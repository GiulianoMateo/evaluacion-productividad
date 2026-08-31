import { useState, useEffect, useCallback } from 'react'
import './Clientes.css'

const API_URL = '/clientes'
const ESTADOS = ['Activo', 'Inactivo', 'Pendiente']

function App() {
  const [clientes, setClientes] = useState([])
  const [formData, setFormData] = useState({
    dni: '', nombre: '', apellido: '', email: '', telefono: '', estado: 'Activo'
  })
  const [editando, setEditando] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [filtro, setFiltro] = useState('')
  const [mensaje, setMensaje] = useState(null)

  const cargarClientes = useCallback(async () => {
    try {
      const res = await fetch(API_URL)
      const data = await res.json()
      setClientes(data)
    } catch {
      mostrarMensaje('Error al cargar clientes', 'error')
    }
  }, [])

  useEffect(() => { cargarClientes() }, [cargarClientes])

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
    try {
      const method = editando ? 'PUT' : 'POST'
      const url = editando ? `${API_URL}/${editando}` : API_URL
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        cargarClientes()
        resetForm()
        mostrarMensaje(editando ? 'Cliente actualizado' : 'Cliente creado', 'success')
      } else {
        const error = await res.json()
        mostrarMensaje(error.detail || 'Error al guardar', 'error')
      }
    } catch {
      mostrarMensaje('Error de conexión', 'error')
    }
  }

  const editarCliente = (cliente) => {
    setFormData({ ...cliente })
    setEditando(cliente.id)
    setMostrarFormulario(true)
  }

  const darDeBaja = async (cliente) => {
    if (cliente.estado.toLowerCase() === 'inactivo') {
      mostrarMensaje('El cliente ya se encuentra dado de baja', 'warning')
      return
    }

    if (!confirm(`¿Dar de baja a ${cliente.nombre} ${cliente.apellido}?`)) return

    try {
      const res = await fetch(`${API_URL}/${cliente.id}/baja`, { method: 'POST' })
      if (res.ok) {
        cargarClientes()
        mostrarMensaje('Cliente dado de baja correctamente', 'success')
      } else {
        const error = await res.json()
        mostrarMensaje(error.detail || 'Error al dar de baja', 'error')
      }
    } catch {
      mostrarMensaje('Error de conexión', 'error')
    }
  }

  const eliminarCliente = async (id) => {
    if (!confirm('¿Eliminar este cliente definitivamente?')) return
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (res.ok) {
        cargarClientes()
        mostrarMensaje('Cliente eliminado', 'success')
      }
    } catch {
      mostrarMensaje('Error al eliminar', 'error')
    }
  }

  const resetForm = () => {
    setFormData({ dni: '', nombre: '', apellido: '', email: '', telefono: '', estado: 'Activo' })
    setEditando(null)
    setMostrarFormulario(false)
  }

  const clientesFiltrados = clientes.filter(c =>
    `${c.nombre} ${c.apellido} ${c.dni}`.toLowerCase().includes(filtro.toLowerCase())
  )

  const getIniciales = (nombre, apellido) => `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()

  const getColorAvatar = (id) => {
    const colores = ['#2563eb', '#059669', '#4f46e5', '#0284c7', '#7c3aed', '#475569']
    return colores[id % colores.length]
  }

  return (
    <div className="clientes-app">
      <header className="header">
        <div className="header-contenido">
          <div className="header-textos">
            <h1 className="titulo">Gestión de Clientes</h1>
            <p className="subtitulo">Administración general de cartera</p>
          </div>
          <button
            className="btn btn-primario btn-toggle"
            onClick={() => { resetForm(); setMostrarFormulario(!mostrarFormulario); }}
          >
            {mostrarFormulario ? 'Cancelar Registro' : 'Nuevo Cliente'}
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
              placeholder="Buscar por nombre, apellido o DNI..."
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
                <h2>{editando ? 'Editar información del cliente' : 'Registrar nuevo cliente'}</h2>
              </div>
              <div className="form-grid">
                <div className="campo"><label>DNI</label><input type="text" name="dni" value={formData.dni} onChange={handleChange} required /></div>
                <div className="campo"><label>Nombre</label><input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required /></div>
                <div className="campo"><label>Apellido</label><input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required /></div>
                <div className="campo"><label>Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} required /></div>
                <div className="campo"><label>Teléfono</label><input type="text" name="telefono" value={formData.telefono} onChange={handleChange} required /></div>
                <div className="campo">
                  <label>Estado</label>
                  <select name="estado" value={formData.estado} onChange={handleChange}>
                    {ESTADOS.map(est => <option key={est} value={est}>{est}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-acciones">
                <button type="button" className="btn btn-secundario" onClick={resetForm}>Cancelar</button>
                <button type="submit" className="btn btn-primario">{editando ? 'Guardar' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        )}

        <div className="lista-clientes">
          {clientesFiltrados.length === 0 ? (
            <div className="sin-clientes">
              <p>{filtro ? 'No hay resultados para tu búsqueda.' : 'Aún no hay clientes registrados.'}</p>
            </div>
          ) : (
            clientesFiltrados.map(cliente => (
              <div key={cliente.id} className="tarjeta-cliente">
                <div className="avatar" style={{ backgroundColor: getColorAvatar(cliente.id) }}>
                  {getIniciales(cliente.nombre, cliente.apellido)}
                </div>
                <div className="info-cliente">
                  <h3>{cliente.nombre} {cliente.apellido}</h3>
                  <div className="detalles">
                    <span className="detalle"><strong>DNI:</strong> {cliente.dni}</span>
                    <span className="detalle"><strong>Email:</strong> {cliente.email}</span>
                    <span className="detalle"><strong>Tel:</strong> {cliente.telefono}</span>
                  </div>
                </div>
                <div className="estado-container">
                  <span className={`estado estado-${cliente.estado.toLowerCase()}`}>
                    {cliente.estado}
                  </span>
                </div>
                <div className="acciones">
                  <button type="button" className="btn-accion btn-editar" onClick={() => editarCliente(cliente)} title="Editar">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    <span>editar</span>
                  </button>
                  {cliente.estado.toLowerCase() !== 'inactivo' && (
                    <button type="button" className="btn-accion btn-baja" onClick={() => darDeBaja(cliente)} title="Dar de baja">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                      <span>dar de baja</span>
                    </button>
                  )}
                  <button type="button" className="btn-accion btn-eliminar" onClick={() => eliminarCliente(cliente.id)} title="Eliminar">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    <span>eliminar</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

export default App
