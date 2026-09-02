import re

from pydantic import BaseModel, field_validator


class ClienteCreate(BaseModel):
    dni: str
    nombre: str
    apellido: str
    email: str
    telefono: str
    estado: str

    @field_validator("email")
    @classmethod
    def validar_email(cls, value: str, info):
        email_regex = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.fullmatch(email_regex, value):
            raise ValueError(f"El campo '{info.field_name}' no es un email válido")
        return value.lower()

    @field_validator("nombre", "apellido")
    @classmethod
    def validar_nombre_apellido(cls, value: str, info):
        if not re.fullmatch(r"[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+", value):
            raise ValueError(
                f"El campo '{info.field_name}' solo debe contener letras"
            )

        return value

    @field_validator("telefono")
    @classmethod
    def validar_telefono(cls, value: str, info):
        if not re.fullmatch(r"[0-9-]+", value):
            raise ValueError(
                f"El campo '{info.field_name}' solo puede contener números y guiones"
            )

        return value
    
    @field_validator("dni")
    @classmethod
    def validar_dni(cls, value: str, info):
        if not value.isdigit():
            raise ValueError(f"El campo '{info.field_name}' solo debe contener números")
        if len(value) < 8 or len(value) > 9:
            raise ValueError(f"El campo '{info.field_name}' debe tener entre 8 y 9 dígitos")
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