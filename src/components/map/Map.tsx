import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import { LatLngTuple } from 'leaflet'; 
import React, { useState } from 'react'
import ReactDOMServer from 'react-dom/server'
import { HomeIcon, MapIcon, MapIcon2, SatelliteIcon, SendIcon, FingerIcon } from '@/icons'
import { useDisclosure } from '@/hooks'
import { CustomCheckbox, Modal } from '../ui'
import { Housing } from '@/types'
interface Props {
  housingData: Housing[]
}

// نوع داده برای مکان‌ها
interface Location {
  lat: number
  lng: number
}

// نوع داده برای ملک‌ها
interface Property {
  id: string
  title: string
  sellingPrice: number
  rent: number
  deposit: number
  location: Location
}
const getPropertyPrice = (property: Property): number => {
  if (property.sellingPrice > 0) {
    return property.sellingPrice
  } else if (property.rent > 0) {
    return property.rent
  } else {
    return property.deposit
  }
}
// تابع فرمت کردن قیمت
const formatPrice = (price: number): string => {
  if (price >= 1_000_000_000) {
    const billion = price / 1_000_000_000
    return `${billion.toFixed(3)} میلیارد`
  } else if (price >= 1_000_000) {
    const million = price / 1_000_000
    return `${million.toFixed(3)} میلیون`
  } else {
    return `${price.toLocaleString('fa-IR')} تومان`
  }
}

const getCenterOfData = (data: Housing[]): LatLngTuple => {
  const latitudes = data.map(item => item.location.lat);
  const longitudes = data.map(item => item.location.lng);
  const centerLat = latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length;
  const centerLng = longitudes.reduce((sum, lng) => sum + lng, 0) / longitudes.length;
  return [centerLat, centerLng] as LatLngTuple;
};

const createIconWithPrice = (price: string, isSelling: boolean): L.DivIcon => {
  const iconColor = isSelling ? '#D52133' : '#007BFF'
  const html = ReactDOMServer.renderToString(
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          backgroundColor: 'white',
          color: 'black',
          borderRadius: '92px',
          padding: '2px 5px',
          fontSize: '14px',
          border: '1px solid #E3E3E7',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '122px',
          height: '32px',
          marginRight: '-46px',
          fontFamily: 'estedad',
        }}
      >
        <span className="font-normal text-base text-[#1A1E25]">{price}</span>
      </div>
      <div style={{ fontSize: '24px', color: iconColor }}>
        <HomeIcon />
      </div>
    </div>
  )
  return L.divIcon({ html, className: 'custom-icon', iconSize: [50, 50] })
}

const LeafletMap: React.FC<Props> = ({housingData}) => {
  // ? Assets
  // ? States
  const [isShow, modalHandlers] = useDisclosure()
  const [isSatelliteView, setIsSatelliteView] = useState(false)
  const [tileLayerUrl, setTileLayerUrl] = useState(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' 
  )

  const toggleMapType = () => {
    setTileLayerUrl(
      (prevUrl) =>
        prevUrl === 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' 
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    )
  }

  const handleApply = (): void => {
    toggleMapType()
    modalHandlers.close()
  }

  const handleModalClose = (): void => {
    modalHandlers.close()
  }

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      {/* دکمه برای تغییر نوع نقشه */}
      <div className="absolute flex flex-col gap-y-2.5 bottom-[88px] right-4 z-[1000]">
        <button
          onClick={modalHandlers.open}
          className={`${
            tileLayerUrl ===
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
              ? 'bg-black text-white'
              : 'bg-white'
          } w-[48px] h-[48px] rounded-lg flex-center shadow-icon`}
        >
          <MapIcon2 />
        </button>
        <button onClick={modalHandlers.open} className="bg-white w-[48px] h-[48px] rounded-lg flex-center shadow-icon">
          <SendIcon />
        </button>
        <button onClick={modalHandlers.open} className="bg-white w-[48px] h-[48px] rounded-lg flex-center shadow-icon">
          <FingerIcon />
        </button>
      </div>

      <Modal isShow={isShow} onClose={handleModalClose} effect="buttom-to-fit">
        <Modal.Content
          onClose={handleModalClose}
          className="flex h-full flex-col gap-y-5 bg-white p-4 rounded-2xl rounded-b-none"
        >
          <Modal.Header right onClose={handleModalClose} />
          <Modal.Body>
            <div className="space-y-4">
              <div className="flex flex-row-reverse items-center gap-2 w-full">
                <CustomCheckbox
                  name={`satellite-view`}
                  checked={isSatelliteView}
                  onChange={() => setIsSatelliteView((prev) => !prev)}
                  label=""
                  customStyle="bg-sky-500"
                />
                <label htmlFor="satellite-view" className="flex items-center gap-2 w-full">
                  <SatelliteIcon />
                  نمای ماهواره ای
                </label>
              </div>
            </div>
            <button onClick={handleApply} className="w-full py-2 bg-red-600 text-white rounded-lg">
              اعمال
            </button>
          </Modal.Body>
        </Modal.Content>
      </Modal>

      <MapContainer
        center={getCenterOfData(housingData)}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          url={tileLayerUrl}
          attribution={
            tileLayerUrl.includes('arcgisonline')
              ? '&copy; <a href="https://www.esri.com/en-us/home">ESRI</a> contributors'
              : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
        />

        {/* نشانگرها */}
        {housingData.map((property) => (
          <Marker
            key={property.id}
            position={[property.location.lat, property.location.lng]}
            icon={createIconWithPrice(formatPrice(getPropertyPrice(property)), property.sellingPrice > 0)}
            title={property.title}
          ></Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default LeafletMap
