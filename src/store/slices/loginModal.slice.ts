import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface State {
  isShowLogin: boolean
  isMemberUserLogin: boolean
}

const initialState: State = {
  isShowLogin: false,
  isMemberUserLogin: false,
}

const isShowLoginSlice = createSlice({
  name: 'loginModal',
  initialState,
  reducers: {
    setIsShowLogin: (state, action: PayloadAction<boolean>) => {
      state.isShowLogin = action.payload
    },
    setIsMemberUserLogin: (state, action: PayloadAction<boolean>) => {
      state.isMemberUserLogin = action.payload
    },
  },
})

export const { setIsShowLogin,setIsMemberUserLogin } = isShowLoginSlice.actions
export default isShowLoginSlice.reducer
