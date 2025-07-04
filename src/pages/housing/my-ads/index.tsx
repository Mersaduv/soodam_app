import { ClientLayout } from '@/components/layouts'
import { HousingSkeleton } from '@/components/skeleton'
import { Button, InlineLoading, LoadingScreen, Modal } from '@/components/ui'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { ArchiveTickIcon, ArrowLeftIcon, CircleMdIcon, InfoCircleMdIcon, LocationSmIcon, TrashGrayIcon } from '@/icons'
import { useGetHousingQuery } from '@/services'
import { useDeleteAdvMutation, useGetMyAdvQuery } from '@/services/productionBaseApi'
import { setIsSuccess } from '@/store'
import { Housing } from '@/types'
import { formatPriceLoc, getProvinceFromCoordinates, NEXT_PUBLIC_API_URL } from '@/utils'
import { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { BiDotsVerticalRounded } from 'react-icons/bi'

const MyAds: NextPage = () => {
  // ? Assets
  const { query, push } = useRouter()
  const { isSuccess } = useAppSelector((state) => state.statesData)
  const dispatch = useAppDispatch()
  const { data: housingData, isLoading } = useGetMyAdvQuery()
  const [deleteAdv] = useDeleteAdvMutation()
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
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

  const handleDeleteAd = (id: string) => {
    setSelectedAdId(id)
    setIsDeleteModalOpen(true)
    setOpenMenuId(null)
  }

  const confirmDeleteAd = async () => {
    if (selectedAdId) {
      setIsProcessing(true)
      try {
        await deleteAdv({ id: selectedAdId }).unwrap()
        // After successful deletion, close the modal
        setIsDeleteModalOpen(false)
      } catch (error) {
        console.error('Error deleting ad:', error)
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setSelectedAdId(null)
  }

  const userType = localStorage.getItem('userType') ? localStorage.getItem('userType')! : null

  return (
    <>
      <ClientLayout title="آگهی های من">
        <main className="py-[87px] pb-[200px] relative">
          {/* Delete Confirmation Modal */}
          <Modal isShow={isDeleteModalOpen} onClose={closeDeleteModal} effect="ease-out">
            <Modal.Content
              onClose={closeDeleteModal}
              className="flex h-full flex-col gap-y-5 bg-white p-4 rounded-2xl mx-4"
            >
              <Modal.Header onClose={closeDeleteModal}>
                <div className="text-base font-medium">حذف آگهی</div>
              </Modal.Header>
              <Modal.Body>
                <div className="space-y-4">
                  <div className="flex justify-center items-center gap-2 w-full mb-3">
                    <div>
                      <InfoCircleMdIcon width="18px" height="18px" />
                    </div>
                    <span className="text-[#5A5A5A] font-normal">آیا از حذف این آگهی مطمئنی؟</span>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <button
                    onClick={confirmDeleteAd}
                    disabled={isProcessing}
                    className="border border-[#D52133] text-[#D52133] hover:bg-[#FFF0F2] w-full h-[40px] rounded-lg text-[12.5px]"
                  >
                    {isProcessing ? <InlineLoading /> : 'حذف آگهی'}
                  </button>
                  <button
                    onClick={closeDeleteModal}
                    className="bg-[#F0F3F6] hover:bg-[#DDE2E6] w-full text-[#2C3E50] h-[40px] rounded-lg text-[12.5px] border border-[#DDE2E6]"
                  >
                    انصراف
                  </button>
                </div>
              </Modal.Body>
            </Modal.Content>
          </Modal>

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
              <div className="space-y-4">
                {housingData &&
                  housingData?.items.length > 0 &&
                  [...housingData?.items]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((housing) => {
                      return (
                        <div
                          key={housing.id}
                          className="bg-white rounded-lg p-4 pb-3 shadow w-full"
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
                                    src={`${
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
                                <div className="flex justify-between">
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
                                  <div className="rotate-90">
                                    <ArrowLeftIcon width="26px" height="26px" />
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

                            <div className="w-full text-right text-[#7A7A7A] text-sm flex justify-start gap-6">
                              {housing.highlight_attributes &&
                                housing.highlight_attributes.length > 0 &&
                                housing.highlight_attributes.map((feature) => {
                                  return (
                                    <div
                                      key={feature.id}
                                      className="flex-center gap-0.5 text-xs font-medium farsi-digits whitespace-nowrap"
                                    >
                                      {' '}
                                      <img className="w-[16px]" src={feature.icon} alt="" />{' '}
                                      {typeof feature.value === 'object' ? feature.value.value : feature.value}{' '}
                                      <span className="font-medium text-[#7A7A7A] text-xs">{feature.name}</span>
                                    </div>
                                  )
                                })}
                              {/* 
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
                              */}
                            </div>
                            <hr className="my-3" />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`text-sm font-medium ${
                                    housing.status === 0
                                      ? 'text-yellow-600'
                                      : housing.status === 1
                                      ? 'text-green-600'
                                      : housing.status === 2
                                      ? 'text-red-600'
                                      : ''
                                  }`}
                                >
                                  {housing.status === 0
                                    ? 'در انتظار تایید'
                                    : housing.status === 1
                                    ? 'تایید شده'
                                    : housing.status === 2
                                    ? 'رد شده'
                                    : 'نامشخص'}
                                </div>
                              </div>
                              <div className="relative">
                                <div
                                  className="rounded-full p-1 cursor-pointer hover:bg-gray-100 transition-all duration-500"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setOpenMenuId(openMenuId === housing.id ? null : housing.id)
                                  }}
                                >
                                  <BiDotsVerticalRounded className="text-2xl text-gray-500" />
                                </div>
                                {openMenuId === housing.id && (
                                  <>
                                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                    <div className="absolute left-0 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                                      <div className="py-1">
                                        <Link
                                          href={`/housing/ad/edit?id=${housing.id}`}
                                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          ویرایش آگهی
                                        </Link>
                                        <button
                                          className="block w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteAd(housing.id)
                                          }}
                                        >
                                          حذف آگهی
                                        </button>
                                      </div>
                                    </div>
                                  </>
                                )}
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
