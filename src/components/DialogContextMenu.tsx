import React from 'react'
import { useDispatch } from 'react-redux'
import { dialogActions } from '../features/dialogs/dialogSlice'
import { DialogBasicType, MaximizedValues } from '../features/dialogs/types'
import ContextMenu from './ContextMenu'

export default function DialogContextMenu({id, config}: DialogBasicType) {

  const dispatch = useDispatch()

  const toggleMinimize = () => {
    dispatch(dialogActions.toggleMinimize({ id }))
  }

  const toggleMaximize = () => {
    dispatch(dialogActions.toggleMaximize({ id, maximized: MaximizedValues.FULL }))
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
              <div onClick={toggleMaximize}>
                {config.maximized === MaximizedValues.FULL ? 'Restore' : 'Maximize'}
              </div>
            )}
            <div onClick={close}>Close</div>
          </>
        </ContextMenu>
      }
    </>
  )
}
