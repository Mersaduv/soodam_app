import { EmptyCustomList } from '@/components/emptyList'
import { HousingCard } from '@/components/housing'
import { ClientLayout } from '@/components/layouts'
import { DataStateDisplay } from '@/components/shared'
import { HousingSkeleton } from '@/components/skeleton'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { ArchiveTickIcon } from '@/icons'
import { useGetHousingQuery } from '@/services'
import { useGetAdvByGeolocationQuery } from '@/services/productionBaseApi'
import { setIsVisible, setRefetchMap } from '@/store'
import { Housing, ServiceResponse } from '@/types'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
const LeafletMap = dynamic(() => import('@/components/map/Map'), { ssr: false })
export default function Home() {
  // ? Assets
  const router = useRouter()
  const { query, events, replace, asPath } = router
  const [housingState, setHousingState] = useState<Housing[]>()
  const [bounds, setBounds] = useState(null)
  const type = query?.type?.toString() ?? ''
  const role = query?.role?.toString() ?? ''
  const map = useAppSelector((state) => state.map)
  const dispatch = useAppDispatch()
  const zoom = useAppSelector((state) => state.statesData.zoom)
  const shouldFetch = bounds && zoom >= 11
  const { housingMap, refetchMap, isVisible } = useAppSelector((state) => state.statesData)
  // dispatch(setRefetchMap(false))
  const leafletMapRef = useRef<any>(null)

  const {
    data: housingData,
    isFetching,
    ...housingQueryProps
  } = useGetAdvByGeolocationQuery(
    {
      longitude: bounds ? bounds.getCenter().lng : undefined,
      latitude: bounds ? bounds.getCenter().lat : undefined,
      radius: 100.0,
      page: 1,
      limit: 10,
      // category_id: Number(query?.category_id) || undefined,
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

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    const role = localStorage.getItem('role')
    if (role === 'user' || !role) {
      dispatch(setIsVisible(true))
    }
    if (user && user.role === 'memberUser' && user.subscription == undefined) {
      dispatch(setIsVisible(true))
    }
    if (user && user.subscription && user.subscription.status !== 'ACTIVE') {
      dispatch(setIsVisible(true))
    }
    if (user && user.role === 'marketer' && user.subscription == undefined) {
      dispatch(setIsVisible(true))
    }
  }, [])
  const housingList = housingData?.items || []

  return (
    <ClientLayout>
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

        <div className={` ${isVisible ? "pt-[187px]": "pt-[147px]"} pb-36 px-4 ${map.mode && 'hidden'} ${housingMap.length > 0 && 'hidden'}`}>
          <div className="flex items-center mb-6">
            <ArchiveTickIcon />
            <div className="border-r-[1.5px] text-[#1A1E25] border-[#7A7A7A] mr-1 pr-1.5 font-normal text-sm">
              {housingList.length} مورد پیدا شد
            </div>
          </div>
          <DataStateDisplay
            {...housingQueryProps}
            isFetching={isFetching}
            dataLength={housingData?.items?.length ? housingData.items.length : 0}
            loadingComponent={<HousingSkeleton />}
            emptyComponent={<EmptyCustomList />}
          >
            {housingData?.items && housingData.items.length > 0 && (
              <section className="flex flex-wrap justify-center gap-3">
                {housingData.items.map((item) => (
                  <HousingCard housing={item} key={item.id} onCardClick={handleHousingCardClick} />
                ))}
              </section>
            )}
          </DataStateDisplay>
        </div>

        <div className={`pt-[147px] pb-36 px-4 ${map.mode && 'hidden'} ${housingMap.length === 0 && 'hidden'}`}>
          <div className="flex items-center mb-6">
            <ArchiveTickIcon />
            <div className="border-r-[1.5px] text-[#1A1E25] border-[#7A7A7A] mr-1 pr-1.5 font-normal text-sm">
              {housingMap.length} مورد پیدا شد
            </div>
          </div>

          {housingMap && (
            <section className="flex flex-wrap justify-center gap-3">
              {housingMap.map((item) => (
                <HousingCard housing={item} key={item.id} onCardClick={handleHousingCardClick} />
              ))}
            </section>
          )}
        </div>
      </main>
    </ClientLayout>
  )
}
