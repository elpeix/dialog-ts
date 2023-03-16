import React, { useCallback, useState } from 'react'
import { DraggableCore, DraggableEventHandler } from 'react-draggable'
import { useDispatch } from 'react-redux'
import ContextMenu from './ContextMenu'
import styles from './Dialog.module.css'
import { dialogActions } from './dialogSlice'
import { DialogType } from './types'

const MaximizedValues = {
  NONE: 0,
  FULL: 1,
  LEFT: 2,
  RIGHT: 3,
}

export default function Dialog({ id, title, config, children }: DialogType ) {

  const dispatch = useDispatch()

  const [dialog, setDialog] = useState({
    width: config.width || 400,
    height: config.height || 300,
    left: config.left || 100,
    top: config.top || 100,
  })

  const [dragging, setDragging] = useState(false)
  const [dragged, setDragged] = useState(false)
  const [resizing, setResizing] = useState(false)
  const [position, setPosition] = useState({x: 0, y: 0})
  const [slack, setSlack] = useState({x: 0, y: 0})
  const [maximized, setMaximized] = useState(MaximizedValues.NONE)
  const [dragToMaximize, setDragToMaximize] = useState(MaximizedValues.NONE)

  const toTop = useCallback(() => {
    dispatch(dialogActions.toTop({id: id}))
  }, [dispatch, id])

  const toggleMaximize = useCallback(() => {
    if (!config.resizable) return
    if (maximized === MaximizedValues.NONE) {
      setMaximized(MaximizedValues.FULL)
    } else {
      setMaximized(MaximizedValues.NONE)
    }
    toTop()
  }, [maximized, toTop, config.resizable])

  const bounds = {
    top: -config.top,
    left: -config.left,
    bottom: window.innerHeight - (80 + config.top),
    right: window.innerWidth - (30 + config.left) 
  }

  const startHandler: DraggableEventHandler = (e, data) => {
    setDragging(true)
    setDragged(false)
    toTop()

    if (maximized !== MaximizedValues.NONE) {
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
    const {x, y} = newPos
    newPos.x += slack.x
    newPos.y += slack.y
    if (bounds)  {
      newPos.x = Math.min(Math.max(bounds.left, newPos.x), bounds.right)
      newPos.y = Math.min(Math.max(bounds.top, newPos.y), bounds.bottom)
    }
    setSlack({ x: slack.x + (x - newPos.x), y: slack.y + (y - newPos.y) })

    if (maximized !== MaximizedValues.NONE) {
      if (config.top + y > 20) {
        setMaximized(MaximizedValues.NONE)
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
      setMaximized(dragToMaximize)
      setDragToMaximize(MaximizedValues.NONE)
    }
    setDragging(false)
    setSlack({x: 0, y: 0})
  }

  const handleResize = (mouseDownEvent: { pageX: number; pageY: number }) => {
    if (!config.resizable && maximized !== MaximizedValues.NONE) return
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

  const toggleMinimize = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation()
    dispatch(dialogActions.toggleMinimize({ id }))
  }

  const close = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation()
    dispatch(dialogActions.close({ id }))
  }

  const contextMenuHandler = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch(dialogActions.toTop({id: id}))
    dispatch(dialogActions.showContextMenu({id: id, x: e.clientX, y: e.clientY}))
  }

  const className = `
    ${styles.dialog}
    ${config.focused ? styles.focused : ''}
    ${resizing ? styles.resizing : ''}
    ${dragging && dragged ? styles.dragging : ''}
    ${maximized !== MaximizedValues.NONE ? styles.maximized : ''}
    ${maximized === MaximizedValues.FULL ? styles.maximizedFull : ''}
    ${maximized === MaximizedValues.LEFT ? styles.maximizedLeft : ''}
    ${maximized === MaximizedValues.RIGHT ? styles.maximizedRight : ''}
  `
  const dialogStyle = {
    display: config.minimized ? 'none' : '',
    zIndex: config.zIndex * 10,
    top: `${dialog.top}px`,
    left: `${dialog.left}px`,
    height: `${dialog.height}px`,
    width: `${dialog.width}px`,
    transform :`translate(${position.x}px, ${position.y}px)`
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
            <div className={styles.header_icon} onContextMenu={contextMenuHandler}></div>
            <div className={styles.header_title}>{title}</div>
            <div className={`dialog-no-drag ${styles.header_action} ${styles.header_minimize}`} onClick={toggleMinimize} />
            { config.resizable && 
              <div className={`dialog-no-drag ${styles.header_action} ${styles.header_maximize}`} onClick={toggleMaximize} />
            } 
            <div className={`dialog-no-drag ${styles.header_action} ${styles.header_close}`} onClick={close} />
          </header>
          <div className={styles.content}>
            {children}
          </div>
          <div className={styles.footer}>
            {config.resizable && !maximized && 
              <div className={styles.resizer} onMouseDown={handleResize}></div>
            }
          </div>
        </div>
      </DraggableCore>
      {!maximized && dragging &&
        <div 
          className={`
            ${styles.maximizeOverlay} 
            ${dragToMaximize !== MaximizedValues.NONE ? styles.maximizeOverlayActive : ''}
            ${dragToMaximize === MaximizedValues.FULL ? styles.maximizeOverlayFull : ''}
            ${dragToMaximize === MaximizedValues.LEFT ? styles.maximizeOverlayLeft : ''}
            ${dragToMaximize === MaximizedValues.RIGHT ? styles.maximizeOverlayRight : ''}`} 
          style={{zIndex: config.zIndex + 1}}></div>
      }
      {!config.minimized && config.contextMenu && 
        <ContextMenu 
          {...config.contextMenu} 
          zIndex = {config.zIndex * 10 + 1}>
          <>
            <div>{`Id: ${id}`}</div>
            <div>{`Title: ${title}`}</div>
            <div onClick={toggleMinimize}>Minimize</div>
            { config.resizable && <div onClick={toggleMaximize}>Maximize</div> }
            <div onClick={close}>Close</div>
          </>
        </ContextMenu>
      }
    </>
  )
}
