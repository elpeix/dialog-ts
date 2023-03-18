import React, { useLayoutEffect, useRef, useState } from 'react'
import styles from './ContextMenu.module.css'

export default function ContextMenu(
  {x, y, zIndex, children}: {
    x: number,
    y: number,
    zIndex: number,
    children: React.ReactNode
  }) {

  const ref = useRef<HTMLInputElement | null>(null)
  const [dimensions, setDimensions] = useState({ width:0, height: 0 })

  useLayoutEffect(() => {
    if (ref.current) {
      setDimensions({
        width: ref.current.offsetWidth,
        height: ref.current.offsetHeight
      })
    }
  }, [])

  return (
    <div 
      ref={ref}
      className={styles.contextMenu}
      style={{
        top: `${y + dimensions.height > window.innerHeight ? y - dimensions.height : y}px`,
        left: `${x + dimensions.width > window.innerWidth ? x - dimensions.width : x}px`,
        zIndex: zIndex * 10 + 2
      }}>
      {children}
    </div>
  )
}
