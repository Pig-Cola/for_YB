import { IpcHandler } from 'src/ipcMethods'

interface customIpcRenderer<
  T extends Record<string, ( ...args: unknown[] ) => unknown>,
  K extends Exclude<keyof T, number | symbol> = Exclude<keyof T, number | symbol>,
> extends Electron.IpcRenderer {
  // send<J extends K>( channel: J, ...args: Parameters<T[J]> ): void
  // sendSync<J extends K>( channel: J, ...args: Parameters<T[J]> ): ReturnType<T[J]>
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
