import { classOption } from '@/utill/class-helper'
import styles from './index.module.scss'

import { useFileStore } from '@/zustand'
import { Reorder, useDragControls, m } from 'framer-motion'
import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from 'react'
import type { jsonFileType } from '@/types'
import { useNavigate } from 'react-router-dom'
import enc, { type Encoding } from 'encoding-japanese'

const { ipcRenderer } = window.require( 'electron' )

const { classname } = classOption( styles )

export default function Replace() {
  const navi = useNavigate()
  const linkRef = useRef<HTMLAnchorElement>( null )
  const [link] = useState( <a ref={linkRef} hidden href={''} download={''}></a> )

  const { file, setFile } = useFileStore( ( s ) => s )

  const [text, setText] = useState( '' )

  useEffect( () => {
    if ( file ) {
      file.arrayBuffer().then( ( bff ) => {
        const arrBff = new Uint8Array( bff )
        const temp = enc.detect( arrBff, ['UTF32', 'UTF16LE', 'UTF16', 'UTF8'] ) as Encoding
        // console.log( temp )
        const conv = enc.convert( arrBff, { to: 'UNICODE', from: temp } )
        const str = enc.codeToString( conv )
        // console.log( str )
        setText( str )
      } )
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
            if ( !confirm( '저장 후에는 초기화가 불가능 합니다.\n다른이름으로 저장했을 때에는 초기화 가능.' ) ) return

            setObj( ( s ) => {
              const newS = { ...s, sessionResult: { ...s.sessionResult, leaderBoardLines: readerBoard } }
              try {
                return newS
              } finally {
                ipcRenderer.invoke( 'saveJson', newS, file.path ).then( () => {
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
            alert( '해당 파일에 덮어 쓰는 경우 초기화가 불가능합니다.' )
            setObj( ( s ) => {
              const newS = { ...s, sessionResult: { ...s.sessionResult, leaderBoardLines: readerBoard } }
              try {
                return newS
              } finally {
                linkRef.current.href = URL.createObjectURL(
                  new Blob(
                    [
                      enc.codeToString(
                        enc.convert( new Uint8Array( enc.stringToCode( JSON.stringify( newS, undefined, 4 ) ) ), 'UTF16LE' ),
                      ),
                    ],
                    {
                      type: 'application/json',
                    },
                  ),
                )
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
          <ItemSlot value={v} index={i} key={v.car.carId} max={readerBoard.length} reorder={setReaderBoard} />
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
          {link}
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
