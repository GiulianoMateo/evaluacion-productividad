import re

from pydantic import BaseModel, EmailStr, field_validator


class ClienteCreate(BaseModel):
    dni: str
    nombre: str
    apellido: str
    email: EmailStr
    telefono: str
    estado: str

    @field_validator("nombre", "apellido")
    @classmethod
    def validar_nombre_apellido(cls, value: str):
        if not re.fullmatch(r"[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+", value):
            raise ValueError(
                "El campo solo debe contener letras"
            )

        return value

    @field_validator("telefono")
    @classmethod
    def validar_telefono(cls, value: str):
        if not re.fullmatch(r"[0-9-]+", value):
            raise ValueError(
                "El teléfono solo puede contener números y guiones"
            )

        return value
    
    @field_validator("dni")
    @classmethod
    def validar_dni(cls, value: str):
        if not value.isdigit(): # o usar regex r"^\d+$"
            raise ValueError("El DNI solo debe contener números")
        return value


class ClienteResponse(BaseModel):
    id: int
    dni: str
    nombre: str
    apellido: str
    email: str
    telefono: str
    estado: str

    model_config = {
        "from_attributes": True
    }