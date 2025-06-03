import { ClientLayout, DashboardLayout } from '@/components/layouts'
import { HousingSkeleton } from '@/components/skeleton'
import { Button, InlineLoading, LoadingScreen, Modal } from '@/components/ui'
import { useAppDispatch, useAppSelector, useDisclosure } from '@/hooks'
import {
  ArchiveTickIcon,
  ArrowLeftIcon,
  CircleMdIcon,
  InfoCircleIcon,
  InfoCircleMdIcon,
  LocationSmIcon,
  TrashGrayIcon,
} from '@/icons'
import { useGetHousingQuery } from '@/services'
import { useGetMyAdvQuery, useGetAdvByAdminQuery } from '@/services/productionBaseApi'
import { setIsSuccess } from '@/store'
import { AdminAdvertisementResponse, PaginationMetadata } from '@/types'
import { formatPriceLoc, getProvinceFromCoordinates, NEXT_PUBLIC_API_URL } from '@/utils'
import { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { IoIosArrowBack } from 'react-icons/io'
import axios from 'axios'
import { toast } from 'react-toastify'
import { IoSearchOutline } from 'react-icons/io5'

const Advertisements: NextPage = () => {
  // ? Assets
  const { query, push } = useRouter()
  const [isShow, modalHandlers] = useDisclosure()
  const { isSuccess } = useAppSelector((state) => state.statesData)
  const dispatch = useAppDispatch()

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<number | null>(null) // null: all, 1: approved, 0: not approved

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(1)
  const [paginationMeta, setPaginationMeta] = useState<PaginationMetadata | null>(null)
  const [isPaginationLoading, setIsPaginationLoading] = useState(false)

  // Query params for the API
  const queryParams = {
    page: currentPage,
    limit: pageSize,
    ...(searchQuery && { search: searchQuery }),
    ...(filterStatus !== null && { status: filterStatus }),
  }

  const { data: housingData, isLoading, refetch } = useGetAdvByAdminQuery(queryParams)
  const [modalType, setModalType] = useState<'approve' | 'reject'>('approve')
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Update pagination metadata when data changes
  useEffect(() => {
    if (housingData?.metadata) {
      setPaginationMeta(housingData.metadata)
      setIsPaginationLoading(false)
    }
  }, [housingData])

  useEffect(() => {
    if (isSuccess) {
      dispatch(setIsSuccess(false))
    }
  }, [isSuccess, dispatch])

  const handleClearAds = () => {
    localStorage.removeItem('addAdv')
  }

  const handleModalClose = (): void => {
    modalHandlers.close()
    setIsProcessing(false)
  }

  const handleApproveAd = async (): Promise<void> => {
    if (!selectedAdId) return

    setIsProcessing(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `/api/admin/advertisement/${selectedAdId}/approve`,
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
    if (!selectedAdId) return

    setIsProcessing(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `/api/admin/advertisement/${selectedAdId}/reject`,
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
      setIsProcessing(false)
      modalHandlers.close()
    }
  }

  const openApproveModal = (id: string): void => {
    setSelectedAdId(id)
    setModalType('approve')
    modalHandlers.open()
  }

  const openRejectModal = (id: string): void => {
    setSelectedAdId(id)
    setModalType('reject')
    modalHandlers.open()
  }

  const role = localStorage.getItem('role') ? localStorage.getItem('role')! : null

  // Handle page change
  const handlePageChange = (page: number) => {
    setIsPaginationLoading(true)
    setCurrentPage(page)
  }

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setIsPaginationLoading(true)
    setPageSize(size)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPaginationLoading(true)
    setSearchQuery(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  // Handle filter click
  const handleFilterClick = (status: number | null) => {
    setIsPaginationLoading(true)
    setFilterStatus(status)
    setCurrentPage(1) // Reset to first page when changing filters
  }

  return (
    <>
      <Modal isShow={isShow} onClose={handleModalClose} effect="ease-out" isAdmin>
        <Modal.Content onClose={handleModalClose} className="flex h-full flex-col gap-y-5 bg-white p-4 rounded-2xl">
          <Modal.Header onClose={handleModalClose}>
            <div className="text-base font-medium">{modalType === 'approve' ? 'تایید آگهی' : 'رد آگهی'}</div>
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div className="flex justify-center items-center gap-2 w-full mb-3">
                <div>
                  <InfoCircleMdIcon width="18px" height="18px" />
                </div>
                <span className="text-[#5A5A5A] font-normal">
                  {modalType === 'approve' ? 'آیا از تایید این آگهی مطمئنی؟' : 'آیا از رد این آگهی مطمئنی؟'}
                </span>
              </div>
            </div>
            <div className="flex gap-2.5">
              {modalType === 'approve' ? (
                <>
                  <button
                    onClick={handleApproveAd}
                    disabled={isProcessing}
                    className="bg-[#2C3E50] hover:bg-[#22303e] w-full text-white h-[40px] rounded-lg text-[12.5px] flex justify-center items-center"
                  >
                    {isProcessing ? <InlineLoading /> : 'تایید آگهی'}
                  </button>
                  <button
                    onClick={handleModalClose}
                    className="bg-[#F0F3F6] hover:bg-[#DDE2E6] w-full text-[#2C3E50] h-[40px] rounded-lg text-[12.5px] border border-[#DDE2E6]"
                  >
                    بازگشت
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleRejectAd}
                    disabled={isProcessing}
                    className="border border-[#D52133] text-[#D52133] hover:bg-[#FFF0F2] w-full h-[40px] rounded-lg text-[12.5px]"
                  >
                    {isProcessing ? <InlineLoading /> : 'رد آگهی'}
                  </button>
                  <button
                    onClick={handleModalClose}
                    className="bg-[#F0F3F6] hover:bg-[#DDE2E6] w-full text-[#2C3E50] h-[40px] rounded-lg text-[12.5px] border border-[#DDE2E6]"
                  >
                    بازگشت
                  </button>
                </>
              )}
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <DashboardLayout showDetail title="آگهی ها">
        <main className="py-[87px] relative">
          <div className="px-4 mb-5 space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="برای جستجو تایپ کنید..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full appearance-none focus:border-none focus:outline-1 focus:outline-[#3c6893] p-4 h-[48px] bg-white rounded-[10px] border border-gray-200"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex overflow-x-auto gap-2 pb-2">
              <button
                onClick={() => handleFilterClick(null)}
                className={`whitespace-nowrap h-[40px] items-center flex px-5 py-3 rounded-full ${
                  filterStatus === null ? 'bg-[#2C3E50] text-white' : 'bg-white text-[#7A7A7A] border border-gray-200'
                }`}
              >
                فیلتر ها
              </button>
              <button
                onClick={() => handleFilterClick(1)}
                className={`whitespace-nowrap h-[40px] items-center flex px-5 py-3 rounded-full ${
                  filterStatus === 1 ? 'bg-[#2C3E50] text-white' : 'bg-white text-[#7A7A7A] border border-gray-200'
                }`}
              >
                تایید شده ها
              </button>
              <button
                onClick={() => handleFilterClick(0)}
                className={`whitespace-nowrap h-[40px] items-center flex px-5 py-3 rounded-full ${
                  filterStatus === 0 ? 'bg-[#2C3E50] text-white' : 'bg-white text-[#7A7A7A] border border-gray-200'
                }`}
              >
                تایید نشده ها
              </button>
            </div>
          </div>

          {isLoading || isPaginationLoading ? (
            <div className="flex justify-center items-center ">
              <HousingSkeleton />
            </div>
          ) : housingData && housingData.items.length == 0 ? (
            <div className="bg-white mx-4 border rounded-2xl border-[#E3E3E7] ">
              <div className="flex justify-center mt-8">
                <img className="w-[180px] h-[180px]" src="/static/Document_empty.png" alt="" />
              </div>
              <div className="mt-8 flex flex-col justify-center items-center gap-2">
                <h1 className="font-medium text-sm">تا اکنون آگهی به ثبت نرسیده.</h1>
              </div>
              <div className="mx-4 mt-8 mb-7 flex gap-3">
                <Button onClick={() => push('/housing/ad')} className="w-full bg-[#2C3E50] rounded-[10px] font-bold text-sm">
                  ثبت آگهی
                </Button>
              </div>
            </div>
          ) : (
            <div className="px-4">
              <div className="space-y-4">
                {housingData &&
                  housingData?.items.length > 0 &&
                  [...housingData?.items]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((housing) => {
                      return (
                        <div
                          key={housing.id}
                          className="bg-white rounded-2xl p-4 border w-full"
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

                            {/* Property Details */}
                            <div className="w-full flex gap-2.5">
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
                              <button
                                onClick={() => openApproveModal(String(housing.id))}
                                className="bg-[#2C3E50] hover:bg-[#22303e] w-full text-white h-[40px] rounded-lg text-[12.5px]"
                              >
                                تایید آگهی
                              </button>
                              <button
                                onClick={() => openRejectModal(String(housing.id))}
                                className="border border-[#D52133] text-[#D52133] hover:bg-[#FFF0F2] w-full h-[40px] rounded-lg text-[12.5px]"
                              >
                                رد آگهی
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
              </div>

              {/* Add pagination controls */}
              {paginationMeta && paginationMeta.total_pages > 1 && (
                <div className="mt-6 flex justify-center">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!paginationMeta.has_prev}
                      className={`px-3 py-1 rounded-md ${
                        !paginationMeta.has_prev
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-[#2C3E50] text-white hover:bg-[#22303e]'
                      }`}
                    >
                      قبلی
                    </button>

                    <div className="flex gap-2">
                      {Array.from({ length: paginationMeta.total_pages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded-md ${
                            currentPage === page
                              ? 'bg-[#2C3E50] text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!paginationMeta.has_next}
                      className={`px-3 py-1 rounded-md ${
                        !paginationMeta.has_next
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-[#2C3E50] text-white hover:bg-[#22303e]'
                      }`}
                    >
                      بعدی
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </DashboardLayout>
    </>
  )
}

export default Advertisements
