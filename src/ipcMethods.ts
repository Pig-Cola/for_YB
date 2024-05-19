import { jsonFileType } from '@/types'
import { ipcMain } from 'electron'
import * as fs from 'fs'

ipcMain.handle( 'saveJson', ( e, obj: jsonFileType, filePath: File['path'] ) => {
  const json = JSON.stringify( obj, undefined, 4 )
  fs.writeFileSync( filePath, json, { flush: true } )
  return json
} )

// ipcMain.handle( 'component', () => {
//   const temp = path.resolve( process.cwd(), `./src/src` )
//   return ( readdirSync( `${temp}`, { recursive: true } ) as string[] )
//     .filter( ( v ) => /\.(jsx|tsx)$/.test( v ) )
//     .map( ( v ) => v.replace( /\.(jsx|tsx)$/, '' ) )
// } )
