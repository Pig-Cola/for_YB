import { useEffect, useRef, useState } from 'react'

import { useDisclosure } from '@nextui-org/use-disclosure'
import { Reorder } from 'framer-motion'
import partition from 'lodash/partition'

import { useIpcRenderer } from '@/hooks/useIpcRenderer'

import { LeaderBoardItemSlot } from '@/components/ItemSlot'
import { LeaderBoardSetting } from '@/components/leaderBoardSetting'
import Menu from '@/components/menu'

import { useFileStore } from '@/zustand/fileStore'

import { getCarModelString } from '@/utill/getCarModel'
import { LAP_TIME_INFINITY } from '@/utill/global-variable'

import styles from './index.module.scss'

import { classOption } from '@/utill/class-helper'

const { classname } = classOption( styles )

export default function Replace() {
  const { ipcRenderer } = useIpcRenderer()
  const settingOptions = useDisclosure()
  const mainRef = useRef<HTMLDivElement>( null )

  const [fileReload, doFileReload] = useState( 0 )
  const { file } = useFileStore( ( s ) => s ) // 선택된 파일 객체
  const [text, setText] = useState( '' ) // 파일 raw text
  const [obj, setObj] = useState<jsonFileTypeEx>() // json 객체

  // 순위 결과 객체
  const [leaderBoard, setLeaderBoard] = useState<jsonFileTypeEx['sessionResult']['leaderBoardLines']>()
  const [invalidLeaderBoard, setInvalidLeaderBoard] = useState<jsonFileTypeEx['sessionResult']['leaderBoardLines']>()

  const [penalty, setPenalty] = useState( {} as Record<string, `${number}`> )
  useEffect( () => {
    void fileReload

    setPenalty( {} )
  }, [fileReload] )

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

      if ( v.timing.bestLap !== LAP_TIME_INFINITY ) return
      if ( v.timing.lastLap === LAP_TIME_INFINITY ) return

      v.timing.bestLap = v.timing.lastLap
      v.timing.bestSplits = v.timing.lastSplits
    } )

    setObj( temp )
  }, [fileReload, text] )

  // leaderBoard validation
  useEffect( () => {
    if ( !obj ) return

    const [invalid, valid] = partition(
      obj.sessionResult.leaderBoardLines,
      ( v ) => v.timing.lastLap === LAP_TIME_INFINITY,
    )

    setLeaderBoard( valid )
    setInvalidLeaderBoard( invalid )
  }, [obj] )

  const doRetire = (
    playerId: jsonFileTypeEx['sessionResult']['leaderBoardLines'][number]['currentDriver']['playerId'],
  ) => {
    setLeaderBoard( ( s ) => {
      const [valid, invalid] = partition( s, ( v ) => v.currentDriver.playerId !== playerId )
      setInvalidLeaderBoard( ( ss ) => [...invalid, ...ss] )
      return valid
    } )
  }

  // render
  return (
    <main className={classname( ['main'] )} ref={mainRef}>
      {/* menu-start */}
      <Menu
        {...{
          doFileReload,
          invalidLeaderBoard,
          leaderBoard,
          penalty,
          setLeaderBoard,
          setObj,
          settingOptions,
        }}
      />
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
              setPenalty={setPenalty}
              doRetire={doRetire}
            />
          ) )}
        </Reorder.Group>
      </div>

      <div className={classname( ['info'] )}>
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

        <div className={classname( ['noti'] )}>
          <span style={{ backgroundColor: '#006fee', color: '#fff', padding: '0.1rem' }}>사용자 정렬</span>기능은 현재
          같은 랩 수에서 'TotalTime + 페널티'의 오름차순 정렬만 지원합니다.
        </div>
      </div>

      <LeaderBoardSetting
        isOpen={settingOptions.isOpen}
        onOpenChange={settingOptions.onOpenChange}
        targetRef={mainRef}
      />
    </main>
  )
}
