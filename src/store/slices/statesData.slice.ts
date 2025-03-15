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
  isSearchTriggered: boolean
  drawnPoints: any[]
  isDrawing: boolean
  selectedArea: any
  mode: string
  itemFilesInArea: any[]
  isSatelliteView: boolean
  isSuccess: boolean
  userCityLocation: number[]
}

const initialState: State = {
  housingMap: [],
  adConfirmExit: '',
  center: [35.745929, 51.402726],
  zoom: 12,
  refetchMap: false,
  address: 'در حال بارگذاری...',
  zoomModal: false,
  isSearchTriggered: false,
  drawnPoints: [],
  isDrawing: false,
  selectedArea: null,
  mode: 'none',
  itemFilesInArea: [],
  isSatelliteView: false,
  isSuccess: false,
  userCityLocation: [35.745929, 51.402726],
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
    setSearchTriggered: (state, action) => {
      state.isSearchTriggered = action.payload
    },
    setDrawnPoints: (state, action) => {
      state.drawnPoints = action.payload
    },
    setIsDrawing: (state, action) => {
      state.isDrawing = action.payload
    },
    setSelectedArea: (state, action) => {
      state.selectedArea = action.payload
    },
    setMode: (state, action) => {
      state.mode = action.payload
    },
    setItemFilesInArea: (state, action) => {
      state.itemFilesInArea = action.payload
    },
    resetDrawing: (state) => {
      return initialState
    },
    setIsSatelliteView: (state, action) => {
      state.isSatelliteView = action.payload
    },
    setIsSuccess: (state, action) => {
      state.isSuccess = action.payload
    },
    setUserCityLocation: (state, action) => {
      state.userCityLocation = action.payload
    }
  },
})

export const {
  setStateData,
  setAdConfirmExit,
  setCenter,
  setZoom,
  setRefetchMap,
  setAddress,
  setShowZoomModal,
  setSearchTriggered,
  setDrawnPoints,
  setIsDrawing,
  setSelectedArea,
  setMode,
  setItemFilesInArea,
  resetDrawing,
  setIsSatelliteView,
  setIsSuccess,
  setUserCityLocation
} = updateSlice.actions
export default updateSlice.reducer
