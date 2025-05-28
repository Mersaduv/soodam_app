import { ClientLayout } from '@/components/layouts'
import { HousingSkeleton } from '@/components/skeleton'
import { Button, InlineLoading, LoadingScreen } from '@/components/ui'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { ArchiveTickIcon, CircleMdIcon, LocationSmIcon, TrashGrayIcon } from '@/icons'
import { useGetHousingQuery } from '@/services'
import { useGetMyAdvQuery } from '@/services/productionBaseApi'
import { setIsSuccess } from '@/store'
import { Housing } from '@/types'
import { formatPriceLoc, getProvinceFromCoordinates } from '@/utils'
import { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const MyAds: NextPage = () => {
  // ? Assets
  const { query, push } = useRouter()
  const { isSuccess } = useAppSelector((state) => state.statesData)
  const dispatch = useAppDispatch()
  const { data: housingData, isLoading } = useGetMyAdvQuery()
  // const [housingAdd, setHousingAdd] = useState<Housing[]>([])

  // useEffect(() => {
  //   const storedHousingAdd = localStorage.getItem('addAdv')
  //   setHousingAdd(storedHousingAdd ? JSON.parse(storedHousingAdd) : [])
  // }, [])

  useEffect(() => {
    if (isSuccess) {
      dispatch(setIsSuccess(false))
    }
  }, [isSuccess, dispatch])

  const handleClearAds = () => {
    localStorage.removeItem('addAdv')
    // setHousingAdd([])
  }

  const role = localStorage.getItem('role') ? localStorage.getItem('role')! : null

  return (
    <>
      <ClientLayout title="آگهی های من">
        <main className="py-[87px] relative">
          {isLoading ? (
            <div className="flex justify-center items-center ">
              <HousingSkeleton />
            </div>
          ) : housingData && housingData.items.length == 0 ? (
            <div className="bg-white mx-4 border rounded-2xl border-[#E3E3E7] ">
              <div className="flex justify-center mt-8">
                <img className="w-[180px] h-[180px]" src="/static/Document_empty.png" alt="" />
              </div>
              <div className="mt-8 flex flex-col justify-center items-center gap-2">
                <h1 className="font-medium text-sm">شما تاکنون آگهی ثبت نکرده اید.</h1>
              </div>
              <div className="mx-4 mt-8 mb-7 flex gap-3">
                <Button onClick={() => push('/housing/ad')} className="w-full rounded-[10px] font-bold text-sm">
                  ثبت آگهی
                </Button>
              </div>
            </div>
          ) : (
            <div className=" px-4">
              <div
                onClick={handleClearAds}
                className="flex -mt-1.5 items-center h-[33px] mb-2 cursor-pointer w-fit relative overflow-hidden px-2 rounded-full"
              >
                <TrashGrayIcon width="20px" height="21px" />
                <div className="text-[#1A1E25] border-[#7A7A7A] mr-1 pr-1.5 font-normal text-sm">
                  پاک کردن همه آگهی‌ها
                </div>
                <span className="absolute inset-0 bg-gray-300 opacity-0 transition-opacity duration-500 hover:opacity-30"></span>
              </div>
              <div className="space-y-4">
                {housingData &&
                  housingData?.items.length > 0 &&
                  [...housingData?.items]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((housing) => {
                      return (
                        <div
                          key={housing.id}
                          className="bg-white rounded-lg p-4 shadow w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex flex-col">
                            <Link href={`/housing/${housing.id}`} className="flex gap-2">
                              {housing.primary_image ? (
                                <div className=" bg-gray-200 rounded-[10px] mb-4">
                                  <Image
                                    width={104}
                                    height={100}
                                    className="rounded-[10px] h-[104px] object-cover"
                                    src={`${process.env.NEXT_PUBLIC_API_URL}${
                                      housing.primary_image.startsWith('/')
                                        ? housing.primary_image
                                        : `/${housing.primary_image}`
                                    }`}
                                    alt={housing.title}
                                  />
                                </div>
                              ) : (
                                <div className=" bg-gray-200 rounded-[10px] mb-4">
                                  <img
                                    width={104}
                                    height={100}
                                    className="rounded-[10px] h-[104px] object-cover"
                                    src="/static/R.png"
                                    alt={housing.title}
                                  />
                                </div>
                              )}
                              <div className="flex-1 flex flex-col">
                                <div className="flex items-center gap-1.5">
                                  <LocationSmIcon width="16px" height="16px" />
                                  <div className="text-xs font-normal">
                                    {housing.full_address && housing.full_address.province
                                      ? typeof housing.full_address.province === 'object' &&
                                        housing.full_address.province !== null
                                        ? (housing.full_address.province as { name: string }).name
                                        : String(housing.full_address.province)
                                      : 'نامشخص'}
                                  </div>
                                </div>

                                <div className="line-clamp-1 overflow-hidden text-ellipsis text-base font-normal mt-1">
                                  {housing.title}
                                </div>
                                <div className="mt-2 space-y-2">
                                  {/* نمایش قیمت */}
                                  {housing.price && (
                                    <>
                                      {housing.price.deposit > 0 && (
                                        <div className="text-xs flex gap-1 text-[#5A5A5A] font-normal">
                                          رهن:{' '}
                                          <div className="font-normal">
                                            {formatPriceLoc(Number(housing.price.deposit))}
                                          </div>
                                        </div>
                                      )}
                                      {housing.price.rent > 0 && (
                                        <div className="text-xs flex gap-1 text-[#5A5A5A] font-normal">
                                          اجاره:{' '}
                                          <div className="font-normal">
                                            {formatPriceLoc(Number(housing.price.rent))}
                                          </div>
                                        </div>
                                      )}
                                      {housing.price.amount > 0 && (
                                        <div className="text-xs flex gap-1 text-[#5A5A5A] font-normal">
                                          قیمت فروش:{' '}
                                          <div className="font-normal">
                                            {formatPriceLoc(Number(housing.price.amount))}
                                          </div>
                                        </div>
                                      )}
                                      {housing.price.discount_amount > 0 && (
                                        <div className="text-xs flex gap-1 text-[#5A5A5A] font-normal">
                                          تخفیف:{' '}
                                          <div className="font-normal">
                                            {formatPriceLoc(Number(housing.price.discount_amount))}
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  )}

                                  {/* نمایش درصد سود مالک و سازنده */}
                                  {housing.attributes &&
                                    housing.attributes
                                      .filter(
                                        (item) =>
                                          item.key === 'text_owner_profit_percentage' ||
                                          item.key === 'text_producer_profit_percentage'
                                      )
                                      .map((item) => {
                                        return (
                                          <div key={item.key} className="text-[13px] space-y-1">
                                            {item.key === 'text_owner_profit_percentage' && (
                                              <p className="text-[#5A5A5A]">سود مالک: {item.value as string}%</p>
                                            )}
                                            {item.key === 'text_producer_profit_percentage' && (
                                              <p className="text-[#5A5A5A]">سود سازنده: {item.value as string}%</p>
                                            )}
                                          </div>
                                        )
                                      })}
                                </div>
                              </div>
                            </Link>

                            {/* Property Details */}
                            <div className="w-full text-right text-[#7A7A7A] text-sm flex justify-start gap-6">
                              {/* {housing.highlight_features &&
                              housing.highlight_features.map((feature) => {
                                return (
                                  <div key={feature.id} className="flex-center gap-0.5 text-xs font-medium farsi-digits whitespace-nowrap">
                                    {' '}
                                    <img className="w-[16px]" src={feature.image} alt="" /> {feature.value as string}{' '}
                                    <span className="font-medium text-[#7A7A7A] text-xs">{feature.name}</span>
                                  </div>
                                )
                              })} */}
                              {/* org  */}
                              <div className="flex gap-0.5 font-medium farsi-digits whitespace-nowrap ont-bold text-[#7A7A7A] text-xs">
                                {' '}
                                <img className="w-[16px]" src={`/static/grid-222.png`} alt="" />
                                <div className="font-bold text-[#7A7A7A] text-xs text-ellipsis overflow-hidden whitespace-nowrap">
                                  بزودی قابل نمایش میشود
                                </div>
                              </div>
                              <div className="flex gap-0.5 font-medium farsi-digits whitespace-nowrap ont-bold text-[#7A7A7A] text-xs">
                                {' '}
                                <img className="w-[16px]" src={`/static/grid-222.png`} alt="" />
                                <div className="font-bold text-[#7A7A7A] text-xs">بزودی</div>
                              </div>
                              <div className="flex gap-0.5 font-medium farsi-digits whitespace-nowrap ont-bold text-[#7A7A7A] text-xs">
                                {' '}
                                <img className="w-[16px]" src={`/static/grid-222.png`} alt="" />
                                <div className="font-bold text-[#7A7A7A] text-xs">بزودی</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
              </div>
            </div>
          )}
        </main>
      </ClientLayout>
    </>
  )
}

export default MyAds
