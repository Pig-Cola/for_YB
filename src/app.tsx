import { createRoot } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import './styles/reset.scss'
import './styles/global.scss'
import Home from './src'
import Replace from './src/replace'

function App() {
  return (
    <MemoryRouter>
      <Routes>
        <Route index Component={Home} />
        <Route path="replace" Component={Replace} />
      </Routes>
    </MemoryRouter>
  )
}

const root = createRoot( document.querySelector( '#root' ) )
root.render( <App /> )
