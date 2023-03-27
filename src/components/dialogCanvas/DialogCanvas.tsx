import React, { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { dialogActions, dialogsState } from '../../features/dialogs/dialogSlice'
import { DialogsStateType, DialogType, MaximizedValues, RootState } from '../../features/dialogs/types'
import styles from './DialogCanvas.module.css'
import Menu from '../Menu'
import Dialog from '../dialog/Dialog'
import DialogContextMenu from '../DialogContextMenu'
import Confirm from '../confirm/Confirm'

export default function DialogCanvas() {

  const { dialogs } = useSelector<RootState>(dialogsState) as DialogsStateType
  const dispatch = useDispatch()
  const [confirm, setConfirm] = useState<JSX.Element | null>(null)

  const clickHandler = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === e.currentTarget) {
      dispatch(dialogActions.clearFocus())
    }
    dispatch(dialogActions.hideContextMenu())
  }

  const contextMenuHandler = () => {
    // e.preventDefault() // Comment out to show general context menu
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

  const getFocused = useCallback(() => dialogs.find((dialog: DialogType) => dialog.config.focused), [dialogs])

  const keyDownHandler = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      dispatch(dialogActions.hideContextMenu())
    }
    if (e.key.toLowerCase() === 'q' && e.altKey && e.shiftKey) {
      closeAll()
    }
    if (e.key === 'ArrowRight' && e.altKey) {
      e.preventDefault()
      dispatch(dialogActions.toNextVisible())
    }
    if (e.key === 'ArrowLeft' && e.altKey) {
      e.preventDefault()
      dispatch(dialogActions.toPreviousVisible())
    }

    const focused = getFocused()
    if (e.key === 'Tab' && e.altKey) {
      if (dialogs.length === 0) {
        return
      }
      if (e.shiftKey) {
        dispatch(dialogActions.toPrevious())
      } else {
        dispatch(dialogActions.toNext())
      }
    }
    if (!focused) {
      return
    }
    if (e.key.toLocaleLowerCase() === 'w' && e.altKey && e.shiftKey) {
      dispatch(dialogActions.close({ id: focused.id }))
    }
    if (e.key === 'ArrowUp' && e.altKey && e.shiftKey) {
      dispatch(dialogActions.setMaximize({id: focused.id, maximized: MaximizedValues.FULL}))
    }
    if (e.key === 'ArrowLeft' && e.altKey && e.shiftKey) {
      dispatch(dialogActions.setMaximize({id: focused.id, maximized: MaximizedValues.LEFT}))
    }
    if (e.key === 'ArrowRight' && e.altKey && e.shiftKey) {
      dispatch(dialogActions.setMaximize({id: focused.id, maximized: MaximizedValues.RIGHT}))
    }
    if (e.key === 'ArrowDown' && e.altKey && e.shiftKey) {
      dispatch(dialogActions.setMaximize({id: focused.id, maximized: MaximizedValues.NONE}))
    }
  }

  return (
    <div 
      className={styles.canvas}
      onClick={clickHandler}
      onContextMenu={contextMenuHandler}
      onKeyDown={keyDownHandler}
      tabIndex={0}
    >
      {dialogs.map((dialog :DialogType) => (
        <Dialog
          key={`dialog${dialog.id}`}
          title={dialog.title}
          icon={dialog.icon}
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
                <div className={styles.tabIcon}>
                  {dialog.icon && <img src={dialog.icon} alt={dialog.title} /> }
                </div>
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