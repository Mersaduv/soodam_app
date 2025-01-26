import { User } from '@/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  phoneNumber: string | null
  fullName: string | null
  role: string | null
  loggedIn: boolean
  user: User | null
}

const getPhoneNumber = () => (typeof window !== 'undefined' && localStorage.getItem('phoneNumber')) || null
const getFullName = () => (typeof window !== 'undefined' && localStorage.getItem('fullName')) || null
const getRole = () => (typeof window !== 'undefined' && localStorage.getItem('role')) || null
const getUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
  return null
}


const getLoggedIn = () => {
  if (typeof window !== 'undefined') {
    const loggedIn = localStorage.getItem('loggedIn')
    return loggedIn !== null ? JSON.parse(loggedIn) : false
  }
}

const initialState: AuthState = {
  phoneNumber: getPhoneNumber(),
  fullName: getFullName(),
  role: getRole(),
  loggedIn: getLoggedIn(),
  user: getUser(),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ phoneNumber: string; fullName: string; role: string; loggedIn: boolean }>
    ) => {
      const { phoneNumber, fullName, loggedIn, role } = action.payload
      state.phoneNumber = phoneNumber
      state.fullName = fullName
      state.loggedIn = loggedIn
      state.role = role
      if (typeof window !== 'undefined') {
        localStorage.setItem('phoneNumber', phoneNumber)
        localStorage.setItem('fullName', fullName)
        localStorage.setItem('role', role)
        localStorage.setItem('loggedIn', JSON.stringify(loggedIn))
      }
    },
    clearCredentials: (state) => {
      state.phoneNumber = null
      state.fullName = null
      state.role = null
      state.loggedIn = false
      if (typeof window !== 'undefined') {
        localStorage.removeItem('phoneNumber')
        localStorage.removeItem('fullName')
        localStorage.removeItem('role')
        localStorage.removeItem('loggedIn')
        localStorage.removeItem('hasSeenModal')
        localStorage.removeItem('user')
      }
    },
  },
})

export const { setCredentials, clearCredentials } = authSlice.actions

export default authSlice.reducer
