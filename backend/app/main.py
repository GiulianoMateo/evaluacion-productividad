from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import clientes, productos, ventas

from app.models.cliente import Cliente
from app.models.producto import Producto
from app.models.venta import Venta, DetalleVenta


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Sistema de Gestión",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(clientes.router)
app.include_router(productos.router)
app.include_router(ventas.router)


@app.get("/")
def root():
    return {
        "mensaje": "API funcionando"
    }
