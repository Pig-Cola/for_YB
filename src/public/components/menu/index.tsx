import { useNavigate } from 'react-router-dom'

import { Button } from '@nextui-org/button'
import { Tooltip } from '@nextui-org/tooltip'
import enc from 'encoding-japanese'
import _get from 'lodash/get'

import { MyIcon } from '@/components/my-icon'
import { useFileStore } from '@/zustand/fileStore'
import { useSettingForLeaderBoard } from '@/zustand/settingForLeaderBoard'

import styles from './index.module.scss'
import { classOption } from '@/utill/class-helper'

import type { useDisclosure } from '@nextui-org/use-disclosure'

const { classname } = classOption( styles )

type MenuProps = {
  settingOptions: ReturnType<typeof useDisclosure>
  leaderBoard: jsonFileTypeEx['sessionResult']['leaderBoardLines']
  invalidLeaderBoard: jsonFileTypeEx['sessionResult']['leaderBoardLines']
  setLeaderBoard: React.Dispatch<React.SetStateAction<jsonFileTypeEx['sessionResult']['leaderBoardLines'] | undefined>>
  setObj: React.Dispatch<React.SetStateAction<jsonFileTypeEx | undefined>>
  doFileReload: React.Dispatch<React.SetStateAction<number>>
  penalty: Record<string, `${number}`>
}

const Menu = ( {
  settingOptions,
  leaderBoard,
  invalidLeaderBoard,
  setLeaderBoard,
  setObj,
  doFileReload,
  penalty,
}: MenuProps ) => {
  const navigate = useNavigate()
  const { setFile } = useFileStore( ( s ) => s )
  const { userProperties } = useSettingForLeaderBoard()

  return (
    <div className={classname( ['menu'] )}>
      <Tooltip content="설정">
        <Button size="sm" onPress={settingOptions.onOpen}>
          <MyIcon>cog</MyIcon>
        </Button>
      </Tooltip>

      <Button
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
                      enc.convert(
                        new Uint16Array(
                          enc.stringToCode(
                            JSON.stringify( newS, ( key, value ) => ( key !== 'carModelString' ? value : undefined ), 2 ),
                          ),
                        ),
                        'UTF16LE',
                      ),
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

      <Tooltip color="primary" placement="bottom" content="일부 기능만 작동">
        <Button
          color="primary"
          size="sm"
          onPress={() => {
            if ( !confirm( '기존 정렬을 무시하고 재정렬 됩니다.' ) ) return

            setLeaderBoard( ( s ) => {
              const temp = s
                .toSorted(
                  ( a, b ) =>
                    a.timing.totalTime +
                    ( +penalty[a.currentDriver.playerId] || 0 ) -
                    ( b.timing.totalTime + ( +penalty[b.currentDriver.playerId] || 0 ) ),
                )
                .toSorted( ( a, b ) => b.timing.lapCount - a.timing.lapCount )

              return temp
            } )
          }}
        >
          사용자 정렬
        </Button>
      </Tooltip>

      <Button
        size="sm"
        color="secondary"
        onPress={() => {
          setFile( null )
          navigate( '/' )
        }}
      >
        홈으로
      </Button>
    </div>
  )
}

export default Menu
