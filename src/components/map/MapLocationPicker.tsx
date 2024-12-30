import { FingerIcon2, GpsIcon } from '@/icons'
import L from 'leaflet'
import React, { useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { HiOutlineLocationMarker } from 'react-icons/hi'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'

interface Props {
  selectedLocation: [number, number]
  handleLocationChange: (location: [number, number]) => void
}

interface LocationPickerProps {
  onLocationChange: (location: [number, number]) => void
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationChange }) => {
  const [position, setPosition] = useState<[number, number]>([35.6892, 51.389]) // مقدار پیش‌فرض تهران

  const customIcon = L.divIcon({
    html: renderToStaticMarkup(
      <div className="bg-red-500 rounded-full">
        <HiOutlineLocationMarker size={24} color="white" />
      </div>
    ),
    className: 'custo m-marker-icon',
    iconSize: [24, 24], // اندازه آیکون
    iconAnchor: [12, 24], // نقطه‌ای که روی موقعیت تنظیم می‌شود
  })

  useMapEvents({
    click(e) {
      const newPosition: [number, number] = [e.latlng.lat, e.latlng.lng]
      setPosition(newPosition)
      onLocationChange(newPosition)
    },
  })

  return <Marker icon={customIcon} position={position}></Marker>
}

const MapLocationPicker = (props: Props) => {
  const { selectedLocation, handleLocationChange } = props
  return (
    <div>
      <label className="block text-sm font-normal text-gray-700 mb-2">لوکیشن دقیق ملک</label>
      <div style={{ position: 'relative' }}>
        <div className="absolute flex flex-col gap-y-2.5 bottom-[9px] right-3 z-[999]">
          <div className="bg-white w-[32px] h-[32px] rounded-lg flex-center shadow-icon cursor-pointer">
            <GpsIcon />
          </div>
          <div className="bg-white w-[32px] h-[32px] rounded-lg flex-center shadow-icon cursor-pointer">
            <FingerIcon2 width="18" height="20"/>
          </div>
        </div>
        <MapContainer
          center={[35.6892, 51.389]} // مقدار پیش‌فرض تهران
          zoom={13}
          style={{ height: '175px', width: '100%', borderRadius: '8px' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationPicker onLocationChange={handleLocationChange} />
        </MapContainer>
      </div>
      {/* {selectedLocation && (
        <p className="text-sm text-gray-500 mt-2">
          موقعیت انتخابی: Lat: {selectedLocation[0]}, Lng: {selectedLocation[1]}
        </p>
      )} */}
    </div>
  )
}

export default MapLocationPicker
