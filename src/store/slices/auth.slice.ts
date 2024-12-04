import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  phoneNumber: string | null
  fullName: string | null
  loggedIn: boolean
}

const getPhoneNumber = () => (typeof window !== 'undefined' && localStorage.getItem('phoneNumber')) || null
const getFullName = () => (typeof window !== 'undefined' && localStorage.getItem('fullName')) || null
const getLoggedIn = () => {
  if (typeof window !== 'undefined') {
    const loggedIn = localStorage.getItem('loggedIn')
    return loggedIn !== null ? JSON.parse(loggedIn) : false
  }
}

const initialState: AuthState = {
  phoneNumber: getPhoneNumber(),
  fullName: getFullName(),
  loggedIn: getLoggedIn(),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ phoneNumber: string; fullName: string;loggedIn: boolean }>
    ) => {
      const { phoneNumber, fullName, loggedIn } = action.payload
      state.phoneNumber = phoneNumber
      state.fullName = fullName
      state.loggedIn = loggedIn
      if (typeof window !== 'undefined') {
        localStorage.setItem('phoneNumber', phoneNumber)
        localStorage.setItem('fullName', fullName)
        localStorage.setItem('loggedIn', JSON.stringify(loggedIn))
      }
    },
    clearCredentials: (state) => {
      state.phoneNumber = null
      state.fullName = null
      state.loggedIn = false
      if (typeof window !== 'undefined') {
        localStorage.removeItem('phoneNumber')
        localStorage.removeItem('fullName')
        localStorage.removeItem('loggedIn')
      }
    },
  },
})

export const { setCredentials, clearCredentials } = authSlice.actions

export default authSlice.reducer
