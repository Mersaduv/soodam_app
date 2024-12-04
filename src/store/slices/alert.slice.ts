import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'

interface AlertState {
  title: string
  status: string
  isShow: boolean
}

const initialState: AlertState = { title: '', status: '', isShow: false }

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    showAlert: (state, action: PayloadAction<{ title: string; status: string }>) => {
      const { status, title } = action.payload

      // Show the toast using react-toastify
      if (status === 'error') {
        toast.error(title)
      } else if (status === 'success') {
        toast.success(title)
      } else if (status === 'warning') {
        toast.warning(title)
      } else {
        toast.info(title)
      }

      state.isShow = true
      state.title = title
      state.status = status
    },
    removeAlert: (state) => {
      state.isShow = false
      state.status = ''
      state.title = ''
    },
  },
})

export const { showAlert, removeAlert } = alertSlice.actions

export default alertSlice.reducer
