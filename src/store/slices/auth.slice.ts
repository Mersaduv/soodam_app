import { User } from '@/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  phoneNumber: string | null
  fullName: string | null
  token: string | null
  loggedIn: boolean
  user: User | null
  userType: number | null
  userGroup: number | null
}

const getPhoneNumber = () => (typeof window !== 'undefined' && localStorage.getItem('phoneNumber')) || null
const getFullName = () => (typeof window !== 'undefined' && localStorage.getItem('fullName')) || null
const getUserType = () => {
  if (typeof window !== 'undefined') {
    const type = localStorage.getItem('userType')
    return type ? Number(type) : null
  }
  return null
}
const getUserGroup = () => {
  if (typeof window !== 'undefined') {
    const group = localStorage.getItem('userGroup')
    return group ? Number(group) : null
  }
  return null
}
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
  token: getToken(),
  loggedIn: getLoggedIn(),
  user: getUser(),
  userType: getUserType(),
  userGroup: getUserGroup()
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ 
        phoneNumber: string; 
        fullName: string; 
        token: string; 
        loggedIn: boolean;
        userType?: number;
        userGroup?: number;
      }>
    ) => {
      const { phoneNumber, fullName, loggedIn, token, userType, userGroup } = action.payload
      state.phoneNumber = phoneNumber
      state.fullName = fullName
      state.loggedIn = loggedIn
      state.token = token
      state.userType = userType || null
      state.userGroup = userGroup || null
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('phoneNumber', phoneNumber)
        localStorage.setItem('fullName', fullName)
        if (userType) localStorage.setItem('userType', userType.toString())
        if (userGroup) localStorage.setItem('userGroup', userGroup.toString())
        localStorage.setItem('token', token)
        localStorage.setItem('loggedIn', JSON.stringify(loggedIn))
      }
    },
    clearCredentials: (state) => {
      state.phoneNumber = null
      state.fullName = null
      state.token = null
      state.loggedIn = false
      state.user = null
      state.userType = null
      state.userGroup = null
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('phoneNumber')
        localStorage.removeItem('fullName')
        localStorage.removeItem('userType')
        localStorage.removeItem('userGroup')
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
      if (action.payload?.user_type) {
        state.userType = action.payload.user_type
        if (typeof window !== 'undefined') {
          localStorage.setItem('userType', action.payload.user_type.toString())
        }
      }
      if (action.payload?.user_group) {
        state.userGroup = action.payload.user_group
        if (typeof window !== 'undefined') {
          localStorage.setItem('userGroup', action.payload.user_group.toString())
        }
      }
    },
  },
})

export const { setCredentials, clearCredentials, updateUser } = authSlice.actions

export default authSlice.reducer
