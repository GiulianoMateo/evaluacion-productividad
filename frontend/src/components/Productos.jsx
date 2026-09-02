import { useState, useEffect, useCallback } from 'react'
import Modal from './Modal'
import './Productos.css'

const API_URL = '/productos'

function Productos() {
  const [productos, setProductos] = useState([])
  const [formData, setFormData] = useState({
    codigo: '', nombre: '', marca: '', descripcion: '', precio_unitario: '', stock: '', estado: 'Activo'
  })
  const [editando, setEditando] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [filtro, setFiltro] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [modal, setModal] = useState({ open: false, title: '', message: '', type: 'danger' })
  const [pendingAction, setPendingAction] = useState(null)

  const cargarProductos = useCallback(async () => {
    try {
      const res = await fetch(API_URL)
      const data = await res.json()
      setProductos(data)
    } catch {
      mostrarMensaje('Error al cargar productos', 'error')
    }
  }, [])

  useEffect(() => { cargarProductos() }, [cargarProductos])

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 3000)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const precio = parseFloat(formData.precio_unitario)
    const stock = parseInt(formData.stock)

    if (precio <= 0) {
      mostrarMensaje('El precio unitario debe ser un número positivo', 'error')
      return
    }

    if (stock < 0) {
      mostrarMensaje('El stock no puede ser negativo', 'error')
      return
    }

    try {
      const method = editando ? 'PUT' : 'POST'
      const url = editando ? `${API_URL}/${editando}` : API_URL
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, precio_unitario: precio, stock: stock })
      })

      if (res.ok) {
        cargarProductos()
        resetForm()
        mostrarMensaje(editando ? 'Producto actualizado' : 'Producto registrado', 'success')
      } else {
        const error = await res.json()
        mostrarMensaje(error.detail || 'Error al guardar', 'error')
      }
    } catch {
      mostrarMensaje('Error de conexión', 'error')
    }
  }

  const editarProducto = (producto) => {
    setFormData({ ...producto })
    setEditando(producto.id)
    setMostrarFormulario(true)
  }

  const confirmarAccion = async () => {
    if (!pendingAction) return
    const { type, id, producto } = pendingAction
    setModal({ open: false, title: '', message: '', type: 'danger' })
    setPendingAction(null)

    try {
      if (type === 'baja') {
        const res = await fetch(`${API_URL}/${producto.id}/baja`, { method: 'POST' })
        if (res.ok) {
          cargarProductos()
          mostrarMensaje('Producto dado de baja correctamente', 'success')
        } else {
          const error = await res.json()
          mostrarMensaje(error.detail || 'Error al dar de baja', 'error')
        }
      }
    } catch {
      mostrarMensaje('Error de conexión', 'error')
    }
  }

  const darDeBaja = (producto) => {
    if (producto.estado.toLowerCase() === 'inactivo') {
      mostrarMensaje('El producto ya se encuentra dado de baja', 'warning')
      return
    }

    setPendingAction({ type: 'baja', producto })
    setModal({
      open: true,
      title: 'Dar de baja',
      message: `¿Dar de baja a ${producto.nombre}?`,
      type: 'danger'
    })
  }

  const resetForm = () => {
    setFormData({ codigo: '', nombre: '', marca: '', descripcion: '', precio_unitario: '', stock: '', estado: 'Activo' })
    setEditando(null)
    setMostrarFormulario(false)
  }

  const productosFiltrados = productos.filter(p =>
    `${p.nombre} ${p.codigo} ${p.marca}`.toLowerCase().includes(filtro.toLowerCase())
  )

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price)
  }

  return (
    <div className="productos-app">
      <header className="header">
        <div className="header-contenido">
          <div className="header-textos">
            <h1 className="titulo">Gestión de Productos</h1>
          </div>
          <button
            className="btn btn-primario btn-toggle"
            onClick={() => { resetForm(); setMostrarFormulario(!mostrarFormulario); }}
          >
            {mostrarFormulario ? 'Cancelar Registro' : 'Nuevo Producto'}
          </button>
        </div>
      </header>

      {mensaje && (
        <div className={`mensaje mensaje-${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      <main className="contenido">
        <div className="controles">
          <div className="busqueda-container">
            <svg className="icono-buscar" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre, código o marca..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="input-busqueda"
            />
          </div>
        </div>

        {mostrarFormulario && (
          <div className="formulario-container">
            <form className="formulario" onSubmit={handleSubmit}>
              <div className="form-header">
                <h2>{editando ? 'Editar información del producto' : 'Registrar nuevo producto'}</h2>
              </div>
              <div className="form-grid">
                <div className="campo"><label>Código / SKU</label><input type="text" name="codigo" value={formData.codigo} onChange={handleChange} required /></div>
                <div className="campo"><label>Nombre</label><input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required /></div>
                <div className="campo"><label>Marca</label><input type="text" name="marca" value={formData.marca} onChange={handleChange} required /></div>
                <div className="campo"><label>Descripción</label><input type="text" name="descripcion" value={formData.descripcion} onChange={handleChange} /></div>
                <div className="campo"><label>Precio Unitario</label><input type="number" name="precio_unitario" value={formData.precio_unitario} onChange={handleChange} step="0.01" min="0.01" required /></div>
                <div className="campo"><label>Stock Inicial</label><input type="number" name="stock" value={formData.stock} onChange={handleChange} min="0" required /></div>
              </div>
              <div className="form-acciones">
                <button type="button" className="btn btn-secundario" onClick={resetForm}>Cancelar</button>
                <button type="submit" className="btn btn-primario">{editando ? 'Guardar' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        )}

        <div className="lista-productos">
          {productosFiltrados.length === 0 ? (
            <div className="sin-productos">
              <p>{filtro ? 'No hay resultados para tu búsqueda.' : 'Aún no hay productos registrados.'}</p>
            </div>
          ) : (
            productosFiltrados.map(producto => (
              <div key={producto.id} className="tarjeta-producto">
                <div className="producto-icono">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                </div>
                <div className="info-producto">
                  <h3>{producto.nombre}</h3>
                  <div className="detalles">
                    <span className="detalle"><strong>SKU:</strong> {producto.codigo}</span>
                    <span className="detalle"><strong>Marca:</strong> {producto.marca}</span>
                    <span className="detalle"><strong>Precio:</strong> {formatPrice(producto.precio_unitario)}</span>
                    <span className="detalle"><strong>Stock:</strong> {producto.stock}</span>
                  </div>
                  {producto.descripcion && <p className="descripcion">{producto.descripcion}</p>}
                </div>
                <div className="estado-container">
                  {producto.estado.toLowerCase() === 'inactivo' && (
                    <span className={`estado estado-${producto.estado.toLowerCase()}`}>
                      {producto.estado}
                    </span>
                  )}
                </div>
                <div className="acciones">
                  {producto.estado.toLowerCase() !== 'inactivo' && (
                    <button type="button" className="btn-accion btn-editar" onClick={() => editarProducto(producto)} title="Editar">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      <span>editar</span>
                    </button>
                  )}
                  {producto.estado.toLowerCase() !== 'inactivo' && (
                    <button type="button" className="btn-accion btn-baja" onClick={() => darDeBaja(producto)} title="Dar de baja">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                      <span>dar de baja</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <Modal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={confirmarAccion}
        onCancel={() => { setModal({ open: false, title: '', message: '', type: 'danger' }); setPendingAction(null) }}
      />
    </div>
  )
}

export default Productos
