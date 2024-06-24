import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@nextui-org/button'
import { useDisclosure } from '@nextui-org/use-disclosure'
import enc from 'encoding-japanese'
import { Reorder } from 'framer-motion'
import cloneDeep from 'lodash/cloneDeep'
import partition from 'lodash/partition'

import { useIpcRenderer } from '@/hooks/useIpcRenderer'
import { ReaderBoardItemSlot } from '@/components/ItemSlot'
import { MyIcon } from '@/components/my-icon'
import { ReaderBoardSetting } from '@/components/readerBoardSetting'
import { useFileStore } from '@/zustand/fileStore'

import styles from './index.module.scss'
import { classOption } from '@/utill/class-helper'

const { classname } = classOption( styles )

export default function Replace() {
  const navi = useNavigate()
  const { ipcRenderer } = useIpcRenderer()
  const settingOptions = useDisclosure()

  const [fileReload, doFileReload] = useState( false )
  const { file, setFile } = useFileStore( ( s ) => s ) // 선택된 파일 객체
  const [text, setText] = useState( '' ) // 파일 raw text
  const [obj, setObj] = useState<jsonFileType>() // json 객체

  // 순위 결과 객체
  const [leaderBoard, setLeaderBoard] = useState<jsonFileType['sessionResult']['leaderBoardLines']>()
  const [invalidLeaderBoard, setInvalidLeaderBoard] = useState<jsonFileType['sessionResult']['leaderBoardLines']>()

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

    const temp = JSON.parse( text ) as jsonFileType
    temp.sessionResult.leaderBoardLines = temp.sessionResult.leaderBoardLines.map( ( v ) => {
      if ( v.timing.bestLap !== 2147483647 ) return v
      if ( v.timing.lastLap === 2147483647 ) return v

      const cloneValue = cloneDeep( v )
      cloneValue.timing.bestLap = cloneValue.timing.lastLap
      cloneValue.timing.bestSplits = cloneValue.timing.lastSplits

      return cloneValue
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
    <main className={classname( ['main'] )}>
      <div className={classname( ['menu'] )}>
        <Button size="sm" color="primary" onPress={settingOptions.onOpen}>
          <MyIcon>cog</MyIcon>
        </Button>
        <Button
          // color="primary"
          size="sm"
          onPress={async () => {
            if ( !confirm( '저장 후에는 초기화가 불가능 합니다.\n다른이름으로 저장했을 때에는 초기화 가능.' ) ) return

            setObj( ( s ) => {
              const newS = {
                ...s,
                sessionResult: { ...s.sessionResult, leaderBoardLines: leaderBoard.concat( invalidLeaderBoard ) },
              }
              try {
                return newS
              } finally {
                ipcRenderer.invoke( 'saveJson', newS, file.path ).then( () => {
                  navi( '/' )
                  alert( '저장되었습니다.' )
                } )
              }
            } )
          }}
        >
          저장
        </Button>
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
                alert( '해당 파일에 덮어 쓰는 경우 초기화가 불가능합니다.' )
                link.click()
              }
            } )
          }}
        >
          다른이름으로 저장
        </Button>
        <Button
          color="danger"
          size="sm"
          onPress={() => {
            doFileReload( ( s ) => !s )
          }}
        >
          초기화
        </Button>
        <Button
          color="success"
          size="sm"
          onPress={() => {
            setFile( null )
            navi( '/' )
          }}
        >
          홈으로
        </Button>
      </div>

      <Reorder.Group
        as="div"
        className={classname( ['leaderBoardLines'] )}
        axis="y"
        layoutScroll
        values={leaderBoard || []}
        onReorder={setLeaderBoard}
        style={{ overflowY: 'auto' }}
      >
        {leaderBoard?.map( ( v, i ) => (
          <ReaderBoardItemSlot
            value={v}
            index={i}
            key={v.car.carId}
            max={leaderBoard.length}
            reorder={setLeaderBoard}
          />
        ) )}
      </Reorder.Group>

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
      <ReaderBoardSetting isOpen={settingOptions.isOpen} onOpenChange={settingOptions.onOpenChange} />
    </main>
  )
}
