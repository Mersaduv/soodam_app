import { ClientLayout } from '@/components/layouts'
import { Button } from '@/components/ui'
import { CircleMdIcon } from '@/icons'
import { NextPage } from 'next'
import { useRouter } from 'next/router'

const MyAdsViewStatistics: NextPage = () => {
  // ? Assets
  const { query, push } = useRouter()

  const role = localStorage.getItem('role') ? localStorage.getItem('role')! : null
  return (
    <>
      <ClientLayout title="آمار بازدید آگهی های من">
        <main className="pt-[87px] relative">
          <div className="bg-white mx-4 border rounded-2xl border-[#E3E3E7] ">
            <div className="flex justify-center mt-8">
              <img className="w-[180px] h-[180px]" src="/static/Document_empty.png" alt="" />
            </div>
            <div className="mt-8 flex flex-col justify-center items-center gap-2">
              <h1 className="font-medium text-sm">شما تاکنون آگهی ثبت نکرده اید.ابتدا باید آگهی ثبت کنید.</h1>
            </div>
            <div className="mx-4 mt-8 mb-7 flex gap-3">
              <Button onClick={() => push('/housing/ad')} className="w-full rounded-[10px] font-bold text-sm">
                ثبت آگهی
              </Button>
            </div>
          </div>
        </main>
      </ClientLayout>
    </>
  )
}

export default MyAdsViewStatistics
