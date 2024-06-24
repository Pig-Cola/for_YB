import { useMemo } from 'react'

import styles from './index.module.scss'
import { classOption } from '@/utill/class-helper'

const { classname } = classOption( styles )

export const MyIcon: React.ComponentType<
  {
    children: string
    className?: string
  } & React.HTMLAttributes<HTMLElement>
> = function ( { children, className = '', ...props } ) {
  const iconText = useMemo( () => children.trim(), [children] )
  const iconClass = useMemo( () => ( iconText ? `icon-${iconText}` : '' ), [iconText] )

  return <i className={classname( ['my-icon'], [className, iconClass] )} {...props} />
}
