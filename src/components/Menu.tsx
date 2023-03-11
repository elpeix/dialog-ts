import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { dialogActions, dialogsState } from '../features/dialogs/dialogSlice'
import { DialogsStateType } from '../features/dialogs/types'
import Confirm from './Confirm'
import { User } from './User'

export default function Menu() {

  const dispatch = useDispatch()
  const { dialogs } = useSelector<DialogsStateType>(dialogsState) as DialogsStateType
  const [confirm, setConfirm] = useState<JSX.Element | null>(null)

  const createDialogSample = () => {
    dispatch(dialogActions.create({
      id: new Date().getTime().toString(),
      title: 'Dialog Sample',
      config: {
        width: 500, 
        height: 400
      },
      children: (
        <div>
          <h2>The children</h2>
        </div>
      )
    }))
  }

  const openUser = () => {
    dispatch(dialogActions.create({
      id: 'user',
      title: 'User',
      config: {
        width: 400,
        height: 500
      },
      children: <User name="Bob" level={3} />
    }))
  }

  const closeAll = () => {
    if (dialogs.length > 0) {
      setConfirm(<Confirm
        confirmText="Close all dialogs?"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          dispatch(dialogActions.closeAll())
          setConfirm(null)
        }}
      />)
    }
  }

  return (
    <>
      <button onClick={createDialogSample}>Create Dialog</button>
      <button onClick={openUser}>Open user</button>
      <button onClick={closeAll}>Close All</button>
      {confirm}
    </>
  )
}
