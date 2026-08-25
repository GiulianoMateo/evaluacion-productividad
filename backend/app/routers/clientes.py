from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.cliente import Cliente
from app.schemas.cliente import ClienteCreate, ClienteResponse


router = APIRouter(
    prefix="/clientes",
    tags=["Clientes"]
)


@router.post(
    "/",
    response_model=ClienteResponse,
    status_code=201
)
def crear_cliente(
    cliente: ClienteCreate,
    db: Session = Depends(get_db)
):
    cliente_existente = (
        db.query(Cliente)
        .filter(Cliente.dni == cliente.dni)
        .first()
    )

    if cliente_existente:
        raise HTTPException(
            status_code=409,
            detail="El cliente ya se encuentra registrado"
        )

    nuevo_cliente = Cliente(
        dni=cliente.dni,
        nombre=cliente.nombre,
        apellido=cliente.apellido,
        email=cliente.email,
        telefono=cliente.telefono,
        estado=cliente.estado
    )

    db.add(nuevo_cliente)
    db.commit()
    db.refresh(nuevo_cliente)

    return nuevo_cliente