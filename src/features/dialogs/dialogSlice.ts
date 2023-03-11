import { createSlice } from '@reduxjs/toolkit'
import { dialogExists, getMaxZIndex, toggleMinimize, toTop, toTopPrevious } from './services'
import { DialogsStateType } from './types'

const initialState: DialogsStateType = {
  dialogs: [],
  position: {
    left: 20,
    top: 20
  }
}

const dialogsSlice = createSlice({
  name: 'dialogs',
  initialState,
  reducers: {
    create: (state: DialogsStateType, action) => {
      if (dialogExists(state.dialogs, action.payload.id)) {
        toTop(state.dialogs, action.payload.id)
        return
      }
      state.dialogs.forEach(dialog => dialog.config.focused = false)
      state.dialogs.push({
        id: action.payload.id,
        title: action.payload.title,
        config: {
          focused: true,
          minimized: false,
          width: action.payload.config.width,
          height: action.payload.config.height,
          parent: action.payload.config.parent,
          left: state.position.left,
          top: state.position.top,
          zIndex: getMaxZIndex(state.dialogs) + 1,
        },
        children: action.payload.children
      })
      if (state.position.left > window.innerWidth - 130) { 
        state.position.left = initialState.position.left
        state.position.top = initialState.position.top
      } else {
        if (state.position.top > window.innerHeight - 180) {
          state.position.top = initialState.position.top + 35
          state.position.left = initialState.position.left + 185
        } else {
          state.position.top += 50
          state.position.left += 50
        }  
      }
    },
    close: (state: DialogsStateType, action) => {
      state.dialogs = state.dialogs.filter(dialog => dialog.id !== action.payload.id)
      toTopPrevious(state.dialogs)
    },
    closeAll: (state: DialogsStateType, ) => {
      state.dialogs = initialState.dialogs
      state.position = initialState.position
    },
    toTop: (state: DialogsStateType, action) => {
      toTop(state.dialogs, action.payload.id)
    },
    toggleMinimize: (state: DialogsStateType, action) => {
      toggleMinimize(state.dialogs, action.payload.id)
    }
  }
})

export default dialogsSlice.reducer
export const dialogActions = dialogsSlice.actions
export const dialogsState = (state: DialogsStateType) => state.dialogs