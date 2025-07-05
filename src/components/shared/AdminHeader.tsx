import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import { SearchModal } from '../modals'
import MapMode from './MapMode'
import FilterControlNavBar from './FilterControlNavBar'
import { ArrowLeftIcon, Close } from '@/icons'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { roles } from '@/utils'
import { useRouter } from 'next/router'
import Link from 'next/link'

const AdminHeader = ({ title, isDashboard }: { title: string; isDashboard?: boolean }) => {
  const { replace, query, back, pathname } = useRouter()
  const userLocalStorage = localStorage.getItem('user')
  const user = userLocalStorage ? JSON.parse(userLocalStorage) : null
  const handleBack = () => {
    back()
  }

  return (
    <header>
      {isDashboard ? (
        <div className="flex items-center justify-between gap-2 px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="border-2 w-fit rounded-full border-[#D52133]">
              <img
                className="w-[50px] h-[50px] rounded-full object-contain p-1"
                src="/static/user.png"
                alt={'پروفایل ادمین'}
              />
            </div>
            <div>
              <h1 className="text-white font-medium farsi-digits">
                سلام, {user?.first_name && user.first_name.trim() !== '' ? user.first_name : user.phone_number}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <img className="w-[26px] h-[26px]" src="/static/Group 273.png" alt="notification" />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between py-6 px-4">
          <div className="flex items-center gap-2.5">
            <button onClick={handleBack} className={`text-white rounded-full w-fit -rotate-90 font-bold`}>
              <ArrowLeftIcon width="24px" height="24px" />
            </button>
            <h1 className="text-white font-medium">{title}</h1>
          </div>

          {!pathname.includes('/admin/requests') && (
            <Link href="/admin/requests">
              <span className="text-white text-sm">ثبت نام ها</span>
            </Link>
          )}
        </div>
      )}
    </header>
  )
}

export default AdminHeader
