import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { 
  contextMenu, dialogExists, getMaxZIndex, hideContextMenu, setMaximize,
  toggleMaximize, toggleMinimize, toNext, toPrevious, toNextVisible, toPreviousVisible,
  toTop, getDialog, toTopPrevious 
} from './services'
import { DialogsStateType, MaximizedValues, RootState } from './types'

const initialState: DialogsStateType = {
  dialogs: [],
  confirmDialog: {
    show: false,
    title: '',
    message: '',
    id: ''
  },
  position: {
    left: 20,
    top: 20
  }
}

const forceCloseDialog = (state: DialogsStateType, id: string) => {
  state.dialogs = state.dialogs.filter(dialog => dialog.id !== id)
  toTopPrevious(state.dialogs)
  if (state.dialogs.length === 0) {
    state.position = initialState.position
  }
  state.confirmDialog = initialState.confirmDialog
}


export const tryToClose = createAsyncThunk(
  'dialogsState/tryToClose',
  ({ id }: {id: string}, thunkApi) => {
    const state = thunkApi.getState() as RootState
    const dialogState = state.dialogsState as DialogsStateType
    const dialog = getDialog(dialogState.dialogs, id)
    if (!dialog) {
      return thunkApi.rejectWithValue('nops')
    }
    return thunkApi.fulfillWithValue({ action: dialog.closePrevented ? 'preventClose' : 'ok' })
  }
) as any // eslint-disable-line @typescript-eslint/no-explicit-any

const dialogsSlice = createSlice({
  name: 'dialogState',
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
        icon: action.payload.icon,
        config: {
          focused: true,
          minimized: false,
          maximized: MaximizedValues.NONE,
          width: action.payload.config.width,
          height: action.payload.config.height,
          parent: action.payload.config.parent,
          left: state.position.left,
          top: state.position.top,
          resizable: action.payload.config.resizable ?? true,
          zIndex: getMaxZIndex(state.dialogs) + 1,
        },
        closePrevented: false,
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
    setPreventClose: (state: DialogsStateType, action) => {
      const dialog = getDialog(state.dialogs, action.payload.id)
      if (dialog) {
        dialog.closePrevented = action.payload.preventClose
      }
    },
    forceClose: (state: DialogsStateType, action) => forceCloseDialog(state, action.payload.id),
    closeAll: (state: DialogsStateType, ) => {
      state.dialogs = initialState.dialogs
      state.position = initialState.position
    },
    toTop: (state: DialogsStateType, action) => toTop(state.dialogs, action.payload.id),
    toPreviousVisible: (state: DialogsStateType, ) => toPreviousVisible(state.dialogs),
    toNextVisible: (state: DialogsStateType, ) => toNextVisible(state.dialogs),
    toPrevious: (state: DialogsStateType, ) => toPrevious(state.dialogs),
    toNext: (state: DialogsStateType, ) => toNext(state.dialogs),
    toggleMinimize: (state: DialogsStateType, action) => toggleMinimize(state.dialogs, action.payload.id),
    toggleMaximize: (state: DialogsStateType, action) => toggleMaximize(state.dialogs, action.payload.id),
    setMaximize: (state: DialogsStateType, action) => setMaximize(state.dialogs, action.payload.id, action.payload.maximized),
    showContextMenu: (state: DialogsStateType, action) => {
      const e = action.payload.event as React.MouseEvent<HTMLDivElement, MouseEvent>
      e.preventDefault()
      e.stopPropagation()
      hideContextMenu(state.dialogs)
      contextMenu(state.dialogs, action.payload.id, e.clientX, e.clientY)
    },
    hideContextMenu: (state: DialogsStateType, ) => hideContextMenu(state.dialogs),
    clearFocus: (state: DialogsStateType, ) => state.dialogs.forEach(dialog => dialog.config.focused = false),
    hideCloseConfirm: (state: DialogsStateType, ) => {state.confirmDialog.show = false}
  },
  extraReducers: (builder) => {
    builder
      .addCase(tryToClose.fulfilled, (state, action) => {
        if (action.payload.action === 'ok') {
          forceCloseDialog(state, action.meta.arg.id)
          return
        }
        state.confirmDialog = {
          ...state.confirmDialog,
          show: true,
          title: 'Close dialog?',
          id: action.meta.arg.id,
          message: 'Are you sure you want to close this dialog?',
        }
      })
      .addCase(tryToClose.rejected, (state, action) => {
        console.log('fetchUserById rejected', action)
      })
  }
})

export default dialogsSlice.reducer
export const dialogActions = dialogsSlice.actions
export const dialogsState = (state: RootState) => state.dialogsState