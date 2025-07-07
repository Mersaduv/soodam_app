import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { AdminRequestDetails } from '@/components/user'
import Head from 'next/head'
import { ArrowLeftIcon } from '@/icons'

interface AdminRequest {
  id: number
  full_name: string
  phone_number: string
  email: string
  province: string
  city: string
  role_type: string
  status: string
  created_at: string
  profile_image: string | null
  security_number: string
  birth_date?: string
  gender?: string
  bank_card_number?: string
  iban?: string
  marital_status?: string
  address?: string
  national_id_image?: string | null
}

const AdminRequestDetailsPage: NextPage = () => {
  const { query, back, push } = useRouter()
  const { id } = query
  const [request, setRequest] = useState<AdminRequest | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    setLoading(true)
    try {
      // Fetch from localStorage for demo
      const requestsString = localStorage.getItem('adminRequests')
      if (!requestsString) {
        setError('درخواستی یافت نشد')
        setLoading(false)
        return
      }

      const requests = JSON.parse(requestsString)
      const foundRequest = requests.find((req: AdminRequest) => req.id === Number(id))
      
      if (foundRequest) {
        setRequest(foundRequest)
      } else {
        setError('درخواست مورد نظر یافت نشد')
      }
    } catch (err) {
      console.error('Error fetching request details:', err)
      setError('خطا در بارگذاری اطلاعات')
    } finally {
      setLoading(false)
    }
  }, [id])

  const handleApprove = (requestId: number) => {
    try {
      const requestsString = localStorage.getItem('adminRequests')
      if (!requestsString) return

      const requests = JSON.parse(requestsString)
      const updatedRequests = requests.map((req: AdminRequest) => {
        if (req.id === requestId) {
          return { ...req, status: 'approved' }
        }
        return req
      })

      localStorage.setItem('adminRequests', JSON.stringify(updatedRequests))
      // Update current view
      if (request) {
        setRequest({ ...request, status: 'approved' })
      }
      
      // Show success message
      alert('درخواست با موفقیت تایید شد')
      push('/admin/requests')
    } catch (err) {
      console.error('Error approving request:', err)
      alert('خطا در تایید درخواست')
    }
  }

  const handleReject = (requestId: number) => {
    try {
      const requestsString = localStorage.getItem('adminRequests')
      if (!requestsString) return

      const requests = JSON.parse(requestsString)
      const updatedRequests = requests.map((req: AdminRequest) => {
        if (req.id === requestId) {
          return { ...req, status: 'rejected' }
        }
        return req
      })

      localStorage.setItem('adminRequests', JSON.stringify(updatedRequests))
      // Update current view
      if (request) {
        setRequest({ ...request, status: 'rejected' })
      }
      
      // Show success message
      alert('درخواست با موفقیت رد شد')
      push('/admin/requests')
    } catch (err) {
      console.error('Error rejecting request:', err)
      alert('خطا در رد درخواست')
    }
  }

  return (
    <DashboardLayout showDetail title="جزئیات ثبت نام کننده"> 
      <>
        <Head>
          <title>سودم | جزئیات درخواست</title>
        </Head>
        <div className="px-4 py-[87px]">
          {loading ? (
            <div className="bg-white rounded-2xl p-8 flex justify-center">
              <p>در حال بارگذاری...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 flex justify-center">
              <p className="text-red-500">{error}</p>
            </div>
          ) : request ? (
            <AdminRequestDetails 
              request={request} 
              onApprove={handleApprove} 
              onReject={handleReject} 
            />
          ) : null}
        </div>
      </>
    </DashboardLayout>
  )
}

export default AdminRequestDetailsPage 