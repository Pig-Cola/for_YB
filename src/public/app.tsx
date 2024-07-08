import '@/styles/reset.scss'
import '@/styles/global.scss'
import '@/styles/my-icon/style.css'
import '@/styles/tailwind_o.scss'

import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import type { RouteObject, RouteProps } from 'react-router-dom'

import { NextUIProvider } from '@nextui-org/react'
import { createRoot } from 'react-dom/client'

import { useFocusWithLikeAlert } from './hooks/useFocusWithLikeAlert'

const pages = import.meta.glob( './pages/**/*.ts?(x)', { eager: true, import: 'default' } )

// './pages/replace/index.tsx'
const routeObj = [] as RouteObject[]
for ( const i in pages ) {
  const Component = pages[i] as RouteProps['Component']
  const pathArr = i.replace( /^\.\/pages/, '' ).split( '/' )
  const file = pathArr.pop().replace( /\.(j|t)sx?$/, '' )

  let target = routeObj
  pathArr.forEach( ( targetPath ) => {
    const temp = target.find( ( { path } ) => path === targetPath )
    if ( !temp ) {
      const newTemp = { path: targetPath, children: [] } as RouteObject
      target.push( newTemp )
      target = newTemp.children
    } else {
      target = temp.children
    }
  } )

  if ( file !== 'index' ) {
    const newTemp = { path: file, children: [] } as RouteObject
    target.push( newTemp )
    target = newTemp.children
  }

  target.push( { path: '', Component } )
}

const memory = createMemoryRouter( routeObj )

function App() {
  useFocusWithLikeAlert()

  return (
    <NextUIProvider>
      <RouterProvider router={memory}></RouterProvider>
    </NextUIProvider>
  )
}

const root = createRoot( document.querySelector( '#root' ) )
root.render( <App /> )
