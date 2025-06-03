import { User } from '@/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  phoneNumber: string | null
  fullName: string | null
  role: string | null
  token: string | null
  loggedIn: boolean
  user: User | null
}

const getPhoneNumber = () => (typeof window !== 'undefined' && localStorage.getItem('phoneNumber')) || null
const getFullName = () => (typeof window !== 'undefined' && localStorage.getItem('fullName')) || null
const getRole = () => (typeof window !== 'undefined' && localStorage.getItem('role')) || null
const getToken = () => (typeof window !== 'undefined' && localStorage.getItem('token')) || null
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
  token: getToken(),
  loggedIn: getLoggedIn(),
  user: getUser(),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ phoneNumber: string; fullName: string; role: string; token: string; loggedIn: boolean }>
    ) => {
      const { phoneNumber, fullName, loggedIn, role, token } = action.payload
      state.phoneNumber = phoneNumber
      state.fullName = fullName
      state.loggedIn = loggedIn
      state.role = role
      state.token = token
      if (typeof window !== 'undefined') {
        localStorage.setItem('phoneNumber', phoneNumber)
        localStorage.setItem('fullName', fullName)
        localStorage.setItem('role', role)
        localStorage.setItem('token', token)
        localStorage.setItem('loggedIn', JSON.stringify(loggedIn))
      }
    },
    clearCredentials: (state) => {
      state.phoneNumber = null
      state.fullName = null
      state.role = null
      state.token = null
      state.loggedIn = false
      state.user = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('phoneNumber')
        localStorage.removeItem('fullName')
        localStorage.removeItem('role')
        localStorage.removeItem('token')
        localStorage.removeItem('loggedIn')
        localStorage.removeItem('hasSeenModal')
        localStorage.removeItem('user')
        localStorage.removeItem('userCity')
        localStorage.removeItem('subscription')
        sessionStorage.clear()
      }
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
  },
})

export const { setCredentials, clearCredentials, updateUser } = authSlice.actions

export default authSlice.reducer
