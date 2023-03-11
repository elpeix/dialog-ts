import { configureStore } from '@reduxjs/toolkit'
import dialogsReducer from './features/dialogs/dialogSlice'

export const store = configureStore({
  reducer: {
    dialogs: dialogsReducer
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false })
})