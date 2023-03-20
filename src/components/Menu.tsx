import React from 'react'
import { useDispatch } from 'react-redux'
import { dialogActions } from '../features/dialogs/dialogSlice'
import { User } from './User'
import userIcon from '../assets/user.svg'

export default function Menu() {

  const dispatch = useDispatch()

  const createDialogSample = () => {
    const id = new Date().getTime().toString()
    dispatch(dialogActions.create({
      id: id,
      title: 'Dialog Sample',
      config: {
        width: 500, 
        height: 400
      },
      children: (
        <div>
          <h2>The children</h2>
          <p>{id}</p>
        </div>
      )
    }))
  }

  const openUser = () => {
    dispatch(dialogActions.create({
      id: 'user',
      title: 'User',
      icon: userIcon,
      config: {
        width: 400,
        height: 500
      },
      children: <User name="Bob" level={3} />
    }))
  }

  return (
    <>
      <button onClick={createDialogSample}>Create Dialog</button>
      <button onClick={openUser}>Open user</button>
    </>
  )
}
