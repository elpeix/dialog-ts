
import { DialogType } from './types'

export const dialogExists = (dialogs: DialogType[], id: string) => {
  return getDialog(dialogs, id) !== undefined
}
export const getDialog = (dialogs: DialogType[], id: string) => {
  return dialogs.find(dialog => dialog.id === id)
}

export const getMaxZIndex = (dialogs: DialogType[]) => {
  if (!dialogs || dialogs.length === 0) {
    return 0
  }
  return Math.max(... dialogs.map(dialog => dialog.config.zIndex))
}

export const toTop = (dialogs: DialogType[], id: string) => {
  const maxZIndex = getMaxZIndex(dialogs)
  dialogs = dialogs.map(dialog => {
    if (dialog.id === id) {
      dialog.config.focused = true
      dialog.config.minimized = false
      if (dialog.config.zIndex !== maxZIndex) {
        dialog.config.zIndex = maxZIndex + 1
      }
    } else {
      dialog.config.focused = false
    }
    return dialog
  })
}

export const toTopPrevious = (dialogs: DialogType[]) => {
  const maxZIndex = getMaxZIndex(dialogs)
  const dialog = dialogs.find(dialog => dialog.config.zIndex === maxZIndex)
  if (dialog) {
    dialog.config.focused = true
  } else if (dialogs.length > 0) {
    dialogs[dialogs.length - 1].config.focused = true
  }
}

export const toggleMinimize = (dialogs: DialogType[], id: string) => {
  const dialog = getDialog(dialogs, id)
  if (!dialog) {
    return
  }
  if (dialog.config.minimized) {
    toTop(dialogs, id)
    return
  }
  dialogs.map(dialog => {
    if (dialog.id === id) {
      dialog.config.zIndex = 0
      dialog.config.minimized = true
      dialog.config.focused = false
    }
    return dialog
  })
  toTopPrevious(dialogs)
}

export const contextMenu = (dialogs: DialogType[], id: string, x: number, y: number) => {
  const dialog = getDialog(dialogs, id)
  if (!dialog) {
    return
  }
  dialog.config.contextMenu = {
    x,
    y,
    show: true
  }
}

export const hideContextMenu = (dialogs: DialogType[]) => {
  dialogs.forEach(dialog => {
    dialog.config.contextMenu = undefined
  })
}
