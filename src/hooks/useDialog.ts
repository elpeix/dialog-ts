import { useDispatch, useSelector } from 'react-redux'
import { dialogActions, tryToClose } from '../features/dialogs/dialogSlice'
import { getDialog } from '../features/dialogs/services'
import { DialogCreateType, DialogType, MaximizedValues, RootState } from '../features/dialogs/types'

export const useDialog = ({ id }: { id: string }) => {

  const dispatch = useDispatch()
  const dialog = useSelector<RootState>(state =>
    getDialog(state.dialogsState.dialogs, id)
  ) as DialogType

  const toTop = () => {
    dispatch(dialogActions.toTop({ id }))
  }

  const close = () => {
    dispatch(tryToClose({ id }))
  }

  const toggleMinimize = () => {
    dispatch(dialogActions.toggleMinimize({ id }))
  }

  const toggleMaximize = () => {
    dispatch(dialogActions.toggleMaximize({ id }))
  }

  const maximize = (maximized?: number) => {
    if (maximized === undefined) {
      maximized = MaximizedValues.FULL
    }
    dispatch(dialogActions.setMaximize({ id, maximized }))
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

  const showContextMenu = ({ x, y }: { x: number, y: number }) => {
    dispatch(dialogActions.showContextMenu({ id, x, y }))
  }

  const hideContextMenu = () => { // TODO: remove this
    dispatch(dialogActions.hideContextMenu())
  }

  const createChild = (dialog: DialogCreateType) => {
    dialog.config.parent = id
    dispatch(dialogActions.create(dialog))
  }

  return {
    dialog,
    toTop,
    close,
    toggleMaximize,
    toggleMinimize,
    maximize,
    restore,
    focus,
    setPreventClose,
    showContextMenu,
    hideContextMenu,
    createChild
  }
}