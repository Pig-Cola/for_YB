import { IpcHandler } from 'src/ipcMethods'

interface customIpcRenderer<
  T extends Record<string, ( ...args: unknown[] ) => unknown>,
  K extends Exclude<keyof T, number | symbol> = Exclude<keyof T, number | symbol>,
> extends Electron.IpcRenderer {
  send( channel: K, ...args: Parameters<T[K]> ): void
  sendSync( channel: K, ...args: Parameters<T[K]> ): ReturnType<T[K]>
  invoke: {
    <J extends K>( channel: J, ...args: Parameters<T[J]> ): Promise<Awaited<ReturnType<T[J]>>>
  }
}

const {
  ipcRenderer,
}: {
  ipcRenderer: customIpcRenderer<IpcHandler>
} = window.require( 'electron/renderer' )

export function useIpcRenderer() {
  return { ipcRenderer }
}
