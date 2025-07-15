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
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { HiOutlineLocationMarker } from 'react-icons/hi'
import dynamic from 'next/dynamic'
import { Button, InlineLoading, Modal } from '@/components/ui'
import { BiShare } from 'react-icons/bi'
import { IoShareSocialOutline } from 'react-icons/io5'
import { useGetAdvByIdQuery, useViewAdvertisementMutation } from '@/services/productionBaseApi'
import axios from 'axios'
import { toast } from 'react-toastify'

// Advertisement Edit Interface
interface AdvertisementEdit {
  id: number;
  original_advertisement_id: number;
  edit_status: number; // 0: pending, 1: approved, 2: rejected
  title: string;
  description: string;
  security_code_owner_building: string;
  phone_number_owner_building: string;
  category: {
    id: number;
    name: string;
    key: string;
    main_category: {
      id: number;
      name: string;
    };
    icon: string;
  };
  price: {
    deposit: number;
    rent: number;
    amount: number;
    currency: string;
    is_negotiable: boolean;
    discount_amount: number;
    original_amount: number;
    price_per_unit: number;
    unit: string;
  };
  full_address: {
    id: number;
    province: {
      id: number;
      name: string;
    };
    city: {
      id: number;
      name: string;
    };
    latitude: number;
    longitude: number;
    address: string;
    zip_code: string;
    geolocation: string;
  };
  attributes: Array<{
    id: string;
    name: string;
    key: string;
    type: string;
    value: any; // can be boolean, string, or object with id and value
    icon: string;
  }>;
  highlight_attributes: any[];
  images: Array<{
    url: string;
    is_primary: boolean;
    order: number;
    width: number;
    height: number;
    alt_text: string;
  }>;
  videos: Array<{
    url: string;
    thumbnail_url: string;
    is_primary: boolean;
    order: number;
    duration: number;
    title: string;
    description: string;
  }>;
  primary_image: string;
  primary_video: string;
  user: {
    id: number;
    username: string;
    full_name: string;
    avatar: string;
    rating: number;
    is_verified: boolean;
    created_at: string;
  };
  admin_notes: string;
  reviewed_by: {
    id: number;
    username: string;
    full_name: string;
    avatar: string;
    rating: number;
    is_verified: boolean;
    created_at: string;
  } | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  // Add properties needed for Housing type compatibility
  status?: number;
  expiry_date?: string;
}

interface Props {
  housing: any
}

const LocationMap = dynamic(() => import('@/components/map/LocationMap'), { ssr: false })
const SingleAdminAdvEdit: NextPage = () => {
  // ? Assets
  const { query, push } = useRouter()
  const dispatch = useAppDispatch()
  const idQuery = query.id
  // ? States
  const [contactShown, setContactShown] = useState(false)
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false)
  const [isShow, modalHandlers] = useDisclosure()
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState('')
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRejectProcessing, setIsRejectProcessing] = useState(false)
  const [advertisementEdit, setAdvertisementEdit] = useState<AdvertisementEdit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  
  // Fetch advertisement edit data
  useEffect(() => {
    const fetchAdvertisementEdit = async () => {
      if (!idQuery) return;
      
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get<AdvertisementEdit>(
          `/api/admin/advertisement-edits/${idQuery}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAdvertisementEdit(response.data);
      } catch (err) {
        console.error('Error fetching advertisement edit:', err);
        setError('خطا در دریافت اطلاعات ویرایش آگهی');
        toast.error('خطا در دریافت اطلاعات ویرایش آگهی');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdvertisementEdit();
  }, [idQuery]);

  // Register view on component mount - early before conditional returns
  const [viewAdvertisement] = useViewAdvertisementMutation()
  useEffect(() => {
    if (typeof idQuery === 'string') {
      viewAdvertisement({ id: idQuery })
    }
  }, [idQuery, viewAdvertisement])

  const handleApproveEdit = async (): Promise<void> => {
    setIsProcessing(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `/api/admin/advertisement-edits/${idQuery}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      toast.success('ویرایش آگهی با موفقیت تایید شد')
      // Refresh data
      push('/admin/advertisements')
    } catch (error) {
      toast.error('خطا در تایید ویرایش آگهی')
      console.error(error)
    } finally {
      setIsProcessing(false)
      modalHandlers.close()
    }
  }

  const handleRejectEdit = async (): Promise<void> => {
    setIsRejectProcessing(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `/api/admin/advertisement-edits/${idQuery}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      toast.success('ویرایش آگهی با موفقیت رد شد')
      // Refresh data
      push('/admin/advertisements')
    } catch (error) {
      toast.error('خطا در رد ویرایش آگهی')
      console.error(error)
    } finally {
      setIsRejectProcessing(false)
      modalHandlers.close()
    }
  }

  const handleShare = async () => {
    if (!advertisementEdit) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: window.location.href,
          text: advertisementEdit.title,
          url: window.location.href,
        })
      } catch (err) {
        console.error('خطا در اشتراک‌گذاری:', err)
      }
    } else {
      alert('مرورگر شما از اشتراک‌گذاری پشتیبانی نمی‌کند. لینک را کپی کنید: ' + window.location.href)
    }
  }

  const isSaved = useAppSelector((state) => advertisementEdit ? state.saveHouse.savedHouses.some((item) => item.id === String(advertisementEdit.original_advertisement_id)) : false)

  if (isLoading) return (
    <ClientLayout title="در حال بارگذاری...">
      <main className="pt-[70px] flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="inline-block">
            <InlineLoading />
          </div>
          <p className="mt-2">در حال بارگذاری جزییات ویرایش آگهی...</p>
        </div>
      </main>
    </ClientLayout>
  )
  
  if (error || !advertisementEdit) return (
    <ClientLayout title="خطا">
      <main className="pt-[70px] flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">خطا در بارگذاری اطلاعات</div>
          <Button onClick={() => push('/admin/advertisements')} className="bg-[#2C3E50] text-white">
            بازگشت به لیست آگهی‌ها
          </Button>
        </div>
      </main>
    </ClientLayout>
  )

  // Determine edit status text and color
  const getEditStatusText = (status: number) => {
    switch(status) {
      case 0: return { text: 'در انتظار تایید', color: 'text-yellow-600' };
      case 1: return { text: 'تایید شده', color: 'text-green-600' };
      case 2: return { text: 'رد شده', color: 'text-red-600' };
      default: return { text: 'نامشخص', color: 'text-gray-600' };
    }
  }
  
  const editStatus = getEditStatusText(advertisementEdit.edit_status);
  const isEditable = advertisementEdit.edit_status === 0; // Only allow editing if status is pending

  // ? Render(s)
  return (
    <>
      <ClientLayout title={`جزئیات ویرایش آگهی - ${advertisementEdit.title}`}>
        <main className="pt-[70px] relative">
          <div>
            {/* Cast advertisementEdit to any to avoid type errors with HousingSliders component */}
            <HousingSliders data={advertisementEdit as any} />
          </div>
          <div className="absolute w-full top-[290px] z-10 pb-[100px]">
            <div className="bg-white mx-4 border rounded-2xl border-[#E3E3E7]">
              <div className="flex justify-between items-center p-4">
                <div className="flex items-center gap-2">
                  <LocationTitleIcon width="16px" height="16px" /> 
                  <div className="text-xs">{advertisementEdit.title}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${editStatus.color} bg-opacity-20`}>
                    {editStatus.text}
                  </span>
                </div>
                <div className="flex gap-4">
                  <div
                    id="saveHouse"
                    className={`rounded-full cursor-pointer flex-center ${isSaved ? 'text-[#D52133]' : 'text-white'}`}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      dispatch(toggleSaveHouse({ 
                        id: String(advertisementEdit.original_advertisement_id), 
                        savedTime: new Date().toISOString() 
                      }));
                    }}
                  >
                    <HearthIcon width="19px" height="17px" />
                  </div>

                  <div id="shareHouse" className={`rounded-full cursor-pointer flex-center`} onClick={handleShare}>
                    <IoShareSocialOutline className="text-xl" />
                  </div>
                </div>
              </div>
              
              {/* Additional Edit Information */}
              <div className="bg-yellow-50 p-3 mx-4 mb-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  آگهی اصلی شناسه: {advertisementEdit.original_advertisement_id}
                </p>
                {advertisementEdit.admin_notes && (
                  <p className="text-sm text-gray-700 mt-2">
                    <span className="font-bold">یادداشت ادمین:</span> {advertisementEdit.admin_notes}
                  </p>
                )}
                {advertisementEdit.reviewed_by && (
                  <p className="text-xs text-gray-600 mt-2">
                    بررسی شده توسط: {advertisementEdit.reviewed_by.username || 'ادمین'} در {advertisementEdit.reviewed_at ? timeAgo(advertisementEdit.reviewed_at, true) : 'زمان نامشخص'}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-2 p-4 pt-0 gap-3.5 gap-x-20">
                {advertisementEdit.attributes
                  .filter((item) => item.type === 'text')
                  .slice(0, 4)
                  .map((feature) => (
                    <div 
                      key={feature.id} 
                      className="flex gap-0.5 font-medium farsi-digits whitespace-nowrap ont-bold text-[#7A7A7A] text-xs"
                    >
                      <img className="w-[16px]" src={`/static/grid-222.png`} alt="" />
                      <div className="font-bold text-[#7A7A7A] text-xs">
                        {feature.name}: {' '}
                        {typeof feature.value === 'object' && feature.value !== null 
                          ? String(feature.value.value) 
                          : typeof feature.value === 'boolean' 
                            ? (feature.value ? 'دارد' : 'ندارد') 
                            : String(feature.value)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <div className="bg-white mx-4 border rounded-2xl border-[#E3E3E7] mt-3">
                <div>
                  <div className="flex items-center gap-2 p-4 pb-0">
                    <div className="bg-[#F0F3F6] rounded-[10px] p-1 text-[#2C3E50]">
                      <MoneyMd2Icon width="24px" height="24px" />
                    </div>
                    {advertisementEdit.price && advertisementEdit.price.amount > 0 ? (
                      <div className="text-[15px] font-medium">قیمت فروش</div>
                    ) : (
                      advertisementEdit.price &&
                      (advertisementEdit.price.deposit > 0 || advertisementEdit.price.rent > 0) && (
                        <div className="text-[15px] font-medium">ودیعه و اجاره</div>
                      )
                    )}
                  </div>
                  <hr className="mt-2 mb-4" />
                  <div className="px-4 space-y-3.5">
                    <div id="map_features" className="space-y-3.5">
                      {advertisementEdit.price && (
                        <>
                          {advertisementEdit.price.amount > 0 && (
                            <div className="flex justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                                <div className="text-[#7A7A7A] text-sm font-normal">قیمت فروش</div>
                              </div>
                              <div className="farsi-digits text-[#7A7A7A] text-sm font-medium">
                                {formatPriceWithSuffix(advertisementEdit.price.amount)}
                                {advertisementEdit.price.is_negotiable && <span className="mr-1">قابل مذاکره</span>}
                              </div>
                            </div>
                          )}

                          {advertisementEdit.price.deposit > 0 && (
                            <div className="flex justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                                <div className="text-[#7A7A7A] text-sm font-normal">قیمت ودیعه</div>
                              </div>
                              <div className="farsi-digits text-[#7A7A7A] text-sm font-medium">
                                {formatPriceWithSuffix(advertisementEdit.price.deposit)}
                              </div>
                            </div>
                          )}

                          {advertisementEdit.price.rent > 0 && (
                            <div className="flex justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                                <div className="text-[#7A7A7A] text-sm font-normal">قیمت اجاره</div>
                              </div>
                              <div className="farsi-digits text-[#7A7A7A] text-sm font-medium">
                                {formatPriceWithSuffix(advertisementEdit.price.rent)}
                              </div>
                            </div>
                          )}

                          {advertisementEdit.price.discount_amount > 0 && (
                            <div className="flex justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                                <div className="text-[#7A7A7A] text-sm font-normal">قیمت تخفیف</div>
                              </div>
                              <div className="farsi-digits text-[#7A7A7A] text-sm font-medium">
                                {formatPriceWithSuffix(advertisementEdit.price.discount_amount)}
                              </div>
                            </div>
                          )}

                          {advertisementEdit.price.price_per_unit > 0 && (
                            <div className="flex justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                                <div className="text-[#7A7A7A] text-sm font-normal">
                                  قیمت هر {advertisementEdit.price.unit || 'متر مربع'}
                                </div>
                              </div>
                              <div className="farsi-digits text-[#7A7A7A] text-sm font-medium">
                                {formatPriceWithSuffix(advertisementEdit.price.price_per_unit)}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Still show profit percentages from attributes if they exist */}
                      {advertisementEdit.attributes
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
                          {timeAgo(advertisementEdit.created_at, true)}،
                          {typeof advertisementEdit.full_address.city === 'object' &&
                          advertisementEdit.full_address.city !== null &&
                          'name' in advertisementEdit.full_address.city
                            ? (advertisementEdit.full_address.city as { name: string }).name
                            : typeof advertisementEdit.full_address.city === 'string'
                            ? advertisementEdit.full_address.city
                            : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex">
                      <div className="flex items-center gap-2.5">
                        <div className="w-[10.67px] h-[10.67px] bg-[#1A1E25] rounded-full" />
                        <div className="text-[#7A7A7A] text-[13px] font-normal flex items-center">
                          شناسه آگهی اصلی :{' '}
                          <div className="text-[#7A7A7A] text-[13px] farsi-digits">
                            {advertisementEdit.original_advertisement_id ?? 'ندارد'}
                          </div>
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

              <div className="bg-white mx-4 border rounded-2xl border-[#E3E3E7] mt-3 pb-4">
                <div className="flex items-center gap-2 p-4 pb-0">
                  <div className="bg-[#F0F3F6] rounded-[10px] p-1">
                    <CubeMd2Icon width="24px" height="24px" />
                  </div>
                  <div className="text-[15px] font-medium">ویژگی و امکانات</div>
                </div>
                <hr className="mt-2 mb-4" />
                <div className="grid grid-cols-2 px-4 gap-y-5 gap-x-4 xxs:gap-x-10">
                  {advertisementEdit.attributes
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
                <div className="pt-4 text-sm">{advertisementEdit.description}</div>
              </div>

              <div className="bg-white p-4 flex justify-between gap-1">
                <div className="bg-[#FCFCFC] rounded-lg h-[68px] w-[105px] space-y-3.5 py-2 pt-2.5">
                  <div className="flex justify-center items-center gap-1">
                    <ClockSmIcon width="17px" height="16px" />
                    <div className="text-[#7A7A7A] text-xs">زمان ثبت ویرایش</div>
                  </div>
                  <div className="text-xs text-center">{timeAgo(advertisementEdit.created_at, true)}</div>
                </div>

                <div className="bg-[#FCFCFC] rounded-lg h-[68px] w-[105px] space-y-3.5 py-2 pt-2.5">
                  <div className="flex justify-center items-center gap-1">
                    <div className="text-[#7A7A7A] text-xs">دسته بندی</div>
                  </div>
                  <div className="text-xs text-center truncate px-2">{advertisementEdit.category.name}</div>
                </div>

                <div className="bg-[#FCFCFC] rounded-lg h-[68px] w-[105px] space-y-3.5 py-2 pt-2.5">
                  <div className="flex justify-center items-center gap-1">
                    <div className="text-[#7A7A7A] text-xs">وضعیت</div>
                  </div>
                  <div className={`text-xs text-center ${editStatus.color}`}>{editStatus.text}</div>
                </div>
              </div>

              <div className="my-4 px-4">
                <h1 className="font-medium">موقعیت</h1>
                {/* Cast advertisementEdit to any to avoid type errors with LocationMap component */}
                <LocationMap isAdmin housingData={advertisementEdit as any} />
              </div>
              <div className="bg-white mx-4 border rounded-2xl border-[#E3E3E7] mt-3 pb-4">
                <div className="flex items-center gap-2 p-4 pb-0">
                  <div className="bg-[#F0F3F6] rounded-[10px] p-1">
                    <LocationMd2Icon width="20px" height="20px" />
                  </div>
                  <div className="flex gap-2">
                    <div className="text-xs text-[#7A7A7A] font-medium whitespace-nowrap">آدرس دقیق:</div>
                    <div className="text-[#1A1E25] text-xs">{advertisementEdit.full_address.address || 'آدرس ثبت نشده'}</div>
                  </div>
                </div>
              </div>

              {/* Buttons for approve/reject only shown if edit status is pending (0) */}
              {isEditable && (
                <div className="mx-4 mt-4 relative flex gap-2">
                  <button
                    onClick={handleApproveEdit}
                    disabled={isProcessing}
                    className="bg-[#2C3E50] hover:bg-[#22303e] w-full text-white h-[40px] rounded-lg text-[12.5px] flex justify-center items-center"
                  >
                    {isProcessing ? <InlineLoading /> : 'تایید ویرایش'}
                  </button>
                  <button
                    onClick={handleRejectEdit}
                    disabled={isRejectProcessing}
                    className="border border-[#D52133] bg-white hover:bg-[#FFF0F2] w-full text-[#D52133] h-[40px] rounded-lg text-[12.5px] flex justify-center items-center"
                  >
                    {isRejectProcessing ? <InlineLoading /> : 'رد ویرایش'}
                  </button>
                </div>
              )}
              
              {/* Back button */}
              <div className="mx-4 mt-4">
                <button
                  onClick={() => push('/admin/advertisements')}
                  className="bg-[#F0F3F6] hover:bg-[#DDE2E6] w-full text-[#2C3E50] h-[40px] rounded-lg text-[12.5px] border border-[#DDE2E6]"
                >
                  بازگشت به لیست آگهی‌ها
                </button>
              </div>
            </div>
          </div>
        </main>
      </ClientLayout>
    </>
  )
}

export default SingleAdminAdvEdit
