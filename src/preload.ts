// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { useIpcRenderer } from './public/hooks/useIpcRenderer'

const oldFn = {
  alert,
  confirm,
}

const PreLoad = () => {
  const { ipcRenderer } = useIpcRenderer()

  ;( { alert: window.alert, confirm: window.confirm } = Object.fromEntries(
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
  ) as typeof oldFn )
}

console.log( 'change!!!' )
PreLoad()
