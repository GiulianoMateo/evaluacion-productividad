from sqlalchemy.orm import Session
from app.models.producto import Producto
from app.schemas.producto import ProductoCreate, ProductoUpdate


def obtener_producto_por_codigo(db: Session, codigo: str):
    return db.query(Producto).filter(Producto.codigo == codigo).first()


def verificar_codigo_en_uso(db: Session, codigo: str, producto_id_excluir: int):
    producto = db.query(Producto).filter(
        Producto.codigo == codigo,
        Producto.id != producto_id_excluir
    ).first()
    return producto is not None


def obtener_productos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Producto).offset(skip).limit(limit).all()


def obtener_producto_por_id(db: Session, producto_id: int):
    return db.query(Producto).filter(Producto.id == producto_id).first()


def crear_producto(db: Session, producto: ProductoCreate):
    db_producto = Producto(
        codigo=producto.codigo,
        nombre=producto.nombre,
        marca=producto.marca,
        descripcion=producto.descripcion,
        precio_unitario=producto.precio_unitario,
        stock=producto.stock,
        estado=producto.estado
    )
    db.add(db_producto)
    db.commit()
    db.refresh(db_producto)
    return db_producto


def actualizar_producto(db: Session, producto_id: int, producto: ProductoUpdate):
    db_producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if db_producto:
        db_producto.codigo = producto.codigo
        db_producto.nombre = producto.nombre
        db_producto.marca = producto.marca
        db_producto.descripcion = producto.descripcion
        db_producto.precio_unitario = producto.precio_unitario
        db_producto.stock = producto.stock
        db_producto.estado = producto.estado
        db.commit()
        db.refresh(db_producto)
    return db_producto


def eliminar_producto(db: Session, producto_id: int):
    db_producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if db_producto:
        db.delete(db_producto)
        db.commit()
        return True
    return False


def cambiar_estado(db: Session, producto_id: int, nuevo_estado: str):
    db_producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if db_producto:
        db_producto.estado = nuevo_estado
        db.commit()
        db.refresh(db_producto)
    return db_producto


def descontar_stock(db: Session, producto_id: int, cantidad: int):
    db_producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if db_producto and db_producto.stock >= cantidad:
        db_producto.stock -= cantidad
        db.commit()
        db.refresh(db_producto)
        return True
    return False


def reingresar_stock(db: Session, producto_id: int, cantidad: int):
    db_producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if db_producto:
        db_producto.stock += cantidad
        db.commit()
        db.refresh(db_producto)
        return True
    return False
