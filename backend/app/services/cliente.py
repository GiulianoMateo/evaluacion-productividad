from sqlalchemy.orm import Session
from app.models.cliente import Cliente
from app.schemas.cliente import ClienteCreate


def obtener_cliente_por_dni(db: Session, dni: str):
    return db.query(Cliente).filter(Cliente.dni == dni).first()


def verificar_dni_en_uso(db: Session, dni: str, cliente_id_excluir: int):
    cliente = db.query(Cliente).filter(
        Cliente.dni == dni,
        Cliente.id != cliente_id_excluir
    ).first()
    return cliente is not None


def obtener_clientes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Cliente).offset(skip).limit(limit).all()


def obtener_cliente_por_id(db: Session, cliente_id: int):
    return db.query(Cliente).filter(Cliente.id == cliente_id).first()


def crear_cliente(db: Session, cliente: ClienteCreate):
    db_cliente = Cliente(
        dni=cliente.dni,
        nombre=cliente.nombre,
        apellido=cliente.apellido,
        email=cliente.email,
        telefono=cliente.telefono,
        estado=cliente.estado
    )
    db.add(db_cliente)
    db.commit()
    db.refresh(db_cliente)
    return db_cliente


def actualizar_cliente(db: Session, cliente_id: int, cliente: ClienteCreate):
    db_cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if db_cliente:
        db_cliente.dni = cliente.dni
        db_cliente.nombre = cliente.nombre
        db_cliente.apellido = cliente.apellido
        db_cliente.email = cliente.email
        db_cliente.telefono = cliente.telefono
        db_cliente.estado = cliente.estado
        db.commit()
        db.refresh(db_cliente)
    return db_cliente


def eliminar_cliente(db: Session, cliente_id: int):
    db_cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if db_cliente:
        db.delete(db_cliente)
        db.commit()
        return True
    return False


def cambiar_estado(db: Session, cliente_id: int, nuevo_estado: str):
    db_cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if db_cliente:
        db_cliente.estado = nuevo_estado
        db.commit()
        db.refresh(db_cliente)
    return db_cliente
