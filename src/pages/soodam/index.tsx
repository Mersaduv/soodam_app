import Link from 'next/link'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ClientLayout } from '@/components/layouts'
import { LogoutButton } from '@/components/user'
import {
  ArrowLeftIcon,
  HeadphoneSmIcon,
  NotificationIcon,
  SettingSmIcon,
  TicketStarIcon,
  TicketStartSmIcon,
  UserEditSmIcon,
  WalletRedIcon,
} from '@/icons'
import { useAppSelector } from '@/hooks'
import { useEffect, useState } from 'react'
import { useGetSubscriptionStatusQuery } from '@/services'

const Soodam: NextPage = () => {
  // ? Assets
  const { query, events, back } = useRouter()
  const { role, phoneNumber, fullName } = useAppSelector((state) => state.auth)
  // ? States
  const [subscriptionStatus, setSubscriptionStatus] = useState('')
  // ? Queries
  const { data: statusData, error } = useGetSubscriptionStatusQuery(phoneNumber)
  const handleBack = () => {
    back()
  }

  useEffect(() => {
    if (statusData && Object.keys(statusData).length > 0) {
      console.log(statusData, 'statusData--statusData')
      setSubscriptionStatus(`${statusData.data.remainingViews}`)
    } else {
      setSubscriptionStatus(`0`)
    }
  }, [statusData])
  console.log(fullName, 'fullName')
  // ? Render(s)
  return (
    <>
      <ClientLayout title="حساب کاربری" isProfile>
        <div className="bg-[#f3f3f5] h-screen">
          <header className={`py-4 px-4 fixed z-[9999] w-full flex justify-between items-center`}>
            <div className="flex items-center gap-3 w-full text-lg font-medium">
              <button onClick={handleBack} className={`bg-white rounded-full w-fit p-1 -rotate-90 font-bold`}>
                <ArrowLeftIcon width="24px" height="24px" />
              </button>
            </div>
            <button type="button" className={`bg-white rounded-full w-fit p-1`}>
              <NotificationIcon width="24px" height="24px" />
            </button>
          </header>
          <div className="bg-[#D8DFF4] h-[200px] rounded-b-[24px] relative">
            <div className="flex justify-center">
              <img className="w-[300px]" src="/static/Vector.png" alt="" />
            </div>
            <div className="flex justify-center">
              <img className="w-[200px]" src="/static/Group 1000011048.png" alt="" />
            </div>
            <div className="absolute bottom-0 flex items-center gap-3 pb-7 px-4 w-full">
              <div className="relative w-[75px] h-[64px]">
                <div className="border-[3px] border-[#FFFFFF] rounded-full w-[64px] h-[64px] absolute z-10"></div>
                <img className="w-[53px] h-[53px] absolute right-[6px] top-[5.9px]" src="/static/OBJECTM.png" alt="" />
              </div>
              <div className="flex flex-col gap-2 w-full">
                <h1 className="text-base font-semibold">{fullName !== null ? fullName : 'بی نام'}</h1>
                <span className="text-sm text-[#5A5A5A] font-semibold farsi-digits">{phoneNumber}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-7 px-4">
            <div className="flex flex-1 items-center justify-center gap-2 bg-[#FFFFFF] w-[172px] h-[64px] rounded-2xl">
              <div className="pr-3">
                <WalletRedIcon width="32px" height="32px" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-normal text-[#5A5A5A] line-clamp-1 overflow-hidden text-ellipsis mb-1">
                  کیف پول
                </span>
                <div className="farsi-digits font-bold text-sm line-clamp-1 overflow-hidden text-ellipsis">0 تومان</div>
              </div>
            </div>

            <div className="flex flex-1 items-center justify-center gap-2 bg-[#FFFFFF] w-[172px] h-[64px] rounded-2xl">
              <div className="pr-3">
                <TicketStarIcon width="32px" height="32px" />
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-normal text-[#5A5A5A] line-clamp-1 overflow-hidden text-ellipsis mb-1">
                  اشتراک باقی مانده
                </span>
                <div className="farsi-digits font-bold text-sm line-clamp-1 overflow-hidden text-ellipsis">
                  {subscriptionStatus} آگهی
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="px-4 space-y-2 mt-5 mb-10">
              <Link href={'/soodam/account'} className="flex items-center gap-2 py-3 cursor-pointer">
                <UserEditSmIcon width="24px" height="24px" />
                <div className="font-medium text-sm">اطلاعات حساب کاربری</div>
              </Link>

              <div className="flex items-center gap-2 py-3 cursor-pointer">
                <TicketStartSmIcon width="24px" height="24px" />
                <div className="font-medium text-sm">خرید اشتراک</div>
              </div>

              <div className="flex items-center gap-2 py-3 cursor-pointer">
                <HeadphoneSmIcon width="24px" height="24px" />
                <div className="font-medium text-sm">درخواست پشتیبانی</div>
              </div>

              <div className="flex items-center gap-2 py-3 cursor-pointer">
                <SettingSmIcon width="24px" height="24px" />
                <div className="font-medium text-sm">تنظیمات</div>
              </div>

              <div className="flex items-center gap-2 pb-20">
                <LogoutButton isProfile />
              </div>
            </div>
          </div>
        </div>
      </ClientLayout>
    </>
  )
}

export default dynamic(() => Promise.resolve(Soodam), { ssr: false })
