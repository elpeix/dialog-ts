import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { dialogActions, dialogsState } from './dialogSlice'
import { DialogsStateType, DialogType } from './types'
import styles from './DialogCanvas.module.css'
import Menu from '../../components/Menu'
import Dialog from './Dialog'

export default function DialogCanvas() {

  const { dialogs } = useSelector<DialogsStateType>(dialogsState) as DialogsStateType
  const dispatch = useDispatch()

  const toTop = (id: string) => dispatch(dialogActions.toTop({id: id}))

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
            <div
              key={`barDialog${dialog.id}`}
              className={`
                ${dialog.config.focused ? styles.focused : ''}
                ${dialog.config.minimized ? styles.minimized : ''}
              `}
              onClick={() => toTop(dialog.id)}
            >
              {dialog.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}