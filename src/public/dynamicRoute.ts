import type { RouteObject, RouteProps } from 'react-router-dom'

const pages = import.meta.glob( './pages/**/*.ts?(x)', { eager: true, import: 'default' } )

// like {'./pages/replace/index.tsx': `module`}
export const routeObj = [] as RouteObject[]

for ( const i in pages ) {
  const Component = pages[i] as RouteProps['Component']
  const pathArr = i
    .replace( /^\.\/pages\//, '' )
    .replace( /\.(j|t)sx?$/, '' )
    .split( '/' )
    .map( ( v ) => {
      const temp = v.replace( /\[\[(.+)\]\]/, '*' ).replace( /\[(.+)\]/, ( mach, p1 ) => `:${p1}` )
      return { path: temp, origin: v.replace( /\[\[(.+)\]\]/, '$1' ) }
    } )
  const file = pathArr.pop()

  let target = routeObj
  pathArr.forEach( ( { path: targetPath } ) => {
    if ( targetPath === '' ) return

    const temp = target.find( ( { path } ) => path === targetPath )
    if ( !temp ) {
      const newTemp = {
        path: targetPath,
        children: [],
      } as RouteObject
      target.push( newTemp )
      target = newTemp.children
    } else {
      target = temp.children
    }
  } )
  if ( file.path === '*' ) {
    target.push( { path: '*', Component, handle: { originPathName: file.origin } } )
    continue
  }
  if ( file.path !== 'index' ) {
    const newTemp = { path: file.path, children: [] } as RouteObject
    target.push( newTemp )
    target = newTemp.children
  }

  target.push( { path: '', Component } )
}
