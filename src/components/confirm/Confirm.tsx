import React, { useEffect, useRef } from 'react'
import styles from './Confirm.module.css'

type ConfirmType = {
  confirmText: string | JSX.Element,
  onCancel: () => void,
  onConfirm: () => void,
}

export default function Confirm( { confirmText, onCancel, onConfirm }: ConfirmType) {

  const confirmRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    setShow(true)
  }, [])

  const setShow = (show:boolean, action?: () => void) => {
    if (show) {
      setTimeout(() => {
        if (confirmRef.current) {
          confirmRef.current.open = true
        }
      }, 1)
      return
    }
    if (confirmRef.current) {
      confirmRef.current.open = false
      action && setTimeout(() => action(), 100)
    }
  }


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShow(false, onCancel)
        return
      }
      if (e.key === 'Enter') {
        setShow(false, onConfirm)
        return
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel, onConfirm])

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.target instanceof HTMLElement) {
        if (e.target.closest('dialog') === null) {
          setShow(false, onCancel)
        }
      }
    }
    window.addEventListener('mousedown', handleMouseDown)
    return () => window.removeEventListener('mousedown', handleMouseDown)
  }, [onCancel])

  const handleCancel = () => {
    setShow(false, onCancel)
  }

  const handleConfirm = () => {
    setShow(false, onConfirm)
  }

  return (
    <div className={styles.confirm}>
      <dialog ref={confirmRef}>
        <p>{confirmText}</p>
        <form method='dialog'>
          <button type="submit" onClick={handleConfirm}>Yes</button>
          <button onClick={handleCancel}>No</button>
        </form>
      </dialog>
    </div>
  )
}
