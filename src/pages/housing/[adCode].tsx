import { ClientLayout } from '@/components/layouts'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import type { GetServerSideProps, NextPage } from 'next'
import Link from 'next/link'
import { Housing } from '@/types'
import { useGetSingleHousingQuery } from '@/services'
import { HousingSliders } from '@/components/sliders'
import {
  ClockSmIcon,
  CubeMdIcon,
  EyeSmIcon,
  HearthIcon,
  HeartMdIcon,
  Location,
  Location2,
  LocationMdIcon,
  LocationRedMdIcon,
  LocationSmIcon,
  LocationTitleIcon,
  MoneyMdIcon,
  SaveSmIcon,
  WarningSmIcon,
} from '@/icons'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { toggleSaveHouse } from '@/store'
import { formatPrice, formatPriceWithSuffix, timeAgo } from '@/utils'
import { getCityFromCoordinates } from '@/services/mapService'
// import { getHousingBySlug } from "@/services"
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { HiOutlineLocationMarker } from 'react-icons/hi'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui'
interface Props {
  //   housing: Housing
  //   similarHousing: {
  housing: any
  //     housings: Housing[]
  //   }
}

// export const getServerSideProps: GetServerSideProps<Props, { slug: string }> = async ({ params }) => {
//******* */ When running MSW data mocking on server-side rendering, it causes an error.
//   }
const LocationMap = dynamic(() => import('@/components/map/LocationMap'), { ssr: false })
const SingleHousing: NextPage = () => {
  // ? Assets
  const { query, push } = useRouter()
  const dispatch = useAppDispatch()
  const adCodeQuery = query.adCode
  // ? States
  const [city, setCity] = useState<string>('')
  const [contactShown, setContactShown] = useState(false)
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false)
  const [showAddress, setShowAddress] = useState(false)
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  // ? Queries
  const { refetch, data: housingData, isLoading } = useGetSingleHousingQuery(adCodeQuery as string)
  const hasValidSubscription = user && user.subscription && user.subscription.status === 'ACTIVE'

  const handleSaveClick = (event: React.MouseEvent<HTMLDivElement>, housing: Housing) => {
    event.preventDefault()
    event.stopPropagation()
    dispatch(toggleSaveHouse({ id: housing.id, savedTime: new Date().toISOString() }))
  }

  useEffect(() => {
    if (housingData?.location?.lat && housingData?.location?.lng) {
      getCityFromCoordinates(housingData.location.lat, housingData.location.lng).then(setCity)
    }
  }, [housingData?.location])

  const handleAddressClick = () => {
    if (hasValidSubscription) {
      setShowAddress(true)
    } else {
      push('/housing/unauthorize')
    }
  }
  const handleContactOwner = async () => {
    if (!hasValidSubscription) {
      push('/housing/unauthorize')
      return
    }

    try {
      await navigator.clipboard.writeText(housingData.contactOwner)
      setContactShown(true)
      setShowCopiedTooltip(true)

      setTimeout(() => {
        setShowCopiedTooltip(false)
      }, 2000)
    } catch (err) {
      console.error('خطا در کپی شماره تماس:', err)
    }
  }

  if (housingData) {
    console.log(housingData, 'housingData')
  }
  const isSaved = useAppSelector((state) => state.saveHouse.savedHouses.some((item) => item.id === housingData?.id))
  if (isLoading) return <div>loading...</div>
  // ? Render(s)
  return (
    <>
      <ClientLayout title="جزییات ملک">
        <main className="pt-[70px] relative">
          <div>
            <HousingSliders data={housingData} />
          </div>
          <div className="absolute w-full top-[290px] z-10 pb-[100px]">
            <div className="bg-white mx-4 border rounded-2xl border-[#E3E3E7]">
              <div className="flex justify-between items-center p-4">
                <div className="flex items-center gap-2">
                  <LocationTitleIcon width="16px" height="16px" /> <div className="text-xs">{housingData.title} </div>
                </div>
                <div
                  id="saveHouse"
                  className={`rounded-full cursor-pointer flex-center ${isSaved ? 'text-[#D52133]' : 'text-white'}`}
                  onClick={(event) => handleSaveClick(event, housingData)}
                >
                  <HearthIcon width="19px" height="17px" />
                </div>
              </div>
              <div className="grid grid-cols-2 p-4 pt-0 gap-3.5 gap-x-20">
                {housingData.highlightFeatures &&
                  housingData.highlightFeatures.map((feature) => {
                    return (
                      <div className="flex gap-0.5 font-medium farsi-digits whitespace-nowrap ont-bold text-[#7A7A7A] text-xs">
                        {' '}
                        <img className="w-[16px]" src={feature.image} alt="" /> {feature.value}{' '}
                        <div className="font-bold text-[#7A7A7A] text-xs">{feature.title}</div>
                      </div>
                    )
                  })}
              </div>
            </div>

            <div>
              {/* نمایش قیمت‌های آگهی رهن و اجاره یا فروش */}
              {(housingData.deposit > 0 || housingData.rent > 0 || housingData.price > 0) && (
                <div className="bg-white mx-4 border rounded-2xl border-[#E3E3E7] mt-3">
                  <div className="flex items-center gap-2 p-4 pb-0">
                    <div className="bg-[#FFF0F2] rounded-[10px] p-1">
                      <MoneyMdIcon width="24px" height="24px" />
                    </div>
                    <div className="text-[15px] font-medium">
                      {housingData.price > 0 ? 'قیمت فروش' : 'ودیعه و اجاره'}
                    </div>
                  </div>
                  <hr className="mt-2 mb-4" />
                  <div className=" px-4 space-y-3.5">
                    {housingData.price > 0 ? (
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                          <div className="text-[#7A7A7A] text-sm font-normal">فروش</div>
                        </div>

                        <div className="farsi-digits text-[#7A7A7A] text-sm font-medium">
                          {formatPriceWithSuffix(housingData.price)}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                            <div className="text-[#7A7A7A] text-sm font-normal">ودیعه</div>
                          </div>

                          <div className="farsi-digits text-[#7A7A7A] text-sm font-medium">
                            {formatPriceWithSuffix(housingData.deposit)}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                            <div className="text-[#7A7A7A] text-sm font-normal">اجاره</div>
                          </div>

                          <div className="farsi-digits text-[#7A7A7A] text-sm font-medium">
                            {formatPriceWithSuffix(housingData.rent)}
                          </div>
                        </div>
                      </>
                    )}
                    <div className="flex">
                      <div className="flex items-center gap-2.5">
                        <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                        <div className="text-[#7A7A7A] text-[13px] font-normal">
                          {timeAgo(housingData.created)}،{city}
                        </div>
                      </div>
                    </div>

                    <div className="flex">
                      <div className="flex items-center gap-2.5">
                        <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                        <div className="text-[#7A7A7A] text-[13px] font-normal flex items-center">
                          شناسه آگهی :{' '}
                          <div className="text-[#7A7A7A] text-[13px] farsi-digits">{housingData.adCode}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex pb-4">
                      <div className="flex items-center gap-1.5 -mr-1">
                        {/* <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" /> */}
                        <WarningSmIcon width="17px" height="17px" />
                        <div className="text-[#7A7A7A] text-[13px] font-normal flex items-center">گزارش تخلف آگهی</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* نمایش درصد سود سازنده و مالک */}
              {(housingData.ownerProfitPercentage > 0 || housingData.producerProfitPercentage > 0) && (
                <div className="bg-white mx-4 border rounded-2xl border-[#E3E3E7] mt-3">
                  <div className="flex items-center gap-2 p-4 pb-0">
                    <div className="bg-[#FFF0F2] rounded-[10px] p-1">
                      {/* در صورت وجود آیکون مناسب می‌توانید آن را تغییر دهید */}
                      <MoneyMdIcon width="24px" height="24px" />
                    </div>
                    <div className="text-[15px] font-medium">درصد سود سازنده و مالک</div>
                  </div>
                  <hr className="mt-2 mb-4" />
                  <div className=" px-4 space-y-3.5">
                    {housingData.ownerProfitPercentage > 0 && (
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                          <div className="text-[#7A7A7A] text-sm font-normal">سود مالک</div>
                        </div>

                        <div className="farsi-digits text-[#7A7A7A] text-sm font-medium">
                          {housingData.ownerProfitPercentage}%
                        </div>
                      </div>
                    )}
                    {housingData.producerProfitPercentage > 0 && (
                      <>
                        <div className="flex justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                            <div className="text-[#7A7A7A] text-sm font-normal">سود سازنده</div>
                          </div>

                          <div className="farsi-digits text-[#7A7A7A] text-sm font-medium">
                            {housingData.producerProfitPercentage}%
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex">
                      <div className="flex items-center gap-2.5">
                        <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                        <div className="text-[#7A7A7A] text-[13px] font-normal">
                          {timeAgo(housingData.created)}،{city}
                        </div>
                      </div>
                    </div>

                    <div className="flex">
                      <div className="flex items-center gap-2.5">
                        <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                        <div className="text-[#7A7A7A] text-[13px] font-normal flex items-center">
                          شناسه آگهی :{' '}
                          <div className="text-[#7A7A7A] text-[13px] farsi-digits">{housingData.adCode}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex pb-4">
                      <div className="flex items-center gap-1.5 -mr-1">
                        {/* <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" /> */}
                        <WarningSmIcon width="17px" height="17px" />
                        <div className="text-[#7A7A7A] text-[13px] font-normal flex items-center">گزارش تخلف آگهی</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* نمایش ظرفیت، نفرات اضافه و نام قرارداد */}
              {(housingData.capacity > 0 ||
                housingData.extraPeople > 0 ||
                (housingData.rentalTerm && housingData.rentalTerm.name)) && (
                <div className="bg-white mx-4 border rounded-2xl border-[#E3E3E7] mt-3">
                  <div className="flex items-center gap-2 p-4 pb-0">
                    <div className="bg-[#FFF0F2] rounded-[10px] p-1">
                      {/* در صورت نیاز آیکون مناسب برای ظرفیت اضافه کنید */}
                      <MoneyMdIcon width="24px" height="24px" />
                    </div>
                    <div className="text-[15px] font-medium">ظرفیت و نفرات اضافه</div>
                  </div>
                  <hr className="mt-2 mb-4" />
                  <div className=" px-4 space-y-3.5">
                    {housingData.capacity > 0 && (
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                          <div className="text-[#7A7A7A] text-sm font-normal">ظرفیت</div>
                        </div>

                        <div className="farsi-digits text-[#7A7A7A] text-sm font-medium">
                          {housingData.capacity} نفر
                        </div>
                      </div>
                    )}
                    {housingData.extraPeople > 0 && (
                      <>
                        <div className="flex justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                            <div className="text-[#7A7A7A] text-sm font-normal">نفرات اضافه</div>
                          </div>

                          <div className="farsi-digits text-[#7A7A7A] text-sm font-medium">
                            {housingData.extraPeople} نفر
                          </div>
                        </div>
                      </>
                    )}

                    {housingData.rentalTerm && housingData.rentalTerm.name && (
                      <>
                        <div className="flex justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                            <div className="text-[#7A7A7A] text-sm font-normal">نوع قرارداد</div>
                          </div>

                          <div className="farsi-digits text-[#7A7A7A] text-[13px] font-medium">
                            {housingData.rentalTerm.name}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex">
                      <div className="flex items-center gap-2.5">
                        <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                        <div className="text-[#7A7A7A] text-[13px] font-normal">
                          {timeAgo(housingData.created)}،{city}
                        </div>
                      </div>
                    </div>

                    <div className="flex">
                      <div className="flex items-center gap-2.5">
                        <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                        <div className="text-[#7A7A7A] text-[13px] font-normal flex items-center">
                          شناسه آگهی :{' '}
                          <div className="text-[#7A7A7A] text-[13px] farsi-digits">{housingData.adCode}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex pb-4">
                      <div className="flex items-center gap-1.5 -mr-1">
                        {/* <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" /> */}
                        <WarningSmIcon width="17px" height="17px" />
                        <div className="text-[#7A7A7A] text-[13px] font-normal flex items-center">گزارش تخلف آگهی</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white mx-4 border rounded-2xl border-[#E3E3E7] mt-3 pb-4">
                <div className="flex items-center gap-2 p-4 pb-0">
                  <div className="bg-[#FFF0F2] rounded-[10px] p-1">
                    {/* در صورت وجود آیکون مناسب می‌توانید آن را تغییر دهید */}
                    <CubeMdIcon width="24px" height="24px" />
                  </div>
                  <div className="text-[15px] font-medium">ویژگی و امکانات</div>
                </div>
                <hr className="mt-2 mb-4" />
                <div className="grid grid-cols-2 px-4 gap-y-5 gap-x-4 xxs:gap-x-10">
                  {housingData.features.map((feature) => {
                    return (
                      <div className="flex gap-x-1.5" key={feature.id}>
                        <img className="w-[16px] h-[16px]" src={feature.image} alt="" />
                        <div className="flex text-[#7A7A7A] text-xs">
                          {feature.title}: <div className="text-[#1A1E25] text-xs mr-0.5">{feature.value}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="my-4 px-4">
                <h1 className="font-medium">توضیحات</h1>
                <div className="pt-4 text-sm">{housingData.description}</div>
              </div>

              <div className="bg-white p-4 flex justify-between gap-1">
                <div className="bg-[#FCFCFC] rounded-lg h-[68px] w-[105px] space-y-3.5 py-2 pt-2.5">
                  <div className="flex justify-center items-center gap-1">
                    <ClockSmIcon width="17px" height="16px" />
                    <div className="text-[#7A7A7A] text-xs">زمان ثبت آگهی</div>
                  </div>
                  <div className="text-xs text-center">{timeAgo(housingData.created)}</div>
                </div>

                <div className="bg-[#FCFCFC] rounded-lg h-[68px] w-[105px] space-y-3.5 py-2 pt-2.5">
                  <div className="flex justify-center items-center gap-1">
                    <EyeSmIcon width="17px" height="17px" />
                    <div className="text-[#7A7A7A] text-xs">تعداد مشاهده</div>
                  </div>
                  <div className="text-xs text-center farsi-digits">{housingData.views}</div>
                </div>

                <div className="bg-[#FCFCFC] rounded-lg h-[68px] w-[105px] space-y-3.5 py-2 pt-2.5">
                  <div className="flex justify-center items-center gap-1">
                    <HeartMdIcon width="16px" height="17px" />
                    <div className="text-[#7A7A7A] text-xs"> علاقه مندی ها</div>
                  </div>
                  <div className="text-xs text-center farsi-digits">{housingData.save}</div>
                </div>
              </div>

              <div className="my-4 px-4">
                <h1 className="font-medium">موقعیت</h1>
                <LocationMap housingData={housingData} />
              </div>
              <div className="bg-white mx-4 border rounded-2xl border-[#E3E3E7] mt-3 pb-4">
                <div className="flex items-center gap-2 p-4 pb-0">
                  <div className="bg-[#FFF0F2] rounded-[10px] p-1">
                    <LocationRedMdIcon width="20px" height="20px" />
                  </div>
                  <div className="flex gap-2">
                    <div className="text-xs text-[#7A7A7A] font-medium whitespace-nowrap">آدرس دقیق:</div>
                    {hasValidSubscription ? (
                      <div className="text-[#1A1E25] text-xs">{housingData.address}</div>
                    ) : (
                      <div className="text-[#D52133] text-xs cursor-pointer underline" onClick={handleAddressClick}>
                        مشاهده کردن
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mx-4 mt-4 relative">
                {showCopiedTooltip && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 text-xs px-2 py-1 rounded shadow">
                    کپی شد!
                  </div>
                )}
                <Button className="w-full rounded-[10px] farsi-digits" onClick={handleContactOwner}>
                  {contactShown ? housingData.contactOwner : 'تماس با مالک'}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </ClientLayout>
    </>
  )
}

export default SingleHousing
