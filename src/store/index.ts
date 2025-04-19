import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'

// Reducers
import authReducer from '../store/slices/auth.slice'
import alertReducer from '../store/slices/alert.slice'
import mapModeReducer from '../store/slices/mapMode.slice'
import isShowLoginReducer from '../store/slices/loginModal.slice'
import savedHousesReducer from '../store/slices/savedHouses.slice'
import statesDataReducer from '../store/slices/statesData.slice'
import apiSlice from '@/services/baseApi'
import { authApiSlice } from '@/services'
import { addressesApiSlice } from '@/services/addressesApiSlice'
import productionApiSlice from '@/services/productionBaseApi'

// Actions
export * from '../store/slices/auth.slice'
export * from '../store/slices/alert.slice'
export * from '../store/slices/mapMode.slice'
export * from '../store/slices/loginModal.slice'
export * from '../store/slices/savedHouses.slice'
export * from '../store/slices/statesData.slice'

export const store = configureStore({
  reducer: {
    alert: alertReducer,
    auth: authReducer,
    map: mapModeReducer,
    saveHouse: savedHousesReducer,
    isShowLogin: isShowLoginReducer,
    statesData: statesDataReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [productionApiSlice.reducerPath]: productionApiSlice.reducer,
    [addressesApiSlice.reducerPath]: addressesApiSlice.reducer,
    // [authApiSlice.reducerPath]: authApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware, addressesApiSlice.middleware, productionApiSlice.middleware),
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>

setupListeners(store.dispatch)
// middleware: (gDM) => gDM().concat(apiSlice.middleware, authApiSlice.middleware),
