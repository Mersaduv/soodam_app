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
  CubeMd2Icon,
  CubeMdIcon,
  EyeSmIcon,
  HearthIcon,
  HeartMdIcon,
  Location,
  Location2,
  LocationMd2Icon,
  LocationMdIcon,
  LocationRedMdIcon,
  LocationSmIcon,
  LocationTitleIcon,
  MoneyMd2Icon,
  MoneyMdIcon,
  SaveSmIcon,
  Warning2SmIcon,
  WarningSmIcon,
} from '@/icons'
import { useAppDispatch, useAppSelector, useDisclosure } from '@/hooks'
import { toggleSaveHouse } from '@/store'
import { formatPrice, formatPriceWithSuffix, timeAgo } from '@/utils'
import { getCityFromCoordinates } from '@/services/mapService'
// import { getHousingBySlug } from "@/services"
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { HiOutlineLocationMarker } from 'react-icons/hi'
import dynamic from 'next/dynamic'
import { Button, InlineLoading, Modal } from '@/components/ui'
import { BiShare } from 'react-icons/bi'
import { IoShareSocialOutline } from 'react-icons/io5'
import { useGetAdvByIdQuery } from '@/services/productionBaseApi'
import axios from 'axios'
import { toast } from 'react-toastify'

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
const SingleAdminAdv: NextPage = () => {
  // ? Assets
  const { query, push } = useRouter()
  const dispatch = useAppDispatch()
  const idQuery = query.id
  // ? States
  // const [city, setCity] = useState<string>('')
  const [contactShown, setContactShown] = useState(false)
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false)
  const [isShow, modalHandlers] = useDisclosure()
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState('')
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRejectProcessing, setIsRejectProcessing] = useState(false)

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  // ? Queries
  const { refetch, data: housingData, isLoading } = useGetAdvByIdQuery(idQuery as string)
  const hasValidSubscription = user && user.subscription && user.subscription.status === 'ACTIVE'

  const handleSaveClick = (event: React.MouseEvent<HTMLDivElement>, housing: Housing) => {
    event.preventDefault()
    event.stopPropagation()
    dispatch(toggleSaveHouse({ id: housing.id, savedTime: new Date().toISOString() }))
  }

  // useEffect(() => {
  //   if (housingData?.location?.lat && housingData?.location?.lng) {
  //     getCityFromCoordinates(housingData.location.lat, housingData.location.lng).then(setCity)
  //   }
  // }, [housingData?.location])

  const handleContactOwner = () => {
    const role = localStorage.getItem('role')
    if (!role || role === 'user') {
      push('/authentication/login?role=memberUser')
      return
    }

    // باز کردن مودال و ذخیره شماره تلفن
    setSelectedPhoneNumber(housingData.user?.phone_number || '')
    modalHandlers.open()
  }

  const handleModalClose = () => {
    modalHandlers.close()
  }

  const handleCall = () => {
    window.location.href = `tel:${selectedPhoneNumber}`
    modalHandlers.close()
  }

  const handleMessage = () => {
    window.location.href = `sms:${selectedPhoneNumber}`
    modalHandlers.close()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: window.location.href,
          text: housingData.title,
          url: window.location.href,
        })
      } catch (err) {
        console.error('خطا در اشتراک‌گذاری:', err)
      }
    } else {
      alert('مرورگر شما از اشتراک‌گذاری پشتیبانی نمی‌کند. لینک را کپی کنید: ' + window.location.href)
    }
  }

  const handleApproveAd = async (): Promise<void> => {
    setIsProcessing(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `/api/admin/advertisement/${idQuery}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      toast.success('آگهی با موفقیت تایید شد')
      refetch()
    } catch (error) {
      toast.error('خطا در تایید آگهی')
      console.error(error)
    } finally {
      setIsProcessing(false)
      modalHandlers.close()
    }
  }

  const handleRejectAd = async (): Promise<void> => {
    setIsRejectProcessing(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `/api/admin/advertisement/${idQuery}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      toast.success('آگهی با موفقیت رد شد')
      refetch()
    } catch (error) {
      toast.error('خطا در رد آگهی')
      console.error(error)
    } finally {
      setIsRejectProcessing(false)
      modalHandlers.close()
    }
  }

  if (housingData) {
    console.log(housingData, 'housingData')
  }
  const isSaved = useAppSelector((state) => state.saveHouse.savedHouses.some((item) => item.id === housingData?.id))
  if (isLoading) return <div>loading...</div>
  if (!housingData) return <div>not found</div>

  // Add this function to determine if current user is the ad owner
  const isAdOwner = () => {
    if (!user || !housingData || !housingData.user) return false
    return user.id === housingData.user.id
  }

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
                <div className="flex gap-4">
                  <div
                    id="saveHouse"
                    className={`rounded-full cursor-pointer flex-center ${isSaved ? 'text-[#D52133]' : 'text-white'}`}
                    onClick={(event) => handleSaveClick(event, housingData)}
                  >
                    <HearthIcon width="19px" height="17px" />
                  </div>

                  {/* Edit Button - Only visible to ad owner */}
                  {isAdOwner() && (
                    <div
                      id="editHouse"
                      className="rounded-full cursor-pointer flex-center"
                      onClick={() => push(`/housing/ad/edit?id=${housingData.id}`)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </div>
                  )}

                  <div id="shareHouse" className={`rounded-full cursor-pointer flex-center`} onClick={handleShare}>
                    <IoShareSocialOutline className="text-xl" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 p-4 pt-0 gap-3.5 gap-x-20">
                <div className="flex gap-0.5 font-medium farsi-digits whitespace-nowrap ont-bold text-[#7A7A7A] text-xs">
                  {' '}
                  <img className="w-[16px]" src={`/static/grid-222.png`} alt="" />
                  <div className="font-bold text-[#7A7A7A] text-xs">بزودی قابل نمایش میشود</div>
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
                {/* {housingData.attributes &&
                  housingData.attributes.filter((item) => item.type === 'text').map((feature) => {
                    return (
                      <div key={feature.id} className="flex gap-0.5 font-medium farsi-digits whitespace-nowrap ont-bold text-[#7A7A7A] text-xs">
                        {' '}
                        <img className="w-[16px]" src={feature.icon} alt="" /> 
                        {typeof feature.value === 'object' && feature.value !== null ? String(feature.value.value) : 
                         typeof feature.value === 'boolean' ? (feature.value ? 'دارد' : 'ندارد') : 
                         String(feature.value)}{' '}
                        <div className="font-bold text-[#7A7A7A] text-xs">{feature.name}</div>
                      </div>
                    )
                  })} */}
              </div>
            </div>

            <div>
              <div className="bg-white mx-4 border rounded-2xl border-[#E3E3E7] mt-3">
                <div>
                  <div className="flex items-center gap-2 p-4 pb-0">
                    <div className="bg-[#F0F3F6] rounded-[10px] p-1 text-[#2C3E50]">
                      <MoneyMd2Icon width="24px" height="24px" />
                    </div>
                    {housingData.price && housingData.price.amount > 0 ? (
                      <div className="text-[15px] font-medium">قیمت فروش</div>
                    ) : (
                      housingData.price &&
                      (housingData.price.deposit > 0 || housingData.price.rent > 0) && (
                        <div className="text-[15px] font-medium">ودیعه و اجاره</div>
                      )
                    )}
                  </div>
                  <hr className="mt-2 mb-4" />
                  <div className="px-4 space-y-3.5">
                    <div id="map_features" className="space-y-3.5">
                      {housingData.price && (
                        <>
                          {housingData.price.amount > 0 && (
                            <div className="flex justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                                <div className="text-[#7A7A7A] text-sm font-normal">قیمت فروش</div>
                              </div>
                              <div className="farsi-digits text-[#7A7A7A] text-sm font-medium">
                                {formatPriceWithSuffix(housingData.price.amount)}
                                {housingData.price.is_negotiable && <span className="mr-1">قابل مذاکره</span>}
                              </div>
                            </div>
                          )}

                          {housingData.price.deposit > 0 && (
                            <div className="flex justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                                <div className="text-[#7A7A7A] text-sm font-normal">قیمت ودیعه</div>
                              </div>
                              <div className="farsi-digits text-[#7A7A7A] text-sm font-medium">
                                {formatPriceWithSuffix(housingData.price.deposit)}
                              </div>
                            </div>
                          )}

                          {housingData.price.rent > 0 && (
                            <div className="flex justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                                <div className="text-[#7A7A7A] text-sm font-normal">قیمت اجاره</div>
                              </div>
                              <div className="farsi-digits text-[#7A7A7A] text-sm font-medium">
                                {formatPriceWithSuffix(housingData.price.rent)}
                              </div>
                            </div>
                          )}

                          {housingData.price.discount_amount > 0 && (
                            <div className="flex justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                                <div className="text-[#7A7A7A] text-sm font-normal">قیمت تخفیف</div>
                              </div>
                              <div className="farsi-digits text-[#7A7A7A] text-sm font-medium">
                                {formatPriceWithSuffix(housingData.price.discount_amount)}
                              </div>
                            </div>
                          )}

                          {housingData.price.price_per_unit > 0 && (
                            <div className="flex justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                                <div className="text-[#7A7A7A] text-sm font-normal">
                                  قیمت هر {housingData.price.unit}
                                </div>
                              </div>
                              <div className="farsi-digits text-[#7A7A7A] text-sm font-medium">
                                {formatPriceWithSuffix(housingData.price.price_per_unit)}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Still show profit percentages from attributes if they exist */}
                      {housingData.attributes
                        .filter(
                          (item) =>
                            item.key === 'text_owner_profit_percentage' ||
                            item.key === 'text_producer_profit_percentage'
                        )
                        .map((item) => (
                          <div key={item.key} className="flex justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                              <div className="text-[#7A7A7A] text-sm font-normal">
                                {item.key === 'text_owner_profit_percentage'
                                  ? 'سود مالک'
                                  : item.key === 'text_producer_profit_percentage'
                                  ? 'سود سازنده'
                                  : 'مشخص نیست'}
                              </div>
                            </div>
                            <div className="farsi-digits text-[#7A7A7A] text-sm font-medium">
                              {formatPriceWithSuffix(Number(item.value))}
                            </div>
                          </div>
                        ))}
                    </div>

                    <div className="flex">
                      <div className="flex items-center gap-2.5">
                        <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                        <div className="text-[#7A7A7A] text-[13px] font-normal">
                          {timeAgo(housingData.created_at, true)}،
                          {typeof housingData.full_address.city === 'object' &&
                          housingData.full_address.city !== null &&
                          'name' in housingData.full_address.city
                            ? (housingData.full_address.city as { name: string }).name
                            : typeof housingData.full_address.city === 'string'
                            ? housingData.full_address.city
                            : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex">
                      <div className="flex items-center gap-2.5">
                        <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                        <div className="text-[#7A7A7A] text-[13px] font-normal flex items-center">
                          شناسه آگهی :{' '}
                          <div className="text-[#7A7A7A] text-[13px] farsi-digits">{housingData.id ?? 'ندارد'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex pb-4">
                      <div className="flex items-center gap-1.5 -mr-1">
                        <Warning2SmIcon width="17px" height="17px" />
                        <div className="text-[#7A7A7A] text-[13px] font-normal flex items-center">گزارش تخلف آگهی</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* نمایش درصد سود سازنده و مالک */}
              {/* ادامه ... */}

              <div className="bg-white mx-4 border rounded-2xl border-[#E3E3E7] mt-3 pb-4">
                <div className="flex items-center gap-2 p-4 pb-0">
                  <div className="bg-[#F0F3F6] rounded-[10px] p-1">
                    {/* در صورت وجود آیکون مناسب می‌توانید آن را تغییر دهید */}
                    <CubeMd2Icon width="24px" height="24px" />
                  </div>
                  <div className="text-[15px] font-medium">ویژگی و امکانات</div>
                </div>
                <hr className="mt-2 mb-4" />
                <div className="grid grid-cols-2 px-4 gap-y-5 gap-x-4 xxs:gap-x-10">
                  {housingData.attributes
                    .filter(
                      (item) =>
                        !['text_monthly_rent', 'text_mortgage_deposit', 'text_selling_price', 'text_discount'].includes(
                          item.key
                        )
                    )
                    .map((feature) => {
                      return (
                        <div className="flex gap-x-1.5" key={feature.id}>
                          <img className="w-[16px] h-[16px]" src={`/static/grid-222.png`} alt="" />
                          <div className="flex text-[#7A7A7A] text-xs">
                            {feature.name}:{' '}
                            <div className="text-[#1A1E25] text-xs mr-0.5">
                              {feature.type === 'bool'
                                ? feature.value
                                  ? 'دارد'
                                  : 'ندارد'
                                : typeof feature.value === 'object' && feature.value !== null
                                ? String(feature.value.value)
                                : String(feature.value)}
                            </div>
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
                  <div className="text-xs text-center">{timeAgo(housingData.created_at, true)}</div>
                </div>

                <div className="bg-[#FCFCFC] rounded-lg h-[68px] w-[105px] space-y-3.5 py-2 pt-2.5">
                  <div className="flex justify-center items-center gap-1">
                    <EyeSmIcon width="17px" height="17px" />
                    <div className="text-[#7A7A7A] text-xs">تعداد مشاهده</div>
                  </div>
                  <div className="text-xs text-center farsi-digits">{housingData.statistics?.views || 0}</div>
                </div>

                <div className="bg-[#FCFCFC] rounded-lg h-[68px] w-[105px] space-y-3.5 py-2 pt-2.5">
                  <div className="flex justify-center items-center gap-1">
                    <HeartMdIcon width="16px" height="17px" />
                    <div className="text-[#7A7A7A] text-xs"> علاقه مندی ها</div>
                  </div>
                  <div className="text-xs text-center farsi-digits">{housingData.statistics?.favorites || 0}</div>
                </div>
              </div>

              <div className="my-4 px-4">
                <h1 className="font-medium">موقعیت</h1>
                <LocationMap isAdmin housingData={housingData} />
              </div>
              <div className="bg-white mx-4 border rounded-2xl border-[#E3E3E7] mt-3 pb-4">
                <div className="flex items-center gap-2 p-4 pb-0">
                  <div className="bg-[#F0F3F6] rounded-[10px] p-1">
                    <LocationMd2Icon width="20px" height="20px" />
                  </div>
                  <div className="flex gap-2">
                    <div className="text-xs text-[#7A7A7A] font-medium whitespace-nowrap">آدرس دقیق:</div>
                    <div className="text-[#1A1E25] text-xs">{housingData.full_address.address}</div>
                  </div>
                </div>
              </div>

              <div className="mx-4 mt-4 relative flex gap-2">
                <button
                  onClick={handleApproveAd}
                  disabled={isProcessing}
                  className="bg-[#2C3E50] hover:bg-[#22303e] w-full text-white h-[40px] rounded-lg text-[12.5px] flex justify-center items-center"
                >
                  {isProcessing ? <InlineLoading /> : 'تایید آگهی'}
                </button>
                <button
                  onClick={handleRejectAd}
                  disabled={isRejectProcessing}
                  className="border border-[#2C3E50] bg-white hover:bg-[#22303e0f] w-full text-[#2C3E50] h-[40px] rounded-lg text-[12.5px] flex justify-center items-center"
                >
                  {isRejectProcessing ? <InlineLoading /> : 'رد آگهی'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </ClientLayout>
    </>
  )
}

export default SingleAdminAdv
