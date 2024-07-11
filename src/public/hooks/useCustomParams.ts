import { useMatches, useParams } from 'react-router-dom'

export const useCustomParams = () => {
  const _params = useParams()
  const ma = useMatches()
  const temp = ma.filter( ( { handle } ) => handle ).map( ( v ) => ( v.handle as { originPathName: string } ).originPathName )
  const { '*': star, ...lestParams } = _params
  return {
    params: { ...lestParams, ...( temp[0] ? { [temp[0]]: star?.split( '/' ) } : {} ) },
  }
}
