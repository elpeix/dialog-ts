import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { dialogActions } from '../features/dialogs/dialogSlice'
import { DialogContentProps } from '../features/dialogs/types'
import { UserChildren } from './UserChildren'

export function User({
  dialogId,
  name,
  level,
}: DialogContentProps & { name: string; level: number }) {
  const dispatch = useDispatch()

  const [user, setUser] = useState({
    name: name,
    level: level,
  })

  const openDialog = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(
      dialogActions.create({
        id: 'newDialog',
        title: 'New Dialog',
        config: {
          width: 300,
          height: 200,
          resizable: false,
        },
        children: (
          <UserChildren parentId={dialogId} />
        ),
      })
    )
  }

  const incLevel = () => {
    setUser((user) => ({ ...user, level: user.level + 1 }))
  }

  return (
    <div className="user">
      <h3 onClick={incLevel}>{user.name}</h3>
      <h5>{user.level}</h5>
      <button onClick={openDialog}>Open dialog</button>
    </div>
  )
}
