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
import { useEffect, useState, useRef, useCallback } from 'react'
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
  const [filterStatus, setFilterStatus] = useState<number | null>(null) // null: all, 1: approved, 0: pending, 2: rejected
  const [showPendingEdits, setShowPendingEdits] = useState<boolean>(false)
  
  // Track last filter to detect changes
  const [activeFilter, setActiveFilter] = useState<string>('all')

  // Infinite scroll state
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [allHousingData, setAllHousingData] = useState<AdminAdvertisementResponse['items']>([])
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false)
  const observer = useRef<IntersectionObserver | null>(null)
  const lastHousingElementRef = useRef<HTMLDivElement | null>(null)
  
  // Page size fixed to 8 for infinite scroll
  const pageSize = 8

  // Query params for the API
  const queryParams = {
    page: currentPage,
    limit: pageSize,
    ...(searchQuery && { search: searchQuery }),
    ...(filterStatus !== null && { status: filterStatus }),
    ...(showPendingEdits && { has_pending_edit: 1 }),
  }

  const { data: housingData, isLoading, isFetching, refetch } = useGetAdvByAdminQuery(queryParams)
  const [modalType, setModalType] = useState<'approve' | 'reject'>('approve')
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Keep track of API request state
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Reset data when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    } else {
      // Force data reset on filter change
      setAllHousingData([])
    }
    setHasMore(true)
    setIsLoadingMore(false)
    setIsInitialLoad(true)
  }, [searchQuery, filterStatus, showPendingEdits])

  // Load data when API response is received
  useEffect(() => {
    if (housingData?.items) {
      let items = housingData.items;
      
      if (currentPage === 1) {
        // Reset data on first page load
        setAllHousingData(items)
      } else {
        // Append new data on pagination
        setAllHousingData(prev => [...prev, ...items])
      }
      
      // Update pagination state
      setHasMore(housingData.metadata?.has_next || false)
      setIsLoadingMore(false)
      setIsInitialLoad(false)
    }
  }, [housingData, currentPage])

  useEffect(() => {
    if (isSuccess) {
      dispatch(setIsSuccess(false))
    }
  }, [isSuccess, dispatch])

  // Intersection Observer setup for infinite scroll
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingMore || isLoading) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setIsLoadingMore(true);
        setCurrentPage(prevPage => prevPage + 1);
      }
    }, { threshold: 0.5 });
    
    if (node) observer.current.observe(node);
    lastHousingElementRef.current = node;
  }, [hasMore, isLoadingMore, isLoading]);

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

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Handle filter click
  const handleFilterClick = (status: number | null, pendingEdits: boolean = false) => {
    // Update active filter tracking
    let newFilter = pendingEdits ? 'pending_edits' : status === null ? 'all' : `status_${status}`;
    
    // If clicking the already active filter, do nothing
    if (newFilter === activeFilter) {
      return;
    }
    
    // Update active filter state
    setActiveFilter(newFilter);
    
    if (pendingEdits) {
      // If clicking on pendingEdits filter, toggle it and clear status filter
      setShowPendingEdits(true)
      setFilterStatus(null)
    } else {
      // If clicking on status filter, set it and clear pendingEdits filter
      setFilterStatus(status)
      setShowPendingEdits(false)
    }
  }

  // Sort advertisements by date (newest first)
  const sortedHousingData = [...allHousingData].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  // Determine if we should show loading state
  const showLoading = isLoading || isFetching || isInitialLoad || (allHousingData.length === 0 && !housingData);

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
                  filterStatus === null && !showPendingEdits ? 'bg-[#2C3E50] text-white' : 'bg-white text-[#7A7A7A] border border-gray-200'
                }`}
              >
                همه آگهی ها
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
                onClick={() => handleFilterClick(2)}
                className={`whitespace-nowrap h-[40px] items-center flex px-5 py-3 rounded-full ${
                  filterStatus === 2 ? 'bg-[#2C3E50] text-white' : 'bg-white text-[#7A7A7A] border border-gray-200'
                }`}
              >
                تایید نشده ها
              </button>
              <button
                onClick={() => handleFilterClick(null, true)}
                className={`whitespace-nowrap h-[40px] items-center flex px-5 py-3 rounded-full ${
                  showPendingEdits ? 'bg-[#2C3E50] text-white' : 'bg-white text-[#7A7A7A] border border-gray-200'
                }`}
              >
                ویرایش شده ها
              </button>
            </div>
          </div>

          {showLoading ? (
            <div className="flex flex-col gap-4 px-4">
              <HousingSkeleton />
              <HousingSkeleton />
            </div>
          ) : allHousingData.length === 0 ? (
            <div className="bg-white mx-4 border rounded-2xl border-[#E3E3E7] ">
              <div className="flex justify-center mt-8">
                <img className="w-[180px] h-[180px]" src="/static/Document_empty.png" alt="" />
              </div>
              <div className="mt-8 flex flex-col justify-center items-center gap-2">
                <h1 className="font-medium text-sm">
                  {showPendingEdits 
                    ? 'هیچ آگهی ویرایش شده‌ای در انتظار تایید نیست.' 
                    : filterStatus === 2
                      ? 'هیچ آگهی رد شده ای یافت نشد.'
                      : 'تا اکنون آگهی به ثبت نرسیده.'}
                </h1>
              </div>
                <div className="mx-4 mt-8 mb-7 flex gap-3">
                  <Button
                    onClick={() => push('/housing/ad')}
                    className="w-full bg-[#2C3E50] rounded-[10px] font-bold text-sm"
                  >
                    ثبت آگهی
                  </Button>
                </div>
             
            </div>
          ) : (
            <div className="px-4">
              <div className="space-y-4">
                {sortedHousingData.map((housing, index) => {
                  const isLastElement = index === sortedHousingData.length - 1;
                  
                  return (
                    <div
                      key={housing.id}
                      ref={isLastElement ? lastElementRef : null}
                      className="bg-white rounded-2xl p-4 border w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-col">
                        <Link href={`/admin/advertisements/${housing.id}`} className="flex gap-2">
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
                              {housing.has_pending_edit && (
                                <span className="mr-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                                  ویرایش شده
                                </span>
                              )}
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
                        <hr className="my-3" />
                        <div className="flex justify-end items-center gap-2">
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
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Loading indicator for infinite scroll */}
              {isLoadingMore && (
                <div className="flex justify-center items-center py-4">
                  <InlineLoading />
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
