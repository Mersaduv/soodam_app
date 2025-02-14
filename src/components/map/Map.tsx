import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Polygon, Popup } from 'react-leaflet'
import L from 'leaflet'
import { LatLngTuple } from 'leaflet'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import ReactDOMServer from 'react-dom/server'
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
} from '@/icons'
import { useAppDispatch, useAppSelector, useDisclosure } from '@/hooks'
import { CustomCheckbox, Modal } from '../ui'
import { Housing } from '@/types'
import { useRouter } from 'next/router'
import * as turf from '@turf/turf'
import { setIsShowLogin, setStateData } from '@/store'
import { useGetSubscriptionStatusQuery, useGetViewedPropertiesQuery, useViewPropertyMutation } from '@/services'
import { toast } from 'react-toastify'
import Image from 'next/image'
import { formatPrice, IRAN_PROVINCES } from '@/utils'
import Link from 'next/link'
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
  price: number
  rent: number
  deposit: number
  location: Location
}

interface ModalSelectHousing {
  housing: Housing
  onClose: () => void
  isModalOpen: boolean
}

const formatPriceLoc = (price: number): string => {
  if (price >= 1_000_000_000) {
    return `${(price / 1_000_000_000).toFixed(3)} میلیارد تومان`
  } else if (price >= 1_000_000) {
    return `${(price / 1_000_000).toFixed(0)} میلیون تومان`
  } else {
    return `${price.toLocaleString()} تومان`
  }
}

const getCenterOfData = (data: Housing[]): LatLngTuple => {
  const latitudes = data.map((item) => item.location.lat)
  const longitudes = data.map((item) => item.location.lng)
  const centerLat = latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length
  const centerLng = longitudes.reduce((sum, lng) => sum + lng, 0) / longitudes.length
  return [centerLat, centerLng] as LatLngTuple
}

const createIconWithPrice = (
  price: string,
  rent: string,
  deposit: string,
  created: string,
  zoom: number,
  propertyId: string,
  isViewed: boolean,
  property: Housing
): L.DivIcon => {
  const iconColor = '#D52133'
  const isNew = (() => {
    const createdDate = new Date(created)
    const today = new Date()
    const diffInDays = (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    return diffInDays <= 2
  })()
  const html = ReactDOMServer.renderToString(
    zoom > 12 ? (
      <div
        className={`w-fit relative  mt-5 ${property.price > 0 ? 'mr-1' : '-mr-4'} ${
          property.ownerProfitPercentage > 0 || property.producerProfitPercentage > 0 ? '-mr-7' : '-mr-4'
        } `}
      >
        <div
          style={{
            backgroundColor: isViewed ? '#D52133' : 'white',
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
          <div className="flex items-center gap-1">
            {isViewed && <CheckSmIcon width="7px" height="6px" />}
            {isNew && !isViewed && <ArrowDownTickIcon width="6px" height="8px" />}
            {/* {price > '0' ? (
              <span className={`font-extrabold text-xs ${isViewed && 'text-white'} farsi-digits pb-[1px]`}>
                {price}
              </span>
            ) : (
              <div className={`flex-center gap-x-1`}>
                <div className="flex-center gap-x-0.5">
                  <span className={`font-extrabold text-xs ${isViewed && 'text-white'} farsi-digits`}>{deposit}</span>
                  <span className={`text-[8px] font-normal ${isViewed && 'text-white'}`}>رهن</span>
                </div>
                <div className="flex-center gap-x-0.5">
                  <span className={`font-extrabold text-xs ${isViewed && 'text-white'} farsi-digits `}>{rent}</span>
                  <span className={`text-[8px] font-normal ${isViewed && 'text-white'}`}>اجاره</span>
                </div>
              </div>
            )} */}
            {property.price > 0 ? (
              <span className={`font-extrabold text-xs ${isViewed && 'text-white'} farsi-digits pb-[1px]`}>
                {' '}
                {formatPrice(property.price)}
              </span>
            ) : property.deposit > 0 || property.rent > 0 ? (
              <div className={`flex-center gap-x-1`}>
                {property.deposit > 0 && (
                  <div className="flex-center gap-x-0.5">
                    <span className={`font-extrabold text-xs ${isViewed && 'text-white'} farsi-digits`}>
                      {formatPrice(property.deposit)}
                    </span>
                    <span className={`text-[8px] font-normal ${isViewed && 'text-white'}`}>رهن</span>
                  </div>
                )}{' '}
                {property.rent > 0 && (
                  <div className="flex-center gap-x-0.5">
                    <span className={`font-extrabold text-xs ${isViewed && 'text-white'} farsi-digits `}>
                      {formatPrice(property.rent)}
                    </span>
                    <span className={`text-[8px] font-normal ${isViewed && 'text-white'}`}>اجاره</span>
                  </div>
                )}
              </div>
            ) : null}

            {(property.ownerProfitPercentage > 0 || property.producerProfitPercentage > 0) && (
              <div className={`flex-center gap-x-1`}>
                {property.ownerProfitPercentage > 0 && (
                  <div className="flex-center gap-x-0.5">
                    <span className={`font-extrabold text-xs ${isViewed && 'text-white'} farsi-digits `}>
                      {property.ownerProfitPercentage}
                    </span>
                    <span className={`text-[8px] font-normal ${isViewed && 'text-white'} whitespace-nowrap`}>
                      سود مالک
                    </span>
                  </div>
                )}
                {property.producerProfitPercentage > 0 && (
                  <div className="flex-center gap-x-0.5">
                    <span className={`font-extrabold text-xs ${isViewed && 'text-white'} farsi-digits `}>
                      {property.producerProfitPercentage}
                    </span>
                    <span className={`text-[8px] font-normal ${isViewed && 'text-white'} whitespace-nowrap`}>
                      سود سازنده
                    </span>
                  </div>
                )}
              </div>
            )}

            {(property.capacity > 0 ||
              property.extraPeople > 0 ||
              (property.rentalTerm && property.rentalTerm.name)) && (
              <div className={`flex-center gap-x-1`}>
                {property.capacity > 0 && (
                  <div className="flex-center gap-x-0.5">
                    <span className={`font-extrabold text-xs ${isViewed && 'text-white'} farsi-digits `}>
                      {property.capacity}
                    </span>
                    <span className={`text-[8px] font-normal ${isViewed && 'text-white'} whitespace-nowrap`}>
                      ظرفیت
                    </span>
                  </div>
                )}
                {property.extraPeople > 0 && (
                  <div className="flex-center gap-x-0.5">
                    <span className={`font-extrabold text-xs ${isViewed && 'text-white'} farsi-digits `}>
                      {property.extraPeople}
                    </span>
                    <span className={`text-[8px] font-normal ${isViewed && 'text-white'} whitespace-nowrap`}>
                      نفرات اضافه
                    </span>
                  </div>
                )}
              </div>
            )}
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
        {isNew && (
          <div
            style={{ fontFamily: 'estedad' }}
            className="bg-emerald-500 px-[1.5px] pb-[1px] rounded-[2px] w-fit text-[7px] text-white absolute -bottom-[9px] left-1"
          >
            جدید
          </div>
        )}
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

interface ZoomHandlerProps {
  setZoomLevel: (zoom: number) => void
}
const ZoomHandler: React.FC<ZoomHandlerProps> = ({ setZoomLevel }) => {
  const role = localStorage.getItem('role')
  const user = JSON.parse(localStorage.getItem('user'))
  useMapEvents({
    zoomend: (e) => {
      const map = e.target
      let newZoom = map.getZoom()
      if (user && user.role === 'marketer' && user.subscription == undefined && newZoom > 13) {
        newZoom = 13
        map.setZoom(13)
      }
      if (user && user.subscription && user.subscription.status !== 'ACTIVE' && newZoom > 13) {
        newZoom = 13
        map.setZoom(13)
      }

      if (user && user.role === 'memberUser' && user.subscription == undefined && newZoom > 13) {
        newZoom = 13
        map.setZoom(13)
      }

      if (role === 'user' && newZoom > 13) {
        newZoom = 13
        map.setZoom(13)
      }

      setZoomLevel(newZoom)
    },
  })

  return null
}
let isShowAdModalButton = true
const DrawingControl = ({
  isDrawing,
  drawnPoints,
  setDrawnPoints,
  polylineRef,
  housingData,
  onDrawingComplete,
  setItemFiles,
  mode,
  setMode,
}) => {
  const dispatch = useAppDispatch()
  const map = useMap()
  const overlayRef = useRef(null)
  const isDrawingRef = useRef(false)
  const drawingTimeoutRef = useRef(null)
  const lastPointRef = useRef(null)
  const minDistance = 5

  useEffect(() => {
    if (mode === 'dispose') {
      setItemFiles([])
      setDrawnPoints([])
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
      setMode('none')
    }
  }, [mode])

  useEffect(() => {
    if (isDrawing) {
      setItemFiles([])

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
      console.log('points:', points, polygon, 'polygon')
      setItemFiles(itemsInArea)
      dispatch(setStateData(itemsInArea))
      console.log('Items in area:', itemsInArea.length, itemsInArea)
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

  const updateOverlay = useCallback(
    (points) => {
      if (!points.length) return

      if (overlayRef.current) {
        overlayRef.current.remove()
      }

      if (points.length < 3) return

      const maxBounds = [
        [90, -180],
        [90, 180],
        [-90, 180],
        [-90, -180],
        [90, -180],
      ]

      const overlay = L.polygon([maxBounds, points], {
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
    (points) => {
      if (polylineRef.current) {
        polylineRef.current.remove()
      }

      const polyline = L.polyline(points, {
        color: 'white',
        weight: 5,
        smoothFactor: 1,
        interactive: false,
      }).addTo(map)

      polylineRef.current = polyline
    },
    [map]
  )

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
        // Calculate distance between first and last point
        const firstPoint = L.latLng(points[0])
        const lastPoint = L.latLng(points[points.length - 1])
        const distance = getPointDistance(firstPoint, lastPoint)

        // If the end point is close enough to the start point, use the start point
        // Otherwise, add the start point to close the polygon
        const closedPoints = distance < minDistance * 2 ? [...points.slice(0, -1), points[0]] : [...points, points[0]]

        updateOverlay(closedPoints)
        updatePolyline(closedPoints) // Update the polyline to show the closing line
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

      // Check if the new point is far enough from the last point
      if (lastPoint && getPointDistance(L.latLng(lastPoint), L.latLng(newPoint)) < minDistance) {
        return
      }

      lastPointRef.current = newPoint

      setDrawnPoints((prev) => {
        const newPoints = [...prev, newPoint]

        if (drawingTimeoutRef.current) {
          cancelAnimationFrame(drawingTimeoutRef.current)
        }

        drawingTimeoutRef.current = requestAnimationFrame(() => {
          throttledUpdate(newPoints)
        })

        return newPoints
      })
    },
    [getPointDistance, throttledUpdate]
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
      setDrawnPoints([])
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

      setDrawnPoints((prev) => completeDrawing(prev))
    }

    // Mouse Events
    const handleMouseDown = (e) => {
      const point = map.containerPointToLatLng([e.clientX, e.clientY])
      isDrawingRef.current = true
      setDrawnPoints([])
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

      setDrawnPoints((prev) => completeDrawing(prev))
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

const getProvinceFromCoordinates = (lat, lng) => {
  const province = IRAN_PROVINCES.find((province) => {
    const { bounds } = province
    return lat >= bounds.minLat && lat <= bounds.maxLat && lng >= bounds.minLng && lng <= bounds.maxLng
  })
  return province ? province.name : 'نامشخص'
}

const PropertyModal: React.FC<ModalSelectHousing> = (props) => {
  const { housing, isModalOpen, onClose } = props
  if (!isModalOpen) return null
  console.log(housing, 'property--property')
  const province = getProvinceFromCoordinates(housing.location.lat, housing.location.lng)
  const isSelling = housing.price > 0
  return (
    <div className="fixed w-full inset-0 z-[9999] flex items-end mb-[85px] justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg p-4 shadow-lg max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col">
          <Link href={`/housing/${housing.adCode}`} className="flex gap-2">
            {housing.images.length > 0 && (
              <div className=" bg-gray-200 rounded-[10px] mb-4">
                <Image
                  width={104}
                  height={100}
                  className="rounded-[10px] h-[104px] object-cover"
                  src={housing.images[1]}
                  alt={housing.title}
                />
              </div>
            )}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-1.5">
                <LocationSmIcon width="16px" height="16px" />
                <div className="text-xs font-normal">{province}</div>
              </div>

              <div className="line-clamp-1 overflow-hidden text-ellipsis text-base font-normal mt-1">
                {housing.title}
              </div>
              <div className="mt-2">
                {/* نمایش قیمت فروش یا رهن و اجاره */}
                {housing.price > 0 ? (
                  <div className="text-sm farsi-digits text-[#5A5A5A] font-normal flex gap-1">
                    <div className="font-normal "> {formatPriceLoc(housing.price)}</div>
                  </div>
                ) : housing.deposit > 0 || housing.rent > 0 ? (
                  <div className="text-[16px] farsi-digits text-[#5A5A5A] font-normal space-y-2">
                    {housing.deposit > 0 && (
                      <div className="flex gap-1 text-xs">
                        {' '}
                        رهن: <div className="font-normal">{formatPriceLoc(housing.deposit)}</div>{' '}
                      </div>
                    )}{' '}
                    {housing.rent > 0 && (
                      <div className="flex gap-1 text-xs">
                        اجاره: <div className="font-normal">{formatPriceLoc(housing.rent)} </div>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* نمایش درصد سود مالک و سازنده */}
                {(housing.ownerProfitPercentage > 0 || housing.producerProfitPercentage > 0) && (
                  <div className="text-[13px] space-y-1">
                    {housing.ownerProfitPercentage > 0 && (
                      <p className="text-[#5A5A5A]">سود مالک: {housing.ownerProfitPercentage}%</p>
                    )}
                    {housing.producerProfitPercentage > 0 && (
                      <p className="text-[#5A5A5A]">سود سازنده: {housing.producerProfitPercentage}%</p>
                    )}
                  </div>
                )}

                {/* نمایش ظرفیت و نفرات اضافه */}
                {(housing.capacity > 0 ||
                  housing.extraPeople > 0 ||
                  (housing.rentalTerm && housing.rentalTerm.name)) && (
                  <div className=" text-[13px] text-[#7A7A7A]">
                    {housing.capacity > 0 && <p className="text-[#5A5A5A]">ظرفیت: {housing.capacity} نفر</p>}
                    {/* {housing.extraPeople > 0 && <p>نفرات اضافه: {housing.extraPeople} نفر</p>} */}
                    {housing.rentalTerm?.name && (
                      <p className="text-[#5A5A5A]">نوع قرارداد: {housing.rentalTerm.name}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Link>

          {/* Property Details */}
          <div className="w-full text-right text-[#7A7A7A] text-sm flex justify-between">
            {/* <div className="flex-center gap-1.5 text-xs font-medium farsi-digits">
              <BedIcon width="21px" height="19px" /> {housing.bedrooms}{' '}
              <span className="font-medium text-[#7A7A7A] text-xs">اتاق خواب</span>
            </div>
            <div className="flex-center gap-1.5 font-medium text-xs farsi-digits">
              <Grid2Icon width="16px" height="16px" /> {housing.cubicMeters}{' '}
              <span className="font-medium text-[#7A7A7A] text-xs">متر مربع</span>
            </div>
            <div className="flex-center gap-1.5 font-medium text-xs farsi-digits">
              <BulidingIcon width="16px" height="17px" /> طبقه {housing.onFloor} از {housing.floors}
            </div> */}
            {housing.highlightFeatures &&
              housing.highlightFeatures.map((feature) => {
                return (
                  <div className="flex-center gap-0.5 text-xs font-medium farsi-digits whitespace-nowrap">
                    {' '}
                    <img className="w-[16px]" src={feature.image} alt="" /> {feature.value}{' '}
                    <span className="font-medium text-[#7A7A7A] text-xs">{feature.title}</span>
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}
const LeafletMap: React.FC<Props> = ({ housingData }) => {
  // ? Assets
  const { query, push } = useRouter()
  const { role, phoneNumber } = useAppSelector((state) => state.auth)
  const { housingMap } = useAppSelector((state) => state.statesData)
  const dispatch = useAppDispatch()
  // ? States
  const [isShow, modalHandlers] = useDisclosure()
  const [itemFiles, setItemFiles] = useState([])
  const [isSatelliteView, setIsSatelliteView] = useState(false)
  const [tileLayerUrl, setTileLayerUrl] = useState('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
  const [zoomLevel, setZoomLevel] = useState(12)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawnPoints, setDrawnPoints] = useState([])
  const [selectedArea, setSelectedArea] = useState(null)
  const mapRef = useRef(null)
  const polylineRef = useRef(null)
  const [mode, setMode] = useState('none')
  const [viewedProperties, setViewedProperties] = useState<string[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Housing>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [position, setPosition] = useState(null)
  const [address, setAddress] = useState('')
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

  const handleGPSClick = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation([latitude, longitude])

          // پن کردن نقشه به موقعیت کاربر
          if (mapRef.current) {
            mapRef.current.flyTo([latitude, longitude], 15)
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

  const handleDrawButtonClick = () => {
    if (mode === 'none') {
      setMode('drawing')
      setIsDrawing(true)
      setDrawnPoints([])
      setSelectedArea(null)
      if (polylineRef.current) {
        polylineRef.current.remove()
      }
    } else if (mode === 'checking') {
      setMode('dispose')
      setIsDrawing(false)
      setDrawnPoints([])
      setItemFiles([])
      if (polylineRef.current) {
        polylineRef.current.remove()
      }
    }
  }

  const handleDrawingComplete = useCallback(() => {
    setIsDrawing(false)
    setMode('checking')
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
    setTileLayerUrl((prevUrl) =>
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

  const handleNavigate = (): void => {
    const logged = localStorage.getItem('loggedIn')

    if (role === 'User') {
      dispatch(setIsShowLogin(true))
    } else if (logged === 'true') {
      push('/housing/ad')
    } else {
      dispatch(setIsShowLogin(true))
    }
  }

  const handleMarkerClick = async (property: Housing) => {
    // if (!phoneNumber) {
    //   toast.error('لطفا ابتدا وارد شوید')
    //   dispatch(setIsShowLogin(true))
    //   return
    // }

    setSelectedProperty(property)
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
    if (housingMap) {
      console.log(housingMap, 'housingMap')
    }
  }, [housingMap])
  const getAddress = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=fa`
      )
      const data = await response.json()
      console.log(data, 'data ----------- data')

      if (data.display_name) {
        setAddress(data.display_name)
      } else {
        setAddress('آدرس یافت نشد')
      }
    } catch (error) {
      console.error('خطا در دریافت آدرس:', error)
      setAddress('خطا در دریافت آدرس')
    }
  }
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng
        setPosition([lat, lng])
        getAddress(lat, lng)
      },
    })
    return null
  }

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
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
        <div className="absolute flex flex-col gap-y-2.5 bottom-[88px] left-4 z-[1000]">
          <div
            onClick={handleNavigate}
            className="bg-white hover:bg-gray-50 w-[131px] h-[56px] rounded-[59px] flex-center gap-2 shadow-icon cursor-pointer"
          >
            <RegisterAdIcon width="32px" height="32px" />
            <span className="font-semibold text-[16px]">ثبت آگهی</span>
          </div>
        </div>
      )}
      {itemFiles.length > 0 && (
        <div className="absolute flex-center gap-y-2.5 bottom-[155px] left-4 z-[1000]">
          <div className="bg-[#FFF0F2] farsi-digits w-[102px] h-[24px] text-[#9D9D9D] font-normal text-xs rounded-[59px] flex-center gap-2 shadow-icon cursor-pointer">
            {itemFiles.length} فایل موجود
          </div>
        </div>
      )}
      <PropertyModal isModalOpen={isModalOpen} onClose={() => setIsModalOpen(false)} housing={selectedProperty} />
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
                  onChange={() => setIsSatelliteView((prev) => !prev)}
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
      <MapContainer center={getCenterOfData(housingData)} zoom={12} style={mapStyle} ref={mapRef}>
        <DrawingControl
          isDrawing={isDrawing}
          drawnPoints={drawnPoints}
          setDrawnPoints={setDrawnPoints}
          polylineRef={polylineRef}
          housingData={housingData}
          onDrawingComplete={handleDrawingComplete}
          setItemFiles={setItemFiles}
          mode={mode}
          setMode={setMode}
        />
        <ZoomHandler setZoomLevel={setZoomLevel} />
        <TileLayer
          url={tileLayerUrl}
          attribution={
            tileLayerUrl.includes('arcgisonline')
              ? '&copy; <a href="https://www.esri.com/en-us/home">ESRI</a> contributors'
              : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
        />
        <MapClickHandler />
        {/* {position && (
          <Marker position={position}>
            <Popup>
              <strong>آدرس:</strong> {address} <br />
              <strong>مختصات:</strong> {position[0]}, {position[1]}
            </Popup>
          </Marker>
        )} */}
        {userLocation && <Marker position={userLocation} icon={userLocationIcon} />}

        {housingData.map((property) => (
          <Marker
            key={property.id}
            position={[property.location.lat, property.location.lng]}
            icon={createIconWithPrice(
              formatPrice(property.price),
              formatPrice(property.rent),
              formatPrice(property.deposit),
              property.created,
              zoomLevel,
              property.id,
              viewedProperties.includes(property.id),
              property
            )}
            title={property.title}
            eventHandlers={{
              click: () => handleMarkerClick(property),
            }}
          />
        ))}
      </MapContainer>
    </div>
  )
}

export default LeafletMap
