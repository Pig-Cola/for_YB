import { classOption } from '@/utill/class-helper'
import styles from './index.module.scss'

import { useFileStore } from '@/zustand'
import { Reorder, useDragControls, m } from 'framer-motion'
import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from 'react'

import { useNavigate } from 'react-router-dom'
import enc from 'encoding-japanese'
import cloneDeep from 'lodash/cloneDeep'
import partition from 'lodash/partition'

const { ipcRenderer } = window.require( 'electron' )

const { classname } = classOption( styles )

export default function Replace() {
  const navi = useNavigate()

  const [fileReload, doFileReload] = useState( false )
  const { file, setFile } = useFileStore( ( s ) => s ) // 선택된 파일 객체

  // 파일 raw text
  const [text, setText] = useState( '' )
  useEffect( () => {
    void fileReload

    if ( !file ) return

    ipcRenderer.invoke( 'readFile', file.path ).then( ( str ) => setText( str ) )
  }, [file, fileReload] )

  // json 객체
  const [obj, setObj] = useState<jsonFileType>()
  useEffect( () => {
    void fileReload

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

  // 순위 결과 객체
  const [leaderBoard, setLeaderBoard] = useState<jsonFileType['sessionResult']['leaderBoardLines']>()
  const [invalidLeaderBoard, setInvalidLeaderBoard] = useState<jsonFileType['sessionResult']['leaderBoardLines']>()
  useEffect( () => {
    if ( !obj ) return

    const [invalid, valid] = partition( obj.sessionResult.leaderBoardLines, ( v ) => v.timing.lastLap === 2147483647 )

    setLeaderBoard( valid )
    setInvalidLeaderBoard( invalid )
  }, [obj] )

  return (
    <main className={classname( ['main'] )}>
      <div className={classname( ['menu'] )}>
        <button
          onClick={async () => {
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
        </button>
        <button
          onClick={() => {
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
        </button>
        <button
          onClick={() => {
            doFileReload( ( s ) => !s )
          }}
        >
          초기화
        </button>
        <button
          onClick={() => {
            setFile( null )
            navi( '/' )
          }}
        >
          홈으로
        </button>
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
          <ItemSlot value={v} index={i} key={v.car.carId} max={leaderBoard.length} reorder={setLeaderBoard} />
        ) )}
      </Reorder.Group>
      <div className={classname( ['info'] )}>
        <div>
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
        <div>
          <p className={classname( ['title'] )}>대시보드 설명</p>
          <br />
          <div className={classname( ['example'] )}>
            <p className={classname( ['index'] )}>등수</p>
            <p className={classname( ['name'] )}>이름</p>
            <p className={classname( ['total-time'] )}>total time</p>
            <p className={classname( ['player-id'] )}>playerId</p>
          </div>
        </div>
      </div>
    </main>
  )
}

type itemValue = jsonFileType['sessionResult']['leaderBoardLines'][number]
function ItemSlot( {
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
