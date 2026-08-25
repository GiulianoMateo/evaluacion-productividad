from fastapi import FastAPI

from app.database import Base, engine
from app.routers import clientes

from app.models.cliente import Cliente


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Sistema de Gestión",
    version="1.0.0"
)


app.include_router(clientes.router)


@app.get("/")
def root():
    return {
        "mensaje": "API funcionando"
    }