import { EmptyCustomList } from '@/components/emptyList'
import { HousingCard } from '@/components/housing'
import { ClientLayout } from '@/components/layouts'
import { DataStateDisplay } from '@/components/shared'
import { HousingSkeleton } from '@/components/skeleton'
import { useAppSelector } from '@/hooks'
import { ArchiveTickIcon } from '@/icons'
import { useGetHousingQuery } from '@/services'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
const LeafletMap = dynamic(() => import('@/components/map/Map'), { ssr: false })
export default function Home() {
  // ? Assets
  const { query, events } = useRouter()
  const type = query?.type?.toString() ?? ''
  const role = query?.role?.toString() ?? ''
  const { data: housingData, isFetching, ...housingQueryProps } = useGetHousingQuery({ ...query, type })

  const map = useAppSelector((state) => state.map)

  useEffect(() => {
    if (role) {
      localStorage.setItem('role', role);
    }
  }, [role]);
  

  if (isFetching) return <div>loading....</div>

  return (
    <ClientLayout>
      <main className="h-full">
        {map.mode ? (
          <div className="h-full" style={{ width: '100%' }}>
            <LeafletMap housingData={housingData.data} />
          </div>
        ) : (
          <div className="pt-[147px] pb-36 px-4">
            <div className="flex items-center mb-6">
              <ArchiveTickIcon />
              <div className="border-r-[1.5px] text-[#1A1E25] border-[#7A7A7A] mr-1 pr-1.5 font-normal text-sm">
                {housingData.data.length} مورد پیدا شد
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
                    <HousingCard housing={item} key={item.id} />
                  ))}
                </section>
              )}
            </DataStateDisplay>
          </div>
        )}
      </main>
    </ClientLayout>
  )
}
