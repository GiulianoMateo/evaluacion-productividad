from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.venta import Venta, DetalleVenta
from app.models.cliente import Cliente
from app.models.producto import Producto
from app.schemas.venta import VentaCreate, VentaUpdate


def obtener_ventas(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Venta).offset(skip).limit(limit).all()


def obtener_venta_por_id(db: Session, venta_id: int):
    return db.query(Venta).filter(Venta.id == venta_id).first()


def obtener_cliente_por_id(db: Session, cliente_id: int):
    return db.query(Cliente).filter(Cliente.id == cliente_id).first()


def obtener_producto_por_id(db: Session, producto_id: int):
    return db.query(Producto).filter(Producto.id == producto_id).first()


def calcular_total(detalles: list, db: Session) -> float:
    total = 0.0
    for detalle in detalles:
        producto = obtener_producto_por_id(db, detalle.producto_id)
        if producto:
            total += producto.precio_unitario * detalle.cantidad
    return total


def verificar_stock_disponible(db: Session, detalles: list) -> tuple[bool, str]:
    for detalle in detalles:
        producto = obtener_producto_por_id(db, detalle.producto_id)
        if not producto:
            return False, f"El producto con ID {detalle.producto_id} no existe"
        if producto.stock < detalle.cantidad:
            return False, f"Stock insuficiente para {producto.nombre}. Disponible: {producto.stock}"
    return True, ""


def crear_venta(db: Session, venta: VentaCreate):
    cliente = obtener_cliente_por_id(db, venta.cliente_id)
    if not cliente:
        return None, "Cliente no encontrado"

    if cliente.estado.lower() == "inactivo":
        return None, "No se pueden emitir ventas a clientes dados de baja"

    stock_ok, mensaje = verificar_stock_disponible(db, venta.detalles)
    if not stock_ok:
        return None, mensaje

    total = calcular_total(db=db, detalles=venta.detalles)

    db_venta = Venta(
        cliente_id=venta.cliente_id,
        fecha_venta=datetime.now(),
        total=total,
        estado="Procesada"
    )
    db.add(db_venta)
    db.flush()

    for detalle in venta.detalles:
        producto = obtener_producto_por_id(db, detalle.producto_id)
        db_detalle = DetalleVenta(
            venta_id=db_venta.id,
            producto_id=detalle.producto_id,
            cantidad=detalle.cantidad,
            precio_unitario=producto.precio_unitario
        )
        db.add(db_detalle)
        producto.stock -= detalle.cantidad

    db.commit()
    db.refresh(db_venta)
    return db_venta, None


def actualizar_venta(db: Session, venta_id: int, venta: VentaUpdate):
    db_venta = db.query(Venta).filter(Venta.id == venta_id).first()
    if not db_venta:
        return None, "Venta no encontrada"

    if db_venta.estado.lower() != "borrador":
        return None, "Solo se pueden modificar ventas en estado Borrador"

    cliente = obtener_cliente_por_id(db, venta.cliente_id)
    if not cliente:
        return None, "Cliente no encontrado"

    if cliente.estado.lower() == "inactivo":
        return None, "No se pueden emitir ventas a clientes dados de baja"

    for detalle in db_venta.detalles:
        producto = obtener_producto_por_id(db, detalle.producto_id)
        if producto:
            producto.stock += detalle.cantidad

    db.query(DetalleVenta).filter(DetalleVenta.venta_id == venta_id).delete()

    stock_ok, mensaje = verificar_stock_disponible(db, venta.detalles)
    if not stock_ok:
        for detalle in db_venta.detalles:
            producto = obtener_producto_por_id(db, detalle.producto_id)
            if producto:
                producto.stock -= detalle.cantidad
        return None, mensaje

    total = 0.0
    for detalle in venta.detalles:
        producto = obtener_producto_por_id(db, detalle.producto_id)
        db_detalle = DetalleVenta(
            venta_id=venta_id,
            producto_id=detalle.producto_id,
            cantidad=detalle.cantidad,
            precio_unitario=producto.precio_unitario
        )
        db.add(db_detalle)
        producto.stock -= detalle.cantidad
        total += producto.precio_unitario * detalle.cantidad

    db_venta.cliente_id = venta.cliente_id
    db_venta.total = total
    db.commit()
    db.refresh(db_venta)
    return db_venta, None


def anular_venta(db: Session, venta_id: int):
    db_venta = db.query(Venta).filter(Venta.id == venta_id).first()
    if not db_venta:
        return None, "Venta no encontrada"

    if db_venta.estado.lower() == "anulada":
        return None, "La venta ya se encuentra anulada"

    for detalle in db_venta.detalles:
        producto = obtener_producto_por_id(db, detalle.producto_id)
        if producto:
            producto.stock += detalle.cantidad

    db_venta.estado = "Anulada"
    db.commit()
    db.refresh(db_venta)
    return db_venta, None


def obtener_ventas_por_filtros(db: Session, fechaDesde: date = None, fechaHasta: date = None, cliente_id: int = None):
    query = db.query(Venta)

    if fechaDesde:
        query = query.filter(Venta.fecha_venta >= datetime.combine(fechaDesde, datetime.min.time()))
    if fechaHasta:
        query = query.filter(Venta.fecha_venta <= datetime.combine(fechaHasta, datetime.max.time()))
    if cliente_id:
        query = query.filter(Venta.cliente_id == cliente_id)

    return query.all()


def obtener_ventas_con_cliente(db: Session, skip: int = 0, limit: int = 100):
    ventas = db.query(Venta).offset(skip).limit(limit).all()
    result = []
    for venta in ventas:
        cliente = obtener_cliente_por_id(db, venta.cliente_id)
        result.append({
            "id": venta.id,
            "cliente_id": venta.cliente_id,
            "cliente_nombre": cliente.nombre if cliente else "",
            "cliente_apellido": cliente.apellido if cliente else "",
            "fecha_venta": venta.fecha_venta,
            "total": venta.total,
            "estado": venta.estado,
            "detalles": venta.detalles
        })
    return result
