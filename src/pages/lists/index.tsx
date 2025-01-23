import Link from 'next/link'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ClientLayout } from '@/components/layouts'
import { useAppSelector } from '@/hooks'
import { Housing } from '@/types'
import { useEffect, useState } from 'react'
import { useGetHousingQuery } from '@/services'
import { ArchiveTickIcon } from '@/icons'
import { HousingCard } from '@/components/housing'
import { DataStateDisplay } from '@/components/shared'
import { HousingSkeleton } from '@/components/skeleton'
import { EmptyCustomList } from '@/components/emptyList'
const LeafletMap = dynamic(() => import('@/components/map/Map'), { ssr: false })
const Lists: NextPage = () => {
  // ? Assets
  const { savedHouses } = useAppSelector((state) => state.saveHouse)
  const { query, events } = useRouter()
  const map = useAppSelector((state) => state.map)
  const { housingMap } = useAppSelector((state) => state.statesData)
  const [saveHousingData, setSaveHousingData] = useState<Housing[]>([])

  const { housing: housingDataSaveHousing, isFetching: isFetching } = useGetHousingQuery(
    {
      pageSize: 9999, //
      isActive: true,
    },
    {
      selectFromResult: ({ data, isFetching }) => ({
        housing: data?.data,
        isFetching,
      }),
    }
  )

  useEffect(() => {
    if (housingDataSaveHousing) {
      const updated = housingDataSaveHousing
        .filter((housingItem) => savedHouses.some((savedItem) => savedItem.id === housingItem.id))
        .map((item) => {
          const savedItem = savedHouses.find((s) => s.id === item.id)
          return savedItem ? { ...item, created: savedItem.savedTime } : item
        })

      setSaveHousingData(updated)
    }
  }, [housingDataSaveHousing, savedHouses])
  if (savedHouses || saveHousingData) {
    console.log(savedHouses, 'savedHouses', saveHousingData, 'saveHousingData')
  }
  if (isFetching) return <div>loading...</div>
  // ? Render(s)
  return (
    <>
      <ClientLayout>
        <main className="">
          {saveHousingData && (
            <div className={`h-full ${!map.mode && 'hidden'}`} style={{ width: '100%' }}>
              <LeafletMap housingData={saveHousingData} />
            </div>
          )}

          <div className={`pt-[147px] pb-36 px-4 ${map.mode && 'hidden'} ${housingMap.length > 0 && 'hidden'}`}>
            <div className="flex items-center mb-6">
              <ArchiveTickIcon />
              <div className="border-r-[1.5px] text-[#1A1E25] border-[#7A7A7A] mr-1 pr-1.5 font-normal text-sm">
                {saveHousingData.length} مورد پیدا شد
              </div>
            </div>

            {saveHousingData && saveHousingData.length > 0 && (
              <section className="flex flex-wrap justify-center gap-3">
                {saveHousingData.map((item) => (
                  <HousingCard housing={item} key={item.id} />
                ))}
              </section>
            )}
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
    </>
  )
}

export default Lists
