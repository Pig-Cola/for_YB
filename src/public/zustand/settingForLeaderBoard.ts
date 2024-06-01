import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// with local storage
export const SETTING_FOR_LEADERBOARD_STORAGE_KEY = 'setting-leaderboard'

type LeaderBoardItem = {
  name: string
  getter: string
  isVisible: boolean
  isImmutable: boolean
}
type LocalStore_State = {
  defaultProperties: LeaderBoardItem[]
  userProperties: LeaderBoardItem[]
}
type LocalStore_Method = {
  pushUserPropperties: ( item: LeaderBoardItem ) => void
  removeUserProperties: ( index: number ) => void
  move2UserProperties: ( idx: number, to: number ) => void
}
export const useSettingForLeaderBoard = create<LocalStore_State & LocalStore_Method>()(
  persist(
    ( set, get ) => ( {
      defaultProperties: [{ name: 'name', getter: '변경 불가능', isVisible: true, isImmutable: true }],
      userProperties: [],

      pushUserPropperties: ( item ) =>
        set( () => {
          const { userProperties } = get()

          return { userProperties: [...userProperties, item] }
        } ),
      removeUserProperties: ( idx ) =>
        set( () => {
          const { userProperties } = get()
          const temp = [...userProperties]
          temp.splice( idx, 1 )

          return {
            userProperties: temp,
          }
        } ),
      move2UserProperties: ( idx, to ) =>
        set( () => {
          const { userProperties } = get()
          const temp = [...userProperties]
          const v = temp.splice( idx, 1 )[0]
          temp.splice( to, 0, v )

          return {
            userProperties: temp,
          }
        } ),
    } ),
    {
      name: SETTING_FOR_LEADERBOARD_STORAGE_KEY,
      storage: createJSONStorage( () => localStorage ),
      partialize: ( { defaultProperties, userProperties } ) => ( {
        defaultProperties,
        userProperties,
      } ),
    },
  ),
)
