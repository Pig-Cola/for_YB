import { ipcMain as _ipcMain, BrowserWindow } from 'electron'
import * as fsP from 'fs/promises'

import enc, { type Encoding } from 'encoding-japanese'

export type IpcHandler = {
  saveJson: ( obj: jsonFileType, filePath: File['path'] ) => Promise<void>
  readFile: ( filePath: File['path'] ) => Promise<string>
  forceFocus: () => Promise<void>
}

interface customIpcMain<
  T extends Record<string, ( ...args: unknown[] ) => unknown>,
  K extends Exclude<keyof T, number | symbol> = Exclude<keyof T, number | symbol>,
> extends Electron.IpcMain {
  handle: {
    <J extends K>(
      channel: J,
      fn: ( ...args: [Electron.IpcMainInvokeEvent, ...Parameters<T[J]>] ) => ReturnType<T[J]>,
    ): void
  }
}

const ipcMain = _ipcMain as customIpcMain<IpcHandler>

ipcMain.handle( 'saveJson', async ( e, obj: jsonFileType, filePath: File['path'] ) => {
  const json = JSON.stringify( obj, undefined, 2 )
  await fsP.writeFile( filePath, json, { flush: true, encoding: 'utf-16le' } )

  // return json
} )

ipcMain.handle( 'readFile', async ( e, filePath: File['path'] ) => {
  const buff = await fsP.readFile( filePath )
  const arrBff = new Uint8Array( buff )

  const encoding = enc.detect( arrBff, ['UTF32', 'UTF16LE', 'UTF16', 'UTF8'] ) as Encoding
  const conv = enc.convert( arrBff, { to: 'UNICODE', from: encoding } )
  const str = enc.codeToString( conv )

  return str
} )

ipcMain.handle( 'forceFocus', async () => {
  const temp = new BrowserWindow( { height: 0, width: 0 } )
  temp.close()
  return
} )
