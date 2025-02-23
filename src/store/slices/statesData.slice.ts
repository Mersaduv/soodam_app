import { Housing } from '@/types'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface State {
  housingMap: Housing[]
  adConfirmExit: string
  center: number[]
  zoom: number
  refetchMap: boolean
  address: string
  zoomModal: boolean
}

const initialState: State = {
  housingMap: [],
  adConfirmExit: '',
  center: [35.745929, 51.402726],
  zoom: 12,
  refetchMap: false,
  address: 'در حال بارگذاری...',
  zoomModal: false,
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
    setRefetchMap(state, action) {
      state.refetchMap = action.payload
    },
    setShowZoomModal(state, action) {
      state.zoomModal = action.payload
    },
    setAddress(state, action) {
      state.address = action.payload
    },
  },
})

export const { setStateData, setAdConfirmExit, setCenter, setZoom, setRefetchMap, setAddress, setShowZoomModal } =
  updateSlice.actions
export default updateSlice.reducer
