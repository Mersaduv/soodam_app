import Link from 'next/link'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ClientLayout } from '@/components/layouts'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { Housing } from '@/types'
import { useEffect, useState } from 'react'
import { useGetHousingQuery } from '@/services'
import { ArchiveTickIcon, TrashGrayIcon } from '@/icons'
import { HousingCard } from '@/components/housing'
import { DataStateDisplay } from '@/components/shared'
import { HousingSkeleton } from '@/components/skeleton'
import { EmptyCustomList } from '@/components/emptyList'
import { Button } from '@/components/ui'
import { clearSavedHouses, setMapMode } from '@/store'
const LeafletMap = dynamic(() => import('@/components/map/Map'), { ssr: false })
const Lists: NextPage = () => {
  // ? Assets
  const { savedHouses } = useAppSelector((state) => state.saveHouse)
  const { query, events, push } = useRouter()
  const map = useAppSelector((state) => state.map)
  const { housingMap } = useAppSelector((state) => state.statesData)
  const [saveHousingData, setSaveHousingData] = useState<Housing[]>([])
  const dispatch = useAppDispatch()
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
  const handleClearSavedHouses = () => {
    localStorage.removeItem('savedHouses')
    setSaveHousingData([])
    dispatch(clearSavedHouses())
  }
  if (savedHouses || saveHousingData) {
    console.log(savedHouses, 'savedHouses', saveHousingData, 'saveHousingData')
  }
  if (isFetching) return <div>loading...</div>
  // ? Render(s)
  return (
    <>
      <ClientLayout title={`${saveHousingData.length > 0 ? '' : 'آگهی های مورد علاقه'}`}>
        {saveHousingData.length > 0 ? (
          <main className="">
            {saveHousingData && saveHousingData.length > 0 && (
              <div className={`h-full ${!map.mode && 'hidden'}`} style={{ width: '100%' }}>
                <LeafletMap housingData={saveHousingData} />
              </div>
            )}

            <div className={`pt-[147px] pb-36 px-4 ${map.mode && 'hidden'} ${housingMap.length > 0 && 'hidden'}`}>
              <div
                onClick={handleClearSavedHouses}
                className="flex -mt-1.5 items-center h-[33px] mb-2 cursor-pointer w-fit relative overflow-hidden px-2 rounded-full"
              >
                <TrashGrayIcon width="20px" height="21px" />
                <div className="text-[#1A1E25] border-[#7A7A7A] mr-1 pr-1.5 font-normal text-sm">
                  پاک کردن همه آگهی‌های مورد علاقه
                </div>
                <span className="absolute inset-0 bg-gray-300 opacity-0 transition-opacity duration-500 hover:opacity-30"></span>
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
        ) : (
          <main className="pt-[87px] relative">
            <div className="bg-white mx-4 border rounded-2xl border-[#E3E3E7] ">
              <div className="flex justify-center mt-8">
                <img className="w-[180px] h-[180px]" src="/static/Document_empty.png" alt="" />
              </div>
              <div className="mt-8 flex flex-col justify-center items-center gap-2">
                <h1 className="font-medium text-sm">شما تاکنون آگهی ذخیره نکرده اید..</h1>
              </div>
              <div className="mx-4 mt-8 mb-7 flex gap-3">
                <Button
                  onClick={() => {
                    push('/')
                    dispatch(setMapMode(true))
                  }}
                  className="w-full rounded-[10px] font-bold text-sm"
                >
                  دیدن آگهی ها
                </Button>
              </div>
            </div>
          </main>
        )}
      </ClientLayout>
    </>
  )
}

export default Lists
