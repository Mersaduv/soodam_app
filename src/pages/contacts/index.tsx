import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { ClientLayout } from '@/components/layouts'
import { useAppSelector } from '@/hooks'
import { Button, DisplayError, TextField } from '@/components/ui'
import { CallXsIcon, LocationMdIcon, SMSEditXsIcon } from '@/icons'
import { Controller, Resolver, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { ContactUsForm } from '@/types'
import { contactUsFormSchema } from '@/utils'
const Contacts: NextPage = () => {
  const { query, push } = useRouter()
  const { phoneNumber, user } = useAppSelector((state) => state.auth)

  const {
    handleSubmit,
    control,
    register,
    trigger,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ContactUsForm>({
    resolver: yupResolver(contactUsFormSchema) as unknown as Resolver<ContactUsForm>,
  })

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

          <form action="" className='pt-5'>
            <div className="space-y-4 px-4 pb-4">
              <Controller
                name="fullName"
                control={control}
                render={({ field }) => (
                  <TextField
                    adForm
                    isDarker
                    label="نام و نام خانوادگی"
                    type="text"
                    {...field}
                    control={control}
                    errors={errors.fullName}
                  />
                )}
              />

              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    adForm
                    isDarker
                    label="شماره تماس "
                    type="number"
                    {...field}
                    control={control}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    errors={errors.phoneNumber}
                  />
                )}
              />

              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField adForm isDarker label="آدرس" {...field} control={control} errors={errors.address} />
                )}
              />
              <div className="space-y-31">
                <label
                  className="block text-sm font-normal mb-2 text-gray-700 md:min-w-max lg:text-sm"
                  htmlFor="address"
                >
                  توضیحات
                </label>
                <textarea
                  className="input h-24 resize-none border-[#E3E3E7] rounded-[8px] bg-[#FCFCFCCC] placeholder:text-xs pr-2"
                  id="address"
                  {...register('address')}
                />
                <div className="w-fit" dir={'ltr'}>
                  {' '}
                  <DisplayError adForm errors={errors.description} />
                </div>
              </div>
            </div>
          </form>
        </div>
        <div className="mb-[120px] w-full mt-6">
          <Button className="w-full">
            ثبت درخواست
          </Button>
        </div>
      </main>
    </ClientLayout>
  )
}

export default dynamic(() => Promise.resolve(Contacts), { ssr: false })
