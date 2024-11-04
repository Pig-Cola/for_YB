import { useEffect } from 'react'

import { useIpcRenderer } from './useIpcRenderer'
import { useIsFirst } from './useIsFirst'

const oldFn = {
  alert,
  confirm,
}

export const useFocusWithLikeAlert = () => {
  const { ipcRenderer } = useIpcRenderer()
  const isFirst = useIsFirst()

  useEffect( () => {
    if ( !isFirst ) {
      return
    }

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
    ) as typeof oldFn )
  }, [ipcRenderer, isFirst] )
}
