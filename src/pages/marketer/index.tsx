import Link from 'next/link'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ClientLayout } from '@/components/layouts'
import { AdsMIcon, ArrowLeftIcon, FaceScanIcon, PdfDownloadIcon, WalletAndCardIcon } from '@/icons'
import { Button } from '@/components/ui'

const Marketer: NextPage = () => {
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
        <div className="flex items-center gap-1 p-4">
          <button onClick={handleBack} className={`rounded-full w-fit p-1 -rotate-90 font-bold`}>
            <ArrowLeftIcon width="24px" height="24px" />
          </button>{' '}
          <h1 className="font-bold text-lg">مراحل فعالیت به عنوان بازاریاب</h1>
        </div>
        <div className="flex flex-col gap-9 mt-2">
          <div className="flex items-center gap-3 px-4">
            <div>
              <AdsMIcon width="54px" height="50px" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="font-medium text-base">ورود به عنوان بازاریاب</h1>
              <p className="text-[#5A5A5A] text-xs">
                در ابتدا باید به عنوان بازاریاب وارد سودم شوید تا از پلن های درآمد زایی استفاده کنید.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4">
            <div>
              <img src="/static/13724094091679983182 1.png" alt="" width="56px" height="56px" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="font-medium text-base">احراز هویت</h1>
              <p className="text-[#5A5A5A] text-xs">
                در ابتدا باید به عنوان بازاریاب وارد سودم شوید تا از پلن های درآمد زایی استفاده کنید.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4">
            <div>
              <PdfDownloadIcon width="56px" height="56px" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="font-medium text-base">بارگزاری فایل ها</h1>
              <p className="text-[#5A5A5A] text-xs">
                در ابتدا باید به عنوان بازاریاب وارد سودم شوید تا از پلن های درآمد زایی استفاده کنید.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 pb-10">
            <div>
              <WalletAndCardIcon width="56px" height="56px" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="font-medium text-base">کسب درآمد و برداشت آن</h1>
              <p className="text-[#5A5A5A] text-xs">
                در ابتدا باید به عنوان بازاریاب وارد سودم شوید تا از پلن های درآمد زایی استفاده کنید.
              </p>
            </div>
          </div>
        </div>
      </main>
      <div className="px-4 mt-10 pb-10">
        <Button onClick={() => push('/marketer/register')} className="w-full font-bold text-sm rounded-lg">
          شروع ثبت نام
        </Button>
      </div>
    </>
  )
}

export default dynamic(() => Promise.resolve(Marketer), { ssr: false })
