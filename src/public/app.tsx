import '@/styles/reset.scss'
import '@/styles/global.scss'
import '@/styles/my-icon/style.css'
import '@/styles/tailwind_o.scss'

import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { NextUIProvider } from '@nextui-org/react'
import { createRoot } from 'react-dom/client'

import Home from '@/src'
import Replace from '@/src/replace'

function App() {
  return (
    <MemoryRouter>
      <NextUIProvider>
        <Routes>
          <Route path="/">
            <Route path="" Component={Home} />
            <Route path="replace" element={<Replace />} />
          </Route>
        </Routes>
      </NextUIProvider>
    </MemoryRouter>
  )
}

const root = createRoot( document.querySelector( '#root' ) )
root.render( <App /> )
