import React from 'react'
import { DialogBasicType, MaximizedValues } from '../features/dialogs/types'
import ContextMenu from './contextMenu/ContextMenu'
import { useDialog } from '../hooks/useDialog'

export default function DialogContextMenu({id, config}: DialogBasicType) {

  const { close, toggleMinimize, maximize, restore } = useDialog({ id })

  return (
    <>
      { config.contextMenu && 
        <ContextMenu 
          {...config.contextMenu} 
          zIndex = {(config.zIndex + 1) * 10 + 1}>
          <>
            <div onClick={toggleMinimize}>
              {config.minimized ? 'Show' : 'Minimize'}
            </div>
            { !config.minimized && config.resizable && (
              <>
                {config.maximized !== MaximizedValues.NONE ? (
                  <div onClick={restore}>Restore</div>
                ) : (
                  <div onClick={() => maximize()}>Maximize</div>
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
