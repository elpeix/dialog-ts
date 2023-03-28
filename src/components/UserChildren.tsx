import React, { useState } from 'react'
import { DialogContentProps } from '../features/dialogs/types'
import { useDialog } from '../features/dialogs/useDialog'

export function UserChildren({ dialogId, parentId }: DialogContentProps & { parentId?: string }) {

  const { setPreventClose } = useDialog({ id: dialogId || '' })
  const { dialog: dialogParent, close: closeParent } = useDialog({ id: parentId || '' })

  const [value, setValue] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreventClose(true)
    setValue(e.target.value)
  }

  return (
    <div>
      <h4>I am a new dialog!</h4>
      <p>My id is: {dialogId}</p>
      <input
        type="text"
        onChange={handleChange}
        value={value}
        style={{ border: '1px solid #ccc' }} />
      <p>My parent id is: {parentId}</p>
      {
        dialogParent && (
          <p>
            My parent is: {dialogParent.title}
            <button onClick={() => { closeParent() }}>Close Parent</button>
          </p>

        )
      }
    </div>
  )
}
