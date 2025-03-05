import { ClientLayout } from '@/components/layouts'
import { Button } from '@/components/ui'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { ArchiveTickIcon, CircleMdIcon, LocationSmIcon, TrashGrayIcon } from '@/icons'
import { useGetHousingQuery } from '@/services'
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
  const { data: housingData } = useGetHousingQuery({
    status: 1,
  })
  const [housingAdd, setHousingAdd] = useState<Housing[]>([])

  useEffect(() => {
    const storedHousingAdd = localStorage.getItem('addAdv')
    setHousingAdd(storedHousingAdd ? JSON.parse(storedHousingAdd) : [])
  }, [])

  useEffect(() => {
    if (isSuccess) {
      dispatch(setIsSuccess(false))
    }
  }, [isSuccess, dispatch])

  const handleClearAds = () => {
    localStorage.removeItem('addAdv')
    setHousingAdd([])
  }

  const role = localStorage.getItem('role') ? localStorage.getItem('role')! : null
  return (
    <>
      <ClientLayout title="آگهی های من">
        <main className="pt-[87px] relative">
          {housingAdd.length == 0 ? (
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
              {housingAdd.map((housing) => {
                const province = getProvinceFromCoordinates(housing.location.lat, housing.location.lng)
                return (
                  <div
                    key={housing.id}
                    className="bg-white rounded-lg p-4 shadow-lg w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-col">
                      <Link href={`/housing/${housing.adCode}`} className="flex gap-2">
                        {housing.images.length > 0 && (
                          <div className=" bg-gray-200 rounded-[10px] mb-4">
                            <Image
                              width={104}
                              height={100}
                              className="rounded-[10px] h-[104px] object-cover"
                              src={housing.images[1]}
                              alt={housing.title}
                            />
                          </div>
                        )}
                        <div className="flex-1 flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <LocationSmIcon width="16px" height="16px" />
                            <div className="text-xs font-normal">{province}</div>
                          </div>

                          <div className="line-clamp-1 overflow-hidden text-ellipsis text-base font-normal mt-1">
                            {housing.title}
                          </div>
                          <div className="mt-2">
                            {/* نمایش قیمت فروش یا رهن و اجاره */}
                            {housing.price > 0 ? (
                              <div className="text-sm farsi-digits text-[#5A5A5A] font-normal flex gap-1">
                                <div className="font-normal "> {formatPriceLoc(housing.price)}</div>
                              </div>
                            ) : housing.deposit > 0 || housing.rent > 0 ? (
                              <div className="text-[16px] farsi-digits text-[#5A5A5A] font-normal space-y-2">
                                {housing.deposit > 0 && (
                                  <div className="flex gap-1 text-xs">
                                    {' '}
                                    رهن: <div className="font-normal">{formatPriceLoc(housing.deposit)}</div>{' '}
                                  </div>
                                )}{' '}
                                {housing.rent > 0 && (
                                  <div className="flex gap-1 text-xs">
                                    اجاره: <div className="font-normal">{formatPriceLoc(housing.rent)} </div>
                                  </div>
                                )}
                              </div>
                            ) : null}

                            {/* نمایش درصد سود مالک و سازنده */}
                            {(housing.ownerProfitPercentage > 0 || housing.producerProfitPercentage > 0) && (
                              <div className="text-[13px] space-y-1">
                                {housing.ownerProfitPercentage > 0 && (
                                  <p className="text-[#5A5A5A]">سود مالک: {housing.ownerProfitPercentage}%</p>
                                )}
                                {housing.producerProfitPercentage > 0 && (
                                  <p className="text-[#5A5A5A]">سود سازنده: {housing.producerProfitPercentage}%</p>
                                )}
                              </div>
                            )}

                            {/* نمایش ظرفیت و نفرات اضافه */}
                            {(housing.capacity > 0 ||
                              housing.extraPeople > 0 ||
                              (housing.rentalTerm && housing.rentalTerm.name)) && (
                              <div className=" text-[13px] text-[#7A7A7A]">
                                {housing.capacity > 0 && (
                                  <p className="text-[#5A5A5A]">ظرفیت: {housing.capacity} نفر</p>
                                )}
                                {/* {housing.extraPeople > 0 && <p>نفرات اضافه: {housing.extraPeople} نفر</p>} */}
                                {housing.rentalTerm?.name && (
                                  <p className="text-[#5A5A5A]">نوع قرارداد: {housing.rentalTerm.name}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>

                      {/* Property Details */}
                      <div className="w-full text-right text-[#7A7A7A] text-sm flex justify-between">
                        {/* <div className="flex-center gap-1.5 text-xs font-medium farsi-digits">
                    <BedIcon width="21px" height="19px" /> {housing.bedrooms}{' '}
                    <span className="font-medium text-[#7A7A7A] text-xs">اتاق خواب</span>
                  </div>
                  <div className="flex-center gap-1.5 font-medium text-xs farsi-digits">
                    <Grid2Icon width="16px" height="16px" /> {housing.cubicMeters}{' '}
                    <span className="font-medium text-[#7A7A7A] text-xs">متر مربع</span>
                  </div>
                  <div className="flex-center gap-1.5 font-medium text-xs farsi-digits">
                    <BulidingIcon width="16px" height="17px" /> طبقه {housing.onFloor} از {housing.floors}
                  </div> */}
                        {housing.highlightFeatures &&
                          housing.highlightFeatures.map((feature) => {
                            return (
                              <div className="flex-center gap-0.5 text-xs font-medium farsi-digits whitespace-nowrap">
                                {' '}
                                <img className="w-[16px]" src={feature.image} alt="" /> {feature.value}{' '}
                                <span className="font-medium text-[#7A7A7A] text-xs">{feature.title}</span>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </ClientLayout>
    </>
  )
}

export default MyAds
