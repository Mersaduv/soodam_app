import Link from 'next/link'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ClientLayout } from '@/components/layouts'
import { LogoutButton } from '@/components/user'
import { ArrowLeftIcon, NotificationIcon, WalletRedIcon } from '@/icons'
import { useAppSelector } from '@/hooks'

const Soodam: NextPage = () => {
  // ? Assets
  const { query, events, back } = useRouter()
  const { role, phoneNumber, fullName } = useAppSelector((state) => state.auth)
  const handleBack = () => {
    back()
  }
  console.log(fullName , "fullName")
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
                <h1 className="text-base font-semibold">{fullName !== null  ? fullName :"بی نام"}</h1>
                <span className="text-sm text-[#5A5A5A] font-semibold farsi-digits">{phoneNumber}</span>
              </div>
            </div>
          </div>
          <div>
            <div>
              <div><WalletRedIcon width="32px" height="32px" /></div>
              <div>
                <span className="text-xs font-normal text-[#5A5A5A]">کیف پول</span>
                <div></div>
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
