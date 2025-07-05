import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { Button } from '@/components/ui'
import AdminHeader from '@/components/shared/AdminHeader'
import { ConfirmDeleteModal } from '@/components/modals'
import { useDisclosure } from '@/hooks'

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

const AdminRequestsPage = () => {
  const [requests, setRequests] = useState<AdminRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<AdminRequest | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending')
  const [rejectModalOpen, rejectModalHandlers] = useDisclosure()
  const [searchTerm, setSearchTerm] = useState('')

  const fetchRequests = async () => {
    try {
      setIsLoading(true)
      // For immediate testing without waiting for API, we can directly access sessionStorage
      const storedRequests = JSON.parse(sessionStorage.getItem('adminRequests') || '[]')
      setRequests(storedRequests)
      
      // Also make the API call to keep the code working if we switch to real API later
      const response = await fetch('/api/admin/requests')
      const result = await response.json()

      if (result.success) {
        setRequests(result.data)
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
      // If API fails, we still have data from sessionStorage
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/request/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved' }),
      })

      const result = await response.json()

      if (result.success) {
        fetchRequests() // Refresh the list
      }
    } catch (error) {
      console.error('Error approving request:', error)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return

    try {
      const response = await fetch(`/api/admin/request/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected' }),
      })

      const result = await response.json()

      if (result.success) {
        fetchRequests() // Refresh the list
        rejectModalHandlers.close()
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
    }
  }

  const handleOpenRejectModal = (request: AdminRequest) => {
    setSelectedRequest(request)
    rejectModalHandlers.open()
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Filter requests by search term and active tab
  const filteredRequests = requests.filter(request => {
    const matchesSearch = searchTerm === '' || 
      request.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.phone_number.includes(searchTerm) ||
      getRoleTypeText(request.role_type).toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTab = activeTab === 'pending' ? request.status === 'pending' : request.status === 'approved'
    
    return matchesSearch && matchesTab
  })

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      <Head>
        <title>سودم | درخواست های ثبت نام</title>
      </Head>
      
      <div className="bg-[#2C3E50]">
        <AdminHeader title="ثبت نام ها" />
      </div>

      <div className="rounded-t-[40px] bg-[#F6F7FB] min-h-screen pt-4 px-4">
        {/* Filter tabs */}
        <div className="flex rounded-lg bg-white overflow-hidden mb-5">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-3 px-4 text-center ${activeTab === 'pending' ? 'bg-[#2C3E50] text-white' : 'bg-white text-[#2C3E50]'}`}
          >
            در انتظار تایید
          </button>
          <button 
            onClick={() => setActiveTab('approved')}
            className={`flex-1 py-3 px-4 text-center ${activeTab === 'approved' ? 'bg-[#2C3E50] text-white' : 'bg-white text-[#2C3E50]'}`}
          >
            تایید شده ها
          </button>
        </div>

        {/* Search input */}
        <div className="relative mb-5">
          <input 
            type="text" 
            placeholder="جستجو بر اساس نام، شماره یا نقش"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full py-3 px-4 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent" 
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Request cards */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white p-10 rounded-xl flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2C3E50]"></div>
            </div>
          ) : filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <div key={request.id} className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-200 ml-3">
                      {request.profile_image ? (
                        <Image src={request.profile_image} alt={request.full_name} layout="fill" objectFit="cover" width={48} height={48} />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{request.full_name}</h3>
                      <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                        request.status === 'pending' 
                          ? 'bg-amber-100 text-amber-600' 
                          : request.status === 'approved' 
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                      }`}>
                        {request.status === 'pending' ? 'در انتظار تایید' : request.status === 'approved' ? 'تایید شده' : 'رد شده'}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 farsi-digits">
                    {getFormattedDate(request.created_at)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div>
                    <p className="text-xs text-gray-500">شماره تماس</p>
                    <p className="text-sm farsi-digits">{request.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">نقش درخواستی</p>
                    <p className="text-sm">{getRoleTypeText(request.role_type)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <p className="text-xs text-gray-500">استان</p>
                    <p className="text-sm">{request.province}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">شهر</p>
                    <p className="text-sm">{request.city}</p>
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <Button 
                      onClick={() => handleApprove(request.id)}
                      className="flex-1 bg-[#2C3E50] py-2 text-white rounded-lg text-sm"
                    >
                      تایید درخواست
                    </Button>
                    <Button 
                      onClick={() => handleOpenRejectModal(request)}
                      className="flex-1 bg-white border border-red-500 py-2 text-red-500 rounded-lg text-sm"
                    >
                      رد درخواست
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white p-10 rounded-xl flex flex-col items-center justify-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">هیچ درخواستی یافت نشد</p>
            </div>
          )}
        </div>
      </div>

      {/* Reject confirmation modal */}
      <ConfirmDeleteModal
        isShow={rejectModalOpen}
        onClose={rejectModalHandlers.close}
        onConfirm={handleReject}
        onCancel={rejectModalHandlers.close}
        title="رد درخواست"
        isLoading={false}
      />
    </div>
  )
}

export default AdminRequestsPage 