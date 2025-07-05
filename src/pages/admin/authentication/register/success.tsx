import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui'
import DashboardLayout from '@/components/layouts/DashboardLayout'

const RegistrationSuccessPage = () => {
  const { push } = useRouter()

  return (
    <DashboardLayout showDetail>
      <Head>
        <title>سودم | ثبت نام موفق</title>
      </Head>

      <div className="bg-[#F6F7FB] rounded-t-[40px] flex-grow flex flex-col items-center justify-center px-6 py-[87px] ">
        <div className="flex flex-col items-center justify-center gap-8 w-full max-w-md">
          <div className="w-full flex justify-center">
            <Image
              src="/static/Illustration 1.png"
              alt="Success"
              width={327}
              height={216}
              className="w-auto h-auto max-w-full"
            />
          </div>

          <div className="text-center space-y-7">
            <h1 className="font-semibold text-xl">درخواست شما با موفقیت ثبت شد.</h1>
            <p className="text-gray-600 text-sm font-medium">
              پس از بررسی و تأیید، از طریق پیام اطلاع‌رسانی خواهیم کرد. از صبوری شما سپاسگزاریم!
            </p>
          </div>

          <Link className="w-full" href="/admin/authentication/login">
            <Button className="w-full py-[14px] font-bold text-sm rounded-lg bg-[#2C3E50]">بازگشت به صفحه ورود</Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default RegistrationSuccessPage
