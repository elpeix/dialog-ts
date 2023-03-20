import React from 'react'
import { useDispatch } from 'react-redux'
import { dialogActions } from '../features/dialogs/dialogSlice'
import { DialogBasicType, MaximizedValues } from '../features/dialogs/types'
import ContextMenu from './contextMenu/ContextMenu'

export default function DialogContextMenu({id, config}: DialogBasicType) {

  const dispatch = useDispatch()

  const toggleMinimize = () => {
    dispatch(dialogActions.toggleMinimize({ id }))
  }

  const maximize = () => {
    dispatch(dialogActions.setMaximize({ id, maximized: MaximizedValues.FULL }))
  }

  const restoreMaximize = () => {
    dispatch(dialogActions.setMaximize({ id, maximized: MaximizedValues.NONE }))
  }

  const close = () => {
    dispatch(dialogActions.close({ id }))
  }

  return (
    <>
      { config.contextMenu && 
        <ContextMenu 
          {...config.contextMenu} 
          zIndex = {config.zIndex * 10 + 1}>
          <>
            <div onClick={toggleMinimize}>
              {config.minimized ? 'Show' : 'Minimize'}
            </div>
            { !config.minimized && config.resizable && (
              <>
                {config.maximized !== MaximizedValues.NONE ? (
                  <div onClick={restoreMaximize}>Restore</div>
                ) : (
                  <div onClick={maximize}>Maximize</div>
                )}
              </>
            )}
            <div onClick={close}>Close</div>
          </>
        </ContextMenu>
      }
    </>
  )
}
