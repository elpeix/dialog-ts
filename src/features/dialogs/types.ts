export type DialogType = {
  id: string,
  title: string,
  config: DialogConfigType,
  children: React.ReactNode
}

export type DialogsStateType = {
  dialogs: DialogType[],
  position: {
    left: number,
    top: number
  } 
}

export type DialogConfigType = {
  focused: boolean,
  minimized: boolean,
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
  }
}