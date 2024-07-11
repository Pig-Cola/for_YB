import '@/styles/reset.scss'
import '@/styles/global.scss'
import '@/styles/my-icon/style.css'
import '@/styles/tailwind_o.scss'

import { RouterProvider, createMemoryRouter } from 'react-router-dom'

import { NextUIProvider } from '@nextui-org/react'
import { createRoot } from 'react-dom/client'

import { routeObj } from './dynamicRoute'

const memory = createMemoryRouter( routeObj )

function App() {
  return (
    <NextUIProvider>
      <RouterProvider router={memory}></RouterProvider>
    </NextUIProvider>
  )
}

const root = createRoot( document.querySelector( '#root' ) )
root.render( <App /> )
