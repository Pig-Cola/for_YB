import { useCallback, useEffect, useMemo, useState } from 'react'

import { Button } from '@nextui-org/button'
import { Code } from '@nextui-org/code'
import { Input } from '@nextui-org/input'
import { Modal, ModalHeader, ModalBody, ModalContent } from '@nextui-org/modal'
import { Switch } from '@nextui-org/react'
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from '@nextui-org/table'
import { Tabs, Tab } from '@nextui-org/tabs'
import { Tooltip } from '@nextui-org/tooltip'

import { LeaderBoardItem, useSettingForLeaderBoard } from '@/zustand/settingForLeaderBoard'

import { MyIcon } from '../my-icon'

import styles from './index.module.scss'

import { classOption } from '@/utill/class-helper'

// import { MyIcon } from '../my-icon'
const { classname } = classOption( styles )

type ReaderBoardSettingProps = {
  isOpen: boolean
  onOpenChange: () => void
  targetRef?: React.RefObject<HTMLElement>
}

const RegPath = /^[a-zA-Z][a-zA-Z0-9]*(\.?[a-zA-Z][a-zA-Z0-9]*)*$/
export function LeaderBoardSetting( { isOpen, onOpenChange, targetRef }: ReaderBoardSettingProps ) {
  const {
    defaultProperties,
    userProperties,
    moreSetting: { includePenaltyWithCopy, penaltyTextZero },

    reset: _reset,

    pushUserPropperties,
    editUserProperties,
    removeUserProperties,
    move2UserProperties,

    toggleMoreSetting,
  } = useSettingForLeaderBoard()
  const [inputName, setInputName] = useState( '' )
  const [inputAccessor, setInputAccessor] = useState( '' )
  const [inputErr, setInputErr] = useState( { name: false, accessor: false } )
  const [isEditOpen, setEditOpen] = useState( -1 )
  const [forceR, setR] = useState( 0 )

  const displayData = useMemo( () => [...defaultProperties, ...userProperties], [defaultProperties, userProperties] )

  useEffect( () => {
    setInputErr( ( s ) => ( { ...s, name: displayData.findIndex( ( v ) => v.name === inputName ) !== -1 } ) )
  }, [displayData, inputName] )
  useEffect( () => {
    setInputErr( ( s ) => ( { ...s, accessor: !RegPath.test( inputAccessor ) && !!inputAccessor.length } ) )
  }, [inputAccessor] )

  useEffect( () => {
    if ( isOpen ) {
      targetRef?.current?.setAttribute( 'inert', '' )
    } else {
      targetRef?.current?.removeAttribute( 'inert' )
    }
  }, [isOpen, targetRef] )

  const disableKey = useMemo( () => displayData.filter( ( v ) => v.isImmutable ).map( ( v ) => v.name ), [displayData] )
  const [selectedName, setSelectedName] = useState<string>()

  const reset = useCallback( () => {
    _reset()
    setR( ( s ) => ++s )
    setInputName( '' )
    setInputAccessor( '' )
  }, [_reset] )

  return (
    <Modal
      classNames={{ body: classname( ['modal'] ) }}
      size="2xl"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      // isDismissable={false}
      // isKeyboardDismissDisabled
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader>리더보드 설정</ModalHeader>
        <ModalBody>
          <Tabs variant="bordered">
            <Tab key={'init'} title={'기본 설정'}>
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
                  <Tooltip content="접근자 설정을 초기화 합니다" color="danger">
                    <Button
                      color="danger"
                      onPress={() => {
                        if ( !confirm( '사용자의 모든 접근자가 초기화됩니다.\n진행하시겠습니까?' ) ) return
                        reset()
                      }}
                    >
                      초기화
                    </Button>
                  </Tooltip>
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
                {/* TODO: 접근자 자동완성 - nextui/autocomplete 이용하기 */}
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
                      isNameVisible: true,
                    } )
                    setInputName( '' )
                    setInputAccessor( '' )
                  }}
                >
                  <MyIcon>plus</MyIcon>
                </Button>
              </div>

              <Table
                removeWrapper
                disabledKeys={disableKey}
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
                    if ( item.name === 'name' ) return
                    return (
                      <TableRow key={item.name}>
                        <TableCell>
                          <div className={classname( ['custom-name'] )}>
                            <Button
                              size="sm"
                              onPress={() => {
                                editUserProperties( { ...item, isNameVisible: !item.isNameVisible } )
                              }}
                            >
                              <MyIcon>{`eye${item.isNameVisible ? '' : '-blocked'}`}</MyIcon>
                            </Button>
                            <span style={{ color: item.color }}>{`${item.name}`}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={classname( ['custom-cell'] )}>
                            <Code className={classname( ['code', { isVisible }] )}>{item.getter}</Code>
                            <div className={classname( ['btns'] )}>
                              <Tooltip content={isVisible ? '정보 표기하지 않기' : '정보 표기하기'} placement="left">
                                <Button
                                  size="sm"
                                  onPress={() => {
                                    editUserProperties( { ...item, isVisible: !item.isVisible } )
                                  }}
                                >
                                  <MyIcon>{`eye${item.isVisible ? '' : '-blocked'}`}</MyIcon>
                                </Button>
                              </Tooltip>
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
                                  setSelectedName( ( s ) => ( item.name !== s ? s : '' ) )
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
            </Tab>

            <Tab key={'no-name'} title="추가 설정">
              <div className={classname( ['more-setting'] )}>
                <div className={classname( ['setting-item'] )}>
                  <p>표기 정보 복사 - 페널티 정보 포함</p>
                  <Switch
                    isSelected={includePenaltyWithCopy}
                    onValueChange={() => toggleMoreSetting( 'includePenaltyWithCopy' )}
                  />
                  <p className={classname( ['description'] )}>표기 정보를 복사할 때, 페널티 정보를 포함할지 여부</p>
                </div>
                <div className={classname( ['setting-item', { disable: !includePenaltyWithCopy }] )}>
                  <p>페널티 값 항상 표기</p>
                  <Switch
                    isSelected={penaltyTextZero}
                    onValueChange={() => toggleMoreSetting( 'penaltyTextZero' )}
                    isDisabled={!includePenaltyWithCopy}
                  />
                  <p className={classname( ['description'] )}>페널티 값이 0일 때에도 페널티 표기</p>
                </div>
              </div>
            </Tab>
          </Tabs>
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
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false} isKeyboardDismissDisabled>
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
