import React from 'react'
import { useDispatch } from 'react-redux'
import { dialogActions } from '../features/dialogs/dialogSlice'
import { DialogType } from '../features/dialogs/types'

export function UserChildren({ dialogId, dialog }: { dialogId?: string, dialog?: DialogType }) {

  const dispatch = useDispatch()


  const handleChange = () => {
    if (!dialog) return
    dispatch(dialogActions.setPreventClose({ id: dialogId, preventClose: true }))
  }

  return (
    <div>
      <h4>I am a new dialog!</h4>
      <p>My id is: {dialogId}</p>
      <input type="text" onChange={handleChange} style={{
        border: '1px solid #ccc',

      }} />
    </div>
  )
}
