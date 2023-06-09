
import { DialogsStateType, DialogType, MaximizedValues } from './types'

export const initialState: DialogsStateType = {
  dialogs: [],
  confirmDialog: {
    show: false,
    title: '',
    message: '',
    id: ''
  },
  position: {
    left: 20,
    top: 20
  }
}

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
  let maxIndex = Math.max(... dialogs.map(dialog => dialog.config.zIndex))
  if (maxIndex === -Infinity) {
    return 0
  }
  if (maxIndex > 100) {
    maxIndex = dialogs.length
    const copyDialogs = dialogs.slice() // Shallow copy
    copyDialogs.sort((a, b) => a.config.zIndex - b.config.zIndex)
      .forEach((dialog, index) => {
        dialog.config.zIndex = index
      })
  }
  return maxIndex
}

export const toTop = (dialogs: DialogType[], id: string) => {
  const maxZIndex = getMaxZIndex(dialogs)
  dialogs = dialogs.map(dialog => {
    if (dialog.id === id) {
      dialog.config.focused = true
      dialog.config.minimized = false
      if (dialog.config.zIndex !== maxZIndex || maxZIndex === 0) {
        dialog.config.zIndex = maxZIndex + 1
      }
    } else {
      dialog.config.focused = false
    }
    return dialog
  })
}

const toTopPrevious = (dialogs: DialogType[]) => {
  const maxZIndex = getMaxZIndex(dialogs)
  const dialog = dialogs.find(dialog => dialog.config.zIndex === maxZIndex)
  if (dialog) {
    dialog.config.focused = true
  } else if (dialogs.length > 0) {
    dialogs[dialogs.length - 1].config.focused = true
  }
}

export const toNextVisible = (dialogs: DialogType[]) => {
  if (dialogs.length <= 1) {
    return
  }
  const index = dialogs.findIndex(dialog => dialog.config.focused)
  if (index < 0) {
    focusTopVisible(dialogs, index)
    return
  }
  if (index >= 0) {
    for (let i = index + 1; i < dialogs.length; i++) {
      if (!dialogs[i].config.minimized) {
        toTop(dialogs, dialogs[i].id)
        return
      }
    }
    for (let i = 0; i < index; i++) {
      if (!dialogs[i].config.minimized) {
        toTop(dialogs, dialogs[i].id)
        return
      }
    }
  }
}

export const toPreviousVisible = (dialogs: DialogType[]) => {
  if (dialogs.length <= 1) {
    return
  }
  const index = dialogs.findIndex(dialog => dialog.config.focused)
  if (index < 0) {
    focusTopVisible(dialogs, index)
    return
  }
  if (index >= 0) {
    for (let i = index - 1; i >= 0; i--) {
      if (!dialogs[i].config.minimized) {
        toTop(dialogs, dialogs[i].id)
        return
      }
    }
    for (let i = dialogs.length - 1; i > index; i--) {
      if (!dialogs[i].config.minimized) {
        toTop(dialogs, dialogs[i].id)
        return
      }
    }
  }
}

export const toNext = (dialogs: DialogType[]) => {
  if (dialogs.length <= 1) {
    return
  }
  let index = dialogs.findIndex(dialog => dialog.config.focused)
  if (index < 0) {
    const maxZIndex = getMaxZIndex(dialogs)
    index = dialogs.findIndex(dialog => dialog.config.zIndex === maxZIndex)
    if (index >= 0) {
      toTop(dialogs, dialogs[index].id)
      return
    }
    index = 0
  }
  const nextDialog = dialogs.at(index + 1) || dialogs.at(0)
  if (nextDialog) {
    toTop(dialogs, nextDialog.id)
  }
}

export const toPrevious = (dialogs: DialogType[]) => {
  if (dialogs.length <= 1) {
    return
  }
  let index = dialogs.findIndex(dialog => dialog.config.focused)
  if (index < 0) {
    const maxZIndex = getMaxZIndex(dialogs)
    index = dialogs.findIndex(dialog => dialog.config.zIndex === maxZIndex)
    if (index >= 0) {
      toTop(dialogs, dialogs[index].id)
      return
    }
    index = dialogs.length - 1
  }
  const previousDialog = dialogs.at(index - 1) || dialogs.at(dialogs.length - 1)
  if (previousDialog) {
    toTop(dialogs, previousDialog.id)
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

export const toggleMaximize = (dialogs: DialogType[], id: string) => {
  const dialog = getDialog(dialogs, id)
  if (!dialog || dialog.config.minimized || !dialog.config.resizable) {
    return
  }
  toTop(dialogs, id)
  if (dialog.config.maximized === MaximizedValues.FULL) {
    dialog.config.maximized = MaximizedValues.NONE
    return
  }
  dialog.config.maximized = MaximizedValues.FULL
}

export const setMaximize = (dialogs: DialogType[], id: string, maximized: number) => {
  const dialog = getDialog(dialogs, id)
  if (!dialog || dialog.config.minimized || !dialog.config.resizable) {
    return
  }
  toTop(dialogs, id)
  if (dialog.config.maximized !== maximized) {
    dialog.config.maximized = maximized
  }
}

export const forceCloseDialog = (state: DialogsStateType, id: string) => {
  state.dialogs = state.dialogs.filter(dialog => dialog.id !== id)
  toTopPrevious(state.dialogs)
  if (state.dialogs.length === 0) {
    state.position = initialState.position
  }
  state.confirmDialog = initialState.confirmDialog
}

export const contextMenu = (dialogs: DialogType[], id: string, x: number, y: number) => {
  const dialog = getDialog(dialogs, id)
  if (!dialog) {
    return
  }
  if (!dialog.config.minimized) {
    toTop(dialogs, id)
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

const focusTopVisible = (dialogs: DialogType[], index: number) => {
  const visibleDialogs = dialogs.filter(dialog => !dialog.config.minimized)
  const maxZIndex = getMaxZIndex(visibleDialogs)
  index = visibleDialogs.findIndex(dialog => dialog.config.zIndex === maxZIndex)
  if (index >= 0) {
    toTop(dialogs, dialogs[index].id)
  }
}

