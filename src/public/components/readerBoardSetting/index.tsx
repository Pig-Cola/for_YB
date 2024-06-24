import { useCallback, useEffect, useMemo, useState } from 'react'

import { Button } from '@nextui-org/button'
import { Code } from '@nextui-org/code'
import { Input } from '@nextui-org/input'
import { Modal, ModalHeader, ModalBody, ModalContent } from '@nextui-org/modal'
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from '@nextui-org/table'

import { LeaderBoardItem, useSettingForLeaderBoard } from '@/zustand/settingForLeaderBoard'

import { MyIcon } from '../my-icon'

import styles from './index.module.scss'
import { classOption } from '@/utill/class-helper'

// import { MyIcon } from '../my-icon'
const { classname } = classOption( styles )

type ReaderBoardSettingProps = {
  isOpen: boolean
  onOpenChange: () => void
}

const RegPath = /^[a-zA-Z][a-zA-Z0-9]*(\.?[a-zA-Z][a-zA-Z0-9]*)*$/
export function ReaderBoardSetting( { isOpen, onOpenChange }: ReaderBoardSettingProps ) {
  const {
    defaultProperties,
    userProperties,

    reset: _reset,

    pushUserPropperties,
    editUserProperties,
    removeUserProperties,
    move2UserProperties,
  } = useSettingForLeaderBoard()
  const [inputName, setInputName] = useState( '' )
  const [inputAccessor, setInputAccessor] = useState( '' )
  const [inputErr, setInputErr] = useState( { name: false, accessor: false } )
  const [forceR, setR] = useState( 0 )
  const [isEditOpen, setEditOpen] = useState( -1 )

  const displayData = useMemo( () => [...defaultProperties, ...userProperties], [defaultProperties, userProperties] )

  useEffect( () => {
    setInputErr( ( s ) => ( { ...s, name: displayData.findIndex( ( v ) => v.name === inputName ) !== -1 } ) )
  }, [displayData, inputName] )
  useEffect( () => {
    setInputErr( ( s ) => ( { ...s, accessor: !RegPath.test( inputAccessor ) && !!inputAccessor.length } ) )
  }, [inputAccessor] )

  const disable = useMemo( () => displayData.filter( ( v ) => v.isImmutable ).map( ( v ) => v.name ), [displayData] )
  const [selectedName, setSelectedName] = useState<string>()

  const reset = useCallback( () => {
    _reset()
    setSelectedName( '' )
    setR( ( s ) => ++s )
  }, [_reset] )

  return (
    <Modal
      classNames={{ body: classname( ['modal'] ) }}
      size="2xl"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader>리더보드 설정</ModalHeader>
        <ModalBody>
          <div className={classname( ['input'] )}>
            <Button
              color="primary"
              onPress={() => {
                move2UserProperties( selectedName, -1 )
              }}
              isDisabled={!selectedName}
            >
              <MyIcon>arrow-up2</MyIcon>
            </Button>
            <Button
              color="primary"
              onPress={() => {
                move2UserProperties( selectedName, 1 )
              }}
              isDisabled={!selectedName}
            >
              <MyIcon>arrow-down2</MyIcon>
            </Button>
            <div className={classname( ['reset-btn'] )}>
              <Button
                color="danger"
                onPress={() => {
                  reset()
                }}
              >
                초기화
              </Button>
            </div>
          </div>

          <div className={classname( ['input'] )}>
            <Input
              classNames={{ base: classname( ['name'] ) }}
              value={inputName}
              onValueChange={setInputName}
              label="이름"
              isInvalid={inputErr.name}
            />
            <Input
              classNames={{ base: classname( ['accessor'] ) }}
              value={inputAccessor}
              onValueChange={setInputAccessor}
              label="접근자"
              isInvalid={inputErr.accessor}
            />
            <Button
              color="primary"
              isDisabled={!( inputName.length && inputAccessor.length )}
              onPress={() => {
                pushUserPropperties( {
                  name: inputName,
                  getter: inputAccessor,
                  isImmutable: false,
                  isVisible: true,
                  color: '#ffffff',
                } )
                setInputName( '' )
                setInputAccessor( '' )
              }}
            >
              <MyIcon>plus</MyIcon>
            </Button>
          </div>

          <Table
            disabledKeys={disable}
            selectionMode="single"
            color="primary"
            onSelectionChange={( k ) => setSelectedName( [...k][0] as string )}
            key={forceR}
          >
            <TableHeader>
              <TableColumn key="name">이름</TableColumn>
              <TableColumn key="getter">설정된 접근자</TableColumn>
            </TableHeader>
            <TableBody>
              {/* {( item ) => (
                  <TableRow key={`${item.name}`}>
                    {( colkey ) => (
                      <TableCell>{renderCell( item, colkey as keyof ( typeof displayData )[number] )}</TableCell>
                    )}
                  </TableRow>
                )} */}
              {displayData.map( ( item, i, o ) => {
                const { isVisible } = item
                if ( item.name === 'name' )
                  return (
                    <TableRow key={item.name}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.getter}</TableCell>
                    </TableRow>
                  )
                return (
                  <TableRow key={item.name}>
                    <TableCell>
                      <span style={{ color: item.color }}>{item.name}</span>
                    </TableCell>
                    <TableCell>
                      <div className={classname( ['custom-cell'] )}>
                        <Code className={classname( ['code', { isVisible }] )}>{item.getter}</Code>
                        <div className={classname( ['btns'] )}>
                          <Button
                            size="sm"
                            onPress={() => {
                              editUserProperties( { ...item, isVisible: !item.isVisible } )
                            }}
                          >
                            <MyIcon>{`eye${item.isVisible ? '' : '-blocked'}`}</MyIcon>
                          </Button>
                          <Button
                            size="sm"
                            onPress={() => {
                              setEditOpen( i )
                            }}
                          >
                            <MyIcon>pencil</MyIcon>
                            <EditModal
                              item={item}
                              allData={o}
                              isOpen={isEditOpen === i}
                              onOpenChange={() => {
                                setEditOpen( -1 )
                              }}
                              onChange={editUserProperties.bind( null, item )}
                            />
                          </Button>
                          <Button
                            size="sm"
                            onPress={() => {
                              removeUserProperties( item )
                            }}
                          >
                            <MyIcon>bin</MyIcon>
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              } )}
            </TableBody>
          </Table>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

type EditModalProps = {
  isOpen: boolean
  onOpenChange: ( a: boolean ) => void
  allData: LeaderBoardItem[]
  item: LeaderBoardItem
  onChange: ( to: LeaderBoardItem ) => void
}
const EditModal = ( { isOpen, onOpenChange, allData, item, onChange }: EditModalProps ) => {
  const [inputName, setInputName] = useState( item.name )
  const [inputAccessor, setInputAccessor] = useState( item.getter )
  const [_color, setColor] = useState( item.color.slice( 1 ) )
  const color = useMemo( () => `#${_color}`, [_color] )
  const [err, setErr] = useState( { name: false, accessor: false } )
  const [colorErr, setColorErr] = useState( false )
  useEffect( () => {
    let tempErr = false
    if ( _color.length !== 6 ) tempErr = true

    const tempArr = [
      ...( function* ( str: string ) {
        let temp = ''
        for ( let i = 0; i < str.length; i++ ) {
          temp += str[i]
          if ( temp.length > 1 ) {
            yield temp
            temp = ''
          }
        }
        if ( temp.length ) yield temp
      } )( _color ),
    ]

    if ( tempArr.every( ( v ) => parseInt( v, 16 ) > 255 ) ) tempErr = true

    setColorErr( tempErr )
  }, [_color] )

  useEffect( () => {
    setErr( ( s ) => {
      const newErr = { ...s }
      if ( allData.filter( ( v ) => v.name !== item.name ).some( ( v ) => v.name === inputName ) || !inputName.length ) {
        newErr.name = true
      } else {
        newErr.name = false
      }
      return newErr
    } )
  }, [allData, inputName, item.name] )
  useEffect( () => {
    setErr( ( s ) => ( { ...s, accessor: !RegPath.test( inputAccessor ) } ) )
  }, [inputAccessor] )

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false} isKeyboardDismissDisabled={true}>
      <ModalContent>
        <ModalHeader>edit</ModalHeader>
        <ModalBody>
          <Input label="이름" value={inputName} onValueChange={setInputName} isInvalid={err.name} />
          <Input label="접근자" value={inputAccessor} onValueChange={setInputAccessor} isInvalid={err.accessor} />
          <Input
            label="색상코드 (ex: #a1b2c3)"
            value={color}
            onValueChange={( v ) => {
              setColor( v.slice( 1 ) )
            }}
            isInvalid={colorErr}
          />
          <Button
            color="primary"
            fullWidth
            onPress={() => {
              onChange( { ...item, name: inputName, getter: inputAccessor, color } )
              onOpenChange( false )
            }}
          >
            저장
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
