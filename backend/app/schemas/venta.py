from datetime import datetime
from pydantic import BaseModel, field_validator


class DetalleVentaCreate(BaseModel):
    producto_id: int
    cantidad: int

    @field_validator("cantidad")
    @classmethod
    def validar_cantidad(cls, value: int):
        if value <= 0:
            raise ValueError("La cantidad debe ser un número positivo")
        return value


class DetalleVentaResponse(BaseModel):
    id: int
    venta_id: int
    producto_id: int
    cantidad: int
    precio_unitario: float

    model_config = {
        "from_attributes": True
    }


class VentaCreate(BaseModel):
    cliente_id: int
    detalles: list[DetalleVentaCreate]


class VentaUpdate(BaseModel):
    cliente_id: int
    detalles: list[DetalleVentaCreate]


class VentaResponse(BaseModel):
    id: int
    cliente_id: int
    fecha_venta: datetime
    total: float
    estado: str
    detalles: list[DetalleVentaResponse]

    model_config = {
        "from_attributes": True
    }


class VentaConClienteResponse(BaseModel):
    id: int
    cliente_id: int
    cliente_nombre: str
    cliente_apellido: str
    fecha_venta: datetime
    total: float
    estado: str
    detalles: list[DetalleVentaResponse]

    model_config = {
        "from_attributes": True
    }
