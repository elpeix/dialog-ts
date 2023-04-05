import React, { useState } from 'react'
import { DialogContentProps } from '../features/dialogs/types'
import { UserChildren } from './UserChildren'
import { useDialog } from '../hooks/useDialog'

export function User({
  dialog,
  name,
  level,
}: DialogContentProps & { name: string; level: number }) {

  const { createChild } = useDialog({ id: dialog?.id || '' })

  const [user, setUser] = useState({
    name: name,
    level: level,
  })

  const openDialog = (e: React.MouseEvent) => {
    e.stopPropagation()
    createChild({
      id: 'newDialog',
      title: 'New Dialog',
      config: {
        width: 300,
        height: 200,
        resizable: false,
      },
      children: <UserChildren parentId={dialog?.id} />
    })
  }

  const incLevel = () => {
    setUser((user) => ({ ...user, level: user.level + 1 }))
  }

  return (
    <div className="user">
      <h3 onClick={incLevel}>{user.name} - {dialog?.id}</h3>
      <h5>{user.level}</h5>
      <button onClick={openDialog}>Open dialog</button>
    </div>
  )
}
