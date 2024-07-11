import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// with local storage
export const SETTING_FOR_LEADERBOARD_STORAGE_KEY = 'setting-leaderboard'

export type LeaderBoardItem = {
  name: string
  getter: string
  isVisible: boolean
  isImmutable: boolean
  color: string
  isNameVisible: boolean
}
type LocalStore_State = {
  defaultProperties: LeaderBoardItem[]
  userProperties: LeaderBoardItem[]
}
type LocalStore_Method = {
  reset: () => void

  pushUserPropperties: ( item: LeaderBoardItem ) => void
  removeUserProperties: ( obj: LeaderBoardItem ) => void
  move2UserProperties: ( name: LeaderBoardItem['name'], to: -1 | 1 ) => void
  editUserProperties: ( obj: LeaderBoardItem, to?: LeaderBoardItem | undefined ) => void
}

const initUserProperties: LocalStore_State['userProperties'] = [
  {
    name: 'Total Time',
    getter: 'timing.totalTime',
    isImmutable: false,
    isVisible: true,
    color: '#00ffff',
    isNameVisible: true,
  },
  {
    name: 'CarModel',
    getter: 'car.carModel',
    isImmutable: false,
    isVisible: true,
    color: '#ffc0cb',
    isNameVisible: true,
  },
  {
    name: 'player ID',
    getter: 'currentDriver.playerId',
    isImmutable: false,
    isVisible: false,
    color: '#808080',
    isNameVisible: true,
  },
  {
    name: 'lap count',
    getter: 'timing.lapCount',
    isImmutable: false,
    isVisible: true,
    color: '#6eed90',
    isNameVisible: true,
  },
]

export const useSettingForLeaderBoard = create<LocalStore_State & LocalStore_Method>()(
  persist(
    ( set ) => ( {
      defaultProperties: [
        {
          name: 'name',
          getter: '변경 불가능',
          isVisible: true,
          isImmutable: true,
          color: '#ffffff',
          isNameVisible: false,
        },
      ],
      userProperties: [...initUserProperties],

      reset: () => set( { userProperties: [...initUserProperties] } ),

      pushUserPropperties: ( item ) =>
        set( ( s ) => {
          const { userProperties } = s

          return { userProperties: [...userProperties, item] }
        } ),
      removeUserProperties: ( obj ) =>
        set( ( s ) => {
          const { userProperties } = s
          const temp = userProperties.filter( ( v ) => v.name !== obj.name )

          return {
            userProperties: temp,
          }
        } ),
      move2UserProperties: ( name, to ) =>
        set( ( s ) => {
          const { userProperties } = s
          const temp = [...userProperties]
          const idx = temp.findIndex( ( v ) => v.name === name )
          if ( idx === -1 ) return {}
          if ( idx + to < 0 || idx + to > temp.length ) return {}
          const v = temp.splice( idx, 1 )[0]
          temp.splice( idx + to, 0, v )
          return {
            userProperties: temp,
          }
        } ),
      editUserProperties: ( obj, to = undefined ) =>
        set( ( s ) => {
          const { userProperties } = s
          const idx = userProperties.findIndex( ( v ) => v.name === obj.name )
          if ( idx === -1 ) return {}

          return { userProperties: userProperties.slice( 0, idx ).concat( to || obj, userProperties.slice( idx + 1 ) ) }
        } ),
    } ),
    {
      name: SETTING_FOR_LEADERBOARD_STORAGE_KEY,
      storage: createJSONStorage( () => localStorage ),
      partialize: ( { defaultProperties, userProperties } ) => ( {
        defaultProperties,
        userProperties,
      } ),
      version: 2,
      migrate: ( ps, ver ) => {
        const temp = { ...( ps as any ) }
        switch ( ver ) {
          case 0: {
            console.log( 'v0 -> v1' )
            temp.userProperties = temp.userProperties.map( ( v: any ) => ( { ...v, isNameVisible: true } ) )
          }
          // falls through
          case 1: {
            console.log( 'v1 -> v2' )
            temp.userProperties.push( {
              name: 'lap count',
              getter: 'timing.lapCount',
              isImmutable: false,
              isVisible: true,
              color: '#6eed90',
              isNameVisible: true,
            } )
          }
        }
        return temp
      },
    },
  ),
)
