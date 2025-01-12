import Link from 'next/link'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ClientLayout } from '@/components/layouts'
import { LogoutButton } from '@/components/user'
import { ArrowLeftIcon, NotificationIcon } from '@/icons'

const Soodam: NextPage = () => {
  // ? Assets
  const { query, events, back } = useRouter()

  const handleBack = () => {
    back()
  }
  // ? Render(s)
  return (
    <>
      <ClientLayout title="حساب کاربری" isProfile>
        <div className="">
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
            <div className="flex justify-center"><img className='w-[300px]' src="/static/Vector.png" alt="" /></div>
            <div className="flex justify-center"><img className='w-[200px]' src="/static/Group 1000011048.png" alt="" /></div>
            <div className="absolute bottom-0 flex gap-3 pb-7 px-4">
              <div className="border-[3px] w-[64px] h-[64px] flex-center border-[#FFFFFF] rounded-full"><img className='w-[52px]' src="/static/OBJECTM.png" alt="" /></div>
              <div className="flex flex-col gap-2">
                <h1 className="text-base font-semibold">بی نام</h1>
                <span className="text-sm text-[#5A5A5A] font-semibold farsi-digits">09338666666</span>
              </div>
            </div>
          </div>
          <h1>حساب کاربری</h1>
          <LogoutButton />
        </div>
      </ClientLayout>
    </>
  )
}

export default dynamic(() => Promise.resolve(Soodam), { ssr: false })
