import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface ProductUpdateState {
  mode: boolean
}

const initialState: ProductUpdateState = {
    mode: true,
}

const productUpdateSlice = createSlice({
  name: 'mapMode',
  initialState,
  reducers: {
    setMapMode: (state, action: PayloadAction<boolean>) => {
      state.mode = action.payload
    },
  },
})

export const { setMapMode } = productUpdateSlice.actions
export default productUpdateSlice.reducer
