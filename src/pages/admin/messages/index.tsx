import dynamic from 'next/dynamic'
import Head from 'next/head'
import { NextPage } from 'next'
import AdminHeader from '@/components/shared/AdminHeader'
import { DashboardLayout } from '@/components/layouts'

const AdminMessagesPage: NextPage = () => {
  return (
    <DashboardLayout>
      <div className="">
        <Head>
          <title>پیام‌ها</title>
        </Head>
        <section className="bg-[#2C3E50] h-screen">
          <div className="bg-[#F6F7FB] rounded-t-[40px] h-full mt-3 pb-[80px]">
            <div className="px-5 pt-6 py-4">
              <div className="font-medium text-[#353535]">پیام‌ها</div>
            </div>

            <div className="px-4">
              {/* Messages content will go here */}
              <div className="bg-white rounded-xl p-4 mt-2">
                <div className="text-center text-gray-500">صفحه پیام‌ها</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

export default dynamic(() => Promise.resolve(AdminMessagesPage), { ssr: false })
