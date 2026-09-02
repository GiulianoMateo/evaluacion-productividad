from sqlalchemy import Column, Integer, String, Float, Boolean

from app.database import Base


class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(50), unique=True, nullable=False, index=True)
    nombre = Column(String(100), nullable=False)
    marca = Column(String(100), nullable=False)
    descripcion = Column(String(500), nullable=True)
    precio_unitario = Column(Float, nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    estado = Column(String(20), nullable=False, default="Activo")
