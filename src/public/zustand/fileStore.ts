import { create } from 'zustand'

type FileStore_State = {
  file: File | null
}
type FileStore_Method = {
  setFile: ( file: File ) => void
}
export const useFileStore = create<FileStore_State & FileStore_Method>( ( set ) => ( {
  file: null,
  setFile: ( file ) => set( { file } ),
} ) )
