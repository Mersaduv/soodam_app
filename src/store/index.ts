import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'

// Reducers
import authReducer from '../store/slices/auth.slice'
import alertReducer from '../store/slices/alert.slice'
import apiSlice from '@/services/baseApi'

// Actions
export * from '../store/slices/auth.slice'
export * from '../store/slices/alert.slice'


export const store = configureStore({
  reducer: {
    alert: alertReducer,
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (gDM) => gDM().concat(apiSlice.middleware),
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>

setupListeners(store.dispatch)
