export type DialogBasicType = {
  id: string,
  title?: string,
  config: DialogConfigType
}

export type DialogType = DialogBasicType & {
  children: React.ReactNode
}

export type DialogsStateType = {
  dialogs: DialogType[],
  position: {
    left: number,
    top: number
  } 
}

export const MaximizedValues = {
  NONE: 0,
  FULL: 1,
  LEFT: 2,
  RIGHT: 3,
} as const

export type DialogConfigType = {
  focused: boolean,
  minimized: boolean,
  maximized: number,
  zIndex: number,
  width: number,
  height: number,
  parent: string,
  left: number,
  top: number,
  contextMenu?: {
    x: number,
    y: number,
    show: boolean
  },
  resizable: boolean
}
