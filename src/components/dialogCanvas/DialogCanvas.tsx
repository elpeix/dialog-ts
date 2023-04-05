import React, { useCallback, useEffect, useState } from 'react'
import { DialogType, MaximizedValues } from '../../features/dialogs/types'
import styles from './DialogCanvas.module.css'
import Menu from '../Menu'
import Dialog from '../dialog/Dialog'
import DialogContextMenu from '../DialogContextMenu'
import Confirm from '../confirm/Confirm'
import { useDialogs } from '../../hooks/useDialogs'

export default function DialogCanvas() {

  const { 
    dialogs,
    confirmDialog,
    clearFocus,
    hideContextMenu,
    closeAll,
    hideCloseConfirm,
    toNextVisible,
    toPreviousVisible,
    toPrevious,
    toNext,
    toTop,
    setMaximize,
    showContextMenu,
    close,
    forceClose,
  } = useDialogs()

  const [confirm, setConfirm] = useState<JSX.Element | null>(null)

  const clickHandler = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      clearFocus()
    }
    hideContextMenu()
  }

  const contextMenuHandler = () => {
    // e.preventDefault() // Comment out to show general context menu
    hideContextMenu()
    // Show general context menu?
  }

  const dialogContextMenuHandler = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    e.preventDefault()
    showContextMenu(id, e.clientX, e.clientY)
  }

  const closeAllHandler = () => {
    if (dialogs.length > 0) {
      setConfirm(<Confirm
        confirmText="Close all dialogs?"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          closeAll()
          setConfirm(null)
        }}
      />)
    }
  }

  const getFocused = useCallback(() => dialogs.find((dialog: DialogType) => dialog.config.focused), [dialogs])

  const keyDownHandler = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      hideContextMenu()
    }
    if (e.key.toLowerCase() === 'q' && e.altKey && e.shiftKey) {
      closeAllHandler()
    }
    if (e.key === 'ArrowRight' && e.altKey) {
      e.preventDefault()
      toNextVisible()
    }
    if (e.key === 'ArrowLeft' && e.altKey) {
      e.preventDefault()
      toPreviousVisible()
    }

    const focused = getFocused()
    if (e.key === 'Tab' && e.altKey) {
      if (dialogs.length === 0) {
        return
      }
      if (e.shiftKey) {
        toPrevious()
      } else {
        toNext()
      }
    }
    if (!focused) {
      return
    }
    if (e.key.toLocaleLowerCase() === 'w' && e.altKey && e.shiftKey) {
      close(focused.id)
    }
    if (e.key === 'ArrowUp' && e.altKey && e.shiftKey) {
      setMaximize(focused.id,MaximizedValues.FULL)
    }
    if (e.key === 'ArrowLeft' && e.altKey && e.shiftKey) {
      setMaximize(focused.id,MaximizedValues.LEFT)
    }
    if (e.key === 'ArrowRight' && e.altKey && e.shiftKey) {
      setMaximize(focused.id,MaximizedValues.RIGHT)
    }
    if (e.key === 'ArrowDown' && e.altKey && e.shiftKey) {
      setMaximize(focused.id,MaximizedValues.NONE)
    }
  }

  useEffect(() => {
    if (confirmDialog && confirmDialog.show && confirmDialog.id) {
      setConfirm(<Confirm
        confirmText={confirmDialog.title}
        onCancel={() => {
          hideCloseConfirm()
          setConfirm(null)
        }}
        onConfirm={() => {
          hideCloseConfirm()
          forceClose(confirmDialog.id)
          setConfirm(null)
        }}
      />)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmDialog])

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
                onClick={() => toTop(dialog.id)}
                onContextMenu={(e) => dialogContextMenuHandler(e, dialog.id)}
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
        { dialogs.length ? <button onClick={closeAllHandler}>Close All</button> : null }
      </div>
      {confirm}
    </div>
  )
}