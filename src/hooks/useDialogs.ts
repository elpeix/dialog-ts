import { useDispatch, useSelector } from 'react-redux'
import { DialogCreateType, DialogsStateType } from '../features/dialogs/types'
import { dialogActions, dialogsState, tryToClose } from '../features/dialogs/dialogSlice'

export const useDialogs = () => {

  const dispatch = useDispatch()
  const { dialogs, confirmDialog } = useSelector(dialogsState) as DialogsStateType

  return {
    dialogs,
    confirmDialog,

    create: (dialog: DialogCreateType) => dispatch(dialogActions.create(dialog)),
    clearFocus: () => dispatch(dialogActions.clearFocus()),
    hideContextMenu: () => dispatch(dialogActions.hideContextMenu()),
    
    hideCloseConfirm: () => dispatch(dialogActions.hideCloseConfirm()),
    closeAll: () => dispatch(dialogActions.closeAll()),

    toNextVisible: () => dispatch(dialogActions.toNextVisible()),
    toPreviousVisible: () => dispatch(dialogActions.toPreviousVisible()),
    toPrevious: () => dispatch(dialogActions.toPrevious()),
    toNext: () => dispatch(dialogActions.toNext()),

    toTop: (id: string) => dispatch(dialogActions.toTop({ id })),
    setMaximize: (id: string, maximized: number) => dispatch(dialogActions.setMaximize({ id, maximized })),
    showContextMenu: (id: string, x: number, y: number) => dispatch(dialogActions.showContextMenu({ id, x, y })),
    close: (id: string) => dispatch(tryToClose({ id })),
    forceClose: (id: string) => dispatch(dialogActions.forceClose({ id })),
  }

}