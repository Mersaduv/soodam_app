import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { HiOutlineLocationMarker } from 'react-icons/hi'
import { Housing } from '@/types'
import { Popup } from 'leaflet'

interface LocationMap {
  housingData: Housing
}
const LocationMap: React.FC<LocationMap> = (props) => {
  const { housingData } = props
  const position: any = [housingData.location.lat, housingData.location.lng]
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

  return (
    <div className="my-4 ">
      <MapContainer className="rounded-2xl" center={position} zoom={15} style={{ height: '240px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position} icon={customIcon}></Marker>
      </MapContainer>
    </div>
  )
}

export default LocationMap
