from pydantic import BaseModel, field_validator


class ProductoCreate(BaseModel):
    codigo: str
    nombre: str
    marca: str
    descripcion: str = ""
    precio_unitario: float
    stock: int
    estado: str = "Activo"

    @field_validator("precio_unitario")
    @classmethod
    def validar_precio(cls, value: float):
        if value <= 0:
            raise ValueError("El precio unitario debe ser un número positivo")
        return value

    @field_validator("stock")
    @classmethod
    def validar_stock(cls, value: int):
        if value < 0:
            raise ValueError("El stock no puede ser negativo")
        return value


class ProductoUpdate(BaseModel):
    codigo: str
    nombre: str
    marca: str
    descripcion: str = ""
    precio_unitario: float
    stock: int
    estado: str = "Activo"

    @field_validator("precio_unitario")
    @classmethod
    def validar_precio(cls, value: float):
        if value <= 0:
            raise ValueError("El precio unitario debe ser un número positivo")
        return value

    @field_validator("stock")
    @classmethod
    def validar_stock(cls, value: int):
        if value < 0:
            raise ValueError("El stock no puede ser negativo")
        return value


class ProductoResponse(BaseModel):
    id: int
    codigo: str
    nombre: str
    marca: str
    descripcion: str
    precio_unitario: float
    stock: int
    estado: str

    model_config = {
        "from_attributes": True
    }
