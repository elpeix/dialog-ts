import React, { useState } from 'react'
import { DraggableCore, DraggableEventHandler } from 'react-draggable'
import styles from './Dialog.module.css'
import { DialogType, MaximizedValues } from '../../features/dialogs/types'
import DialogContextMenu from '../DialogContextMenu'
import { useDialog } from '../../hooks/useDialog'

export default function Dialog({ id, title, icon, config, children }: DialogType) {

  const { 
    dialog: dialogItem,
    close,
    toTop,
    maximize,
    toggleMaximize,
    toggleMinimize,
    restore,
    showContextMenu,
    hideContextMenu
  } = useDialog({ id })

  const [dialog, setDialog] = useState({
    width: config.width || 400,
    height: config.height || 300,
    left: config.left || 100,
    top: config.top || 100,
  })

  const [dragging, setDragging] = useState(false)
  const [dragged, setDragged] = useState(false)
  const [resizing, setResizing] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [slack, setSlack] = useState({ x: 0, y: 0 })
  const [dragToMaximize, setDragToMaximize] = useState<number>(MaximizedValues.NONE)

  const bounds = {
    top: -config.top,
    left: -config.left,
    bottom: window.innerHeight - (80 + config.top),
    right: window.innerWidth - (30 + config.left)
  }

  const startHandler: DraggableEventHandler = (e, data) => {
    hideContextMenu()
    setDragging(true)
    setDragged(false)
    toTop()

    if (config.maximized !== MaximizedValues.NONE) {
      let x = (data.x - (dialog.width / 2)) * data.x / window.innerWidth
      if (data.x > dialog.width / 2) {
        const percent = data.x / window.innerWidth
        x = (data.x - dialog.width / 2)
        if (percent < 0.5) {
          x = x + (dialog.width / 2) * (0.5 - percent)
        } else {
          x = x - (dialog.width / 2) * (percent - 0.5)
        }
      }
      setPosition({
        x: Math.min(Math.max(0, x), window.innerWidth - dialog.width) - dialog.left,
        y: -dialog.top
      })
    }
  }

  const dragHandler: DraggableEventHandler = (e, data) => {
    if (!dragging) return
    setDragged(true)

    const newPos = { x: position.x + data.deltaX, y: position.y + data.deltaY }
    const { x, y } = newPos
    newPos.x += slack.x
    newPos.y += slack.y
    if (bounds) {
      newPos.x = Math.min(Math.max(bounds.left, newPos.x), bounds.right)
      newPos.y = Math.min(Math.max(bounds.top, newPos.y), bounds.bottom)
    }
    setSlack({ x: slack.x + (x - newPos.x), y: slack.y + (y - newPos.y) })

    if (config.maximized !== MaximizedValues.NONE) {
      if (config.top + y > 20) {
        restore()
      }
    } else if (config.resizable) {
      if (data.y < 0) {
        setDragToMaximize(MaximizedValues.FULL)
      } else if (data.x < 10) {
        setDragToMaximize(MaximizedValues.LEFT)
      } else if (data.x > window.innerWidth - 10) {
        setDragToMaximize(MaximizedValues.RIGHT)
      } else {
        setDragToMaximize(MaximizedValues.NONE)
      }
    }
    setPosition(newPos)
  }

  const stopHandler: DraggableEventHandler = () => {
    if (!dragging) return
    if (dragged) {
      maximize(dragToMaximize)
      setDragToMaximize(MaximizedValues.NONE)
    }
    setDragging(false)
    setSlack({ x: 0, y: 0 })
  }

  const handleResize = (mouseDownEvent: { pageX: number; pageY: number }) => {
    if (!config.resizable && config.maximized !== MaximizedValues.NONE) return
    const size = {
      width: dialog.width,
      height: dialog.height
    }
    const position = {
      x: mouseDownEvent.pageX,
      y: mouseDownEvent.pageY
    }
    const onMouseMove = (mouseMoveEvent: { pageX: number; pageY: number }) => {
      document.body.classList.add('resizing')
      setDialog(ov => ({
        ...ov,
        width: size.width - position.x + mouseMoveEvent.pageX,
        height: size.height - position.y + mouseMoveEvent.pageY
      }))
      setResizing(true)
    }
    const onMouseUp = () => {
      document.body.removeEventListener('mousemove', onMouseMove)
      setResizing(false)
      document.body.classList.remove('resizing')
    }
    document.body.addEventListener('mousemove', onMouseMove)
    document.body.addEventListener('mouseup', onMouseUp, { once: true })
  }

  const toggleMinimizeHandler = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleMinimize()
  }

  const closeHandler = (e: React.MouseEvent) => {
    e.stopPropagation()
    close()
  }

  const contextMenuHandler = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    showContextMenu({ x: e.clientX, y: e.clientY })
  }

  const className = `
    ${styles.dialog}
    ${config.focused ? styles.focused : ''}
    ${resizing ? styles.resizing : ''}
    ${dragging && dragged ? styles.dragging : ''}
    ${config.maximized !== MaximizedValues.NONE ? styles.maximized : ''}
    ${config.maximized === MaximizedValues.FULL ? styles.maximizedFull : ''}
    ${config.maximized === MaximizedValues.LEFT ? styles.maximizedLeft : ''}
    ${config.maximized === MaximizedValues.RIGHT ? styles.maximizedRight : ''}
  `
  const dialogStyle = {
    display: config.minimized ? 'none' : '',
    zIndex: config.zIndex * 10,
    top: `${dialog.top}px`,
    left: `${dialog.left}px`,
    height: `${dialog.height}px`,
    width: `${dialog.width}px`,
    transform: `translate(${position.x}px, ${position.y}px)`
  }

  return (
    <>
      <DraggableCore
        handle="header.dialog-drag"
        cancel=".dialog-no-drag"
        onStart={startHandler}
        onDrag={dragHandler}
        onStop={stopHandler}
      >
        <div
          className={className}
          style={dialogStyle}
          onClick={toTop}
          onContextMenu={toTop}
        >
          <header className={`dialog-drag ${styles.header}`} onDoubleClick={toggleMaximize}>
            <div className={styles.header_icon} onContextMenu={contextMenuHandler}>
              {icon && <img src={icon} />}
            </div>
            <div className={styles.header_title}>{title}</div>
            <div className={`dialog-no-drag ${styles.header_action} ${styles.header_minimize}`} onClick={toggleMinimizeHandler} />
            {config.resizable && config.maximized === MaximizedValues.NONE &&
              <div className={`dialog-no-drag ${styles.header_action} ${styles.header_maximize}`} onClick={toggleMaximize} />
            }
            {config.resizable && config.maximized !== MaximizedValues.NONE &&
              <div className={`dialog-no-drag ${styles.header_action} ${styles.header_restore}`} onClick={toggleMaximize} />
            }
            <div className={`dialog-no-drag ${styles.header_action} ${styles.header_close}`} onClick={closeHandler} />
          </header>
          <div className={styles.content}>
            {React.isValidElement(children) && React.cloneElement(children, {
              ...children.props,
              dialog: dialogItem
            })}
          </div>
          <div className={styles.footer}>
            {config.resizable && !config.maximized &&
              <div className={styles.resizer} onMouseDown={handleResize}></div>
            }
          </div>
        </div>
      </DraggableCore>
      {!config.maximized && dragging &&
        <div
          className={`
            ${styles.maximizeOverlay} 
            ${dragToMaximize !== MaximizedValues.NONE ? styles.maximizeOverlayActive : ''}
            ${dragToMaximize === MaximizedValues.FULL ? styles.maximizeOverlayFull : ''}
            ${dragToMaximize === MaximizedValues.LEFT ? styles.maximizeOverlayLeft : ''}
            ${dragToMaximize === MaximizedValues.RIGHT ? styles.maximizeOverlayRight : ''}`}
          style={{ zIndex: config.zIndex + 1 }}></div>
      }
      <DialogContextMenu id={id} config={config} title={title} />
    </>
  )
}
