import { useEffect, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

import { Button } from '@nextui-org/button'
import { Input } from '@nextui-org/react'
import { Reorder, m, useDragControls } from 'framer-motion'
import _ from 'lodash'

import { useSettingForLeaderBoard } from '@/zustand/settingForLeaderBoard'

import { MyIcon } from '../my-icon'

import styles from './index.module.scss'
import { classOption } from '@/utill/class-helper'

const { classname } = classOption( styles )

type itemValue = jsonFileTypeEx['sessionResult']['leaderBoardLines'][number]
type LeaderBoardItemSlotProps = {
  value: itemValue
  index: number
  // reorder: Dispatch<SetStateAction<itemValue[]>>
  // max: number
  setPenalty: Dispatch<SetStateAction<Record<string, `${number}`>>>
}

export function LeaderBoardItemSlot( {
  value: info,
  index: i /* reorder, max */,
  setPenalty,
}: LeaderBoardItemSlotProps ) {
  const controls = useDragControls()
  const { userProperties } = useSettingForLeaderBoard()

  const [isExtension, setIsExtension] = useState( false )
  const controlRef = useRef<HTMLDivElement>( null )

  useEffect( () => {
    if ( isExtension ) {
      controlRef.current.setAttribute( 'inert', '' )
    } else {
      controlRef.current.removeAttribute( 'inert' )
    }
  }, [isExtension] )

  return (
    <Reorder.Item
      as="div"
      dragListener={false}
      drag={'y'}
      value={info}
      className={classname( ['board'] )}
      whileDrag={{ borderColor: 'lightgreen', scale: 0.95 }}
      dragControls={controls}
    >
      <div className={classname( ['user-info'] )}>
        <div className={classname( ['index'] )}># {i + 1}</div>
        <div className={classname( ['name'] )}>{`${info.currentDriver.firstName} ${info.currentDriver.lastName}`}</div>
        {userProperties
          ?.filter( ( item ) => item.isVisible )
          .map( ( item ) => (
            <div key={item.name} style={{ color: item.color }}>
              {item.isNameVisible ? `${item.name}: ` : ''}
              {( () => {
                const temp = _( info ).get( item.getter, '잘못된 접근자 입니다.' )
                if ( item.getter === 'car.carModel' && typeof temp === 'number' ) {
                  return info.car.carModelString
                }
                if ( typeof temp === 'object' ) return '잘못된 접근자 입니다.'
                return temp
              } )()}
            </div>
          ) )}
      </div>

      <div className={classname( ['control'] )} ref={controlRef}>
        <Button
          size="sm"
          onPress={() => {
            setIsExtension( true )
          }}
        >
          <MyIcon>pencil</MyIcon>
        </Button>

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

      <div className={classname( ['extension', { isExtension }] )}>
        <div className={classname( ['close-btn'] )}>
          <button onClick={() => setIsExtension( false )}>
            <MyIcon>cross</MyIcon>
          </button>
        </div>

        {/* <div className={classname( ['input'] )}>
          <input
            key={i}
            ref={inputRef}
            type="number"
            min={1}
            max={max}
            onChange={( e ) => {
              const value = e.currentTarget.value
              const first = value[0]
              if ( first === '-' || first === '0' ) {
                e.currentTarget.value = `${i + 1}`
                return
              }
              if ( value !== '' && +value > max ) {
                e.currentTarget.value = `${max}`
                return
              }
            }}
            onBlur={( e ) => {
              const value = e.currentTarget.value
              if ( value === '' ) {
                e.currentTarget.value = `${i + 1}`
              }
            }}
            defaultValue={`${i + 1}`}
          ></input>
          <Button
            size="sm"
            onPress={() => {
              reorder( ( s ) => {
                const newS = [...s.slice( 0, i ), ...s.slice( i + 1 )]

                newS.splice( +inputRef.current.value - 1, 0, s[i] )
                return newS
              } )
            }}
          >
            이동
          </Button>
        </div> */}
        <div className={classname( ['input'] )}>
          <Input
            size="sm"
            label="패널티 입력"
            type="number"
            variant="underlined"
            min={0}
            isClearable
            onBeforeInput={( e ) => {
              if ( ( e as typeof e & { data: string } ).data === '-' ) {
                e.preventDefault()
              }
            }}
            onValueChange={( v ) => {
              setPenalty( ( s ) => ( { ...s, [info.currentDriver.playerId]: v as `${number}` } ) )
            }}
          />
        </div>
      </div>
    </Reorder.Item>
  )
}
