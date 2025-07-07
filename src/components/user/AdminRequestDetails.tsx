import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui'

interface AdminRequestDetailsProps {
  request: {
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
  onApprove?: (id: number) => void
  onReject?: (id: number) => void
  showActions?: boolean
}

const AdminRequestDetails: React.FC<AdminRequestDetailsProps> = ({
  request,
  onApprove,
  onReject,
  showActions = true,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'contact'>('details')

  const handleApprove = () => {
    if (onApprove) onApprove(request.id)
  }

  const handleReject = () => {
    if (onReject) onReject(request.id)
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E3E3E7] overflow-hidden">
      <div className="p-4 pt-6">
        <div className="flex flex-col items-center mb-4">
          <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden mb-2 border-2 border-[#2C3E50] relative">
            {request.profile_image ? (
              <Image src={request.profile_image} alt={request.full_name} layout="fill" objectFit="cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-xl font-bold text-gray-500">
                  {request.full_name ? request.full_name.charAt(0) : '?'}
                </span>
              </div>
            )}
          </div>
          <h4 className="font-bold text-lg">{request.full_name}</h4>
          {request.status === 'pending' ? (
            <div className="flex items-center mt-1.5">
              <div className="w-[10.35px] h-[10.35px] rounded-full bg-yellow-400 ml-1"></div>
              <span className="text-[13px] text-yellow-400 ">در انتظار تایید</span>
            </div>
          ) : request.status === 'approved' ? (
            <div className="flex items-center mt-1.5">
              <div className="w-[10.35px] h-[10.35px] rounded-full bg-green-400 ml-1"></div>
              <span className="text-[13px] text-green-500 ">تایید شده</span>
            </div>
          ) : (
            <div className="flex items-center mt-1.5">
              <div className="w-[10.35px] h-[10.35px] rounded-full bg-red-400 ml-1"></div>
              <span className="text-[13px] text-red-500 ">رد شده</span>
            </div>
          )}
        </div>

        {/* tabs for details and contact */}
        <div className="flex items-center justify-between p-2 h-[48px] bg-[#F0F3F6] rounded-lg">
          <button
            className={`flex-1 h-[36px] rounded-[5px] text-center font-medium ${
              activeTab === 'details' ? 'bg-[#2C3E50] text-white' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('details')}
          >
            مشخصات
          </button>
          <button
            className={`flex-1 h-[36px] rounded-[5px] text-center font-medium ${
              activeTab !== 'details' ? 'bg-[#2C3E50] text-white' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('contact')}
          >
            اطلاعات تماس
          </button>
        </div>

        {activeTab === 'details' ? (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">نام پدر</p>
                <p className="font-medium">{request.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">نقش درخواستی</p>
                <p className="font-medium">
                  {request.role_type === 'admin_city'
                    ? 'ادمین شهر'
                    : request.role_type === 'admin_news'
                    ? 'ادمین خبر'
                    : request.role_type === 'admin_ad'
                    ? 'ادمین آگهی'
                    : request.role_type === 'marketer'
                    ? 'بازاریاب'
                    : request.role_type}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">کد ملی</p>
                <p className="font-medium ltr text-right">{request.security_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">تاریخ تولد</p>
                <p className="font-medium">{request.birth_date || '-'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">جنسیت</p>
                <p className="font-medium">{request.gender || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">شماره شناسنامه</p>
                <p className="font-medium ltr text-right">{request.security_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">شماره کارت بانکی</p>
                <p className="font-medium ltr text-right">{request.bank_card_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">وضعیت تاهل</p>
                <p className="font-medium">{request.marital_status || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">شماره شبا</p>
                <p className="font-medium ltr text-right">{request.iban}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">شهر</p>
                <p className="font-medium">
                  {request.city}
                  {request.province ? ` - ${request.province}` : ''}
                </p>
              </div>
            </div>

            {request.national_id_image && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">کارت ملی ثبت شده</p>
                <div className="border border-gray-200 rounded-lg overflow-hidden w-1/2">
                  <Image
                    src={request.national_id_image}
                    alt="National ID Card"
                    width={300}
                    height={180}
                    layout="responsive"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm text-gray-500">شماره تماس</p>
                <p className="font-medium ltr text-right">{request.phone_number}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm text-gray-500">ایمیل</p>
                <p className="font-medium ltr text-right">{request.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm text-gray-500">شماره کارت بانکی</p>
                <p className="font-medium ltr text-right">{request.bank_card_number || '-'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm text-gray-500">شماره شبا</p>
                <p className="font-medium ltr text-right">{request.iban || '-'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm text-gray-500">آدرس</p>
                <p className="font-medium">{request.address || '-'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showActions && (
        <div className="flex p-4 gap-2">
          <Button
            onClick={handleReject}
            className="flex-1 py-[14px] border border-red-500 text-red-500 font-bold text-sm rounded-lg bg-white hover:bg-red-50"
          >
            رد درخواست
          </Button>
          <Button onClick={handleApprove} className="flex-1 py-[14px] font-bold text-sm rounded-lg bg-[#2C3E50]">
            تایید درخواست
          </Button>
        </div>
      )}
    </div>
  )
}

export default AdminRequestDetails
