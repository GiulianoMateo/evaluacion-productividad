from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.services import venta_service
from app.schemas.venta import VentaCreate, VentaUpdate, VentaResponse, VentaConClienteResponse

router = APIRouter(
    prefix="/ventas",
    tags=["Ventas"]
)


@router.get("/", response_model=list[VentaConClienteResponse])
def listar_ventas(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    ventas = venta_service.obtener_ventas_con_cliente(db, skip=skip, limit=limit)
    return ventas


@router.get("/filtros", response_model=list[VentaConClienteResponse])
def listar_ventas_filtradas(
    fechaDesde: date = Query(None),
    fechaHasta: date = Query(None),
    clienteId: int = Query(None),
    db: Session = Depends(get_db)
):
    if not fechaDesde and not fechaHasta and not clienteId:
        return []

    ventas = venta_service.obtener_ventas_por_filtros(
        db,
        fechaDesde=fechaDesde,
        fechaHasta=fechaHasta,
        cliente_id=clienteId
    )

    result = []
    for venta in ventas:
        cliente = venta_service.obtener_cliente_por_id(db, venta.cliente_id)
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


@router.get("/{venta_id}", response_model=VentaResponse)
def obtener_venta(
    venta_id: int,
    db: Session = Depends(get_db)
):
    venta = venta_service.obtener_venta_por_id(db, venta_id)
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return venta


@router.post("/", response_model=VentaResponse, status_code=201)
def crear_venta(
    venta: VentaCreate,
    db: Session = Depends(get_db)
):
    db_venta, error = venta_service.crear_venta(db, venta)
    if error:
        if "Cliente no encontrado" in error:
            raise HTTPException(status_code=404, detail=error)
        elif "No se pueden emitir ventas" in error:
            raise HTTPException(status_code=409, detail=error)
        else:
            raise HTTPException(status_code=409, detail=error)
    return db_venta


@router.put("/{venta_id}", response_model=VentaResponse)
def actualizar_venta(
    venta_id: int,
    venta: VentaUpdate,
    db: Session = Depends(get_db)
):
    db_venta, error = venta_service.actualizar_venta(db, venta_id, venta)
    if error:
        if "no encontrada" in error.lower():
            raise HTTPException(status_code=404, detail=error)
        else:
            raise HTTPException(status_code=409, detail=error)
    return db_venta


@router.post("/{venta_id}/anular", response_model=VentaResponse)
def anular_venta(
    venta_id: int,
    db: Session = Depends(get_db)
):
    db_venta, error = venta_service.anular_venta(db, venta_id)
    if error:
        if "no encontrada" in error.lower():
            raise HTTPException(status_code=404, detail=error)
        else:
            raise HTTPException(status_code=409, detail=error)
    return db_venta
