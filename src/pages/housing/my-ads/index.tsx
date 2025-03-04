import { ClientLayout } from '@/components/layouts'
import { Button } from '@/components/ui'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { CircleMdIcon } from '@/icons'
import { useGetHousingQuery } from '@/services'
import { setIsSuccess } from '@/store'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const MyAds: NextPage = () => {
  // ? Assets
  const { query, push } = useRouter()
  const { isSuccess } = useAppSelector((state) => state.statesData)
  const dispatch = useAppDispatch()
  const { data: housingData } = useGetHousingQuery({
    status: 1,
  })
  useEffect(() => {
    if (isSuccess) {
      dispatch(setIsSuccess(false))
    }
  }, [isSuccess, dispatch])
  const role = localStorage.getItem('role') ? localStorage.getItem('role')! : null
  return (
    <>
      <ClientLayout title="آگهی های من">
        <main className="pt-[87px] relative">
          <div className="bg-white mx-4 border rounded-2xl border-[#E3E3E7] ">
            <div className="flex justify-center mt-8">
              <img className="w-[180px] h-[180px]" src="/static/Document_empty.png" alt="" />
            </div>
            <div className="mt-8 flex flex-col justify-center items-center gap-2">
              <h1 className="font-medium text-sm">شما تاکنون آگهی ثبت نکرده اید.</h1>
            </div>
            <div className="mx-4 mt-8 mb-7 flex gap-3">
              <Button
                onClick={() => push('/housing/ad')}
                className="w-full rounded-[10px] font-bold text-sm"
              >
                ثبت آگهی
              </Button>
            </div>
          </div>
        </main>
      </ClientLayout>
    </>
  )
}

export default MyAds
