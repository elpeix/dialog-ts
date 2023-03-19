import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { dialogActions, dialogsState } from '../../features/dialogs/dialogSlice'
import { DialogsStateType, DialogType } from '../../features/dialogs/types'
import styles from './DialogCanvas.module.css'
import Menu from '../Menu'
import Dialog from '../dialog/Dialog'
import DialogContextMenu from '../DialogContextMenu'
import Confirm from '../confirm/Confirm'

export default function DialogCanvas() {

  const { dialogs } = useSelector<DialogsStateType>(dialogsState) as DialogsStateType
  const dispatch = useDispatch()
  const [confirm, setConfirm] = useState<JSX.Element | null>(null)

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

  const closeAll = () => {
    if (dialogs.length > 0) {
      setConfirm(<Confirm
        confirmText="Close all dialogs?"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          dispatch(dialogActions.closeAll())
          setConfirm(null)
        }}
      />)
    }
  }

  return (
    <div className={styles.canvas} onClick={handleOnClick} onContextMenu={handleOnContextMenu}>
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
      <div className={styles.footer}>
        <Menu />
        <div className={styles.bar}>
          {dialogs.map((dialog: DialogType) => (
            <React.Fragment key={`barDialog${dialog.id}`}>
              <div
                className={`
                  ${styles.tab}
                  ${dialog.config.focused ? styles.focused : ''}
                  ${dialog.config.minimized ? styles.minimized : ''}
                `}
                title={dialog.title}
                onClick={() => dispatch(dialogActions.toTop({id: dialog.id}))}
                onContextMenu={(e) => dispatch(dialogActions.showContextMenu({id: dialog.id, event: e}))}
              >
                <span>{dialog.title}</span>
              </div>
              <DialogContextMenu id={dialog.id} config={dialog.config} />
            </React.Fragment>
          ))}
        </div>
        { dialogs.length ? <button onClick={closeAll}>Close All</button> : null }
      </div>
      {confirm}
    </div>
  )
}