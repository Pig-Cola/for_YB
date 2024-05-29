import { type Dispatch, type SetStateAction, useRef } from 'react'

import { Reorder, useDragControls, m } from 'framer-motion'

import styles from './index.module.scss'
import { classOption } from '@/utill/class-helper'

const { classname } = classOption( styles )

type itemValue = jsonFileType['sessionResult']['leaderBoardLines'][number]
export function ItemSlot( {
  value: v,
  index: i,
  reorder,
  max,
}: {
  value: itemValue
  index: number
  reorder: Dispatch<SetStateAction<itemValue[]>>
  max: number
} ) {
  const controls = useDragControls()
  const input = useRef<HTMLInputElement>( null )

  return (
    <Reorder.Item
      as="div"
      dragListener={false}
      drag={'y'}
      value={v}
      className={classname( ['board'] )}
      dragControls={controls}
      whileDrag={{ borderColor: 'lightgreen' }}
    >
      <div className={classname( ['user-info'] )}>
        <div className={classname( ['index'] )}># {i + 1}</div>
        <div className={classname( ['name'] )}>{`${v.currentDriver.firstName} ${v.currentDriver.lastName}`}</div>
        <div className={classname( ['total-time'] )}>{`${v.timing.totalTime}`}</div>
        <div className={classname( ['player-id'] )}>{v.currentDriver.playerId}</div>
      </div>

      <div className={classname( ['control'] )}>
        <div className={classname( ['input'] )}>
          <input
            ref={input}
            key={i}
            type="number"
            min={1}
            max={max}
            defaultValue={i + 1}
            onChange={( e ) => {
              const first = e.target.value[0]
              if ( first === '-' || first === '0' ) {
                e.target.value = `${i + 1}`
                return
              }

              if ( +e.target.value > max ) {
                e.target.value = `${max}`
                return
              }
            }}
            onBlur={( e ) => {
              if ( !e.target.value ) {
                e.target.value = `${i + 1}`
                return
              }
            }}
          />
          <button
            onClick={() => {
              reorder( ( s ) => {
                const newS = [...s.slice( 0, i ), ...s.slice( i + 1 )]
                newS.splice( +input.current.value - 1, 0, s[i] )
                return newS
              } )
            }}
          >
            이동
          </button>
        </div>

        <m.button
          onPointerDown={( e ) => {
            controls.start( e )
          }}
          className={classname( ['dragable'] )}
          style={{ touchAction: 'none' }}
        >
          ↕
        </m.button>
      </div>
    </Reorder.Item>
  )
}
