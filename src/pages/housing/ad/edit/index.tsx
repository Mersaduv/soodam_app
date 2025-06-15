import { AdvertisementRegistrationForm } from '@/components/forms'
import { ClientLayout } from '@/components/layouts'
import { Button } from '@/components/ui'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { SmallArrowLeftIcon } from '@/icons'
import { setAdConfirmExit, setIsSuccess } from '@/store'
import { userTypes } from '@/utils'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'

const EditAdPage: NextPage = () => {
  // ? Assets
  const { query, back, push } = useRouter()
  const adId = query.id as string
  const roleQuery = (query.role as string) ?? ''
  const { adConfirmExit, isSuccess } = useAppSelector((state) => state.statesData)
  const dispatch = useAppDispatch()
  const [showFaq, setShowFaq] = useState(false)
  
  const handleSuccess = () => {
    push('/housing/my-ads')
  }
  
  console.log(adId , 'adId');
  
  // رفع مشکلات:
  // 1. مشکل موقعیت مکانی با تنظیم مجدد آن پس از بارگذاری حل شده است
  // 2. مشکل عدم امکان تایپ در فیلد عنوان با استفاده از یک فیلد ورودی ساده به جای کامپوننت TextField حل شده است
  
  return (
    <ClientLayout
      isAdConfirmExit={true}
      title="ویرایش آگهی"
    >
      <div className="py-[90px] px-4 relative">
        {/* کامپوننت فرم همیشه رندر می‌شود */}
        <div style={{ display: adConfirmExit === '0' || isSuccess === true ? 'none' : 'block' }}>
          <AdvertisementRegistrationForm 
            roleUser={roleQuery} 
            adId={adId}
            isEditMode={true}
          />
        </div>
        {isSuccess === true && (
          <div>
            <div className=" bg-white mx-4 border rounded-2xl border-[#E3E3E7]]">
              <div className="flex justify-center mt-8 px-4">
                <img className="w-full max-w-[500px]" src="/static/Modal.png" alt="success edit" />
              </div>
              <div className="mt-8 flex flex-col justify-center items-center gap-3 pb-8">
                <h1 className="font-bold text-lg">آگهی شما با موفقیت ویرایش شد.</h1>
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
              <h1 className="font-medium text-sm">آیا از ویرایش آگهی خود منصرف شده اید؟</h1>
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
        
        {/* سوالات متداول */}
        <div className="mt-8 mb-4">
          <Button
            type="button"
            onClick={() => setShowFaq(!showFaq)}
            className="w-full rounded-[10px] font-bold text-sm py-[14px] bg-white text-[#5A5A5A] border border-[#E3E3E7]"
          >
            {showFaq ? "بستن سوالات متداول" : "نمایش سوالات متداول"}
          </Button>
          
          {showFaq && (
            <div className="mt-4 bg-white border rounded-2xl border-[#E3E3E7] p-4">
              <h2 className="font-bold text-lg mb-4">سوالات متداول</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-[#1A1E25]">آیا پس از ویرایش آگهی، نیاز به تایید مجدد است؟</h3>
                  <p className="text-[#5A5A5A] text-xs mt-1">
                    بله، پس از ویرایش آگهی، تغییرات شما باید توسط مدیریت سایت بررسی و تایید شود.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-[#1A1E25]">چه اطلاعاتی را می‌توانم ویرایش کنم؟</h3>
                  <p className="text-[#5A5A5A] text-xs mt-1">
                    شما می‌توانید تمامی اطلاعات آگهی از جمله عنوان، توضیحات، قیمت، عکس‌ها و ویژگی‌ها را ویرایش کنید.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-[#1A1E25]">آیا می‌توانم دسته‌بندی آگهی را تغییر دهم؟</h3>
                  <p className="text-[#5A5A5A] text-xs mt-1">
                    بله، امکان تغییر دسته‌بندی آگهی وجود دارد. اما توجه داشته باشید که با تغییر دسته‌بندی، برخی از ویژگی‌های ثبت شده قبلی ممکن است حذف شوند.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-[#1A1E25]">تغییرات چه زمانی اعمال می‌شوند؟</h3>
                  <p className="text-[#5A5A5A] text-xs mt-1">
                    تغییرات شما بلافاصله در سیستم ثبت می‌شوند، اما نمایش آن‌ها در سایت منوط به تایید مدیریت است که معمولاً در کمتر از 24 ساعت انجام می‌شود.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-[#1A1E25]">آیا می‌توانم عکس‌های جدید اضافه کنم؟</h3>
                  <p className="text-[#5A5A5A] text-xs mt-1">
                    بله، شما می‌توانید عکس‌های جدید اضافه کنید یا عکس‌های قبلی را حذف نمایید. برای بهترین نتیجه، از عکس‌های باکیفیت استفاده کنید.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  )
}

export default dynamic(() => Promise.resolve(EditAdPage), { ssr: false }) 