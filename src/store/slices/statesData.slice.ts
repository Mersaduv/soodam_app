import { Housing } from '@/types'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface State {
  housingMap: Housing[]
  adConfirmExit: string
  center: number[]
  zoom: number
}

const initialState: State = {
  housingMap: [],
  adConfirmExit: '',
  center: [35.745929, 51.402726],
  zoom: 12,
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
    setCenter(state, action) {
      state.center = action.payload
    },
    setZoom(state, action) {
      state.zoom = action.payload
    },
  },
})

export const { setStateData, setAdConfirmExit, setCenter, setZoom } = updateSlice.actions
export default updateSlice.reducer
