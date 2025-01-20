import { Housing } from '@/types'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface State {
  housingMap: Housing[]
}

const initialState: State = {
    housingMap: [],
}

const updateSlice = createSlice({
  name: 'statesData',
  initialState,
  reducers: {
    setStateData: (state, action: PayloadAction<Housing[]>) => {
      state.housingMap = action.payload
    },
  },
})

export const { setStateData } = updateSlice.actions
export default updateSlice.reducer