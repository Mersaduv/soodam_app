import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Modal } from '../ui'
import { roles } from '@/utils'
import { useAppSelector, useAppDispatch } from '@/hooks'
import { clearCredentials } from '@/store'
import { useRouter } from 'next/router'

interface AdminFirstLoginModalProps {
  isShow: boolean
  onClose: () => void
}

const AdminFirstLoginModal: React.FC<AdminFirstLoginModalProps> = ({ isShow, onClose }) => {
  const { phoneNumber, user } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const { push } = useRouter()

  const handleClick = (pathname: string, query: { role: string }) => {
    push({
      pathname,
      query,
    })
    onClose()
  }


  return (
    <Modal isShow={isShow} onClose={onClose} effect="ease-out">
      <Modal.Content onClose={onClose} className="flex h-full flex-col gap-y-5 bg-white mx-2 p-4 rounded-3xl">
        <Modal.Header onClose={onClose}>نقش خود را انتخاب کنید</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div
              onClick={() => handleClick('/admin/authentication/register', { role: 'admin_city' })}
              className="hover:bg-[#FFF0F2] border hover:border-[#D52133] cursor-pointer p-4 rounded-lg flex justify-between items-center"
            >
              <div className="w-[200px] max-w-[160px] space-y-6 flex flex-col justify-between h-full items-center">
                <p className="text-sm">ثبت نام ادمین شهر</p>
              </div>
              <Image src="/static/listening-to-feedback.png" alt="عضو" layout="intrinsic" width={95} height={95} />
            </div>

            <div
              onClick={() => handleClick('/admin/authentication/register', { role: 'admin_ad' })}
              className="hover:bg-[#FFF0F2] border hover:border-[#D52133] cursor-pointer p-4 rounded-lg flex justify-between items-center"
            >
              <div className="w-[200px] max-w-[160px] space-y-6 flex flex-col justify-between h-full items-center">
                <p className="text-sm">ثبت نام ادمین آگهی</p>
              </div>
              <Image src="/static/smart-home-contol.png" alt="کاربر معمولی" layout="intrinsic" width={95} height={95} />
            </div>

            <div
              onClick={() => handleClick('/admin/authentication/register', { role: 'admin_news' })}
              className="hover:bg-[#FFF0F2] border hover:border-[#D52133] cursor-pointer p-4 rounded-lg flex justify-between items-center"
            >
              <div className="w-[200px] max-w-[160px] space-y-6 flex flex-col justify-between h-full items-center">
                <p className="text-sm">ثبت نام ادمین خبر</p>
              </div>
              <Image src="/static/becoming-rich.png" alt="خبرنگار" layout="intrinsic" width={95} height={95} />
            </div>

            <div
              onClick={() => handleClick('/admin/authentication/register', { role: 'marketer' })}
              className="hover:bg-[#FFF0F2] border hover:border-[#D52133] cursor-pointer p-4 rounded-lg flex justify-between items-center"
            >
              <div className="w-[200px] max-w-[160px] space-y-6 flex flex-col justify-between h-full items-center">
                <p className="text-sm">ثبت نام بازاریاب</p>
              </div>
              <Image src="/static/business-deal.png" alt="املاک" layout="intrinsic" width={95} height={95} />
            </div>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  )
}

export default AdminFirstLoginModal
