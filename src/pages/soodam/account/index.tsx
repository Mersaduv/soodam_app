import Link from 'next/link'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ClientLayout } from '@/components/layouts'
import { AdsMIcon, ArrowLeftIcon, FaceScanIcon, PdfDownloadIcon, WalletAndCardIcon } from '@/icons'
import { Button } from '@/components/ui'

const Account: NextPage = () => {
  // ? Assets
  const { query, events, back, push } = useRouter()

  const handleBack = () => {
    back()
  }

  // ? Render(s)
  return (
    <>
      {' '}
      <main className="bg-white m-4 rounded-2xl border border-[#E3E3E7]">
        <div className="flex justify-center items-center gap-1 p-4">
          <h1 className="font-bold text-lg">اطلاعات حساب کاربری</h1>
        </div>
        <div className="flex flex-col gap-9 mt-2"></div>
      </main>
      <div className="px-4 mt-10 pb-10">
        <Button
          //  onClick={() => push('/marketer/register')}
          className="w-full font-bold text-sm rounded-lg"
        >
          ذخیره اطلاعات
        </Button>
        <Button
           onClick={handleBack}
          className="w-full font-bold text-sm rounded-lg mt-4 text-[#D52133] border border-[#D52133] bg-[#FFFFFF]"
        >
          انصراف
        </Button>
      </div>
    </>
  )
}

export default dynamic(() => Promise.resolve(Account), { ssr: false })
