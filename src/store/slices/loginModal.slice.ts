import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface State {
  isShowLogin: boolean
}

const initialState: State = {
  isShowLogin: false,
}

const isShowLoginSlice = createSlice({
  name: 'loginModal',
  initialState,
  reducers: {
    setIsShowLogin: (state, action: PayloadAction<boolean>) => {
      state.isShowLogin = action.payload
    },
  },
})

export const { setIsShowLogin } = isShowLoginSlice.actions
export default isShowLoginSlice.reducer
