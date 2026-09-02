# evaluacion-productividad

Propuesta de Evaluación de la Productividad - Ingeniería de Software III

Sistema de gestión de clientes, productos y ventas desarrollado con FastAPI y React.

Alumno: Giuliano Giannoncelli

## Tiempo de desarrollo

Aproximadamente 3 horas y media de trabajo utilizando OpenCode y ChatGPT.

## Requisitos

- Python 3.10+
- Node.js 18+
- npm

## Instalación y ejecución

### Backend

```bash
cd backend
pip install -r requirements.txt
python seed.py          
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Datos de prueba

El script `seed.py` carga:
- 8 clientes (6 activos, 2 inactivos)
- 8 productos (6 activos, 2 inactivos)
- 4 ventas (3 procesadas, 1 anulada)

## Funcionalidades

- CRUD de clientes con validaciones
- CRUD de productos con control de stock
- Registro de ventas con verificación de stock
- Dar de baja clientes y productos
- Anulación de ventas
- Búsqueda y filtrado
