import { AdvertisementRegistrationForm } from '@/components/forms'
import { ClientLayout } from '@/components/layouts'
import { Button } from '@/components/ui'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { SmallArrowLeftIcon } from '@/icons'
import { setAdConfirmExit, setIsSuccess } from '@/store'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'

const NewAdPage: NextPage = () => {
  // ? Assets
  const { query, back, push } = useRouter()
  const roleQuery = (query.role as string) ?? ''
  const { adConfirmExit, isSuccess } = useAppSelector((state) => state.statesData)
  const dispatch = useAppDispatch()
  const handleSuccess = () => {
    push('/housing/my-ads')
  }
  return (
    <ClientLayout
      isAdConfirmExit={true}
      title={`${query.role === 'Marketer' ? 'ثبت آگهی به عنوان بازاریاب' : 'ثبت آگهی شخصی'}`}
    >
      <div className="py-[90px] px-4 relative">
        {/* کامپوننت فرم همیشه رندر می‌شود */}
        <div style={{ display: adConfirmExit === '0' || isSuccess === true ? 'none' : 'block' }}>
          <AdvertisementRegistrationForm roleUser={roleQuery} />
        </div>
        {isSuccess === true && (
          <div>
            <div className=" bg-white mx-4 border rounded-2xl border-[#E3E3E7]]">
              <div className="flex justify-center mt-8 px-4">
                <img className="w-full max-w-[500px]" src="/static/Modal.png" alt="success add" />
              </div>
              <div className="mt-8 flex flex-col justify-center items-center gap-3 pb-8">
                <h1 className="font-bold text-lg">آگهی شما با موفقیت ثبت شد.</h1>
                <p className="text-[#1A1E25] text-sm font-normal text-center">
                  پس از تایید مدیریت در لیست آگهی ها نمایش داده می شود.
                </p>
              </div>
            </div>
            <div className="mx-4 mt-4 mb-4 flex gap-3">
              <Button
                type="button"
                onClick={handleSuccess}
                className="w-full rounded-[10px] font-bold text-sm h-[48px]"
              >
                متوجه شدم
              </Button>
            </div>
          </div>
        )}
        {/* نمایش یا پنهان کردن لایه تایید خروج */}
        {adConfirmExit === '0' && (
          <div className=" bg-white mx-4 border rounded-2xl border-[#E3E3E7]]">
            <div className="flex justify-center mt-12">
              <img className="w-[180px]" src="/static/Document_empty.png" alt="" />
            </div>
            <div className="mt-8 flex flex-col justify-center items-center gap-2">
              <h1 className="font-medium text-sm">آیا از ثبت آگهی خود منصرف شده اید؟</h1>
              <p className="text-[#7A7A7A] text-[13px] font-medium">
                با بازگشت به صفحه قبل مواردی که وارد کرده اید پاک می شوند.
              </p>
            </div>
            <div className="mx-4 mt-8 mb-4 flex gap-3">
              <Button
                onClick={() => {
                  dispatch(setAdConfirmExit(''))
                  back()
                }}
                className="w-full rounded-[10px] font-bold text-sm py-[14px] bg-white text-[#D52133] border border-[#D52133]"
              >
                بله
              </Button>
              <Button
                onClick={() => dispatch(setAdConfirmExit(''))}
                className="w-full rounded-[10px] font-bold text-sm"
              >
                خیر
              </Button>
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  )
}

export default dynamic(() => Promise.resolve(NewAdPage), { ssr: false })
