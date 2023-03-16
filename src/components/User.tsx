import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { dialogActions } from '../features/dialogs/dialogSlice'
import { UserChildren } from './UserChildren'

export function User(props: { name: string; level: number }) {
  const dispatch = useDispatch()

  const [user, setUser] = useState({
    name: props.name,
    level: props.level,
  })

  const openDialog = (e: React.MouseEvent<HTMLButtonElement>) => {
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
          <UserChildren />
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
