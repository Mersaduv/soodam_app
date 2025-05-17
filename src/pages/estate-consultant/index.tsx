import { EmptyCustomList } from '@/components/emptyList'
import { EstateCard } from '@/components/estate'
import { HousingCard } from '@/components/housing'
import { ClientLayout } from '@/components/layouts'
import { DataStateDisplay } from '@/components/shared'
import { HousingSkeleton } from '@/components/skeleton'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { ArchiveTickIcon } from '@/icons'
import { useGetEstatesQuery, useGetHousingQuery } from '@/services'
import { setRefetchMap } from '@/store'
import { Estate, Housing } from '@/types'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
const LeafletMap = dynamic(() => import('@/components/map/EstateMap'), { ssr: false })
export default function EstateConsultant() {
  // ? Assets
  const router = useRouter()
  const { query, events, replace, asPath } = router
  const [estateState, setEstateState] = useState<Estate[]>()
  const [bounds, setBounds] = useState(null)

  const type = query?.type?.toString() ?? ''
  const role = query?.role?.toString() ?? ''
  const map = useAppSelector((state) => state.map)
  const dispatch = useAppDispatch()
  const zoom = useAppSelector((state) => state.statesData.zoom)
  const shouldFetch = bounds && zoom >= 11
  const { estateMap, refetchMap } = useAppSelector((state) => state.statesData)
  // dispatch(setRefetchMap(false))
  const leafletMapRef = useRef<any>(null)

  const {
    data: estateData,
    isFetching,
    ...estateQueryProps
  } = useGetEstatesQuery(
    {
      ...query,
      type,
      status: 2,
      swLat: bounds ? bounds.getSouthWest().lat : undefined,
      swLng: bounds ? bounds.getSouthWest().lng : undefined,
      neLat: bounds ? bounds.getNorthEast().lat : undefined,
      neLng: bounds ? bounds.getNorthEast().lng : undefined,
    },
    { skip: !shouldFetch }
  )
  useEffect(() => {
    const storedBounds = localStorage.getItem('storedBounds')
    if (storedBounds && !bounds) {
      const parsedBounds = JSON.parse(storedBounds)
      if (typeof window !== 'undefined') {
        const L = require('leaflet')
        const newBounds = L.latLngBounds(
          [parsedBounds.swLat, parsedBounds.swLng],
          [parsedBounds.neLat, parsedBounds.neLng]
        )
        setBounds(newBounds)
      }
    }
  }, [])

  const handleBoundsChanged = useCallback((newBounds) => {
    setBounds((prevBounds) => {
      if (prevBounds && prevBounds.equals(newBounds)) {
        return prevBounds
      }
      return newBounds
    })
  }, [])
  useEffect(() => {
    if (role) {
      localStorage.setItem('role', role)
    }
  }, [role])
  useEffect(() => {
    if (map.mode && leafletMapRef.current) {
      leafletMapRef.current.invalidateSize()
    }
  }, [map.mode])
  const handleEstateCardClick = (estate: Estate) => {
    if (bounds) {
      if (typeof window !== 'undefined') {
        const L = require('leaflet')
        localStorage.setItem(
          'storedBounds',
          JSON.stringify({
            neLat: bounds.getNorthEast().lat,
            neLng: bounds.getNorthEast().lng,
            swLat: bounds.getSouthWest().lat,
            swLng: bounds.getSouthWest().lng,
          })
        )
      }
      router.push(`/estate-consultant/${estate.id}?estateName=${estate.name}`)
    }
  }

  const estateList = estateData?.data || []

  return (
    <ClientLayout title='لیست مشاورین املاک' canFilter>
      <main className="h-full">
        <div className={`h-full ${!map.mode && 'hidden'}`} style={{ width: '100%' }}>
          {map.mode && (
            <LeafletMap
              key={`leaflet-map-${map.mode}`}
              estateData={estateList}
              onBoundsChanged={handleBoundsChanged}
            />
          )}
        </div>

        <div className={`pt-[210px] pb-36 px-4 ${map.mode && 'hidden'} ${estateMap.length > 0 && 'hidden'}`}>
          <div className="flex items-center mb-6">
            <ArchiveTickIcon />
            <div className="border-r-[1.5px] text-[#1A1E25] border-[#7A7A7A] mr-1 pr-1.5 font-normal text-sm">
              {estateList.length} مورد پیدا شد
            </div>
          </div>
          <DataStateDisplay
            {...estateQueryProps}
            isFetching={isFetching}
            dataLength={estateData?.data ? estateData.data.length : 0}
            loadingComponent={<HousingSkeleton />}
            emptyComponent={<EmptyCustomList />}
          >
            {estateData && estateData.data.length > 0 && (
              <section className="flex flex-wrap justify-center gap-3">
                {estateData.data.map((item) => (
                  <EstateCard estate={item} key={item.id} onCardClick={handleEstateCardClick} />
                ))}
              </section>
            )}
          </DataStateDisplay>
        </div>

        <div className={`pt-[210px] pb-36 px-4 ${map.mode && 'hidden'} ${estateMap.length === 0 && 'hidden'}`}>
          <div className="flex items-center mb-6">
            <ArchiveTickIcon />
            <div className="border-r-[1.5px] text-[#1A1E25] border-[#7A7A7A] mr-1 pr-1.5 font-normal text-sm">
              {estateMap.length} مورد پیدا شد
            </div>
          </div>

          {estateMap && (
            <section className="flex flex-wrap justify-center gap-3">
              {estateMap.map((item) => (
                <EstateCard estate={item} key={item.id} onCardClick={handleEstateCardClick} />
              ))}
            </section>
          )}
        </div>
      </main>
    </ClientLayout>
  )
}
