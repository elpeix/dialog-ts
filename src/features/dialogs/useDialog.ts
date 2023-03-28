import { useDispatch, useSelector } from 'react-redux'
import { dialogActions, tryToClose } from './dialogSlice'
import { getDialog } from './services'
import { DialogType, MaximizedValues, RootState } from './types'

export const useDialog = ({ id }: { id: string }) => {

  const dispatch = useDispatch()
  const dialog = useSelector<RootState>(state => 
    getDialog(state.dialogsState.dialogs, id)
  ) as DialogType

  const close = () => {
    dispatch(tryToClose({ id }))
  }

  const toggleMinimize = () => {
    dispatch(dialogActions.toggleMinimize({ id }))
  }

  const maximize = () => {
    dispatch(dialogActions.setMaximize({ id, maximized: MaximizedValues.FULL }))
  }

  const restore = () => {
    dispatch(dialogActions.setMaximize({ id, maximized: MaximizedValues.NONE }))
  }

  const focus = () => {
    dispatch(dialogActions.toTop({ id }))
  }

  const setPreventClose = (preventClose: boolean) => {
    dispatch(dialogActions.setPreventClose({ id, preventClose }))
  }

  return {
    dialog,
    close,
    toggleMinimize,
    maximize,
    restore,
    focus,
    setPreventClose
  }
}