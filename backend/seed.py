from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models.cliente import Cliente
from app.models.producto import Producto
from app.models.venta import Venta, DetalleVenta


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    db.query(DetalleVenta).delete()
    db.query(Venta).delete()
    db.query(Cliente).delete()
    db.query(Producto).delete()
    db.commit()

    clientes = [
        Cliente(dni="10100100", nombre="Tomas", apellido="Aranda", email="chicle@email.com", telefono="1123456789", estado="Activo"),
        Cliente(dni="55555555", nombre="Leandro", apellido="Paredes", email="bocajrs@email.com", telefono="1134567890", estado="Activo"),
        Cliente(dni="10101010", nombre="Lionel", apellido="Messi", email="goat@email.com", telefono="1189012345", estado="Inactivo"),
        Cliente(dni="40345678", nombre="Miguel", apellido="Merentiel", email="soyunabestia@email.com", telefono="1145678901", estado="Activo"),
        Cliente(dni="32323232", nombre="Carlos", apellido="Tevez", email="fuerteapache@email.com", telefono="1190123456", estado="Inactivo"),
        Cliente(dni="23232323", nombre="Emiliano", apellido="Martínez", email="miraquetecomo@email.com", telefono="1156789012", estado="Activo"),
        Cliente(dni="40567890", nombre="Valentin", apellido="Barco", email="colo@email.com", telefono="1167890123", estado="Activo"),
        Cliente(dni="40678901", nombre="Nico", apellido="Paz", email="hostiachaval@email.com", telefono="1178901234", estado="Activo"),
    ]
    db.add_all(clientes)
    db.commit()

    productos = [
        Producto(codigo="SKU001", nombre="Camiseta Argentina", marca="Adidas", descripcion="Camiseta selección argentina", precio_unitario=45000, stock=50, estado="Activo"),
        Producto(codigo="SKU002", nombre="Pantalon Argentina", marca="Adidas", descripcion="Pantalon selección argentina", precio_unitario=38000, stock=40, estado="Activo"),
        Producto(codigo="SKU003", nombre="Botines Messi", marca="Adidas", descripcion="Botines edición especial", precio_unitario=125000, stock=25, estado="Activo"),
        Producto(codigo="SKU004", nombre="Pelota World Cup", marca="Adidas", descripcion="Pelota oficial del mundial", precio_unitario=55000, stock=100, estado="Activo"),
        Producto(codigo="SKU005", nombre="Medias Argentina", marca="Adidas", descripcion="Medias oficiales", precio_unitario=12000, stock=80, estado="Activo"),
        Producto(codigo="SKU006", nombre="Campera Argentina", marca="Adidas", descripcion="Campera con cierre", precio_unitario=65000, stock=30, estado="Activo"),
        Producto(codigo="SKU007", nombre="Gorras Vintage", marca="Adidas", descripcion="Gorras estilo retro", precio_unitario=18000, stock=0, estado="Inactivo"),
        Producto(codigo="SKU008", nombre="Guantes Arquero", marca="Reebok", descripcion="Guantes de arquero profesionales", precio_unitario=42000, stock=0, estado="Inactivo"),
    ]
    db.add_all(productos)
    db.commit()

    hoy = datetime.now()

    venta1 = Venta(
        cliente_id=clientes[0].id,
        fecha_venta=hoy - timedelta(days=5),
        total=83000,
        estado="Procesada"
    )
    db.add(venta1)
    db.flush()
    db.add(DetalleVenta(venta_id=venta1.id, producto_id=productos[0].id, cantidad=1, precio_unitario=45000))
    db.add(DetalleVenta(venta_id=venta1.id, producto_id=productos[1].id, cantidad=1, precio_unitario=38000))
    productos[0].stock -= 1
    productos[1].stock -= 1

    venta2 = Venta(
        cliente_id=clientes[1].id,
        fecha_venta=hoy - timedelta(days=3),
        total=180000,
        estado="Procesada"
    )
    db.add(venta2)
    db.flush()
    db.add(DetalleVenta(venta_id=venta2.id, producto_id=productos[2].id, cantidad=1, precio_unitario=125000))
    db.add(DetalleVenta(venta_id=venta2.id, producto_id=productos[4].id, cantidad=1, precio_unitario=12000))
    db.add(DetalleVenta(venta_id=venta2.id, producto_id=productos[4].id, cantidad=3, precio_unitario=12000))
    productos[2].stock -= 1
    productos[4].stock -= 4

    venta3 = Venta(
        cliente_id=clientes[2].id,
        fecha_venta=hoy - timedelta(days=1),
        total=110000,
        estado="Procesada"
    )
    db.add(venta3)
    db.flush()
    db.add(DetalleVenta(venta_id=venta3.id, producto_id=productos[3].id, cantidad=2, precio_unitario=55000))
    productos[3].stock -= 2

    venta4 = Venta(
        cliente_id=clientes[3].id,
        fecha_venta=hoy - timedelta(days=10),
        total=65000,
        estado="Anulada"
    )
    db.add(venta4)
    db.flush()
    db.add(DetalleVenta(venta_id=venta4.id, producto_id=productos[5].id, cantidad=1, precio_unitario=65000))

    db.commit()
    db.close()
    print("Seed completado: 8 clientes, 8 productos, 4 ventas")


if __name__ == "__main__":
    seed()
