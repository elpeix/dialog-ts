import React, { MutableRefObject, useCallback, useRef, useState } from 'react'
import { DraggableCore, DraggableEventHandler } from 'react-draggable'
import { useDispatch } from 'react-redux'
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
  const [dragToMaximize, setDragToMaximize] = useState(false)

  const dialogRef = useRef<HTMLDivElement>(null)  as MutableRefObject<HTMLDivElement>
  const dialogContent = useRef<HTMLDivElement>(null)  as MutableRefObject<HTMLDivElement>

  const toTop = useCallback(() => {
    dispatch(dialogActions.toTop({id: id}))
  }, [dispatch, id])

  const toggleMaximize = useCallback(() => {
    if (maximized === MaximizedValues.NONE) {
      setMaximized(MaximizedValues.FULL)
    } else {
      setMaximized(MaximizedValues.NONE)
    }
    toTop()
  }, [maximized, toTop])

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
    } else {
      setDragToMaximize(data.y < 0)
    }
    setPosition(newPos)
  }

  const stopHandler: DraggableEventHandler = () => {
    if (!dragging) return
    if (dragToMaximize) {
      toggleMaximize()
      setDragToMaximize(false)
    }
    setDragging(false)
    setSlack({x: 0, y: 0})
  }

  const handleResize = (mouseDownEvent: { pageX: number; pageY: number }) => {
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

  const className = `
    ${styles.dialog}
    ${config.focused ? styles.focused : ''}
    ${resizing ? styles.resizing : ''}
    ${dragging && dragged ? styles.dragging : ''}
    ${maximized === MaximizedValues.FULL ? styles.maximized : ''}
    ${maximized === MaximizedValues.LEFT ? 'maximized-left' : ''}
    ${maximized === MaximizedValues.RIGHT ? 'maximized-right' : ''}
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
          ref={dialogRef}
          style={dialogStyle}
          onClick={toTop}
        >
          <header className={`dialog-drag ${styles.header}`} onDoubleClick={toggleMaximize}>
            <div className={styles.header_icon}>&nbsp;</div>
            <div className={styles.header_title}>{title}</div>
            <div className={`dialog-no-drag ${styles.header_action} ${styles.header_minimize}`} onClick={toggleMinimize} />
            <div className={`dialog-no-drag ${styles.header_action} ${styles.header_maximize}`} onClick={toggleMaximize} />
            <div className={`dialog-no-drag ${styles.header_action} ${styles.header_close}`} onClick={close} />
          </header>
          <div className={styles.content} ref={dialogContent}>
            {children}
          </div>
          <div className={styles.footer}>
            {!maximized && <div className={styles.resizer} onMouseDown={handleResize}></div>}
          </div>
        </div>
      </DraggableCore>
      {!maximized && dragging &&
        <div 
          className={`${styles.maximizeOverlay} ${dragToMaximize ? styles.dragToMaximize : ''}`} 
          style={{zIndex: config.zIndex + 1}}></div>
      }
    </>
  )

  


  // DOWN is OK

  // const className = `
  //   ${children.props.className} ${dragging ? 'dragging' : ''}
  //   ${maximized === MaximizedType.FULL ? styles.maximized : ''}
  //   ${maximized === MaximizedType.LEFT ? 'maximized-left' : ''}
  //   ${maximized === MaximizedType.RIGHT ? 'maximized-right' : ''}
  // `

  // const style = {
  //   transform :`translate(${position.x}px, ${position.y}px)`
  // }

  // return (
  //   <>
  //     <DraggableCore
  //       handle="header.dialog-drag" 
  //       cancel=".dialog-no-drag"
  //       onStart={startHandler}
  //       onDrag={dragHandler}
  //       onStop={stopHandler}
  //     > 
  //       {React.cloneElement(React.Children.only(children), {
  //         className: className,
  //         style: {...children.props.style, ...style},
  //       })}
  //     </DraggableCore>
  //     {!maximized && dragging &&
  //       <div 
  //         className={`${styles.maximizeOverlay} ${dragToMaximize ? styles.dragToMaximize : ''}`} 
  //         style={{zIndex: children.props.style.zIndex + 1}}></div>
  //     }
  //   </>
  // )
}
