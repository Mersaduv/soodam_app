// import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Polygon } from 'react-leaflet'
// import L from 'leaflet'
// import { LatLngTuple } from 'leaflet'
// import React, { useEffect, useRef, useState } from 'react'
// import ReactDOMServer from 'react-dom/server'
// import {
//   HomeIcon,
//   MapIcon,
//   MapIcon2,
//   SatelliteIcon,
//   SendIcon,
//   FingerIcon,
//   RegisterAdIcon,
//   ArrowDownTickIcon,
// } from '@/icons'
// import { useDisclosure } from '@/hooks'
// import { CustomCheckbox, Modal } from '../ui'
// import { Housing } from '@/types'
// import { useRouter } from 'next/router'
// interface Props {
//   housingData: Housing[]
// }

// // نوع داده برای مکان‌ها
// interface Location {
//   lat: number
//   lng: number
// }

// // نوع داده برای ملک‌ها
// interface Property {
//   id: string
//   title: string
//   sellingPrice: number
//   rent: number
//   deposit: number
//   location: Location
// }

// const formatPrice = (price: number): string => {
//   if (price >= 1_000_000_000) {
//     return (price / 1_000_000_000).toFixed(3)
//   } else if (price >= 1_000_000) {
//     return (price / 1_000_000).toFixed(0)
//   } else {
//     return price.toString()
//   }
// }

// const getCenterOfData = (data: Housing[]): LatLngTuple => {
//   const latitudes = data.map((item) => item.location.lat)
//   const longitudes = data.map((item) => item.location.lng)
//   const centerLat = latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length
//   const centerLng = longitudes.reduce((sum, lng) => sum + lng, 0) / longitudes.length
//   return [centerLat, centerLng] as LatLngTuple
// }

// const createIconWithPrice = (
//   price: string,
//   rent: string,
//   deposit: string,
//   created: string,
//   zoom: number
// ): L.DivIcon => {
//   const iconColor = '#D52133'
//   const isNew = (() => {
//     const createdDate = new Date(created)
//     const today = new Date()
//     const diffInDays = (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
//     return diffInDays <= 2
//   })()
//   const html = ReactDOMServer.renderToString(
//     zoom > 12 ? (
//       <div className="w-fit relative">
//         <div
//           style={{
//             backgroundColor: 'white',
//             color: 'black',
//             borderRadius: '4px',
//             padding: '2px 5px',
//             fontSize: '14px',
//             border: '1px solid #E3E3E7',
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'center',
//             width: 'fit-content',
//             height: '16px',
//             fontFamily: 'estedad',
//             marginBottom: '-22px',
//             zIndex: 10,
//           }}
//         >
//           <div className="flex items-center gap-1">
//             {isNew && <ArrowDownTickIcon width="6px" height="8px" />}
//             {price > '0' ? (
//               <span className="font-extrabold text-xs text-[#1A1E25] farsi-digits">{price}</span>
//             ) : (
//               <div className="flex-center gap-x-1">
//                 <div className="flex-center gap-x-0.5">
//                   <span className="font-extrabold text-xs text-[#1A1E25] farsi-digits">{deposit}</span>
//                   <span className="text-[8px] font-normal">رهن</span>
//                 </div>
//                 <div className="flex-center gap-x-0.5">
//                   <span className="font-extrabold text-xs text-[#1A1E25] farsi-digits">{rent}</span>
//                   <span className="text-[8px] font-normal">اجاره</span>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//         <div
//           style={{
//             fontSize: '24px',
//             color: iconColor,
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'center',
//             position: 'absolute',
//             zIndex: -1,
//             margin: 'auto',
//             left: '0',
//             right: '0',
//             top: '-8.2px',
//           }}
//         >
//           <HomeIcon width="16px" height="16px" />
//         </div>
//         {isNew && (
//           <div
//             style={{ fontFamily: 'estedad' }}
//             className="bg-emerald-500 px-[1.5px] pb-[1px] rounded-[2px] w-fit text-[7px] text-white absolute -bottom-[9px] left-1"
//           >
//             جدید
//           </div>
//         )}
//       </div>
//     ) : (
//       <div
//         style={{
//           fontSize: '24px',
//           color: iconColor,
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           position: 'absolute',
//           zIndex: -1,
//           margin: 'auto',
//           left: '0',
//           right: '0',
//           top: '-8.2px',
//         }}
//       >
//         <HomeIcon width="16px" height="16px" />
//       </div>
//     )
//   )
//   return L.divIcon({ html, className: 'custom-icon', iconSize: [50, 50] })
// }
// const ZoomHandler: React.FC<{ setZoomLevel: (zoom: number) => void }> = ({ setZoomLevel }) => {
//   useMapEvents({
//     zoomend: (e) => {
//       const map = e.target
//       setZoomLevel(map.getZoom())
//     },
//   })

//   return null
// }

// const MapDrawingHandler = ({ isDrawingMode, setPolygonPoints, polygonPoints }) => {
//   const isDrawing = useRef(false);

//   useMapEvents({
//     mousedown: (e) => {
//       if (isDrawingMode) {
//         isDrawing.current = true;
//         setPolygonPoints([[e.latlng.lat, e.latlng.lng]]);
//       }
//     },
//     mousemove: (e) => {
//       if (isDrawingMode && isDrawing.current) {
//         setPolygonPoints(points => [...points, [e.latlng.lat, e.latlng.lng]]);
//       }
//     },
//     mouseup: () => {
//       if (isDrawingMode) {
//         isDrawing.current = false;
//       }
//     },
//     mouseout: () => {
//       isDrawing.current = false;
//     }
//   });
//   return null;
// };
// const LeafletMap: React.FC<Props> = ({ housingData }) => {
//   // ? Assets
//   const { query, push } = useRouter()
//   // ? States
//   const [isShow, modalHandlers] = useDisclosure()
//   const [isSatelliteView, setIsSatelliteView] = useState(false)
//   const [tileLayerUrl, setTileLayerUrl] = useState('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
//   const [isDrawingMode, setIsDrawingMode] = useState(false);
//   const [polygonPoints, setPolygonPoints] = useState([]);
//   const [zoomLevel, setZoomLevel] = useState(12);
//   const mapRef = useRef(null);

//   const toggleDrawingMode = () => {
//     setIsDrawingMode(!isDrawingMode);
//     if (isDrawingMode) {
//       calculatePropertiesInPolygon();
//       setPolygonPoints([]);
//     }
//   };

//   const calculatePropertiesInPolygon = () => {
//     if (polygonPoints.length < 3) return;

//     const propertiesInside = housingData.filter(property => {
//       return isPointInPolygon(
//         [property.location.lat, property.location.lng],
//         polygonPoints
//       );
//     });

//     console.log(`تعداد فایل‌های داخل محدوده: ${propertiesInside.length}`);
//   };

//   const isPointInPolygon = (point, polygon) => {
//     let inside = false;
//     for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
//       const xi = polygon[i][0], yi = polygon[i][1];
//       const xj = polygon[j][0], yj = polygon[j][1];

//       const intersect = ((yi > point[1]) !== (yj > point[1]))
//           && (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi);
//       if (intersect) inside = !inside;
//     }
//     return inside;
//   };

//   // اضافه کردن استایل برای تغییر شکل موس در حالت رسم
//   const mapStyle = {
//     width: '100%',
//     height: '100%',
//     cursor: isDrawingMode ? 'crosshair' : 'grab'
//   };
//   const toggleMapType = () => {
//     setTileLayerUrl((prevUrl) =>
//       prevUrl === 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
//         ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
//         : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
//     )
//   }

//   const handleApply = (): void => {
//     toggleMapType()
//     modalHandlers.close()
//   }

//   const handleModalClose = (): void => {
//     modalHandlers.close()
//   }

//   const handleNavigate = (): void => {
//     const logged = localStorage.getItem('loggedIn')
//     if (logged === 'true') {
//       push('/housing/ad')
//     } else {
//       push({
//         pathname: '/authentication/login',
//         query: { redirectTo: '/housing/ad' },
//       })
//     }
//   }

//   useEffect(() => {
//     if (mapRef.current) {
//       const mapInstance = mapRef.current;
//       if (isDrawingMode) {
//         mapInstance.dragging.disable()
//       } else {
//         mapInstance.dragging.enable()
//       }
//     }
//   }, [isDrawingMode]);

//   return (
//     <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
//       <div className="absolute flex flex-col gap-y-2.5 bottom-[88px] right-4 z-[1000]">
//         <button
//           onClick={modalHandlers.open}
//           className={`${
//             tileLayerUrl ===
//             'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
//               ? 'bg-black text-white'
//               : 'bg-white'
//           } w-[48px] h-[48px] rounded-lg flex-center shadow-icon`}
//         >
//           <MapIcon2 width="26.8px" height="26.8px" />
//         </button>
//         <button className="bg-white w-[48px] h-[48px] rounded-lg flex-center shadow-icon">
//           <SendIcon width="26px" height="26px" />
//         </button>
//         <button
//         className={`bg-white w-[48px] h-[48px] rounded-lg flex-center shadow-icon ${isDrawingMode ? 'bg-blue-200' : ''}`}
//         onClick={toggleDrawingMode}
//         title={isDrawingMode ? 'اتمام رسم محدوده' : 'شروع رسم محدوده'}
//       >
//         <FingerIcon width="26px" height="29px" />
//       </button>
//       </div>

//       <div className="absolute flex flex-col gap-y-2.5 bottom-[88px] left-4 z-[1000]">
//         <div
//           onClick={handleNavigate}
//           className="bg-white hover:bg-gray-50 w-[131px] h-[56px] rounded-[59px] flex-center gap-2 shadow-icon cursor-pointer"
//         >
//           <RegisterAdIcon width="32px" height="32px" />
//           <span className="font-semibold text-[16px]">ثبت آگهی</span>
//         </div>
//       </div>

//       <Modal isShow={isShow} onClose={handleModalClose} effect="buttom-to-fit">
//         <Modal.Content
//           onClose={handleModalClose}
//           className="flex h-full flex-col gap-y-5 bg-white p-4 rounded-2xl rounded-b-none"
//         >
//           <Modal.Header right onClose={handleModalClose} />
//           <Modal.Body>
//             <div className="space-y-4">
//               <div className="flex flex-row-reverse items-center gap-2 w-full">
//                 <CustomCheckbox
//                   name={`satellite-view`}
//                   checked={isSatelliteView}
//                   onChange={() => setIsSatelliteView((prev) => !prev)}
//                   label=""
//                   customStyle="bg-sky-500"
//                 />
//                 <label htmlFor="satellite-view" className="flex items-center gap-2 w-full">
//                   <SatelliteIcon width="24px" height="24px" />
//                   نمای ماهواره ای
//                 </label>
//               </div>
//             </div>
//             <button onClick={handleApply} className="w-full py-2 bg-red-600 text-white rounded-lg">
//               اعمال
//             </button>
//           </Modal.Body>
//         </Modal.Content>
//       </Modal>
//       <MapContainer
//         center={getCenterOfData(housingData)}
//         zoom={12}
//         style={mapStyle}
//         ref={mapRef}
//         dragging={!isDrawingMode} // غیرفعال کردن جابجایی نقشه در حالت رسم
//       >
//         <MapDrawingHandler
//           isDrawingMode={isDrawingMode}
//           setPolygonPoints={setPolygonPoints}
//           polygonPoints={polygonPoints}
//         />
//         <ZoomHandler setZoomLevel={setZoomLevel} />
//         <TileLayer
//           url={tileLayerUrl}
//           attribution={
//             tileLayerUrl.includes('arcgisonline')
//               ? '&copy; <a href="https://www.esri.com/en-us/home">ESRI</a> contributors'
//               : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//           }
//         />

//         {housingData.map((property) => (
//           <Marker
//             key={property.id}
//             position={[property.location.lat, property.location.lng]}
//             icon={createIconWithPrice(
//               formatPrice(property.sellingPrice),
//               formatPrice(property.rent),
//               formatPrice(property.deposit),
//               property.created,
//               zoomLevel
//             )}
//             title={property.title}
//           />
//         ))}

//         {polygonPoints.length > 0 && (
//           <Polygon
//             positions={polygonPoints}
//             pathOptions={{
//               color: 'blue',
//               fillColor: 'blue',
//               fillOpacity: 0,
//               weight: 2
//             }}
//           />
//         )}
//       </MapContainer>
//     </div>
//   )
// }

// export default LeafletMap

import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Polygon } from 'react-leaflet'
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
} from '@/icons'
import { useAppDispatch, useAppSelector, useDisclosure } from '@/hooks'
import { CustomCheckbox, Modal } from '../ui'
import { Housing } from '@/types'
import { useRouter } from 'next/router'
import * as turf from '@turf/turf'
import { setIsShowLogin } from '@/store'
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

const formatPrice = (price: number): string => {
  if (price >= 1_000_000_000) {
    return (price / 1_000_000_000).toFixed(3)
  } else if (price >= 1_000_000) {
    return (price / 1_000_000).toFixed(0)
  } else {
    return price.toString()
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
  zoom: number
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
      <div className="w-fit relative">
        <div
          style={{
            backgroundColor: 'white',
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
            marginBottom: '-22px',
            zIndex: 10,
          }}
        >
          <div className="flex items-center gap-1">
            {isNew && <ArrowDownTickIcon width="6px" height="8px" />}
            {price > '0' ? (
              <span className="font-extrabold text-xs text-[#1A1E25] farsi-digits">{price}</span>
            ) : (
              <div className="flex-center gap-x-1">
                <div className="flex-center gap-x-0.5">
                  <span className="font-extrabold text-xs text-[#1A1E25] farsi-digits">{deposit}</span>
                  <span className="text-[8px] font-normal">رهن</span>
                </div>
                <div className="flex-center gap-x-0.5">
                  <span className="font-extrabold text-xs text-[#1A1E25] farsi-digits">{rent}</span>
                  <span className="text-[8px] font-normal">اجاره</span>
                </div>
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
          top: '-8.2px',
        }}
      >
        <HomeIcon width="16px" height="16px" />
      </div>
    )
  )
  return L.divIcon({ html, className: 'custom-icon', iconSize: [50, 50] })
}
const ZoomHandler: React.FC<{ setZoomLevel: (zoom: number) => void }> = ({ setZoomLevel }) => {
  useMapEvents({
    zoomend: (e) => {
      const map = e.target
      setZoomLevel(map.getZoom())
    },
  })

  return null
}

const DrawingControl = ({ isDrawing, drawnPoints, setDrawnPoints, polylineRef, housingData }) => {
  const map = useMap();
  const overlayRef = useRef(null);
  const isMouseDownRef = useRef(false);
  const drawingTimeoutRef = useRef(null);

  const countItemsInArea = useCallback((points) => {
    if (points.length < 3) return;

    const polygon = turf.polygon([points]);
    const itemsInArea = housingData.filter((property) => {
      const point = turf.point([property.location.lat, property.location.lng]);
      return turf.booleanPointInPolygon(point, polygon);
    });

    console.log('Items in area:', itemsInArea.length, itemsInArea);
  }, [housingData]);

  const updateOverlay = useCallback((points) => {
    if (!points.length) return;

    if (overlayRef.current) {
      overlayRef.current.remove();
    }

    // Performance optimization: Only create overlay if we have enough points
    if (points.length < 3) return;

    const bounds = map.getBounds();
    const outerCoords = [
      [bounds.getNorth(), bounds.getWest()],
      [bounds.getNorth(), bounds.getEast()],
      [bounds.getSouth(), bounds.getEast()],
      [bounds.getSouth(), bounds.getWest()],
      [bounds.getNorth(), bounds.getWest()] // Close the outer polygon
    ];

    const overlay = L.polygon([outerCoords, points], {
      color: 'none',
      fillColor: '#1A1E2566',
      fillOpacity: 0.45,
      interactive: false // Improves performance by preventing mouse events
    }).addTo(map);

    overlayRef.current = overlay;
  }, [map]);

  const updatePolyline = useCallback((points) => {
    if (polylineRef.current) {
      polylineRef.current.remove();
    }

    const polyline = L.polyline(points, {
      color: '#FFFFFF', // مشابه رنگ blue-600 در Tailwind
      weight: 4,
      smoothFactor: 1,
      interactive: false
    }).addTo(map);

    polylineRef.current = polyline;
  }, [map]);

  // Throttled update function for better performance
  const throttledUpdate = useCallback(
    throttle((points) => {
      updatePolyline(points);
      updateOverlay(points);
    }, 16), // ~60fps
    [updatePolyline, updateOverlay]
  );

  useMapEvents({
    mousedown: (e) => {
      if (!isDrawing) return;
      isMouseDownRef.current = true;
      const newPoint = [e.latlng.lat, e.latlng.lng];
      setDrawnPoints([newPoint]);
    },

    mousemove: (e) => {
      if (!isDrawing || !isMouseDownRef.current) return;

      setDrawnPoints(prev => {
        const newPoint = [e.latlng.lat, e.latlng.lng];
        const newPoints = [...prev, newPoint];
        
        // Clear existing timeout
        if (drawingTimeoutRef.current) {
          cancelAnimationFrame(drawingTimeoutRef.current);
        }

        // Schedule update on next animation frame
        drawingTimeoutRef.current = requestAnimationFrame(() => {
          throttledUpdate(newPoints);
        });

        return newPoints;
      });
    },

    mouseup: () => {
      if (!isMouseDownRef.current) return;
      
      isMouseDownRef.current = false;
      setDrawnPoints(prev => {
        if (prev.length > 0) {
          const closedPoints = [...prev, prev[0]];
          updateOverlay(closedPoints);
          countItemsInArea(closedPoints);
          return closedPoints;
        }
        return prev;
      });
    }
  });

  // Cleanup
  useEffect(() => {
    return () => {
      if (overlayRef.current) {
        overlayRef.current.remove();
      }
      if (polylineRef.current) {
        polylineRef.current.remove();
      }
      if (drawingTimeoutRef.current) {
        cancelAnimationFrame(drawingTimeoutRef.current);
      }
    };
  }, []);

  // Toggle map interactions
  useEffect(() => {
    const controls = [
      map.dragging,
      map.touchZoom,
      map.doubleClickZoom,
      map.scrollWheelZoom,
      map.boxZoom,
      map.keyboard,
      map.tapHold
    ].filter(Boolean);

    controls.forEach(control => {
      isDrawing ? control.disable() : control.enable();
    });
  }, [isDrawing, map]);

  return null;
};

// Utility function for throttling
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

const LeafletMap: React.FC<Props> = ({ housingData }) => {
  // ? Assets
  const { query, push } = useRouter()
  const { role } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  // ? States
  const [isShow, modalHandlers] = useDisclosure()
  const [isSatelliteView, setIsSatelliteView] = useState(false)
  const [tileLayerUrl, setTileLayerUrl] = useState('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
  const [zoomLevel, setZoomLevel] = useState(12)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawnPoints, setDrawnPoints] = useState([])
  const [selectedArea, setSelectedArea] = useState(null)
  const mapRef = useRef(null)
  const polylineRef = useRef(null)

  const mapStyle = {
    width: '100%',
    height: '100%',
    cursor: isDrawing ? 'crosshair' : 'grab',
  }

  const handleDrawButtonClick = () => {
    setIsDrawing(!isDrawing)
    if (!isDrawing) {
      setDrawnPoints([])
      setSelectedArea(null)
      if (polylineRef.current) {
        polylineRef.current.remove()
      }
    }
  }

  const completeDrawing = () => {
    if (drawnPoints.length < 3) {
      alert('لطفا حداقل سه نقطه را انتخاب کنید')
      return
    }

    const polygon = turf.polygon([[...drawnPoints, drawnPoints[0]]])
    setSelectedArea(polygon)
    setIsDrawing(false)

    // نمایش محدوده انتخاب شده
    if (polylineRef.current) {
      polylineRef.current.remove()
    }

    const closedPolygon = L.polygon(drawnPoints, { color: 'red' })
    closedPolygon.addTo(mapRef.current.getMap())
    polylineRef.current = closedPolygon

    // شمارش آیتم‌های داخل محدوده
    const itemsInArea = housingData.filter((property) => {
      const point = turf.point([property.location.lat, property.location.lng])
      return turf.booleanPointInPolygon(point, polygon)
    })

    alert(`تعداد آیتم‌های داخل محدوده: ${itemsInArea.length}`)
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
    if (role === "User") {
      dispatch(setIsShowLogin(true))
    }
    else if (logged === 'true') {
      push('/housing/ad')
    } else {
      push({
        pathname: '/authentication/login',
        query: { redirectTo: '/housing/ad' },
      })
    }
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
        <button className="bg-white w-[48px] h-[48px] rounded-lg flex-center shadow-icon">
          <SendIcon width="26px" height="26px" />
        </button>
        <button
          className={`${isDrawing ? 'bg-[#1A1E25]' : 'bg-white'} w-[48px] h-[48px] rounded-lg flex-center shadow-icon ${
            isDrawing ? 'bg-blue-500' : ''
          }`}
          onClick={handleDrawButtonClick}
        >
          {isDrawing ? <Close className="text-[28px] text-white" /> : <FingerIcon width="26px" height="29px" />}
        </button>
      </div>

      <div className="absolute flex flex-col gap-y-2.5 bottom-[88px] left-4 z-[1000]">
        <div
          onClick={handleNavigate}
          className="bg-white hover:bg-gray-50 w-[131px] h-[56px] rounded-[59px] flex-center gap-2 shadow-icon cursor-pointer"
        >
          <RegisterAdIcon width="32px" height="32px" />
          <span className="font-semibold text-[16px]">ثبت آگهی</span>
        </div>
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

        {housingData.map((property) => (
          <Marker
            key={property.id}
            position={[property.location.lat, property.location.lng]}
            icon={createIconWithPrice(
              formatPrice(property.sellingPrice),
              formatPrice(property.rent),
              formatPrice(property.deposit),
              property.created,
              zoomLevel
            )}
            title={property.title}
          />
        ))}
      </MapContainer>
    </div>
  )
}

export default LeafletMap
