import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@nextui-org/button'
import { Tooltip } from '@nextui-org/tooltip'
import { useDisclosure } from '@nextui-org/use-disclosure'
import enc from 'encoding-japanese'
import { Reorder } from 'framer-motion'
import { default as _get } from 'lodash/get'
import partition from 'lodash/partition'

import { useIpcRenderer } from '@/hooks/useIpcRenderer'
import { LeaderBoardItemSlot } from '@/components/ItemSlot'
import { LeaderBoardSetting } from '@/components/leaderBoardSetting'
import { MyIcon } from '@/components/my-icon'
import { useFileStore } from '@/zustand/fileStore'
import { useSettingForLeaderBoard } from '@/zustand/settingForLeaderBoard'
import { getCarModelString } from '@/utill/getCarModel'

import styles from './index.module.scss'
import { classOption } from '@/utill/class-helper'

const { classname } = classOption( styles )

export default function Replace() {
  const navi = useNavigate()
  const { ipcRenderer } = useIpcRenderer()
  const settingOptions = useDisclosure()
  const mainRef = useRef<HTMLDivElement>( null )

  const [fileReload, doFileReload] = useState( 0 )
  const { file, setFile } = useFileStore( ( s ) => s ) // 선택된 파일 객체
  const [text, setText] = useState( '' ) // 파일 raw text
  const [obj, setObj] = useState<jsonFileTypeEx>() // json 객체

  const { userProperties } = useSettingForLeaderBoard()

  // 순위 결과 객체
  const [leaderBoard, setLeaderBoard] = useState<jsonFileTypeEx['sessionResult']['leaderBoardLines']>()
  const [invalidLeaderBoard, setInvalidLeaderBoard] = useState<jsonFileTypeEx['sessionResult']['leaderBoardLines']>()

  // file read
  useEffect( () => {
    void fileReload // reload

    if ( !file ) return

    ipcRenderer.invoke( 'readFile', file.path ).then( ( str ) => setText( str ) )
  }, [file, fileReload, ipcRenderer] )

  // text parsing
  useEffect( () => {
    void fileReload // reload

    if ( !text ) return

    const temp = JSON.parse( text ) as jsonFileTypeEx
    temp.sessionResult.leaderBoardLines.forEach( ( v ) => {
      v.car.carModelString = getCarModelString( v.car.carModel )

      if ( v.timing.bestLap !== 2147483647 ) return
      if ( v.timing.lastLap === 2147483647 ) return

      v.timing.bestLap = v.timing.lastLap
      v.timing.bestSplits = v.timing.lastSplits
    } )

    setObj( temp )
  }, [fileReload, text] )

  // leaderBoard validation
  useEffect( () => {
    if ( !obj ) return

    const [invalid, valid] = partition( obj.sessionResult.leaderBoardLines, ( v ) => v.timing.lastLap === 2147483647 )

    setLeaderBoard( valid )
    setInvalidLeaderBoard( invalid )
  }, [obj] )

  // render
  return (
    <main className={classname( ['main'] )} ref={mainRef}>
      {/* menu-start */}
      <div className={classname( ['menu'] )}>
        <Tooltip content="설정">
          <Button size="sm" onPress={settingOptions.onOpen}>
            <MyIcon>cog</MyIcon>
          </Button>
        </Tooltip>

        <Button
          // color="primary"
          size="sm"
          onPress={() => {
            setObj( ( s ) => {
              const newS = {
                ...s,
                sessionResult: { ...s.sessionResult, leaderBoardLines: leaderBoard.concat( invalidLeaderBoard ) },
              }
              try {
                return newS
              } finally {
                const link = document.createElement( 'a' )
                link.href = URL.createObjectURL(
                  new Blob(
                    [
                      enc.codeToString(
                        enc.convert( new Uint16Array( enc.stringToCode( JSON.stringify( newS, undefined, 2 ) ) ), 'UTF16LE' ),
                      ),
                    ],
                    {
                      type: 'application/json',
                    },
                  ),
                )
                link.download = 'file'
                alert( '원본 파일에 덮어 쓰는 경우 초기화가 불가능합니다.' )
                link.click()
              }
            } )
          }}
        >
          다른이름으로 저장
        </Button>

        <Tooltip content="순서 초기화" color="danger" placement="bottom">
          <Button
            color="danger"
            size="sm"
            onPress={() => {
              doFileReload( ( s ) => ++s )
            }}
          >
            초기화
          </Button>
        </Tooltip>

        <Tooltip color="success" content="Excel을 위한 데이터 복사" placement="bottom">
          <Button
            color="success"
            size="sm"
            onPress={async () => {
              const visible = userProperties.filter( ( v ) => v.isVisible )
              const table = document.createElement( 'table' )
              const thead = document.createElement( 'thead' )
              const tr = document.createElement( 'tr' )

              tr.appendChild(
                ( () => {
                  const temp = document.createElement( 'th' )
                  temp.innerText = 'name'
                  return temp
                } )(),
              )
              visible.forEach( ( { name: v } ) => {
                const temp = document.createElement( 'th' )
                temp.innerText = v
                tr.appendChild( temp )
              } )
              thead.appendChild( tr )

              const tbody = document.createElement( 'tbody' )
              leaderBoard?.forEach( ( item ) => {
                const tr = document.createElement( 'tr' )
                tr.appendChild(
                  ( () => {
                    const temp = document.createElement( 'td' )
                    temp.innerText = `${item.currentDriver.firstName} ${item.currentDriver.lastName}`
                    return temp
                  } )(),
                )
                visible.forEach( ( { getter } ) => {
                  const td = document.createElement( 'td' )
                  td.innerText = _get( item, getter, '잘못된 접근자 입니다' )
                  tr.appendChild( td )
                } )
                tbody.appendChild( tr )
              } )
              table.appendChild( thead )
              table.appendChild( tbody )

              const { clipboard } = window.require( 'electron' )
              clipboard.write( { text: table.textContent, html: table.outerHTML }, 'clipboard' )

              alert( '복사 완료!' )
            }}
          >
            표기 정보 복사
          </Button>
        </Tooltip>

        <Button
          color="secondary"
          size="sm"
          onPress={() => {
            setFile( null )
            navi( '/' )
          }}
        >
          홈으로
        </Button>
      </div>
      {/* menu-end */}

      <div className={classname( ['leaderBoardLines-wrapper'] )}>
        <Reorder.Group
          as="div"
          className={classname( ['leaderBoardLines'] )}
          axis="y"
          layoutScroll
          values={leaderBoard || []}
          onReorder={setLeaderBoard}
        >
          {leaderBoard?.map( ( v, i ) => (
            <LeaderBoardItemSlot
              value={v}
              index={i}
              key={`${v.car.carId}-${fileReload}`}
              max={leaderBoard.length}
              reorder={setLeaderBoard}
            />
          ) )}
        </Reorder.Group>
      </div>

      <div className={classname( ['info'] )}>
        <p>
          <span className={classname( ['title'] )}>파일 이름 : </span>
          {file?.name || 'file name'}
        </p>
        <p>
          <span className={classname( ['title'] )}>파일 위치 : </span>
          {file?.path || 'file name'}
        </p>
        <br />
        <br />

        <p>
          <span className={classname( ['title'] )}>서버 이름 : </span>
          {obj?.serverName}
        </p>
        <br />
        <p>
          <span className={classname( ['title'] )}>트랙 : </span>
          {obj?.trackName}
        </p>
      </div>

      <LeaderBoardSetting
        isOpen={settingOptions.isOpen}
        onOpenChange={settingOptions.onOpenChange}
        targetRef={mainRef}
      />
    </main>
  )
}
