import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { Button, InlineLoading, Modal } from '@/components/ui'
import AdminHeader from '@/components/shared/AdminHeader'
import { ConfirmDeleteModal } from '@/components/modals'
import { useDisclosure } from '@/hooks'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { showAlert } from '@/store'
import { useAppDispatch } from '@/hooks'
import { ArrowLeftIcon, InfoCircleMdIcon } from '@/icons'
import { toast } from 'react-toastify'
import axios from 'axios'

type AdminRequest = {
  id: number
  full_name: string
  phone_number: string
  email: string
  province: string
  city: string
  role_type: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  profile_image: string | null
  security_number?: string
}

const getRoleTypeText = (roleType: string): string => {
  switch (roleType) {
    case 'admin_city':
      return 'ادمین شهر'
    case 'admin_news':
      return 'ادمین خبر'
    case 'admin_ad':
      return 'ادمین آگهی'
    case 'marketer':
      return 'بازاریاب'
    default:
      return 'ادمین'
  }
}

const getFormattedDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  // Convert to Persian date format (simplified version)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

// Helper function to safely save to localStorage
const safeSetItem = (key: string, value: string): boolean => {
  try {
    // Clear localStorage if it's getting too large (over 4MB)
    if (JSON.stringify(localStorage).length > 4000000) {
      localStorage.removeItem('adminRequests')
    }
    localStorage.setItem(key, value)
    return true
  } catch (e) {
    console.error('LocalStorage error:', e)
    alert('حافظه محلی پر شده است. برخی داده‌های قدیمی پاک می‌شوند.')
    try {
      // Try again after clearing
      localStorage.removeItem('adminRequests')
      localStorage.setItem(key, value)
      return true
    } catch (e2) {
      console.error('Failed after cleanup:', e2)
      return false
    }
  }
}

const AdminRequestsPage = () => {
  const [requests, setRequests] = useState<AdminRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<AdminRequest | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending')
  const [rejectModalOpen, rejectModalHandlers] = useDisclosure()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<number | null>(null)
  const [isPaginationLoading, setIsPaginationLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalType, setModalType] = useState<'approve' | 'reject'>('approve')
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null)
  const [isShow, modalHandlers] = useDisclosure()
  const [isProcessing, setIsProcessing] = useState(false)
  const dispatch = useAppDispatch()

  const fetchRequests = () => {
    try {
      setIsLoading(true)
      // Load from localStorage instead of sessionStorage and API
      let storedRequests: AdminRequest[] = []
      try {
        storedRequests = JSON.parse(localStorage.getItem('adminRequests') || '[]')
      } catch (e) {
        console.error('Error parsing stored requests:', e)
        storedRequests = []
      }

      // Check if we have no items, create some mock data for testing
      if (storedRequests.length === 0) {
        // Sample base64 image (a very small placeholder - in reality would be larger)
        const sampleBase64Image =
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

        const mockRequests: AdminRequest[] = [
          {
            id: 2,
            full_name: 'محمد شادل',
            phone_number: '09356716523',
            email: 'mohammad@example.com',
            province: 'اصفهان',
            city: 'اصفهان',
            role_type: 'admin_news',
            status: 'pending',
            created_at: new Date(2023, 7, 13).toISOString(),
            profile_image: sampleBase64Image,
          },
          {
            id: 3,
            full_name: 'نقی حسینی',
            phone_number: '09128116523',
            email: 'naghi@example.com',
            province: 'مازندران',
            city: 'ساری',
            role_type: 'marketer',
            status: 'rejected',
            created_at: new Date(2023, 7, 14).toISOString(),
            profile_image: null,
          },
        ]
        safeSetItem('adminRequests', JSON.stringify(mockRequests))
        setRequests(mockRequests)
      } else {
        setRequests(storedRequests)
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setIsLoading(false)
      setTimeout(() => setIsPaginationLoading(false), 300)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleApprove = (id: number) => {
    try {
      // Get current requests
      const currentRequests = [...requests]

      // Update the request status
      const updatedRequests = currentRequests.map((request) =>
        request.id === id ? { ...request, status: 'approved' as 'approved' } : request
      )

      // Save back to localStorage
      if (safeSetItem('adminRequests', JSON.stringify(updatedRequests))) {
        setRequests(updatedRequests)
        dispatch(showAlert({ title: 'درخواست با موفقیت تایید شد', status: 'success' }))
      } else {
        dispatch(showAlert({ title: 'خطا در تایید درخواست', status: 'error' }))
      }
    } catch (error) {
      console.error('Error approving request:', error)
      dispatch(showAlert({ title: 'خطا در تایید درخواست', status: 'error' }))
    }
  }

  const handleReject = () => {
    if (!selectedRequest) return

    try {
      // Get current requests
      const currentRequests = [...requests]

      // Update the request status
      const updatedRequests = currentRequests.map((request) =>
        request.id === selectedRequest.id ? { ...request, status: 'rejected' as 'rejected' } : request
      )

      // Save back to localStorage
      if (safeSetItem('adminRequests', JSON.stringify(updatedRequests))) {
        setRequests(updatedRequests)
        dispatch(showAlert({ title: 'درخواست با موفقیت رد شد', status: 'success' }))
        rejectModalHandlers.close()
      } else {
        dispatch(showAlert({ title: 'خطا در رد درخواست', status: 'error' }))
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      dispatch(showAlert({ title: 'خطا در رد درخواست', status: 'error' }))
    }
  }

  const handleOpenRejectModal = (request: AdminRequest) => {
    setSelectedRequest(request)
    rejectModalHandlers.open()
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Handle filter click
  const handleFilterClick = (status: number | null) => {
    setIsPaginationLoading(true)
    setFilterStatus(status)
    setCurrentPage(1) // Reset to first page when changing filters

    // Filter based on status
    if (status === 0) {
      setActiveTab('pending')
    } else if (status === 1) {
      setActiveTab('approved')
    } else {
      setActiveTab('pending') // Default to pending for other cases
    }
  }

  const handleModalClose = (): void => {
    modalHandlers.close()
    setIsProcessing(false)
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

  const handleApproveAd = async (): Promise<void> => {
    try {
      // Get current requests
      const currentRequests = [...requests]

      // Update the request status
      const updatedRequests = currentRequests.map((request) =>
        request.id === selectedRequest.id ? { ...request, status: 'approved' as 'approved' } : request
      )

      // Save back to localStorage
      if (safeSetItem('adminRequests', JSON.stringify(updatedRequests))) {
        setRequests(updatedRequests)
        dispatch(showAlert({ title: 'درخواست با موفقیت تایید شد', status: 'success' }))
      } else {
        dispatch(showAlert({ title: 'خطا در تایید درخواست', status: 'error' }))
      }
    } catch (error) {
      console.error('Error approving request:', error)
      dispatch(showAlert({ title: 'خطا در تایید درخواست', status: 'error' }))
    }
  }

  const handleRejectAd = async (): Promise<void> => {
    if (!selectedRequest) return

    try {
      // Get current requests
      const currentRequests = [...requests]

      // Update the request status
      const updatedRequests = currentRequests.map((request) =>
        request.id === selectedRequest.id ? { ...request, status: 'rejected' as 'rejected' } : request
      )

      // Save back to localStorage
      if (safeSetItem('adminRequests', JSON.stringify(updatedRequests))) {
        setRequests(updatedRequests)
        dispatch(showAlert({ title: 'درخواست با موفقیت رد شد', status: 'success' }))
        rejectModalHandlers.close()
      } else {
        dispatch(showAlert({ title: 'خطا در رد درخواست', status: 'error' }))
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      dispatch(showAlert({ title: 'خطا در رد درخواست', status: 'error' }))
    }
  }

  // Filter requests by search term and status
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      searchTerm === '' ||
      request.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.phone_number.includes(searchTerm) ||
      getRoleTypeText(request.role_type).toLowerCase().includes(searchTerm.toLowerCase())

    let matchesStatus = true

    if (filterStatus === 0) {
      matchesStatus = request.status === 'pending'
    } else if (filterStatus === 1) {
      matchesStatus = request.status === 'approved'
    } else if (filterStatus === 2) {
      matchesStatus = request.status === 'rejected'
    }

    return matchesSearch && matchesStatus
  })

  return (
    <>
      <Modal isShow={isShow} onClose={handleModalClose} effect="ease-out" isAdmin>
        <Modal.Content onClose={handleModalClose} className="flex h-full flex-col gap-y-5 bg-white p-4 rounded-2xl">
          <Modal.Header onClose={handleModalClose}>
            <div className="text-base font-medium">{modalType === 'approve' ? 'تایید درخواست' : 'رد درخواست'}</div>
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div className="flex justify-center items-center gap-2 w-full mb-3">
                <div>
                  <InfoCircleMdIcon width="18px" height="18px" />
                </div>
                <span className="text-[#5A5A5A] font-normal">
                  {modalType === 'approve' ? 'آیا از تایید این درخواست مطمئنی؟' : 'آیا از رد این درخواست مطمئنی؟'}
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
                    {isProcessing ? <InlineLoading /> : 'تایید درخواست'}
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
                    {isProcessing ? <InlineLoading /> : 'رد درخواست'}
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
      <Head>
        <title>سودم | درخواست های ثبت نام</title>
      </Head>

      <DashboardLayout showDetail title="ثبت نام ها">
        <main className="py-[87px] relative">
          <div className="px-4 mb-5 space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="جستجو بر اساس نام، شماره یا نقش.."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full appearance-none focus:border-none focus:outline-1 focus:outline-[#3c6893] p-4 h-[48px] bg-white rounded-[10px] border border-gray-200"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex overflow-x-auto overflow-hidden gap-2 pb-2">
              <button
                onClick={() => handleFilterClick(null)}
                className={`whitespace-nowrap h-[40px] items-center flex px-5 py-3 rounded-full ${
                  filterStatus === null ? 'bg-[#2C3E50] text-white' : 'bg-white text-[#7A7A7A] border border-gray-200'
                }`}
              >
                فیلترها
              </button>
              <button
                onClick={() => handleFilterClick(1)}
                className={`whitespace-nowrap h-[40px] items-center flex px-5 py-3 rounded-full ${
                  filterStatus === 1 ? 'bg-[#2C3E50] text-white' : 'bg-white text-[#7A7A7A] border border-gray-200'
                }`}
              >
                تایید شده
              </button>
              <button
                onClick={() => handleFilterClick(0)}
                className={`whitespace-nowrap h-[40px] items-center flex px-5 py-3 rounded-full ${
                  filterStatus === 0 ? 'bg-[#2C3E50] text-white' : 'bg-white text-[#7A7A7A] border border-gray-200'
                }`}
              >
                در انتظار تایید
              </button>

              <button
                onClick={() => handleFilterClick(2)}
                className={`whitespace-nowrap h-[40px] items-center flex px-5 py-3 rounded-full ${
                  filterStatus === 2 ? 'bg-[#2C3E50] text-white' : 'bg-white text-[#7A7A7A] border border-gray-200'
                }`}
              >
                تایید نشده ها
              </button>
            </div>

            {/* Request cards */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="bg-white p-10 rounded-xl flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2C3E50]"></div>
                </div>
              ) : filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <div key={request.id} className="bg-white p-4 rounded-[16px] border border-[#E3E3E7]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-200 ml-3">
                          {request.profile_image ? (
                            <div className="w-full h-full relative">
                              <Image
                                src={request.profile_image}
                                alt={request.full_name}
                                layout="fill"
                                objectFit="cover"
                                unoptimized={true} // Required for base64 images
                              />
                            </div>
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{request.full_name}</h3>
                          <div
                            className={`text-xs font-semibold py-0.5 rounded-full inline-block ${
                              request.status === 'pending'
                                ? ' text-[#F0C330]'
                                : request.status === 'approved'
                                ? ' text-green-500'
                                : ' text-red-500'
                            }`}
                          >
                            {request.status === 'pending'
                              ? 'در انتظار تایید'
                              : request.status === 'approved'
                              ? 'تایید شده'
                              : 'رد شده'}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 pb-4">
                        <div className="rotate-90 -ml-1">
                          <ArrowLeftIcon width="30px" height="30px" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-5">
                      <div className="flex flex-col items-center gap-1">
                        <p className="text-xs font-medium text-center text-gray-500">تاریخ درخواست</p>
                        <div className="text-sm text-gray-800 farsi-digits text-center">
                          {getFormattedDate(request.created_at)}
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <p className="text-xs text-gray-500">نقش درخواستی</p>
                        <p className="text-sm">{getRoleTypeText(request.role_type)}</p>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <p className="text-xs text-gray-500">شماره تماس</p>
                        <p className="text-sm farsi-digits">{request.phone_number}</p>
                      </div>
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => openApproveModal(String(request.id))}
                          className="bg-[#2C3E50] hover:bg-[#22303e] w-full text-white h-[40px] rounded-lg text-[12.5px] flex-1"
                        >
                          تایید درخواست
                        </button>
                        <button
                          onClick={() => openRejectModal(String(request.id))}
                          className="border border-[#D52133] text-[#D52133] hover:bg-[#FFF0F2] w-full h-[40px] rounded-lg text-[12.5px] flex-1"
                        >
                          رد درخواست
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white p-10 rounded-xl flex flex-col items-center justify-center text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-gray-300 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-gray-500">هیچ درخواستی یافت نشد</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </DashboardLayout>
      {/* Reject confirmation modal */}
      <ConfirmDeleteModal
        isShow={rejectModalOpen}
        onClose={rejectModalHandlers.close}
        onConfirm={handleReject}
        onCancel={rejectModalHandlers.close}
        title="رد درخواست"
        isLoading={false}
      />
    </>
  )
}

export default AdminRequestsPage
