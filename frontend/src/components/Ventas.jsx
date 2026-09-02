import { useState, useEffect, useCallback } from 'react'
import Modal from './Modal'
import './Ventas.css'

const API_VENTAS = '/ventas'
const API_CLIENTES = '/clientes'
const API_PRODUCTOS = '/productos'

function Ventas() {
  const [ventas, setVentas] = useState([])
  const [clientes, setClientes] = useState([])
  const [productos, setProductos] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [filtro, setFiltro] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [dniCliente, setDniCliente] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [formData, setFormData] = useState({
    cliente_id: '',
    detalles: []
  })
  const [productoSeleccionado, setProductoSeleccionado] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [modal, setModal] = useState({ open: false, title: '', message: '', type: 'danger' })
  const [pendingAction, setPendingAction] = useState(null)

  const cargarVentas = useCallback(async () => {
    try {
      const res = await fetch(API_VENTAS)
      const data = await res.json()
      setVentas(data)
    } catch {
      mostrarMensaje('Error al cargar ventas', 'error')
    }
  }, [])

  const cargarClientes = useCallback(async () => {
    try {
      const res = await fetch(API_CLIENTES)
      const data = await res.json()
      setClientes(data)
    } catch {
      mostrarMensaje('Error al cargar clientes', 'error')
    }
  }, [])

  const cargarProductos = useCallback(async () => {
    try {
      const res = await fetch(API_PRODUCTOS)
      const data = await res.json()
      const productosActivos = data.filter(p => p.estado.toLowerCase() === 'activo')
      setProductos(productosActivos)
    } catch {
      mostrarMensaje('Error al cargar productos', 'error')
    }
  }, [])

  useEffect(() => {
    cargarVentas()
    cargarClientes()
    cargarProductos()
  }, [cargarVentas, cargarClientes, cargarProductos])

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 3000)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const agregarProducto = () => {
    if (!productoSeleccionado || cantidad <= 0) {
      mostrarMensaje('Seleccione un producto y una cantidad válida', 'error')
      return
    }

    const producto = productos.find(p => p.id === parseInt(productoSeleccionado))
    if (!producto) return

    if (producto.stock < cantidad) {
      mostrarMensaje(`Stock insuficiente. Disponible: ${producto.stock}`, 'error')
      return
    }

    const detalleExistente = formData.detalles.find(d => d.producto_id === parseInt(productoSeleccionado))
    if (detalleExistente) {
      const nuevaCantidad = detalleExistente.cantidad + cantidad
      if (nuevaCantidad > producto.stock) {
        mostrarMensaje(`Stock insuficiente. Disponible: ${producto.stock}`, 'error')
        return
      }
      setFormData(prev => ({
        ...prev,
        detalles: prev.detalles.map(d =>
          d.producto_id === parseInt(productoSeleccionado)
            ? { ...d, cantidad: nuevaCantidad }
            : d
        )
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        detalles: [...prev.detalles, { producto_id: parseInt(productoSeleccionado), cantidad }]
      }))
    }

    setProductoSeleccionado('')
    setCantidad(1)
  }

  const quitarProducto = (productoId) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.filter(d => d.producto_id !== productoId)
    }))
  }

  const calcularTotal = () => {
    return formData.detalles.reduce((total, detalle) => {
      const producto = productos.find(p => p.id === detalle.producto_id)
      return total + (producto ? producto.precio_unitario * detalle.cantidad : 0)
    }, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.cliente_id) {
      mostrarMensaje('Seleccione un cliente', 'error')
      return
    }

    if (formData.detalles.length === 0) {
      mostrarMensaje('Agregue al menos un producto', 'error')
      return
    }

    try {
      const res = await fetch(API_VENTAS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        cargarVentas()
        cargarProductos()
        resetForm()
        mostrarMensaje('Venta registrada correctamente', 'success')
      } else {
        const error = await res.json()
        mostrarMensaje(error.detail || 'Error al registrar venta', 'error')
      }
    } catch {
      mostrarMensaje('Error de conexión', 'error')
    }
  }

  const confirmarAccion = async () => {
    if (!pendingAction) return
    const { type, venta } = pendingAction
    setModal({ open: false, title: '', message: '', type: 'danger' })
    setPendingAction(null)

    try {
      if (type === 'anular') {
        const res = await fetch(`${API_VENTAS}/${venta.id}/anular`, { method: 'POST' })
        if (res.ok) {
          cargarVentas()
          cargarProductos()
          mostrarMensaje('Venta anulada correctamente', 'success')
        } else {
          const error = await res.json()
          mostrarMensaje(error.detail || 'Error al anular venta', 'error')
        }
      }
    } catch {
      mostrarMensaje('Error de conexión', 'error')
    }
  }

  const anularVenta = (venta) => {
    if (venta.estado.toLowerCase() === 'anulada') {
      mostrarMensaje('La venta ya se encuentra anulada', 'warning')
      return
    }

    setPendingAction({ type: 'anular', venta })
    setModal({
      open: true,
      title: 'Anular venta',
      message: '¿Anular esta venta? El stock será reintegrado.',
      type: 'danger'
    })
  }

  const buscarPorFiltros = async () => {
    if (!fechaDesde && !fechaHasta && !dniCliente) {
      cargarVentas()
      return
    }

    try {
      const params = new URLSearchParams()
      if (fechaDesde) params.append('fechaDesde', fechaDesde)
      if (fechaHasta) params.append('fechaHasta', fechaHasta)
      if (dniCliente) {
        const cliente = clientes.find(c => c.dni === dniCliente)
        if (cliente) params.append('clienteId', cliente.id)
      }

      const res = await fetch(`${API_VENTAS}/filtros?${params.toString()}`)
      const data = await res.json()
      setVentas(data)
    } catch {
      mostrarMensaje('Error al buscar ventas', 'error')
    }
  }

  const resetForm = () => {
    setFormData({ cliente_id: '', detalles: [] })
    setProductoSeleccionado('')
    setCantidad(1)
    setMostrarFormulario(false)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price)
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const getProductoNombre = (productoId) => {
    const producto = productos.find(p => p.id === productoId)
    return producto ? producto.nombre : `Producto ${productoId}`
  }

  const ventasFiltradas = ventas.filter(v => {
    const texto = `${v.cliente_nombre} ${v.cliente_apellido} ${v.id}`.toLowerCase()
    return texto.includes(filtro.toLowerCase())
  })

  const clientesActivos = clientes.filter(c => c.estado.toLowerCase() === 'activo')

  return (
    <div className="ventas-app">
      <header className="header">
        <div className="header-contenido">
          <div className="header-textos">
            <h1 className="titulo">Gestión de Ventas</h1>
          </div>
          <button
            className="btn btn-primario btn-toggle"
            onClick={() => { resetForm(); setMostrarFormulario(!mostrarFormulario); }}
          >
            {mostrarFormulario ? 'Cancelar' : 'Nueva Venta'}
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
          <div className="filtros-container">
            <div className="busqueda-container">
              <svg className="icono-buscar" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input
                type="text"
                placeholder="Buscar por cliente o ID..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="input-busqueda"
              />
            </div>
            <div className="filtros-fecha">
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="input-fecha"
                placeholder="Desde"
              />
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="input-fecha"
                placeholder="Hasta"
              />
              <input
                type="text"
                placeholder="DNI cliente"
                value={dniCliente}
                onChange={(e) => setDniCliente(e.target.value)}
                className="input-dni"
              />
              <button className="btn btn-secundario btn-buscar" onClick={buscarPorFiltros}>
                Buscar
              </button>
            </div>
          </div>
        </div>

        {mostrarFormulario && (
          <div className="formulario-container">
            <form className="formulario" onSubmit={handleSubmit}>
              <div className="form-header">
                <h2>Registrar nueva venta</h2>
              </div>
              <div className="form-grid">
                <div className="campo">
                  <label>Cliente</label>
                  <select name="cliente_id" value={formData.cliente_id} onChange={handleChange} required>
                    <option value="">Seleccionar cliente...</option>
                    {clientesActivos.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre} {cliente.apellido} - DNI {cliente.dni}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="productos-venta">
                <h3>Productos</h3>
                <div className="agregar-producto">
                  <select
                    value={productoSeleccionado}
                    onChange={(e) => setProductoSeleccionado(e.target.value)}
                  >
                    <option value="">Seleccionar producto...</option>
                    {productos.map(producto => (
                      <option key={producto.id} value={producto.id}>
                        {producto.nombre} - {formatPrice(producto.precio_unitario)} (Stock: {producto.stock})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                    className="input-cantidad"
                  />
                  <button type="button" className="btn btn-secundario" onClick={agregarProducto}>
                    Agregar
                  </button>
                </div>

                {formData.detalles.length > 0 && (
                  <div className="lista-detalles">
                    <table className="tabla-detalles">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio Unit.</th>
                          <th>Subtotal</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.detalles.map(detalle => {
                          const producto = productos.find(p => p.id === detalle.producto_id)
                          return (
                            <tr key={detalle.producto_id}>
                              <td>{producto?.nombre || 'Producto'}</td>
                              <td>{detalle.cantidad}</td>
                              <td>{producto ? formatPrice(producto.precio_unitario) : '-'}</td>
                              <td>{producto ? formatPrice(producto.precio_unitario * detalle.cantidad) : '-'}</td>
                              <td>
                                <button
                                  type="button"
                                  className="btn-quitar"
                                  onClick={() => quitarProducto(detalle.producto_id)}
                                >
                                  Quitar
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                    <div className="total-venta">
                      <strong>Total:</strong> {formatPrice(calcularTotal())}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-acciones">
                <button type="button" className="btn btn-secundario" onClick={resetForm}>Cancelar</button>
                <button type="submit" className="btn btn-primario">Registrar Venta</button>
              </div>
            </form>
          </div>
        )}

        <div className="lista-ventas">
          {ventasFiltradas.length === 0 ? (
            <div className="sin-ventas">
              <p>{filtro || fechaDesde || fechaHasta || dniCliente ? 'No hay resultados para tu búsqueda.' : 'Aún no hay ventas registradas.'}</p>
            </div>
          ) : (
            ventasFiltradas.map(venta => (
              <div key={venta.id} className="tarjeta-venta">
                <div className="venta-header">
                  <div className="venta-info">
                    <h3>Venta #{venta.id}</h3>
                    <span className="venta-fecha">{formatDate(venta.fecha_venta)}</span>
                  </div>
                  <span className={`estado estado-${venta.estado.toLowerCase()}`}>
                    {venta.estado}
                  </span>
                </div>
                <div className="venta-cliente">
                  <strong>Cliente:</strong> {venta.cliente_nombre} {venta.cliente_apellido}
                </div>
                <div className="venta-detalles">
                  {venta.detalles && venta.detalles.length > 0 ? (
                    venta.detalles.map((detalle, idx) => (
                      <span key={idx} className="detalle-item">
                        {getProductoNombre(detalle.producto_id)} x{detalle.cantidad}
                      </span>
                    ))
                  ) : (
                    <span className="sin-detalles">Sin detalles</span>
                  )}
                </div>
                <div className="venta-footer">
                  <div className="venta-total">
                    <strong>Total:</strong> {formatPrice(venta.total)}
                  </div>
                  <div className="acciones">
                    {venta.estado.toLowerCase() !== 'anulada' && (
                      <button type="button" className="btn-accion btn-anular" onClick={() => anularVenta(venta)} title="Anular">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                        </svg>
                        <span>anular</span>
                      </button>
                    )}
                  </div>
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

export default Ventas
