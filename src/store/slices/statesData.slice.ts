import { Housing } from '@/types'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface State {
  housingMap: Housing[]
  adConfirmExit: string
}

const initialState: State = {
  housingMap: [],
  adConfirmExit: '',
}

const updateSlice = createSlice({
  name: 'statesData',
  initialState,
  reducers: {
    setStateData: (state, action: PayloadAction<Housing[]>) => {
      state.housingMap = action.payload
    },
    setAdConfirmExit: (state, action: PayloadAction<string>) => {
      state.adConfirmExit = action.payload
    },
  },
})

export const { setStateData, setAdConfirmExit } = updateSlice.actions
export default updateSlice.reducer
