import { create } from 'zustand'

type state = {
  file: File | null
}
type method = {
  setFile: ( file: File ) => void
}
export const useFileStore = create<state & method>( ( set ) => ( {
  file: null,
  setFile: ( file ) => set( { file } ),
} ) )
