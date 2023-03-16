import React from 'react'
import styles from './ContextMenu.module.css'

export default function ContextMenu(
  {x, y, zIndex, children}: {
    x: number,
    y: number,
    zIndex: number,
    children: React.ReactNode
  }) {

  const contextMenuStyle = {
    top: `${y}px`,
    left: `${x}px`,
    zIndex: zIndex
  }

  return (
    <div 
      className={styles.contextMenu}
      style={contextMenuStyle}>
      {children}
    </div>
  )
}
