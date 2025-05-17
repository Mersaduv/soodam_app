import { EmptyCustomList } from '@/components/emptyList'
import { HousingCard } from '@/components/housing'
import { ClientLayout } from '@/components/layouts'
import { DataStateDisplay } from '@/components/shared'
import { HousingSkeleton } from '@/components/skeleton'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { ArchiveTickIcon } from '@/icons'
import { useGetHousingQuery } from '@/services'
import { setRefetchMap } from '@/store'
import { Housing } from '@/types'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
const LeafletMap = dynamic(() => import('@/components/map/Map'), { ssr: false })
export default function Estate() {
  // ? Assets
  const router = useRouter()
  const { query, events, replace, asPath } = router
  const [housingState, setHousingState] = useState<Housing[]>()
  const [bounds, setBounds] = useState(null)
  const estateId = query?.id?.toString() ?? ''
  const estateName = query?.estateName?.toString() ?? ''
  const type = query?.type?.toString() ?? ''
  const role = query?.role?.toString() ?? ''
  const map = useAppSelector((state) => state.map)
  const dispatch = useAppDispatch()
  const zoom = useAppSelector((state) => state.statesData.zoom)
  const shouldFetch = bounds && zoom >= 11
  const { housingMap, refetchMap } = useAppSelector((state) => state.statesData)
  // dispatch(setRefetchMap(false))
  const leafletMapRef = useRef<any>(null)

  const {
    data: housingData,
    isFetching,
    ...housingQueryProps
  } = useGetHousingQuery(
    {
      ...query,
      type,
      status: 2,
      centerLat: bounds ? bounds.getCenter().lat : undefined,
      centerLng: bounds ? bounds.getCenter().lng : undefined,
    },
    { skip: !shouldFetch }
  )
  useEffect(() => {
    const storedCenter = localStorage.getItem('storedCenter')
    if (storedCenter && !bounds) {
      const parsedCenter = JSON.parse(storedCenter)
      if (typeof window !== 'undefined') {
        const L = require('leaflet')
        const center = L.latLng(parsedCenter.centerLat, parsedCenter.centerLng)
        // برای ایجاد یک bounds فرضی با ابعاد کوچک اطراف مرکز (مثلاً یک دایره کوچک 0.01 درجه‌ای)
        const offset = 0.01
        const newBounds = L.latLngBounds(
          [center.lat - offset, center.lng - offset],
          [center.lat + offset, center.lng + offset]
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
  const handleHousingCardClick = (housing: Housing) => {
    if (bounds) {
      if (typeof window !== 'undefined') {
        const center = bounds.getCenter()
        localStorage.setItem(
          'storedCenter',
          JSON.stringify({
            centerLat: center.lat,
            centerLng: center.lng,
          })  
        )
      }
      router.push(`/housing/${housing.id}`)
    }
  }

  const housingList = housingData?.data || []

  return (
    <ClientLayout title={`املاک ${estateName} - لیست فایل ها`} canFilter>
      <main className="h-full">
        <div className={`h-full ${!map.mode && 'hidden'}`} style={{ width: '100%' }}>
          {map.mode && (
            <LeafletMap
              key={`leaflet-map-${map.mode}`}
              housingData={housingList}
              onBoundsChanged={handleBoundsChanged}
            />
          )}
        </div>

        <div className={`pt-[200px] pb-36 px-4 ${map.mode && 'hidden'} ${housingMap.length > 0 && 'hidden'}`}>
          <div className="flex items-center mb-6">
            <ArchiveTickIcon />
            <div className="border-r-[1.5px] text-[#1A1E25] border-[#7A7A7A] mr-1 pr-1.5 font-normal text-sm">
              {housingList.length} مورد پیدا شد
            </div>
          </div>
          <DataStateDisplay
            {...housingQueryProps}
            isFetching={isFetching}
            dataLength={housingData?.data ? housingData.data.length : 0}
            loadingComponent={<HousingSkeleton />}
            emptyComponent={<EmptyCustomList />}
          >
            {housingData && housingData.data.length > 0 && (
              <section className="flex flex-wrap justify-center gap-3">
                {housingData.data.map((item) => (
                  <HousingCard housing={item} key={item.id} onCardClick={handleHousingCardClick} inEstate />
                ))}
              </section>
            )}
          </DataStateDisplay>
        </div>

        <div className={`pt-[200px] pb-36 px-4 ${map.mode && 'hidden'} ${housingMap.length === 0 && 'hidden'}`}>
          <div className="flex items-center mb-6">
            <ArchiveTickIcon />
            <div className="border-r-[1.5px] text-[#1A1E25] border-[#7A7A7A] mr-1 pr-1.5 font-normal text-sm">
              {housingMap.length} مورد پیدا شد
            </div>
          </div>

          {housingMap && (
            <section className="flex flex-wrap justify-center gap-3">
              {housingMap.map((item) => (
                <HousingCard housing={item} key={item.id} onCardClick={handleHousingCardClick} inEstate />
              ))}
            </section>
          )}
        </div>
      </main>
    </ClientLayout>
  )
}
