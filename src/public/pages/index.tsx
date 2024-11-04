import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useFileStore } from '@/zustand/fileStore'

import styles from './index.module.scss'

import { classOption } from '@/utill/class-helper'

const { classname } = classOption( styles )

export default function Home() {
  const [isDragOver, setIsDragOver] = useState( false )
  const fileInput = useRef<HTMLInputElement>( null )
  const [isError, setIsError] = useState( false )
  const { file, setFile } = useFileStore( ( s ) => s )
  const navi = useNavigate()

  useEffect( () => {
    if ( file ) {
      navi( '/replace' )
    }
  }, [file, navi] )

  useEffect( () => {
    if ( isError ) {
      setTimeout( setIsError, 500, false )
    }
  }, [isError] )

  const inputReset = useRef( 0 )
  const makeInput = useCallback( () => {
    return (
      <input
        key={inputReset.current++}
        type="file"
        accept=".json"
        hidden
        ref={fileInput}
        onSelect={( e ) => {
          console.log( e )
        }}
        onChange={( e ) => {
          e.preventDefault()
          try {
            if ( e.currentTarget.files?.[0]?.type !== 'application/json' ) {
              setIsError( true )
              return
            }
            setFile( e.currentTarget.files?.[0] )
          } finally {
            setMyinput( makeInput() )
          }
        }}
      />
    )
  }, [setFile] )

  const [myInput, setMyinput] = useState( makeInput() )

  return (
    <>
      <div
        className={classname( [
          'drag-box',
          {
            'drag-over': isDragOver,
            err: isError,
          },
        ] )}
        onDragEnter={( e ) => {
          e.preventDefault()
          setIsDragOver( true )
        }}
        onDragOver={( e ) => {
          e.preventDefault()
        }}
        onDragLeave={( e ) => {
          e.preventDefault()
          setIsDragOver( false )
        }}
        onDrop={( e ) => {
          e.preventDefault()
          setIsDragOver( false )
          const temp_file = e.dataTransfer.files
          if ( temp_file.length === 1 && temp_file[0].type === 'application/json' ) {
            setFile( temp_file[0] )
          } else {
            setIsError( true )
          }
        }}
      >
        <div>
          파일 불러오기
          <span className={classname( ['info'] )}>{' ( *.json )'}</span>
        </div>
        <br />
        <br />
        <br />
        <div className={classname( ['text-box'] )}>
          <span>
            파일을 끌어다 놓거나 {'(drag & drop) '}
            <a
              href="#"
              className={classname( ['clickable'] )}
              onClick={( e ) => {
                e.preventDefault()
                fileInput.current?.click()
              }}
            >
              여기를 클릭
            </a>
            해서 파일을 불러오기
          </span>
        </div>
        {myInput}
      </div>
    </>
  )
}
