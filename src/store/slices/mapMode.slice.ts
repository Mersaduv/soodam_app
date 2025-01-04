import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface State {
  mode: boolean
}

const initialState: State = {
    mode: true,
}

const updateSlice = createSlice({
  name: 'mapMode',
  initialState,
  reducers: {
    setMapMode: (state, action: PayloadAction<boolean>) => {
      state.mode = action.payload
    },
  },
})

export const { setMapMode } = updateSlice.actions
export default updateSlice.reducer
