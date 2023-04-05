import React from 'react'
import { User } from './User'
import userIcon from '../assets/user.svg'
import { useDialogs } from '../hooks/useDialogs'

export default function Menu() {

  const { create } = useDialogs()

  const createDialogSample = () => {
    const id = new Date().getTime().toString()
    create({
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
    })
  }

  const openUser = () => {
    create({
      id: 'user',
      title: 'User',
      icon: userIcon,
      config: {
        width: 400,
        height: 500
      },
      children: <User name="Bob" level={3} />
    })
  }

  return (
    <>
      <button onClick={createDialogSample}>Create Dialog</button>
      <button onClick={openUser}>Open user</button>
    </>
  )
}
