from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.services import cliente_service
from app.schemas.cliente import ClienteCreate, ClienteResponse

router = APIRouter(
    prefix="/clientes",
    tags=["Clientes"]
)


@router.get("/", response_model=list[ClienteResponse])
def listar_clientes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    clientes = cliente_service.obtener_clientes(db, skip=skip, limit=limit)
    return clientes


@router.get("/{cliente_id}", response_model=ClienteResponse)
def obtener_cliente(
    cliente_id: int,
    db: Session = Depends(get_db)
):
    cliente = cliente_service.obtener_cliente_por_id(db, cliente_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente


@router.post("/", response_model=ClienteResponse, status_code=201)
def crear_cliente(
    cliente: ClienteCreate,
    db: Session = Depends(get_db)
):
    cliente_existente = cliente_service.obtener_cliente_por_dni(db, dni=cliente.dni)
    if cliente_existente:
        raise HTTPException(
            status_code=409,
            detail="El cliente ya se encuentra registrado"
        )
    nuevo_cliente = cliente_service.crear_cliente(db, cliente)
    return nuevo_cliente


@router.put("/{cliente_id}", response_model=ClienteResponse)
def actualizar_cliente(
    cliente_id: int,
    cliente: ClienteCreate,
    db: Session = Depends(get_db)
):
    cliente_existente = cliente_service.obtener_cliente_por_id(db, cliente_id)
    if not cliente_existente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    if cliente_service.verificar_dni_en_uso(db, cliente.dni, cliente_id):
        raise HTTPException(
            status_code=409,
            detail="El DNI ya está en uso por otro cliente"
        )

    db_cliente = cliente_service.actualizar_cliente(db, cliente_id, cliente)
    return db_cliente


@router.post("/{cliente_id}/baja", response_model=ClienteResponse)
def dar_de_baja_cliente(
    cliente_id: int,
    db: Session = Depends(get_db)
):
    cliente = cliente_service.obtener_cliente_por_id(db, cliente_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    if cliente.estado.lower() == "inactivo":
        raise HTTPException(
            status_code=409,
            detail="El cliente ya se encuentra dado de baja"
        )

    cliente_baja = cliente_service.cambiar_estado(db, cliente_id, "Inactivo")
    return cliente_baja


@router.delete("/{cliente_id}", status_code=204)
def eliminar_cliente(
    cliente_id: int,
    db: Session = Depends(get_db)
):
    eliminado = cliente_service.eliminar_cliente(db, cliente_id)
    if not eliminado:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return None
