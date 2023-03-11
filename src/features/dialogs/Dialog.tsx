import React, { useState, useRef, MutableRefObject } from 'react'
import { useDispatch } from 'react-redux'
import { dialogActions } from './dialogSlice'
import { DialogType } from './types'
import styles from './Dialog.module.css'
import Draggable from 'react-draggable'

export default function Dialog(props: DialogType) {
  const [dialog, setDialog] = useState({
    id: props.id,
    title: props.title || 'Dialog',
    width: props.config.width || 400,
    height: props.config.height || 300,
    left: props.config.left || 100,
    top: props.config.top || 100,
    maximized: false,
    dragging: false,
    resizing: false,
    rel: {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    },
    unmaximixed: {
      height: 0,
      width: 0,
      top: 0,
      left: 0,
    },
  })

  const dispatch = useDispatch()
  const dialogRef = useRef<HTMLDivElement>(null)  as MutableRefObject<HTMLDivElement>
  const dialogContent = useRef<HTMLDivElement>(null)  as MutableRefObject<HTMLDivElement>

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
        resizing: true,
        width: size.width - position.x + mouseMoveEvent.pageX,
        height: size.height - position.y + mouseMoveEvent.pageY
      }))
    }
    const onMouseUp = () => {
      document.body.removeEventListener('mousemove', onMouseMove)
      setDialog(ov => ({
        ...ov,
        resizing: false
      }))
      document.body.classList.remove('resizing')
    }
    document.body.addEventListener('mousemove', onMouseMove)
    document.body.addEventListener('mouseup', onMouseUp, { once: true })
  }

  const toggleMaximize = () => {
    setDialog(ov => ({...ov, maximized: !dialog.maximized}))
    toTop()
  }

  const toggleMinimize = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation()
    dispatch(dialogActions.toggleMinimize({id: props.id}))
  }

  const toTop = () => dispatch(dialogActions.toTop({id: props.id}))
  const close = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation()
    dispatch(dialogActions.close({id: props.id}))
  }

  const bounds = {
    top: -props.config.top,
    left: -props.config.left,
    bottom: window.innerHeight - (80 + props.config.top),
    right: window.innerWidth - (30 + props.config.left) 
  }

  const dialogStyle = {
    display: props.config.minimized ? 'none' : '',
    zIndex: props.config.zIndex,
    top: `${dialog.top}px`,
    left: `${dialog.left}px`,
    height: `${dialog.height}px`,
    width: `${dialog.width}px`,
  }

  return (
    <Draggable
      handle="header.dialog-drag" 
      cancel=".dialog-no-drag" 
      disabled={dialog.maximized} 
      bounds={bounds} 
      onStart={() => {toTop()}}>
      <div
        className={`${styles.dialog} ${dialog.maximized ? styles.maximized : ''} ${props.config.focused ? styles.focused : ''} ${dialog.resizing ? styles.resizing : ''}`}
        ref={dialogRef}
        style={dialogStyle}
        onClick={toTop}
      >
        <header className={`dialog-drag ${styles.header}`} onDoubleClick={toggleMaximize}>
          <div className={styles.header_icon}>&nbsp;</div>
          <div className={styles.header_title}>{props.title}</div>
          <div className={`dialog-no-drag ${styles.header_action} ${styles.header_minimize}`} onClick={toggleMinimize} />
          <div className={`dialog-no-drag ${styles.header_action} ${styles.header_maximize}`} onClick={toggleMaximize} />
          <div className={`dialog-no-drag ${styles.header_action} ${styles.header_close}`} onClick={close} />
        </header>
        <div className={styles.content} ref={dialogContent}>
          {props.children}
        </div>
        <div className={styles.footer}>
          {!dialog.maximized && <div className={styles.resizer} onMouseDown={handleResize}></div>}
        </div>
      </div>
    </Draggable>

  )
}
