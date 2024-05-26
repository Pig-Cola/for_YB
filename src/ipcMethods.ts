import { ipcMain } from 'electron'
import * as fs from 'fs'

ipcMain.handle( 'saveJson', ( e, obj: jsonFileType, filePath: File['path'] ) => {
  const json = JSON.stringify( obj, undefined, 2 )
  fs.writeFileSync( filePath, json, { flush: true, encoding: 'utf-16le' } )
  return json
} )
