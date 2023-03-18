import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { dialogActions, dialogsState } from '../features/dialogs/dialogSlice'
import { DialogsStateType, DialogType } from '../features/dialogs/types'
import styles from './DialogCanvas.module.css'
import Menu from './Menu'
import Dialog from './Dialog'
import DialogContextMenu from './DialogContextMenu'

export default function DialogCanvas() {

  const { dialogs } = useSelector<DialogsStateType>(dialogsState) as DialogsStateType
  const dispatch = useDispatch()

  const handleOnClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === e.currentTarget) {
      dispatch(dialogActions.clearFocus())
    }
    dispatch(dialogActions.hideContextMenu())
  }

  const handleOnContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault()
    dispatch(dialogActions.hideContextMenu())
    // Show general context menu?
  }

  return (
    <div className={styles.dialogCanvas} onClick={handleOnClick} onContextMenu={handleOnContextMenu}>
      <div className={styles.dialogs}>
        {dialogs.map((dialog :DialogType) => (
          <Dialog
            key={`dialog${dialog.id}`}
            title={dialog.title}
            id={dialog.id}
            config={dialog.config}
          >
            {dialog.children}
          </Dialog>
        ))}
      </div>
      <div className={styles.dialogsFooter}>
        <Menu />
        <div className={styles.dialogsFooterBar}>
          {dialogs.map((dialog: DialogType) => (
            <>
              <div
                key={`barDialog${dialog.id}`}
                className={`
                  ${styles.tab}
                  ${dialog.config.focused ? styles.focused : ''}
                  ${dialog.config.minimized ? styles.minimized : ''}
                `}
                onClick={() => dispatch(dialogActions.toTop({id: dialog.id}))}
                onContextMenu={(e) => dispatch(dialogActions.showContextMenu({id: dialog.id, event: e}))}
              >
                {dialog.title}
              </div>
              <DialogContextMenu key={`cm${dialog.id}`} id={dialog.id} config={dialog.config} />
            </>
          ))}
        </div>
      </div>
    </div>
  )
}