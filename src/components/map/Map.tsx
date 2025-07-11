import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Polygon, Popup } from 'react-leaflet'
import L from 'leaflet'
import { LatLngTuple } from 'leaflet'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactDOMServer from 'react-dom/server'
import * as turf from '@turf/turf'
import jalaali from 'jalaali-js'
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
  NEXT_PUBLIC_API_URL,
  userTypes,
} from '@/utils'
import Link from 'next/link'
interface Props {
  housingData: Housing[]
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
  full_address: {
    latitude: number
    longitude: number
  }
}

interface ModalSelectHousing {
  housing: Housing
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
    const shamsiStr = property.created_at.split(' ')[0]
    const [jy, jm, jd] = shamsiStr.split('-').map(Number)

    const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd)
    const createdDate = new Date(gy, gm - 1, gd)

    const today = new Date()
    const diffInDays = (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)

    return diffInDays <= 7
  })()
  const html = ReactDOMServer.renderToString(
    zoom > 12 ? (
      <div
        className={`w-fit relative  mt-[24px] ${Number(property.price.amount) > 0 ? '-mr-[1.5px]' : '-mr-[19px]'} ${
          // Number(property.price.owner_profit_percentage) > 0 ||
          // Number(property.price.producer_profit_percentage) > 0
          Number(0) > 0 || Number(0) > 0 ? '-mr-7' : '-mr-4'
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
          <div className="flex items-center gap-1 pt-[0px]">
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
            {property.price && (
              <>
                {property.price.deposit > 0 && (
                  <div className="text-xs flex gap-1 text-[#5A5A5A] font-normal">
                    <span className={`font-extrabold text-xs ${isViewed && 'text-white'} farsi-digits `}>
                      {formatPrice(Number(property.price.deposit))}
                    </span>
                    <span className={`text-[8px] font-normal ${isViewed && 'text-white'}`}>رهن</span>
                  </div>
                )}
                {property.price.rent > 0 && (
                  <div className="text-xs flex gap-1 text-[#5A5A5A] font-normal">
                    <span className={`font-extrabold text-xs ${isViewed && 'text-white'} farsi-digits `}>
                      {formatPrice(Number(property.price.rent))}
                    </span>
                    <span className={`text-[8px] font-normal ${isViewed && 'text-white'}`}>اجاره</span>
                  </div>
                )}
                {property.price.amount > 0 && (
                  <div className="text-xs flex gap-1 text-[#5A5A5A] font-normal">
                    <span className={`font-extrabold text-xs ${isViewed && 'text-white'} farsi-digits `}>
                      {formatPrice(Number(property.price.amount))}
                    </span>
                    <span className={`text-[8px] font-normal ${isViewed && 'text-white'}`}>فروش</span>
                  </div>
                )}
                {property.price.discount_amount > 0 && (
                  <div className="text-xs flex gap-1 text-[#5A5A5A] font-normal">
                    <span className={`font-extrabold text-xs ${isViewed && 'text-white'} farsi-digits `}>
                      {formatPrice(Number(property.price.discount_amount))}
                    </span>
                    <span className={`text-[8px] font-normal ${isViewed && 'text-white'}`}>تخفیف</span>
                  </div>
                )}
              </>
            )}
            {/* {Number(property.attributes?.find((item) => item?.key === 'text_selling_price')?.value) > 0 ? (
              <span className={`font-extrabold text-xs ${isViewed && 'text-white'} farsi-digits pb-[1px]`}>
                {' '}
                {formatPrice(Number(property.attributes?.find((item) => item?.key === 'text_selling_price')?.value))}
              </span>
            ) : Number(property.attributes?.find((item) => item?.key === 'text_mortgage_deposit')?.value) > 0 ||
              Number(property.attributes?.find((item) => item?.key === 'text_monthly_rent')?.value) > 0 ? (
              <div className={`flex-center gap-x-1`}>
                {Number(property.attributes?.find((item) => item?.key === 'text_mortgage_deposit')?.value) > 0 && (
                  <div className="flex-center gap-x-0.5">
                    <span className={`font-extrabold text-xs ${isViewed && 'text-white'} farsi-digits`}>
                      {formatPrice(
                        Number(property.attributes?.find((item) => item?.key === 'text_mortgage_deposit')?.value)
                      )}
                    </span>
                    <span className={`text-[8px] font-normal ${isViewed && 'text-white'}`}>رهن</span>
                  </div>
                )}{' '}
                {Number(property.attributes?.find((item) => item?.key === 'text_monthly_rent')?.value) > 0 && (
                  <div className="flex-center gap-x-0.5">
                    <span className={`font-extrabold text-xs ${isViewed && 'text-white'} farsi-digits `}>
                      {formatPrice(Number(property.attributes?.find((item) => item?.key === 'text_monthly_rent')?.value))}
                    </span>
                    <span className={`text-[8px] font-normal ${isViewed && 'text-white'}`}>اجاره</span>
                  </div>
                )}
              </div>
            ) : null} */}

            {(Number(property.attributes?.find((item) => item?.key === 'text_owner_profit_percentage')?.value) > 0 ||
              Number(property.attributes?.find((item) => item?.key === 'text_producer_profit_percentage')?.value) >
                0) && (
              <div className={`flex-center gap-x-1`}>
                {Number(property.attributes?.find((item) => item?.key === 'text_owner_profit_percentage')?.value) >
                  0 && (
                  <div className="flex-center gap-x-0.5">
                    <span className={`font-extrabold text-xs ${isViewed && 'text-white'} farsi-digits `}>
                      {Number(property.attributes?.find((item) => item?.key === 'text_owner_profit_percentage')?.value)}
                    </span>
                    <span className={`text-[8px] font-normal ${isViewed && 'text-white'} whitespace-nowrap`}>
                      سود مالک
                    </span>
                  </div>
                )}
                {Number(property.attributes?.find((item) => item?.key === 'text_producer_profit_percentage')?.value) >
                  0 && (
                  <div className="flex-center gap-x-0.5">
                    <span className={`font-extrabold text-xs ${isViewed && 'text-white'} farsi-digits `}>
                      {Number(
                        property.attributes?.find((item) => item?.key === 'text_producer_profit_percentage')?.value
                      )}
                    </span>
                    <span className={`text-[8px] font-normal ${isViewed && 'text-white'} whitespace-nowrap`}>
                      سود سازنده
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* {(Number(property.features.find((item) => item.key === 'text_capacity')?.value) > 0 ||
              Number(property.features.find((item) => item.key === 'text_extra_people')?.value) > 0 ||
              (property.rentalTerm && property.rentalTerm.name)) && (
              <div className={`flex-center gap-x-1`}>
                {Number(property.features.find((item) => item.key === 'text_capacity')?.value) > 0 && (
                  <div className="flex-center gap-x-0.5">
                    <span className={`font-extrabold text-xs ${isViewed && 'text-white'} farsi-digits `}>
                      {Number(property.features.find((item) => item.key === 'text_capacity')?.value)}
                    </span>
                    <span className={`text-[8px] font-normal ${isViewed && 'text-white'} whitespace-nowrap`}>
                      ظرفیت
                    </span>
                  </div>
                )}
                {Number(property.features.find((item) => item.key === 'text_extra_people')?.value) > 0 && (
                  <div className="flex-center gap-x-0.5">
                    <span className={`font-extrabold text-xs ${isViewed && 'text-white'} farsi-digits `}>
                      {Number(property.features.find((item) => item.key === 'text_extra_people')?.value)}
                    </span>
                    <span className={`text-[8px] font-normal ${isViewed && 'text-white'} whitespace-nowrap`}>
                      نفرات اضافه
                    </span>
                  </div>
                )}
              </div>
            )} */}
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
        const point = turf.point([property.full_address.latitude, property.full_address.longitude])

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

const PropertyModal: React.FC<ModalSelectHousing> = (props) => {
  const { housing, isModalOpen, onClose } = props
  if (!isModalOpen) return null
  // console.log(housing, 'property--property')
  const isSelling = Number(housing.attributes?.find((item) => item?.key === 'text_selling_price')?.value) > 0
  return (
    <div className="fixed w-full inset-0 z-[9999] flex items-end mb-[85px] justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg p-4 shadow-lg max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col">
          <Link href={`/housing/${housing.id}`} className="flex gap-2">
            {housing.primary_image ? (
              <div className=" bg-gray-200 rounded-[10px] mb-4">
                <Image
                  width={104}
                  height={100}
                  className="rounded-[10px] h-[104px] object-cover"
                  src={`${housing.primary_image}`}
                  alt={housing.title}
                />
              </div>
            ) : (
              <div className=" bg-gray-200 rounded-[10px] mb-4">
                <Image
                  width={104}
                  height={100}
                  className="rounded-[10px] h-[104px] object-cover"
                  src={`/static/R.png`}
                  alt={housing.title}
                />
              </div>
            )}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-1.5">
                <LocationSmIcon width="16px" height="16px" />
                <div className="text-xs font-normal">{Object(housing.full_address.province).name}</div>
              </div>

              <div className="line-clamp-1 overflow-hidden text-ellipsis text-base font-normal mt-1">
                {housing.title}
              </div>
              <div className="mt-2">
                {housing.price && (
                  <div>
                    {/* نمایش قیمت فروش یا رهن و اجاره */}
                    {Number(housing.price.amount) > 0 ? (
                      <div className="text-sm farsi-digits text-[#5A5A5A] font-normal flex gap-1">
                        <div className="font-normal "> {formatPriceLoc(Number(housing.price.amount))}</div>
                      </div>
                    ) : Number(housing.price?.deposit) > 0 || Number(housing.price?.rent) > 0 ? (
                      <div className="text-[16px] farsi-digits text-[#5A5A5A] font-normal space-y-2">
                        {Number(housing.price?.deposit) > 0 && (
                          <div className="flex gap-1 text-xs">
                            {' '}
                            رهن: <div className="font-normal">
                              {formatPriceLoc(Number(housing.price?.deposit))}
                            </div>{' '}
                          </div>
                        )}{' '}
                        {Number(housing.price?.rent) > 0 && (
                          <div className="flex gap-1 text-xs">
                            اجاره: <div className="font-normal">{formatPriceLoc(Number(housing.price?.rent))}</div>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {/* نمایش درصد سود مالک و سازنده */}
                    {/* {(Number(housing.attributes?.find((item) => item?.key === 'text_owner_profit_percentage')?.value) >
                      0 ||
                      Number(
                        housing.attributes?.find((item) => item?.key === 'text_producer_profit_percentage')?.value
                      ) > 0) && (
                      <div className="text-[13px] space-y-1">
                        {Number(
                          housing.attributes?.find((item) => item?.key === 'text_owner_profit_percentage')?.value
                        ) > 0 && (
                          <p className="text-[#5A5A5A]">
                            سود مالک:{' '}
                            {Number(
                              housing.attributes?.find((item) => item?.key === 'text_owner_profit_percentage')?.value
                            )}
                            %
                          </p>
                        )}
                        {Number(
                          housing.attributes?.find((item) => item?.key === 'text_producer_profit_percentage')?.value
                        ) > 0 && (
                          <p className="text-[#5A5A5A]">
                            سود سازنده:{' '}
                            {Number(
                              housing.attributes?.find((item) => item?.key === 'text_producer_profit_percentage')?.value
                            )}
                            %
                          </p>
                        )}
                      </div>
                    )} */}

                    {/* نمایش ظرفیت و نفرات اضافه */}
                    {/* //... */}
                  </div>
                )}
              </div>
            </div>
          </Link>

          {/* Property Details */}
          <div className="w-full text-right text-[#7A7A7A] text-sm flex justify-start gap-4">
            {housing.highlight_attributes &&
              housing.highlight_attributes.length > 0 &&
              housing.highlight_attributes.map((feature) => {
                return (
                  <div
                    key={feature.id}
                    className="flex-center gap-0.5 text-xs font-medium farsi-digits whitespace-nowrap"
                  >
                    <img className="w-[16px]" src={feature.icon} alt="" />
                    <span className="font-medium text-[#7A7A7A] text-xs">
                      {typeof feature.value === 'object' ? feature.value.value : feature.value}
                    </span>
                    <span className="font-medium text-[#7A7A7A] text-xs">{feature.name}</span>
                  </div>
                )
              })}
            {/* 
            <div className="flex-center gap-1 text-xs font-medium farsi-digits whitespace-nowrap">
              {' '}
              <img className="w-[16px]" src={`/static/grid-222.png`} alt="" />
              <span className="font-medium text-[#7A7A7A] text-xs"> بزودی قابل نمایش میشود</span>
            </div>

            <div className="flex-center gap-1 text-xs font-medium farsi-digits whitespace-nowrap">
              {' '}
              <img className="w-[16px]" src={`/static/grid-222.png`} alt="" />
              <span className="font-medium text-[#7A7A7A] text-xs"> بزودی </span>
            </div>

            <div className="flex-center gap-1 text-xs font-medium farsi-digits whitespace-nowrap">
              {' '}
              <img className="w-[16px]" src={`/static/grid-222.png`} alt="" />
              <span className="font-medium text-[#7A7A7A] text-xs"> بزودی </span>
            </div>
            */}
          </div>
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
const LeafletMap: React.FC<Props> = ({ housingData, onBoundsChanged }) => {
  // ? Assets
  const { query, push } = useRouter()
  const { phoneNumber } = useAppSelector((state) => state.auth)
  const { housingMap } = useAppSelector((state) => state.statesData)
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
  const [selectedProperty, setSelectedProperty] = useState<Housing>(null)
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
    const logged = localStorage.getItem('loggedIn')
    const userType = localStorage.getItem('userType')
    console.log(userType)

    if (userType === 'user' || userType === null) {
      push('/authentication/login?role=memberUser')
    } else if (logged === 'true') {
      push('/housing/ad')
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
            className="bg-white hover:bg-gray-50 w-[131px] h-[56px] rounded-[59px] flex-center gap-2 shadow-icon cursor-pointer"
          >
            <RegisterAdIcon width="32px" height="32px" />
            <span className="font-semibold text-[16px]">ثبت آگهی</span>
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
        <DrawingControl polylineRef={polylineRef} housingData={housingData} onDrawingComplete={handleDrawingComplete} />
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

        {housingData.map((property) => (
          <Marker
            key={property.id}
            position={[property.full_address.latitude, property.full_address.longitude]}
            icon={createIconWithPrice(
              formatPrice(Number(property.attributes?.find((item) => item?.key === 'text_selling_price')?.value)),
              formatPrice(Number(property.attributes?.find((item) => item?.key === 'text_monthly_rent')?.value)),
              formatPrice(Number(property.attributes?.find((item) => item?.key === 'text_mortgage_deposit')?.value)),
              property.created_at,
              zoom,
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

export default React.memo(LeafletMap)
