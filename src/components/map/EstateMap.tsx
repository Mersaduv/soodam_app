import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Polygon, Popup } from 'react-leaflet'
import L from 'leaflet'
import { LatLngTuple } from 'leaflet'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactDOMServer from 'react-dom/server'
import * as turf from '@turf/turf'
import {
  HomeIcon,
  MapIcon,
  MapIcon2,
  SatelliteIcon,
  SendIcon,
  FingerIcon,
  RegisterAdIcon,
  ArrowDownTickIcon,
  Close,
  FingerWIcon,
  Check,
  CheckSmIcon,
  BedIcon,
  BulidingIcon,
  Grid2Icon,
  GpsIcon,
  LocationSmIcon,
  LocationRedSmIcon,
  UserEditMdIcon,
} from '@/icons'
import { useAppDispatch, useAppSelector, useDisclosure } from '@/hooks'
import { CustomCheckbox, Modal } from '../ui'
import { Estate, Housing } from '@/types'
import { useRouter } from 'next/router'
import {
  setAddress,
  setCenter,
  setDrawnPoints,
  setIsDrawing,
  setIsSatelliteView,
  setIsShowLogin,
  setItemFilesInArea,
  setMode,
  setSearchTriggered,
  setSelectedArea,
  setShowZoomModal,
  setStateData,
  setUserCityLocation,
  setZoom,
} from '@/store'
import { useGetSubscriptionStatusQuery, useGetViewedPropertiesQuery, useViewPropertyMutation } from '@/services'
import { toast } from 'react-toastify'
import Image from 'next/image'
import {
  formatPrice,
  formatPriceLoc,
  getProvinceFromCoordinates,
  IRAN_PROVINCES,
  iranProvincesByPopulation,
  userTypes,
} from '@/utils'
import Link from 'next/link'
interface Props {
  estateData: Estate[]
  onBoundsChanged?: (newBounds: any) => void
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
  price: number
  rent: number
  deposit: number
  location: Location
}

interface ModalSelectEstate {
  estate: Estate
  onClose: () => void
  isModalOpen: boolean
}

const getCenterOfData = (data: Housing[]): LatLngTuple => {
  const latitudes = data.map((item) => item.full_address.latitude)
  const longitudes = data.map((item) => item.full_address.longitude) 
  const centerLat = latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length
  const centerLng = longitudes.reduce((sum, lng) => sum + lng, 0) / longitudes.length
  return [centerLat, centerLng] as LatLngTuple
}

const createIcon = (
  zoom: number,
  estate: Estate
): L.DivIcon => {
  const iconColor = '#D52133'
  const isNew = (() => {
    const createdDate = new Date(estate.created)
    const today = new Date()
    const diffInDays = (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    return diffInDays <= 2
  })()
  const html = ReactDOMServer.renderToString(
    zoom > 12 ? (
      <div
        className={`w-fit relative  mt-6 mr-1`}
      >
        <div
          style={{
            backgroundColor:  'white',
            color: 'black',
            borderRadius: '4px',
            padding: '2px 5px',
            fontSize: '14px',
            border: '1px solid #E3E3E7',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: 'fit-content',
            height: '16px',
            fontFamily: 'estedad',
            // marginBottom: '-22px',
            zIndex: 10,
          }}
        >
          <div className="text-[12px] font-normal">
           {estate.name}
          </div>
        </div>
        <div
          style={{
            fontSize: '24px',
            color: iconColor,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            zIndex: -1,
            margin: 'auto',
            left: '0',
            right: '0',
            top: '-8.2px',
          }}
        >
          <HomeIcon width="16px" height="16px" />
        </div>
      </div>
    ) : (
      <div
        style={{
          fontSize: '24px',
          color: iconColor,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          zIndex: -1,
          margin: 'auto',
          left: '0',
          right: '0',
          top: '0',
          bottom: '0',
        }}
      >
        <HomeIcon width="16px" height="16px" />
      </div>
    )
  )
  return L.divIcon({ html, className: 'custom-icon', iconSize: [50, 50] })
}

const ZoomHandler: React.FC = () => {
  const dispatch = useAppDispatch()
  const userType = localStorage.getItem('userType')
  const user = JSON.parse(localStorage.getItem('user'))

  useMapEvents({
    zoomend: (e) => {
      const map = e.target
      let newZoom = map.getZoom()
      if (user && user.user_type === userTypes.Marketer && user.subscription == undefined && newZoom > 13) {
        newZoom = 13
        map.setZoom(13)
      }
      if (user && user.subscription && user.subscription.status !== 'ACTIVE' && newZoom > 13) {
        newZoom = 13
        map.setZoom(13)
      }

      if (user && user.user_type === userTypes.MemberUser && user.subscription == undefined && newZoom > 13) {
        newZoom = 13
        map.setZoom(13)
      }

      if (!userType && newZoom > 13) {
        newZoom = 13
        map.setZoom(13)
      }
      dispatch(setZoom(newZoom))
    },
  })

  return null
}
let isShowAdModalButton = true
const DrawingControl = ({ polylineRef, housingData, onDrawingComplete }) => {
  const dispatch = useAppDispatch()
  const map = useMap()
  const overlayRef = useRef(null)
  const isDrawingRef = useRef(false)
  const drawingTimeoutRef = useRef(null)
  const lastPointRef = useRef(null)
  const minDistance = 5
  const isDrawing = useAppSelector((state) => state.statesData.isDrawing)
  const drawnPoints = useAppSelector((state) => state.statesData.drawnPoints)
  const mode = useAppSelector((state) => state.statesData.mode)

  const updateDrawnPoints = (points) => {
    dispatch(setDrawnPoints(points))
  }

  // setMode بجای استفاده از prop
  const updateMode = (newMode) => {
    dispatch(setMode(newMode))
  }

  // setItemFiles بجای استفاده از prop
  const updateItemFiles = (items) => {
    dispatch(setItemFilesInArea(items))
  }

  useEffect(() => {
    if (mode === 'dispose') {
      updateItemFiles([])
      updateDrawnPoints([])
      dispatch(setStateData([]))
      if (overlayRef.current) {
        overlayRef.current.remove()
        overlayRef.current = null
      }

      if (polylineRef.current) {
        polylineRef.current.remove()
      }

      if (drawingTimeoutRef.current) {
        cancelAnimationFrame(drawingTimeoutRef.current)
        drawingTimeoutRef.current = null
      }

      isDrawingRef.current = false
      lastPointRef.current = null
      updateMode('none')
    }
  }, [mode])

  useEffect(() => {
    if (isDrawing) {
      updateItemFiles([])

      if (overlayRef.current) {
        overlayRef.current.remove()
        overlayRef.current = null
      }

      if (drawingTimeoutRef.current) {
        cancelAnimationFrame(drawingTimeoutRef.current)
        drawingTimeoutRef.current = null
      }

      isDrawingRef.current = false
      lastPointRef.current = null
    }
  }, [isDrawing])

  const countItemsInArea = useCallback(
    (points) => {
      if (points.length < 3) return

      const polygon = turf.polygon([points])
      const itemsInArea = housingData.filter((property) => {
        const point = turf.point([property.location.lat, property.location.lng])

        return turf.booleanPointInPolygon(point, polygon)
      })
      // console.log('points:', points, polygon, 'polygon')
      updateItemFiles(itemsInArea)
      dispatch(setStateData(itemsInArea))
      // console.log('Items in area:', itemsInArea.length, itemsInArea)
    },
    [housingData]
  )

  const getPointDistance = useCallback(
    (point1, point2) => {
      if (!point1 || !point2) return Infinity
      const p1 = map.latLngToContainerPoint(point1)
      const p2 = map.latLngToContainerPoint(point2)
      return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
    },
    [map]
  )
  useEffect(() => {
    if (mode === 'drawing') {
      const maxBounds: any[] = [
        [90, -180],
        [90, 180],
        [-90, 180],
        [-90, -180],
        [90, -180],
      ]

      if (overlayRef.current) {
        // به‌روزرسانی مختصات overlay موجود
        overlayRef.current.setLatLngs([maxBounds])
      } else {
        const overlay = L.polygon([maxBounds], {
          color: 'none',
          fillColor: '#1A1E2566',
          fillOpacity: 0.5,
          interactive: false,
          smoothFactor: 0,
        }).addTo(map)
        overlayRef.current = overlay
      }
    } else if (overlayRef.current) {
      overlayRef.current.remove()
      overlayRef.current = null
    }
  }, [mode, drawnPoints, map])

  const updateOverlay = useCallback(
    (points) => {
      if (!points.length) return

      if (overlayRef.current) {
        overlayRef.current.remove()
      }

      if (points.length < 3) return

      const maxBounds: any[] = [
        [90, -180],
        [90, 180],
        [-90, 180],
        [-90, -180],
        [90, -180],
      ]

      const overlay = L.polygon([maxBounds], {
        color: 'none',
        fillColor: '#1A1E2566',
        fillOpacity: 0.5,
        interactive: false,
        smoothFactor: 0,
      }).addTo(map)

      overlayRef.current = overlay
    },
    [map]
  )

  useEffect(() => {
    if (!map || !isDrawing) return

    const handleMapChange = debounce(() => {
      if (drawnPoints.length >= 3) {
        updateOverlay(drawnPoints)
      }
    }, 100)

    map.on('zoom', handleMapChange)
    map.on('moveend', handleMapChange)
    map.on('resize', handleMapChange)

    return () => {
      map.off('zoom', handleMapChange)
      map.off('moveend', handleMapChange)
      map.off('resize', handleMapChange)
    }
  }, [map, isDrawing, drawnPoints, updateOverlay])

  function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }
  const updatePolyline = useCallback(
    (points, lineColor = '#f1071e') => {
      if (polylineRef.current) {
        polylineRef.current.remove()
      }

      const polyline = L.polyline(points, {
        color: lineColor,
        weight: 5,
        smoothFactor: 1,
        interactive: false,
      }).addTo(map)

      polylineRef.current = polyline
    },
    [map]
  )

  useEffect(() => {
    if (drawnPoints.length > 0) {
      const lineColor = mode === 'checking' ? 'white' : '#f1071e'
      updatePolyline(drawnPoints, lineColor)
    } else if (polylineRef.current) {
      polylineRef.current.remove()
    }
  }, [drawnPoints, mode, updatePolyline])

  const throttledUpdate = useCallback(
    throttle((points) => {
      updatePolyline(points)
      updateOverlay(points)
    }, 16),
    [updatePolyline, updateOverlay]
  )

  const completeDrawing = useCallback(
    (points) => {
      if (points.length > 2) {
        const firstPoint = L.latLng(points[0])
        const lastPoint = L.latLng(points[points.length - 1])
        const distance = getPointDistance(firstPoint, lastPoint)

        const closedPoints = distance < minDistance * 2 ? [...points.slice(0, -1), points[0]] : [...points, points[0]]

        updateOverlay(closedPoints)
        updatePolyline(closedPoints, 'white')
        countItemsInArea(closedPoints)
        onDrawingComplete()
        return closedPoints
      }
      return points
    },
    [getPointDistance, minDistance, updateOverlay, updatePolyline, countItemsInArea, onDrawingComplete]
  )

  const handleDrawingMove = useCallback(
    (latlng) => {
      if (!isDrawingRef.current) return

      const newPoint: any = [latlng.lat, latlng.lng]
      const lastPoint = lastPointRef.current

      if (lastPoint && getPointDistance(L.latLng(lastPoint), L.latLng(newPoint)) < minDistance) {
        return
      }

      lastPointRef.current = newPoint

      const newPoints = [...drawnPoints, newPoint]
      updateDrawnPoints(newPoints)

      if (drawingTimeoutRef.current) {
        cancelAnimationFrame(drawingTimeoutRef.current)
      }

      drawingTimeoutRef.current = requestAnimationFrame(() => {
        throttledUpdate(newPoints)
      })
    },
    [drawnPoints, getPointDistance, throttledUpdate]
  )

  // Touch Events
  useEffect(() => {
    if (!map || !isDrawing) return

    const container = map.getContainer()

    const handleTouchStart = (e) => {
      e.preventDefault()
      const touch = e.touches[0]
      const point = map.containerPointToLatLng([touch.clientX, touch.clientY])
      isDrawingRef.current = true
      updateDrawnPoints([])
      handleDrawingMove(point)
    }

    const handleTouchMove = (e) => {
      e.preventDefault()
      if (!isDrawingRef.current) return
      const touch = e.touches[0]
      const point = map.containerPointToLatLng([touch.clientX, touch.clientY])
      handleDrawingMove(point)
    }

    const handleTouchEnd = (e) => {
      e.preventDefault()
      if (!isDrawingRef.current) return
      isDrawingRef.current = false
      lastPointRef.current = null

      const newPoints = completeDrawing(drawnPoints)
      updateDrawnPoints(newPoints)
    }

    // Mouse Events
    const handleMouseDown = (e) => {
      const point = map.containerPointToLatLng([e.clientX, e.clientY])
      isDrawingRef.current = true
      updateDrawnPoints([])
      handleDrawingMove(point)
    }

    const handleMouseMove = (e) => {
      if (!isDrawingRef.current) return
      const point = map.containerPointToLatLng([e.clientX, e.clientY])
      handleDrawingMove(point)
    }

    const handleMouseUp = () => {
      if (!isDrawingRef.current) return
      isDrawingRef.current = false
      lastPointRef.current = null

      const newPoints = completeDrawing(drawnPoints)
      updateDrawnPoints(newPoints)
    }

    // Add event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: false })
    container.addEventListener('mousedown', handleMouseDown)
    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseup', handleMouseUp)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('mousedown', handleMouseDown)
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseup', handleMouseUp)
    }
  }, [map, isDrawing, handleDrawingMove, updateOverlay, countItemsInArea])

  // Cleanup
  useEffect(() => {
    return () => {
      if (overlayRef.current) overlayRef.current.remove()
      if (polylineRef.current) polylineRef.current.remove()
      if (drawingTimeoutRef.current) cancelAnimationFrame(drawingTimeoutRef.current)
    }
  }, [])

  // Toggle map interactions
  useEffect(() => {
    const controls = [
      map.dragging,
      map.touchZoom,
      map.doubleClickZoom,
      map.scrollWheelZoom,
      map.boxZoom,
      map.keyboard,
      map.tapHold,
    ].filter(Boolean)

    controls.forEach((control) => {
      isDrawing ? control.disable() : control.enable()
    })
  }, [isDrawing, map])

  return null
}

function throttle(func, limit) {
  let inThrottle
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

const EstateModal: React.FC<ModalSelectEstate> = (props) => {
  const { estate, isModalOpen, onClose } = props
  if (!isModalOpen) return null
  // console.log(housing, 'property--property')
  const province = getProvinceFromCoordinates(estate.location.lat, estate.location.lng)
  return (
    <div className="fixed w-full inset-0 z-[9999] flex items-end mb-[85px] justify-center" onClick={onClose}>
      <div className="bg-white flex items-center rounded-2xl shadow-lg max-w-md w-full mx-4 h-[100px]" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col justify-center w-full px-3">
          <Link href={`/estate-consultant/${estate.id}?estateName=${estate.name}`} className="flex items-center gap-2 h-full w-full">
            {estate.image && (
              <div className=" bg-gray-200 rounded-[10px] flex items-center justify-center">
                <Image
                  width={104}
                  height={100}
                  className="rounded-[10px] w-[78px] h-[76px] object-cover"
                  src={estate.image}
                  alt={estate.name}
                />
              </div>
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-[#D52133]">
                <LocationRedSmIcon width="16px" height="16px" />
                <div className="text-xs font-normal">{province}</div>
              </div>

              <div className="line-clamp-1 overflow-hidden text-ellipsis text-base font-normal mt-1">
                {estate.name}
              </div>
              <div className="mt-1.5">
              <div className="text-sm farsi-digits text-[#5A5A5A] font-normal flex gap-1">
                    <div className="font-normal "> {estate.address}</div>
                  </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

const BoundsFetcher = ({ onBoundsChanged }) => {
  const map = useMap()
  useEffect(() => {
    const updateBounds = () => {
      const currentZoom = map.getZoom()
      // اگر سطح زوم کمتر از ۱۱ است، به‌روزرسانی bounds انجام نمی‌شود.
      if (currentZoom < 11) return
      onBoundsChanged(map.getBounds())
    }
    map.on('moveend', updateBounds)
    // فراخوانی اولیه
    updateBounds()
    return () => {
      map.off('moveend', updateBounds)
    }
  }, [map, onBoundsChanged])
  return null
}

const SearchFetcher = () => {
  const { center, zoom, isSearchTriggered } = useAppSelector((state) => state.statesData)
  const map = useMap()
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (isSearchTriggered && center && zoom) {
      map.flyTo(center as LatLngTuple, zoom)
      dispatch(setSearchTriggered(false))
    }
  }, [isSearchTriggered, center, zoom, map, dispatch])
  return null
}

const MapController = () => {
  const dispatch = useAppDispatch()
  useMapEvents({
    moveend: (e) => {
      const map = e.target
      const newCenter = map.getCenter()
      const newZoom = map.getZoom()
      dispatch(setCenter([newCenter.lat, newCenter.lng]))
      dispatch(setZoom(newZoom))
    },
  })
  return null
}
const LeafletEstateMap: React.FC<Props> = ({ estateData, onBoundsChanged }) => {
  // ? Assets
  const { query, push } = useRouter()
  const { phoneNumber } = useAppSelector((state) => state.auth)
  const { estateMap } = useAppSelector((state) => state.statesData)
  const center = useAppSelector((state) => state.statesData.center)
  const zoom = useAppSelector((state) => state.statesData.zoom)
  const dispatch = useAppDispatch()
  // ? States
  const { isDrawing, drawnPoints, mode, itemFilesInArea, isSatelliteView } = useAppSelector((state) => state.statesData)
  const [isShow, modalHandlers] = useDisclosure()
  // const [itemFiles, setItemFiles] = useState([])
  const [tileLayerUrl, setTileLayerUrl] = useState(
    isSatelliteView
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  )
  // const [zoomLevel, setZoomLevel] = useState(12)
  // const [isDrawing, setIsDrawing] = useState(false)
  // const [drawnPoints, setDrawnPoints] = useState([])
  // const [selectedArea, setSelectedArea] = useState(null)
  const mapRef = useRef(null)
  const polylineRef = useRef(null)
  const updateIsDrawing = (value) => dispatch(setIsDrawing(value))
  const updateSetMode = (value) => dispatch(setMode(value))

  // const [mode, setMode] = useState('none')
  const [viewedProperties, setViewedProperties] = useState<string[]>([])
  const [selectedEstate, setSelectedEstate] = useState<Estate>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [position, setPosition] = useState(null)
  // const [address, setAddress] = useState('')
  const mapStyle = {
    width: '100%',
    height: '100%',
    cursor: isDrawing ? 'crosshair' : 'grab',
  }

  const userLocationIcon = L.divIcon({
    className: 'custom-user-location',
    html: `
      <div class="location-marker">
        <div class="location-marker__inner"></div>
      </div>
      <style>
        .location-marker {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.2);
          position: relative;
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .location-marker__inner {
          width: 12px;
          height: 12px;
          background: rgb(37, 99, 235);
          border: 2px solid white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 0 2px rgb(37, 99, 235);
        }
        
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.5);
          }
          
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 15px rgba(37, 99, 235, 0);
          }
          
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
          }
        }
      </style>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })

  // ? Queries
  const { data: statusData } = useGetSubscriptionStatusQuery(phoneNumber)
  const [viewProperty, { isSuccess }] = useViewPropertyMutation()
  const { data: viewedPropertiesData, isLoading: isLoadingViewedProperties } = useGetViewedPropertiesQuery(
    phoneNumber,
    {
      skip: !phoneNumber,
    }
  )

  useEffect(() => {
    if (viewedPropertiesData) {
      setViewedProperties(viewedPropertiesData.data.map((item) => item.propertyId))
    }
  }, [viewedPropertiesData])

  const haversineDistance = (coords1: number[], coords2: number[]) => {
    const toRad = (value: number) => (value * Math.PI) / 180

    const [lat1, lon1] = coords1
    const [lat2, lon2] = coords2

    const R = 6371 // شعاع زمین به کیلومتر
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)

    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // فاصله بر حسب کیلومتر
  }

  const handleGPSClick = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          // const userCoords = [35.6892, 51.389]
          const userCoords = [latitude, longitude]

          setUserLocation(userCoords)
          dispatch(setUserCityLocation(userCoords))

          let nearestProvince = null
          let minDistance = Infinity

          for (const province of iranProvincesByPopulation) {
            const provinceCoords = province.geom.coordinates.reverse() // تبدیل به [lat, lng]
            const distance = haversineDistance(userCoords, provinceCoords)
            if (distance < minDistance) {
              minDistance = distance
              nearestProvince = {
                name: province.province,
                coordinates: provinceCoords,
              }
            }
          }

          if (nearestProvince) {
            localStorage.setItem('userCity', JSON.stringify(nearestProvince))
          }

          if (mapRef.current) {
            mapRef.current.flyTo(userCoords, 15)
          }
        },
        (error) => {
          console.error('خطا در دریافت موقعیت:', error)
          alert('دسترسی به موقعیت مکانی امکان‌پذیر نیست')
        }
      )
    } else {
      alert('مرورگر شما از Geolocation پشتیبانی نمی‌کند')
    }
  }

  const updateDrawnPoints = (points) => {
    dispatch(setDrawnPoints(points))
  }

  const updateMode = (newMode) => {
    dispatch(setMode(newMode))
  }

  const updateItemFiles = (items) => {
    dispatch(setItemFilesInArea(items))
  }

  const updateSelectedArea = (area) => {
    dispatch(setSelectedArea(area))
  }

  const handleDrawButtonClick = () => {
    if (mode === 'none') {
      updateMode('drawing')
      updateIsDrawing(true)
      updateDrawnPoints([])
      updateSelectedArea(null)
      if (polylineRef.current) {
        polylineRef.current.remove()
      }
    } else if (mode === 'checking') {
      updateMode('dispose')
      updateIsDrawing(false)
      updateDrawnPoints([])
      updateItemFiles([])
      if (polylineRef.current) {
        polylineRef.current.remove()
      }
    }
  }

  const handleDrawingComplete = useCallback(() => {
    updateIsDrawing(false)
    updateMode('checking')
  }, [])

  const renderButtonContent = () => {
    switch (mode) {
      case 'drawing':
        return <FingerWIcon width="26px" height="29px" fill="#FDFDFD" />
      case 'checking':
        return <Close className="text-[28px] text-white" />
      default:
        return <FingerIcon width="26px" height="29px" />
    }
  }

  const toggleMapType = () => {
    setTileLayerUrl(
      isSatelliteView
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

  const handleNavigate = (): void => {
    // const logged = localStorage.getItem('loggedIn')
    // const role = localStorage.getItem('role')
    // console.log(role)

    // if (role === 'user' || role === null) {
    //   push('/authentication/login?role=memberUser')
    // } else if (logged === 'true') {
    //   push('/housing/ad')
    // }
    push('/estate-consultant/register')
  }

  const handleMarkerClick = async (estate: Estate) => {
    // if (!phoneNumber) {
    //   toast.error('لطفا ابتدا وارد شوید')
    //   dispatch(setIsShowLogin(true))
    //   return
    // }

    setSelectedEstate(estate)
    setIsModalOpen(true)
    // try {
    //   const response = await viewProperty({
    //     phoneNumber,
    //     propertyId: property.id,
    //   }).unwrap()

    //   if (response.status === 201) {
    //     setViewedProperties((prev) => [...prev, property.id])
    //     setIsModalOpen(true)
    //     toast.success(response.message)
    //   } else {
    //     setIsModalOpen(true)
    //     toast.warning(response.message)
    //   }
    // } catch (error: any) {
    //   if (error.status === 403) {
    //     toast.error('لطفا اشتراک تهیه کنید')
    //     push('/subscription')
    //   } else {
    //     toast.error(error.data?.message || 'خطا در بازدید ملک')
    //   }
    // }
  }
  useEffect(() => {
    if (estateMap) {
      console.log(estateMap, 'estateMap')
    }
  }, [estateMap])
  // const getAddress = async (lat, lon) => {
  //   try {
  //     const response = await fetch(
  //       `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=fa`
  //     )
  //     const data = await response.json()
  //     console.log(data, 'data ----------- data')

  //     if (data.display_name) {
  //       setAddress(data.display_name)
  //     } else {
  //       setAddress('آدرس یافت نشد')
  //     }
  //   } catch (error) {
  //     console.error('خطا در دریافت آدرس:', error)
  //     setAddress('خطا در دریافت آدرس')
  //   }
  // }

  const getAddress = async (lat, lon) => {
    try {
      const response = await fetch(`https://map.ir/reverse?lat=${lat}&lon=${lon}`, {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_MAP_API_KEY,
        },
      })
      const data = await response.json()
      console.log(data, 'data ----------- data')

      if (data && data.province && data.county) {
        const simplifiedAddress = `${data.province} ${data.county && `، شهرستان ${data.county}`} ${
          data.city && `،شهر ${data.city}`
        }`
        dispatch(setAddress(simplifiedAddress))
      } else {
        dispatch(setAddress('اطلاعات کافی برای آدرس یافت نشد'))
      }
    } catch (error) {
      console.log('خطا در دریافت آدرس:', error)
      dispatch(setAddress('خطا در دریافت آدرس'))
    }
  }

  const MapEvents = () => {
    const map = useMapEvents({
      moveend: () => {
        const newCenter = map.getCenter()
        const currentZoom = map.getZoom() // دریافت سطح زوم فعلی
        dispatch(setCenter([newCenter.lat, newCenter.lng]))

        // بررسی سطح زوم
        if (currentZoom >= 11) {
          getAddress(newCenter.lat, newCenter.lng) // دریافت آدرس فقط در زوم کافی
          dispatch(setShowZoomModal(false)) // بستن مودال
        } else {
          dispatch(setShowZoomModal(true)) // نمایش مودال
          // dispatch(setAddress('لطفا نزدیک‌تر شوید')) // تنظیم پیام موقت
        }
      },
    })
    return null
  }
  useEffect(() => {
    // فراخوانی تابع getAddress هنگام لود اولیه
    const initialCenter = center as LatLngTuple
    const initialZoom = zoom
    if (initialZoom >= 11) {
      getAddress(initialCenter[0], initialCenter[1])
      dispatch(setShowZoomModal(false))
    } else {
      dispatch(setShowZoomModal(true))
      // dispatch(setAddress('لطفا نزدیک‌تر شوید'));
    }
  }, [])

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <div className="fixed flex flex-col gap-y-2.5 bottom-[88px] right-4 z-[1000]">
        <button
          onClick={modalHandlers.open}
          className={`${
            tileLayerUrl ===
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
              ? 'bg-black text-white'
              : 'bg-white'
          } w-[48px] h-[48px] rounded-lg flex-center shadow-icon`}
        >
          <MapIcon2 width="26.8px" height="26.8px" />
        </button>
        <button
          id="gps"
          onClick={handleGPSClick}
          className="bg-white w-[48px] h-[48px] rounded-lg flex-center shadow-icon"
        >
          <SendIcon width="26px" height="26px" />
        </button>
        <button
          className={`${mode === 'drawing' ? 'bg-[#1A1E25]' : ''} ${mode === 'checking' ? 'bg-[#1A1E25]' : ''} ${
            mode !== 'drawing' && mode !== 'checking' && 'bg-white'
          } w-[48px] h-[48px] rounded-lg flex-center shadow-icon`}
          onClick={handleDrawButtonClick}
          disabled={mode === 'drawing'}
        >
          {renderButtonContent()}
        </button>
      </div>
      {isShowAdModalButton && (
        <div className="fixed flex flex-col gap-y-2.5 bottom-[88px] left-4 z-[1000]">
          <div
            onClick={handleNavigate}
            className="bg-white hover:bg-gray-50 w-[110px] h-[56px] rounded-[59px] flex-center gap-2 shadow-icon cursor-pointer"
          >
            <UserEditMdIcon width="24px" height="24px" />
            <div className="font-semibold text-[16px]">ثبت نام</div>
          </div>
        </div>
      )}
      {itemFilesInArea.length > 0 && (
        <div className="absolute flex-center gap-y-2.5 bottom-[155px] left-4 z-[1000]">
          <div className="bg-[#FFF0F2] farsi-digits w-[102px] h-[24px] text-[#9D9D9D] font-normal text-xs rounded-[59px] flex-center gap-2 shadow-icon cursor-pointer">
            {itemFilesInArea.length} فایل موجود
          </div>
        </div>
      )}
      <EstateModal isModalOpen={isModalOpen} onClose={() => setIsModalOpen(false)} estate={selectedEstate} />
      <Modal isShow={isShow} onClose={handleModalClose} effect="buttom-to-fit">
        <Modal.Content
          onClose={handleModalClose}
          className="flex h-full flex-col gap-y-5 bg-white p-4  pb-8  rounded-2xl rounded-b-none"
        >
          <Modal.Header right onClose={handleModalClose} />
          <Modal.Body>
            <div className="space-y-4">
              <div className="flex flex-row-reverse items-center gap-2 w-full">
                <CustomCheckbox
                  name={`satellite-view`}
                  checked={isSatelliteView}
                  onChange={() => dispatch(setIsSatelliteView(!isSatelliteView))}
                  label=""
                  customStyle="bg-sky-500"
                />
                <label htmlFor="satellite-view" className="flex items-center gap-2 w-full">
                  <SatelliteIcon width="24px" height="24px" />
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
      <MapContainer center={center as LatLngTuple} zoom={zoom} style={mapStyle} ref={mapRef}>
        <SearchFetcher />
        <MapEvents />
        <DrawingControl polylineRef={polylineRef} housingData={estateData} onDrawingComplete={handleDrawingComplete} />
        <ZoomHandler />
        <TileLayer
          url={tileLayerUrl}
          attribution={
            tileLayerUrl.includes('arcgisonline')
              ? '&copy; <a href="https://www.esri.com/en-us/home">ESRI</a> contributors'
              : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
        />
        <MapController />

        {/* کامپوننتی برای دریافت bounds (در صورت نیاز) */}
        {onBoundsChanged && <BoundsFetcher onBoundsChanged={onBoundsChanged} />}
        {userLocation && <Marker position={userLocation} icon={userLocationIcon} />}

        {estateData.map((estate) => (
          <Marker
            key={estate.id}
            position={[estate.location.lat, estate.location.lng]}
            icon={createIcon(
              zoom,
              estate
            )}
            title={estate.name}
            eventHandlers={{
              click: () => handleMarkerClick(estate),
            }}
          />
        ))}
      </MapContainer>
    </div>
  )
}

export default React.memo(LeafletEstateMap)
