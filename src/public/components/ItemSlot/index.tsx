import { useEffect, useRef, useState, useTransition } from 'react'
import type { Dispatch, SetStateAction } from 'react'

import { Button } from '@nextui-org/button'
import { Input, Tooltip } from '@nextui-org/react'
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
  setPenalty: Dispatch<SetStateAction<Record<string, number>>>
  currentpenalty: number
  doRetire: ( playerId: string ) => void
}

export function LeaderBoardItemSlot( {
  value: info,
  index: i /* reorder, max */,
  setPenalty,
  currentpenalty,
  doRetire,
}: LeaderBoardItemSlotProps ) {
  const controls = useDragControls()
  const { userProperties } = useSettingForLeaderBoard()
  const [, startTransition] = useTransition()

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
                if ( item.getter === 'timing.totalTime' ) {
                  return +temp + currentpenalty // penalty를 totalTime에 적용
                }
                if ( typeof temp === 'object' ) return '잘못된 접근자 입니다.'
                return temp
              } )()}
            </div>
          ) )}
      </div>

      <div className={classname( ['control'] )} ref={controlRef}>
        <Tooltip color="danger" content="리스트에서 사라짐">
          <Button
            size="sm"
            color="danger"
            onPress={() => {
              doRetire( info.currentDriver.playerId )
            }}
          >
            <span>리타이어</span>
            <MyIcon>flag</MyIcon>
          </Button>
        </Tooltip>

        <Tooltip color="default" content="페널티 편집">
        <Button
          size="sm"
          onPress={() => {
            setIsExtension( true )
          }}
        >
          <MyIcon>pencil</MyIcon>
        </Button>
        </Tooltip>

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

        <div className={classname( ['input'] )}>
          <Input
            size="sm"
            label="패널티 입력 (단위: 초)"
            type="number"
            variant="underlined"
            min={0}
            defaultValue={`${currentpenalty / 1000 || ''}`}
            isClearable
            onBeforeInput={( e ) => {
              if ( ( e as typeof e & { data: string } ).data === '-' ) {
                e.preventDefault()
              }
            }}
            onValueChange={( v ) => {
              startTransition( () => setPenalty( ( s ) => ( { ...s, [info.currentDriver.playerId]: +v * 1000 } ) ) )
            }}
          />
        </div>
      </div>

      <div className={classname( [{ 'is-penalty': !!currentpenalty }] )}></div>
    </Reorder.Item>
  )
}
