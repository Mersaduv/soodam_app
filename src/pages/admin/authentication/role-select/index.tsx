import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Head from 'next/head'
import AdminHeader from '@/components/shared/AdminHeader'
import { ArrowLeftIcon } from '@/icons'
import DashboardLayout from '@/components/layouts/DashboardLayout'

const RoleSelectPage: React.FC = () => {
  const { push, back } = useRouter()

  const handleClick = (pathname: string, query: { role: string }) => {
    push({
      pathname,
      query,
    })
  }

  const handleBack = () => {
    back()
  }

  return (
    <DashboardLayout showDetail title="انتخاب نقش">
      <>
        <Head>
          <title>سودم | انتخاب نقش</title>
        </Head>

        <div className="bg-[#F6F7FB] min-h-screen">
          <div className="fixed top-0 right-0 left-0 z-50 bg-[#2C3E50] py-4 px-4 flex items-center">
            <button onClick={handleBack} className="ml-4 -rotate-90">
              <ArrowLeftIcon width="24px" height="24px" color="#fff" />
            </button>
            <h1 className="text-white font-medium">انتخاب نقش</h1>
          </div>
          
          <div className="py-[87px] px-4 pb-6">
            <div className="space-y-4">
              <div
                onClick={() => handleClick('/admin/authentication/register', { role: 'admin_city' })}
                className="hover:bg-[#FFF0F2] border hover:border-[#D52133] cursor-pointer p-4 rounded-lg flex justify-between items-center bg-white"
              >
                <div className="w-[200px] max-w-[160px] space-y-6 flex flex-col justify-between h-full items-center">
                  <p className="text-sm">ثبت نام ادمین شهر</p>
                </div>
                <Image src="/static/listening-to-feedback.png" alt="عضو" layout="intrinsic" width={95} height={95} />
              </div>

              <div
                onClick={() => handleClick('/admin/authentication/register', { role: 'admin_ad' })}
                className="hover:bg-[#FFF0F2] border hover:border-[#D52133] cursor-pointer p-4 rounded-lg flex justify-between items-center bg-white"
              >
                <div className="w-[200px] max-w-[160px] space-y-6 flex flex-col justify-between h-full items-center">
                  <p className="text-sm">ثبت نام ادمین آگهی</p>
                </div>
                <Image src="/static/smart-home-contol.png" alt="کاربر معمولی" layout="intrinsic" width={95} height={95} />
              </div>

              <div
                onClick={() => handleClick('/admin/authentication/register', { role: 'admin_news' })}
                className="hover:bg-[#FFF0F2] border hover:border-[#D52133] cursor-pointer p-4 rounded-lg flex justify-between items-center bg-white"
              >
                <div className="w-[200px] max-w-[160px] space-y-6 flex flex-col justify-between h-full items-center">
                  <p className="text-sm">ثبت نام ادمین خبر</p>
                </div>
                <Image src="/static/becoming-rich.png" alt="خبرنگار" layout="intrinsic" width={95} height={95} />
              </div>

              {/* <div
                onClick={() => handleClick('/admin/authentication/register', { role: 'marketer' })}
                className="hover:bg-[#FFF0F2] border hover:border-[#D52133] cursor-pointer p-4 rounded-lg flex justify-between items-center bg-white"
              >
                <div className="w-[200px] max-w-[160px] space-y-6 flex flex-col justify-between h-full items-center">
                  <p className="text-sm">ثبت نام بازاریاب</p>
                </div>
                <Image src="/static/business-deal.png" alt="املاک" layout="intrinsic" width={95} height={95} />
              </div> */}
            </div>
          </div>
        </div>
      </>
    </DashboardLayout>
  )
}

export default RoleSelectPage 