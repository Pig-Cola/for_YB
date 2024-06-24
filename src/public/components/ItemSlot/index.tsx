import { type Dispatch, type SetStateAction, useState } from 'react'

import { Button } from '@nextui-org/button'
import { Input } from '@nextui-org/react'
import { Reorder, m, useDragControls } from 'framer-motion'
import _ from 'lodash'

import { useSettingForLeaderBoard } from '@/zustand/settingForLeaderBoard'

import styles from './index.module.scss'
import { classOption } from '@/utill/class-helper'

const { classname } = classOption( styles )

type itemValue = jsonFileType['sessionResult']['leaderBoardLines'][number]
export function ReaderBoardItemSlot( {
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
  const { userProperties } = useSettingForLeaderBoard()
  const [inputValue, setInputValue] = useState( `${i + 1}` )

  return (
    <Reorder.Item
      as="div"
      dragListener={false}
      drag={'y'}
      value={v}
      className={classname( ['board'] )}
      whileDrag={{ borderColor: 'lightgreen', scale: 0.95 }}
      dragControls={controls}
    >
      <div className={classname( ['user-info'] )}>
        <div className={classname( ['index'] )}># {i + 1}</div>
        <div className={classname( ['name'] )}>{`${v.currentDriver.firstName} ${v.currentDriver.lastName}`}</div>
        {userProperties
          ?.filter( ( item ) => item.isVisible )
          .map( ( item ) => (
            <div key={item.name} style={{ color: item.color }}>
              {item.name}: {_( v ).get( item.getter, '잘못된 접근자 입니다.' )}
            </div>
          ) )}
      </div>

      <div className={classname( ['control'] )}>
        <div className={classname( ['input'] )}>
          <Input
            key={i}
            type="number"
            min={1}
            max={max}
            value={inputValue}
            onValueChange={( value ) => {
              const first = value[0]
              if ( first === '-' || first === '0' ) return setInputValue( `${i + 1}` )
              if ( +value > max ) return setInputValue( `${max}` )
              return setInputValue( value )
            }}
            onBlur={() => {
              setInputValue( ( s ) => s || `${i + 1}` )
            }}
          ></Input>
          <Button
            size="sm"
            onPress={() => {
              reorder( ( s ) => {
                const newS = [...s.slice( 0, i ), ...s.slice( i + 1 )]
                newS.splice( +inputValue - 1, 0, s[i] )
                return newS
              } )
            }}
          >
            이동
          </Button>
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
