import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { dialogActions, dialogsState } from './dialogSlice'
import { DialogsStateType, DialogType } from './types'
import styles from './DialogCanvas.module.css'
import Menu from '../../components/Menu'
import Dialog from './Dialog'

export default function DialogCanvas() {

  const { dialogs } = useSelector<DialogsStateType>(dialogsState) as DialogsStateType
  const dispatch = useDispatch()

  const toTop = (id: string) => dispatch(dialogActions.toTop({id: id}))

  return (
    <div className={styles.dialogCanvas}>
      <div className={styles.dialogs}>
        {dialogs.map((dialog :DialogType) => (
          <Dialog
            key={`dialog${dialog.id}`}
            title={dialog.title}
            id={dialog.id}
            config={dialog.config}
          >
            {dialog.children}
          </Dialog>
        ))}
      </div>
      <div className={styles.dialogsFooter}>
        <Menu />
        <div className={styles.dialogsFooterBar}>
          {dialogs.map((dialog: DialogType) => (
            <div
              key={`barDialog${dialog.id}`}
              className={dialog.config.focused ? styles.focused : ''}
              onClick={() => toTop(dialog.id)}
            >
              {dialog.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}