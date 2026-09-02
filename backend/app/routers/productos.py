from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.services import producto_service
from app.schemas.producto import ProductoCreate, ProductoUpdate, ProductoResponse

router = APIRouter(
    prefix="/productos",
    tags=["Productos"]
)


@router.get("/", response_model=list[ProductoResponse])
def listar_productos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    productos = producto_service.obtener_productos(db, skip=skip, limit=limit)
    return productos


@router.get("/{producto_id}", response_model=ProductoResponse)
def obtener_producto(
    producto_id: int,
    db: Session = Depends(get_db)
):
    producto = producto_service.obtener_producto_por_id(db, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


@router.post("/", response_model=ProductoResponse, status_code=201)
def crear_producto(
    producto: ProductoCreate,
    db: Session = Depends(get_db)
):
    producto_existente = producto_service.obtener_producto_por_codigo(db, codigo=producto.codigo)
    if producto_existente:
        raise HTTPException(
            status_code=409,
            detail="El código de producto ya está registrado"
        )
    nuevo_producto = producto_service.crear_producto(db, producto)
    return nuevo_producto


@router.put("/{producto_id}", response_model=ProductoResponse)
def actualizar_producto(
    producto_id: int,
    producto: ProductoUpdate,
    db: Session = Depends(get_db)
):
    producto_existente = producto_service.obtener_producto_por_id(db, producto_id)
    if not producto_existente:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    if producto_service.verificar_codigo_en_uso(db, producto.codigo, producto_id):
        raise HTTPException(
            status_code=409,
            detail="El código de producto ya está en uso por otro producto"
        )

    db_producto = producto_service.actualizar_producto(db, producto_id, producto)
    return db_producto


@router.post("/{producto_id}/baja", response_model=ProductoResponse)
def dar_de_baja_producto(
    producto_id: int,
    db: Session = Depends(get_db)
):
    producto = producto_service.obtener_producto_por_id(db, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    if producto.estado.lower() == "inactivo":
        raise HTTPException(
            status_code=409,
            detail="El producto ya se encuentra dado de baja"
        )

    producto_baja = producto_service.cambiar_estado(db, producto_id, "Inactivo")
    return producto_baja


@router.delete("/{producto_id}", status_code=204)
def eliminar_producto(
    producto_id: int,
    db: Session = Depends(get_db)
):
    eliminado = producto_service.eliminar_producto(db, producto_id)
    if not eliminado:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return None
