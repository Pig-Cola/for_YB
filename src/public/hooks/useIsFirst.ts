import { useEffect, useState } from 'react'

export const useIsFirst = () => {
  const [isFirst, setIs] = useState( false )

  useEffect( () => {
    setIs( true )
  }, [] )

  return isFirst
}
