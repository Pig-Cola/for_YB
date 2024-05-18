import { classOption } from '@/utill/class-helper'
import styles from './index.module.scss'

import { useFileStore } from '@/zustand'
import { Reorder, useDragControls, m } from 'framer-motion'
import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from 'react'
import type { jsonFileType } from '@/types'
import { useNavigate } from 'react-router-dom'

const { ipcRenderer } = window.require( 'electron' )

const { classname } = classOption( styles )

export default function Replace() {
  const navi = useNavigate()
  const linkRef = useRef<HTMLAnchorElement>( null )
  const [link] = useState( <a ref={linkRef} hidden href={''} download={''}></a> )

  const { file, setFile } = useFileStore( ( s ) => s )

  const reader = useRef<FileReader | null>( null )

  useEffect( () => {
    reader.current = new FileReader()
  }, [] )

  const [text, setText] = useState( '' )

  useEffect( () => {
    if ( file && reader.current ) {
      reader.current.onload = ( e ) => {
        setText( ( e.target?.result as string ) || '' )
      }
      reader.current.readAsText( file )
    }
  }, [file] )

  const [obj, setObj] = useState<jsonFileType>()

  useEffect( () => {
    if ( !text ) return

    setObj( JSON.parse( text ) )
  }, [text] )

  const [readerBoard, setReaderBoard] = useState<jsonFileType['sessionResult']['leaderBoardLines']>()

  useEffect( () => {
    if ( !obj ) return

    setReaderBoard( [...obj.sessionResult.leaderBoardLines] )
  }, [obj] )

  return (
    <main className={classname( ['main'] )}>
      <div className={classname( ['menu'] )}>
        <button
          onClick={async () => {
            if ( !confirm( '저장 후에는 초기화가 불가능 합니다\n다른이름으로 저장했을 때에는 초기화 가능' ) ) {
              return
            }

            setObj( ( s ) => {
              const newS = { ...s, sessionResult: { ...s.sessionResult, leaderBoardLines: readerBoard } }
              try {
                return newS
              } finally {
                ipcRenderer.invoke( 'saveJson', newS, file.path ).then( () => {
                  alert( '저장되었습니다' )
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
              const newS = { ...s, sessionResult: { ...s.sessionResult, leaderBoardLines: readerBoard } }
              try {
                return newS
              } finally {
                linkRef.current.href =
                  /* `\
data:application/json;charset=utf-8,\
${JSON.stringify( newS, undefined, 2 )}\
` */
                  URL.createObjectURL( new Blob( [JSON.stringify( newS, undefined, 2 )], { type: 'application/json' } ) )
                linkRef.current.download = 'file'
                linkRef.current.click()
                console.log( linkRef.current.href )
              }
            } )
          }}
        >
          다른이름으로 저장
        </button>
        <button
          onClick={() => {
            setObj( JSON.parse( text ) )
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
        values={readerBoard || []}
        onReorder={setReaderBoard}
        style={{ overflowY: 'auto' }}
      >
        {readerBoard?.map( ( v, i ) => (
          <ItemSlot value={v} index={i} key={v.car.carId} reorder={setReaderBoard} />
        ) )}
      </Reorder.Group>
      <div className={classname( ['info'] )}>
        <p>서버 이름 : {obj?.serverName}</p>
        <br />
        <p>트랙 : {obj?.trackName}</p>
        <br />
        <p className={classname( ['filename'] )}>파일 이름 : {file?.name || 'file name'}</p>
        <br />
        <p>파일 위치 : {file?.path || 'file name'}</p>
        {link}
      </div>
    </main>
  )
}

type itemValue = jsonFileType['sessionResult']['leaderBoardLines'][number]
function ItemSlot( {
  value: v,
  index: i,
  reorder,
}: {
  value: itemValue
  index: number
  reorder: Dispatch<SetStateAction<itemValue[]>>
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
        <div className={classname( ['player-id'] )}>{v.currentDriver.playerId}</div>
      </div>

      <div className={classname( ['control'] )}>
        <div className={classname( ['input'] )}>
          <input ref={input} key={i} type="number" defaultValue={i + 1} />
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
