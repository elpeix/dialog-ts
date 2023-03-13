import React, { useState } from 'react'
import { DraggableCore, DraggableEventHandler } from 'react-draggable'

export default function DialogDraggable({ children, bounds, onStart, onDrag, onStop }: {
  children: JSX.Element,
  bounds: {
    left?: number,
    right?: number,
    top?: number,
    bottom?: number
  },
  onStart: DraggableEventHandler,
  onDrag: DraggableEventHandler,
  onStop: DraggableEventHandler
  
}) {

  const [dragging, setDragging] = useState(false)
  const [position, setPosition] = useState({x: 0, y: 0})
  const [slackX, setSlackX] = useState(0)
  const [slackY, setSlackY] = useState(0)

  const startHandler: DraggableEventHandler = (e, data) => {
    setDragging(true)
    onStart(e, data)
  }

  const dragHandler: DraggableEventHandler = (e, data) => {
    if (!dragging) return
    
    // Code from react-draggable, prepared for DialogDraggable
    const uiData = {
      ...data,
      x: position.x + data.deltaX,
      y: position.y + data.deltaY
    }

    const newPos = { x: uiData.x, y: uiData.y }

    // Copy original
    const {x, y} = newPos

    // Add slack to the values used to calculate bound position. This will ensure that if
    // we start removing slack, the element won't react to it right away until it's been
    // completely removed.
    newPos.x += slackX
    newPos.y += slackY

    // Get bound position. This will ceil/floor the x and y within the boundaries.
    newPos.x = Math.min(Math.max(bounds.left ?? newPos.x, newPos.x), bounds.right ?? newPos.x)
    newPos.y = Math.min(Math.max(bounds.top ?? newPos.y, newPos.y), bounds.bottom ?? newPos.y)

    // Recalculate slack by noting how much was shaved by the boundPosition handler.
    setSlackX(slackX + (x - newPos.x))
    setSlackY(slackY + (y - newPos.y))

    // Update the event we fire to reflect what really happened after bounds took effect.
    uiData.x = newPos.x
    uiData.y = newPos.y
    uiData.deltaX = newPos.x - position.x
    uiData.deltaY = newPos.y - position.y
 
    const shouldUpdate = onDrag(e, uiData)
    if (shouldUpdate === false) {
      return false
    }
    setPosition(newPos)
  }

  const stopHandler: DraggableEventHandler = (e, data) => {
    setDragging(false)
    onStop(e, data)
  }

  const style = {
    transform :`translate(${position.x}px, ${position.y}px)`
  }

  return (
    <DraggableCore
      handle="header.dialog-drag" 
      cancel=".dialog-no-drag"
      onStart={startHandler}
      onDrag={dragHandler}
      onStop={stopHandler}
    > 
      {React.cloneElement(React.Children.only(children), {
        style: {...children.props.style, ...style},
      })}
    </DraggableCore>
  )
}
