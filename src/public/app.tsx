import '@/styles/reset.scss'
import '@/styles/global.scss'
import '@/styles/my-icon/style.css'
import '@/styles/tailwind_o.scss'

import { useEffect } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { NextUIProvider } from '@nextui-org/react'
import { createRoot } from 'react-dom/client'

import Home from '@/src'
import Replace from '@/src/replace'

import { useIpcRenderer } from './hooks/useIpcRenderer'

const oldFn = {
  alert,
  confirm,
}

function App() {
  const { ipcRenderer } = useIpcRenderer()
  useEffect( () => {
    ( { alert: window.alert, confirm: window.confirm } = Object.fromEntries(
      Object.entries( oldFn ).map( ( [key, fn] ) => [
        key,
        ( arg?: string ) => {
          try {
            return fn( arg )
          } finally {
            ipcRenderer.invoke( 'forceFocus' )
          }
        },
      ] ),
    ) as { alert: typeof oldFn.alert; confirm: typeof oldFn.confirm } )
  }, [ipcRenderer] )
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
