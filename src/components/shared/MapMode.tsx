import { useAppDispatch, useAppSelector } from '@/hooks'
import { ListIcon, MapIcon } from '@/icons'
import { setMapMode } from '@/store'
import React from 'react'

const MapMode = () => {
  const dispatch = useAppDispatch()
  const map = useAppSelector((state) => state.map)
  return (
    <div className="flex justify-center items-center h-[48px] w-[86px] bg-[#D52133] border-[#E3E3E7] border-[0.8px] rounded-lg cursor-pointer" onClick={() => dispatch(setMapMode(!map.mode))}>
      {map.mode ? (
        <div className="flex items-center gap-0.5">
          <ListIcon className="w-[22px] h-[22px] text-white" />
          <span className="font-normal text-sm text-white">لیست</span>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <MapIcon style={{ color: 'white' }} />
          <span className="font-normal text-sm text-white">نقشه</span>
        </div>
      )}
    </div>
  )
}

export default MapMode
