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
import { Button, Modal } from '@/components/ui'
import { BiShare } from 'react-icons/bi'
import { IoShareSocialOutline } from 'react-icons/io5'
import { useGetAdvByIdQuery, useGetFavoritesQuery, useAddFavoriteMutation, useViewAdvertisementMutation } from '@/services/productionBaseApi'

// Small inline loading for favorite button
const SmallFavoriteLoading = () => {
  return (
    <div className="inline-flex items-center justify-center">
      <div className="lds-heart">
        <div></div>
      </div>
      <style jsx>{`
        .lds-heart {
          display: inline-block;
          position: relative;
          width: 19px;
          height: 17px;
          transform: rotate(45deg);
          transform-origin: 10px 10px;
        }
        .lds-heart div {
          top: 6px;
          left: 6px;
          position: absolute;
          width: 8px;
          height: 8px;
          background: #D52133;
          animation: lds-heart 1.2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
        }
        .lds-heart div:after,
        .lds-heart div:before {
          content: " ";
          position: absolute;
          display: block;
          width: 8px;
          height: 8px;
          background: #D52133;
        }
        .lds-heart div:before {
          left: -6px;
          border-radius: 50% 0 0 50%;
        }
        .lds-heart div:after {
          top: -6px;
          border-radius: 50% 50% 0 0;
        }
        @keyframes lds-heart {
          0% {
            transform: scale(0.8);
          }
          5% {
            transform: scale(0.9);
          }
          10% {
            transform: scale(0.8);
          }
          15% {
            transform: scale(1);
          }
          50% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(0.8);
          }
        }
      `}</style>
    </div>
  );
};

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
  const idQuery = query.id
  // ? States
  // const [city, setCity] = useState<string>('')
  const [contactShown, setContactShown] = useState(false)
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false)
  const [isShow, modalHandlers] = useDisclosure()
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState('')
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  // ? Queries
  const { refetch, data: housingData, isLoading } = useGetAdvByIdQuery(idQuery as string)
  const { data: favoritesData } = useGetFavoritesQuery({})
  const [addFavorite, { isLoading: isAddingFavorite }] = useAddFavoriteMutation()
  const [viewAdvertisement] = useViewAdvertisementMutation()
  const isSaved = favoritesData?.items && favoritesData?.items.length > 0 && favoritesData?.items.some((fav) => fav.id === housingData?.id)

  // برای نمایش محلی وضعیت علاقه‌مندی
  const [localIsSaved, setLocalIsSaved] = useState(isSaved)
  
  // به روزرسانی وضعیت محلی هر وقت isSaved تغییر می‌کند
  useEffect(() => {
    setLocalIsSaved(isSaved)
  }, [isSaved])

  const handleSaveClick = async (event: React.MouseEvent<HTMLDivElement>, housing: Housing) => {
    event.preventDefault()
    event.stopPropagation()
    
    // ابتدا وضعیت محلی را تغییر می‌دهیم برای تجربه کاربری بهتر
    setLocalIsSaved(!localIsSaved)
    
    try {
      // فراخوانی API
      const response = await addFavorite({ id: housing.id }).unwrap()
      console.log('پاسخ API علاقه‌مندی:', response)
      
      // اگر پاسخ API متفاوت از انتظار بود، وضعیت محلی را به حالت قبل برمی‌گردانیم
      if ((response.action === 'add' && !localIsSaved) || 
          (response.action === 'remove' && localIsSaved)) {
        setLocalIsSaved(!localIsSaved)
      }
    } catch (error) {
      console.error('خطا در به‌روزرسانی علاقه‌مندی:', error)
      // وضعیت محلی را به حالت قبل برمی‌گردانیم
      setLocalIsSaved(!localIsSaved)
    }
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

  if (housingData) {
    console.log(housingData, 'housingData')
  }

  // Register view on component mount - early, before any conditional returns
  useEffect(() => {
    if (typeof idQuery === 'string') {
      viewAdvertisement({ id: idQuery })
    }
  }, [idQuery, viewAdvertisement])

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
                    className={`rounded-full cursor-pointer flex-center ${localIsSaved ? 'text-[#D52133]' : 'text-white'}`}
                    onClick={(event) => handleSaveClick(event, housingData)}
                  >
                    {isAddingFavorite ? (
                      <SmallFavoriteLoading />
                    ) : (
                      <HearthIcon width="19px" height="17px" />
                    )}
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
                {housingData.highlight_attributes &&
                  housingData.highlight_attributes.length > 0 &&
                  housingData.highlight_attributes.map((feature) => {
                    return (
                      <div
                        key={feature.id}
                        className="flex gap-0.5 font-medium farsi-digits whitespace-nowrap ont-bold text-[#7A7A7A] text-xs"
                      >
                        {' '}
                        <img className="w-[16px]" src={feature.icon} alt="" />
                        <span className="font-medium text-[#7A7A7A] text-xs">
                          {typeof feature.value === 'object' ? feature.value.value : feature.value}
                        </span>
                        <span className="font-medium text-[#7A7A7A] text-xs">{feature.name}</span>
                      </div>
                    )
                  })}
                {/* 
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
                */}
              </div>
            </div>

            <div>
              <div className="bg-white mx-4 border rounded-2xl border-[#E3E3E7] mt-3">
                <div>
                  <div className="flex items-center gap-2 p-4 pb-0">
                    <div className="bg-[#FFF0F2] rounded-[10px] p-1">
                      <MoneyMdIcon width="24px" height="24px" />
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
                        <WarningSmIcon width="17px" height="17px" />
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
                  <div className="bg-[#FFF0F2] rounded-[10px] p-1">
                    {/* در صورت وجود آیکون مناسب می‌توانید آن را تغییر دهید */}
                    <CubeMdIcon width="24px" height="24px" />
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
                <LocationMap housingData={housingData} />
              </div>
              <div className="bg-white mx-4 border rounded-2xl border-[#E3E3E7] mt-3 pb-4">
                <div className="flex items-center gap-2 p-4 pb-0">
                  <div className="bg-[#FFF0F2] rounded-[10px] p-1">
                    <LocationRedMdIcon width="20px" height="20px" />
                  </div>
                  <div className="flex gap-2">
                    <div className="text-xs text-[#7A7A7A] font-medium whitespace-nowrap">آدرس دقیق:</div>
                    <div className="text-[#1A1E25] text-xs">{housingData.full_address.address}</div>
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
                  {contactShown ? housingData.user?.username || 'تماس با مالک' : 'تماس با مالک'}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </ClientLayout>
      <Modal isShow={isShow} onClose={handleModalClose} effect="buttom-to-fit">
        <Modal.Content
          onClose={handleModalClose}
          className="flex h-full flex-col gap-y-5 bg-white p-4 pb-8 rounded-2xl rounded-b-none"
        >
          <Modal.Header right onClose={handleModalClose}>
            اطلاعات تماس
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <button
                onClick={handleCall}
                className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg farsi-digits"
              >
                تماس با {selectedPhoneNumber}
              </button>
              <button
                onClick={handleMessage}
                className="w-full py-2 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg farsi-digits"
              >
                پیامک به {selectedPhoneNumber}
              </button>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </>
  )
}

export default SingleHousing
