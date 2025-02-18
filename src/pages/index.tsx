import { EmptyCustomList } from '@/components/emptyList'
import { HousingCard } from '@/components/housing'
import { ClientLayout } from '@/components/layouts'
import { DataStateDisplay } from '@/components/shared'
import { HousingSkeleton } from '@/components/skeleton'
import { useAppSelector } from '@/hooks'
import { ArchiveTickIcon } from '@/icons'
import { useGetHousingQuery } from '@/services'
import { Housing } from '@/types'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
const LeafletMap = dynamic(() => import('@/components/map/Map'), { ssr: false })
export default function Home() {
  // ? Assets
  const { query, events } = useRouter()
  const [housingState, setHousingState] = useState<Housing[]>()
  const type = query?.type?.toString() ?? ''
  const role = query?.role?.toString() ?? ''
  const map = useAppSelector((state) => state.map)
  const { housingMap } = useAppSelector((state) => state.statesData)
  // const handleBoundsChanged = useCallback((newBounds) => {
  //   setBounds((prevBounds) => {
  //     if (prevBounds && prevBounds.equals(newBounds)) {
  //       return prevBounds;
  //     }
  //     return newBounds;
  //   });
  // }, []);
  const [bounds, setBounds] = useState(null);
  const handleBoundsChanged = useCallback((newBounds) => {
    setBounds(newBounds);
  }, []);
  const { data: housingData, isFetching } = useGetHousingQuery({
    ...query,
    type,
    swLat: bounds ? bounds.getSouthWest().lat : undefined,
    swLng: bounds ? bounds.getSouthWest().lng : undefined,
    neLat: bounds ? bounds.getNorthEast().lat : undefined,
    neLng: bounds ? bounds.getNorthEast().lng : undefined,
  });
  useEffect(() => {
    if (role) {
      localStorage.setItem('role', role)
    }
  }, [role])

  const housingList = housingData?.data || [];
  if (isFetching) return <div>loading....</div>

  return (
    <ClientLayout>
      <main className="h-full">
        <div className={`h-full ${!map.mode && 'hidden'}`} style={{ width: '100%' }}>
        <LeafletMap housingData={housingList} onBoundsChanged={handleBoundsChanged} />
        </div>
        <div className={`pt-[147px] pb-36 px-4 ${map.mode && 'hidden'} ${housingMap.length > 0 && 'hidden'}`}>
          <div className="flex items-center mb-6">
            <ArchiveTickIcon />
            <div className="border-r-[1.5px] text-[#1A1E25] border-[#7A7A7A] mr-1 pr-1.5 font-normal text-sm">
              {housingData.data.length} مورد پیدا شد
            </div>
          </div>
          {/* <DataStateDisplay
            {...housingQueryProps}
            isFetching={isFetching}
            dataLength={housingData?.data ? housingData.data.length : 0}
            loadingComponent={<HousingSkeleton />}
            emptyComponent={<EmptyCustomList />}
          >
            {housingData && housingData.data.length > 0 && (
              <section className="flex flex-wrap justify-center gap-3">
                {housingData.data.map((item) => (
                  <HousingCard housing={item} key={item.id} />
                ))}
              </section>
            )}
          </DataStateDisplay> */}
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
                <HousingCard housing={item} key={item.id} />
              ))}
            </section>
          )}
        </div>
      </main>
    </ClientLayout>
  )
}
