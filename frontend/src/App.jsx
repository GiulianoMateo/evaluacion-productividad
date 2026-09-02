import { useState } from 'react'
import Clientes from './components/Clientes'
import Productos from './components/Productos'
import Ventas from './components/Ventas'

function App() {
  const [seccion, setSeccion] = useState('clientes')

  return (
    <div className="app-container">
      <nav className="nav-tabs">
        <button
          className={`nav-tab ${seccion === 'clientes' ? 'active' : ''}`}
          onClick={() => setSeccion('clientes')}
        >
          Clientes
        </button>
        <button
          className={`nav-tab ${seccion === 'productos' ? 'active' : ''}`}
          onClick={() => setSeccion('productos')}
        >
          Productos
        </button>
        <button
          className={`nav-tab ${seccion === 'ventas' ? 'active' : ''}`}
          onClick={() => setSeccion('ventas')}
        >
          Ventas
        </button>
      </nav>

      {seccion === 'clientes' && <Clientes />}
      {seccion === 'productos' && <Productos />}
      {seccion === 'ventas' && <Ventas />}
    </div>
  )
}

export default App
