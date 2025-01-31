import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { ClientLayout } from '@/components/layouts'
import { useAppSelector } from '@/hooks'
import { Button } from '@/components/ui'
import { CallXsIcon, LocationMdIcon, SMSEditXsIcon } from '@/icons'
import { Resolver, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { ContactUsForm } from '@/types'
const Contacts: NextPage = () => {
  const { query, push } = useRouter()
  const { phoneNumber, user } = useAppSelector((state) => state.auth)

//  const {
//     handleSubmit,
//     control,
//     register,
//     trigger,
//     setValue,
//     getValues,
//     formState: { errors },
//   } = useForm<ContactUsForm>({
//     resolver: yupResolver(validationSchema({ features: featureData, dealType })) as unknown as Resolver<ContactUsForm>,
//   })

//    const onSubmit = (data: ContactUsForm) => {
//       console.log('Form submitted:', data, roleUser)
//     }
  return (
    <ClientLayout title="مجله خیر">
      <main className="mx-auto p-4 pt-[92px]">
        <div className="bg-white relative h-full border border-[#E3E3E7] rounded-2xl">
          <div className="px-4 pt-6">
            <div className="relative h-[215px]">
              <img
                className="rounded-2xl absolute h-[215px] w-full "
                src="/static/photo_2025-01-29_18-54-27.jpg"
                alt=""
              />
              <div className="bg-[#D52133] absolute z-10 right-0 left-0 mx-7 top-0 bottom-0 my-9 flex">
                <div className="flex-1 flex-center flex-col gap-1.5 bg-white">
                  <h1 className="text-xs">دفتر مرکزی سودم</h1>
                  <div className="text-[#7A7A7A] text-[10px] font-normal px-1">
                    شهرک گلستان، خیابان هوانیروز، ساختمان اداری کاج، طبقه ۱
                  </div>
                </div>
                <div className="flex-1 flex-center flex-col gap-1.5">
                  <LocationMdIcon width="33px" height="33px" />
                  <span className="text-white px-2">جست‌وجو با گوگل مَپ</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 mt-5">
            <div className="space-y-2.5">
              <div className="flex text-sm gap-1.5">
                <CallXsIcon width="16px" height="17px" /> <div className="text-sm">شماره تلفن : ۳۲۲۴۴۲۱۲-۰۲۱</div>
              </div>

              <div className="flex text-sm gap-1.5">
                <SMSEditXsIcon width="16px" height="17px" />{' '}
                <div className="text-sm">لطفا برای ارتباط با ما فرم زیر را پر کنید.</div>
              </div>
            </div>
          </div>

          <form action="">
            {/* <div className="space-y-4">
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    adForm
                    label="شماره تماس مالک"
                    type="number"
                    {...field}
                    control={control}
                    errors={errors.phoneNumber}
                    placeholder="شماره تماس مالک (اجباری)"
                  />
                )}
              />

              <Controller
                name="nationalCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    adForm
                    label="کد ملی مالک"
                    type="number"
                    {...field}
                    control={control}
                    errors={errors.nationalCode}
                    placeholder="کد ملی (اختیاری)"
                  />
                )}
              />

              <Controller
                name="postalCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    adForm
                    label="کد پستی"
                    {...field}
                    control={control}
                    errors={errors.postalCode}
                    placeholder="کد پستی (اجباری)"
                  />
                )}
              />
            </div> */}
          </form>
        </div>
        <div className="mb-[100px] w-full mt-6">
          <Button onClick={() => push('/subscription')} className="w-full">
            ثبت درخواست
          </Button>
        </div>
      </main>
    </ClientLayout>
  )
}

export default dynamic(() => Promise.resolve(Contacts), { ssr: false })
