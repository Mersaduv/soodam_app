import React, { useState } from 'react'
import { useForm, Controller, Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { ArrowLeftIcon, CheckIcon } from '@/icons'
import { Modal, TextField } from '@/components/ui'
interface Props {}
import * as yup from 'yup'
import dynamic from 'next/dynamic'
import { useDisclosure } from '@/hooks'
import { Disclosure } from '@headlessui/react'
import { useGetCategoriesQuery } from '@/services'
import { useRouter } from 'next/router'
// مراحل فرم
const steps = ['مشخصات', 'قیمت', 'ویژگی‌ها', 'عکس و ویدئو']

interface FormValues {
  // مرحله 1 - مشخصات
  phoneNumber: string
  nationalCode?: string
  postalCode: string
  address: string
  category: string
  location: {
    lat: number
    lng: number
  }

  // مرحله 2 - قیمت
  price: number
  discount?: number

  // مرحله 3 - ویژگی‌ها
  features: {
    rooms: number
    area: number
    parkingCount: number
    hasElevator: boolean
    floor: number
  }

  // مرحله 4 - رسانه
  media: {
    images: File[]
    video?: File
  }
}

// Schema کلی برای تمام مراحل
const validationSchema = yup.object().shape({
  // مرحله 1
  phoneNumber: yup
    .string()
    .required('شماره تماس الزامی است')
    .matches(/^09[0-9]{9}$/, 'شماره موبایل معتبر نیست'),
  nationalCode: yup
    .string()
    .matches(/^[0-9]{10}$/, 'کد ملی معتبر نیست')
    .optional(),
  postalCode: yup
    .string()
    .required('کد پستی الزامی است')
    .matches(/^[0-9]{10}$/, 'کد پستی معتبر نیست'),
  address: yup.string().required('آدرس الزامی است').min(10, 'آدرس باید حداقل 10 کاراکتر باشد'),
  category: yup.string().required('دسته‌بندی الزامی است'),
  location: yup.object().shape({
    lat: yup.number().required('موقعیت جغرافیایی الزامی است'),
    lng: yup.number().required('موقعیت جغرافیایی الزامی است'),
  }),

  // مرحله 2
  price: yup.number().required('قیمت الزامی است').positive('قیمت باید مثبت باشد'),
  discount: yup
    .number()
    .min(0, 'تخفیف نمی‌تواند منفی باشد')
    .max(100, 'تخفیف نمی‌تواند بیشتر از 100 درصد باشد')
    .optional(),

  // مرحله 3
  features: yup.object().shape({
    rooms: yup.number().required('تعداد اتاق الزامی است').min(0),
    area: yup.number().required('متراژ الزامی است').positive(),
    parkingCount: yup.number().min(0),
    hasElevator: yup.boolean(),
    floor: yup.number().min(0),
  }),

  // مرحله 4
  media: yup.object().shape({
    images: yup.array().min(1, 'حداقل یک تصویر الزامی است'),
    video: yup.mixed().optional(),
  }),
})

const MapLocationPicker = dynamic(() => import('@/components/map/MapLocationPicker'), { ssr: false })

const AdvertisementRegistrationForm: React.FC = () => {
  // ? Assets
  const { query } = useRouter()
  const { data: categoriesData, isFetching, ...categoryQueryProps } = useGetCategoriesQuery({ ...query })
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null)
  const [isShow, modalHandlers] = useDisclosure()
  const [selectedCategory, setSelectedCategory] = useState(null)
  const {
    handleSubmit,
    control,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormValues>,
    mode: 'onChange',
    defaultValues: {
      features: {
        rooms: 0,
        area: 0,
        parkingCount: 0,
        hasElevator: false,
        floor: 0,
      },
      media: {
        images: [],
      },
      location: {
        lat: 0,
        lng: 0,
      },
    },
  })

  const onSubmit = (data: FormValues) => {
    console.log('Form submitted:', data)
  }

  // اعتبارسنجی فیلدهای مرحله فعلی
  const validateCurrentStep = async () => {
    let fieldsToValidate: string[] = []

    switch (currentStep) {
      case 0:
        fieldsToValidate = ['phoneNumber', 'postalCode', 'address', 'category', 'location']
        break
      case 1:
        fieldsToValidate = ['price']
        break
      case 2:
        fieldsToValidate = ['features']
        break
      case 3:
        fieldsToValidate = ['media']
        break
    }

    const result = await trigger(fieldsToValidate as any)
    return result
  }

  const handleNext = async () => {
    const isStepValid = await validateCurrentStep()
    if (isStepValid && currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleLocationChange = (location: [number, number]) => {
    setSelectedLocation(location)
  }

  const handleModalClose = (): void => {
    modalHandlers.close()
  }

  const handleSelectCategory = (name) => {
    setSelectedCategory(name)
  }

  if (isFetching) return <div>loading...</div>
  return (
    <div className="mx-auto py-5 mb-20 border rounded-[16px] bg-white">
      {/* Progress Steps */}
      <div className="flex justify-between items-center mb-6 px-[33px]">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center relative">
              <div
                className={`w-[20px] h-[20px] farsi-digits font-bold text-sm flex items-center justify-center rounded-full ${
                  index <= currentStep ? 'bg-[#D52133] text-white' : 'bg-[#E3E3E7] text-[#7A7A7A]'
                }`}
              >
                {index === currentStep ? <img src="/static/Eliiose2.png" alt="Eliiose2" /> : index + 1}
              </div>
              <div
                className={`mt-2 text-[11px] flex gap-0.5 text-[#1A1E25] -bottom-[22px] absolute whitespace-nowrap ${
                  index === currentStep ? 'font-bold text-[#D52133]' : ''
                }`}
              >
                {index < currentStep && <CheckIcon />} {step}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-[2px] ${index < currentStep ? 'bg-[#D52133]' : 'bg-[#E3E3E7]'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-4 pt-6">
        {/* Step 1: مشخصات */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  adForm
                  label="شماره تماس مالک"
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

            <MapLocationPicker selectedLocation={selectedLocation} handleLocationChange={handleLocationChange} />

            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <TextField
                  adForm
                  label="آدرس نوشتاری دقیق ملک را مشخص کنید"
                  {...field}
                  control={control}
                  errors={errors.address}
                  placeholder="آدرس کامل را وارد کنید"
                />
              )}
            />

            {/* <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <TextField
                  adForm
                  label="دسته‌بندی"
                  {...field}
                  control={control}
                  errors={errors.category}
                  placeholder="دسته‌بندی ملک را وارد کنید"
                />
              )}
            /> */}
            <div>
              <label
                className={`block text-sm font-normal mb-2  text-gray-700 md:min-w-max lg:text-sm`}
                htmlFor="category"
              >
                دسته بندی
              </label>
              <div
                onClick={modalHandlers.open}
                className="w-full cursor-pointer border-[1.5px] bg-[#FCFCFC] rounded-[8px] px-4 h-[40px] text-right text-[#5A5A5A] flex justify-between items-center"
              >
                <span className="text-[14px]">
                  {!isShow && 'انتخاب'}
                  {selectedCategory ? selectedCategory : ''}
                </span>
                <ArrowLeftIcon
                  className={`w-5 h-5 text-[#9D9D9D] transition-transform ${isShow ? 'rotate-180' : ''}`}
                />
              </div>
            </div>
            <Modal isShow={isShow} onClose={handleModalClose} effect="buttom-to-fit">
              <Modal.Content
                onClose={handleModalClose}
                className="flex h-full flex-col gap-y-5 bg-white p-4 rounded-2xl rounded-b-none"
              >
                <Modal.Header right onClose={handleModalClose} />
                <Modal.Body>
                  <div className=" mt-2 w-full z-10">
                    <div className="flex flex-col gap-y-3.5 px-4 py-2">
                      {categoriesData.data.map((item, index) => (
                        <Disclosure key={index}>
                          {({ open }) => (
                            <>
                              <Disclosure.Button className="!mt-0 flex w-full items-center justify-between py-2">
                                <div className="flex gap-x-1.5 items-center">
                                  <img className="w-[24px] h-[24px]" src={item.imageUrl} alt={item.name} />
                                  <span className="pl-3 whitespace-nowrap font-normal text-[14px] tracking-wide text-[#5A5A5A]">
                                    {item.name}
                                  </span>
                                </div>
                                <ArrowLeftIcon
                                  className={`w-5 h-5 ${open ? '' : 'rotate-90 text-gray-700'} transition-all`}
                                />
                              </Disclosure.Button>
                              {item.children.length > 0 && (
                                <Disclosure.Panel>
                                  {item.children.map((subItem, subIndex) => (
                                    <div
                                      key={subIndex}
                                      onClick={() => handleSelectCategory(subItem.name)}
                                      className="cursor-pointer mb-6 flex w-full items-center justify-between pr-[32px]"
                                    >
                                      <span className="font-light text-[14px] text-[#5A5A5A]">{subItem.name}</span>
                                    </div>
                                  ))}
                                </Disclosure.Panel>
                              )}
                            </>
                          )}
                        </Disclosure>
                      ))}
                    </div>
                  </div>
                </Modal.Body>
              </Modal.Content>
            </Modal>
          </div>
        )}

        {/* Step 2: قیمت */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <TextField
                  adForm
                  label="قیمت"
                  type="number"
                  {...field}
                  control={control}
                  errors={errors.price}
                  placeholder="قیمت را وارد کنید"
                />
              )}
            />

            <Controller
              name="discount"
              control={control}
              render={({ field }) => (
                <TextField
                  adForm
                  label="تخفیف (درصد)"
                  type="number"
                  {...field}
                  control={control}
                  errors={errors.discount}
                  placeholder="درصد تخفیف را وارد کنید"
                />
              )}
            />
          </div>
        )}

        {/* Step 3: ویژگی‌ها */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <Controller
              name="features.rooms"
              control={control}
              render={({ field }) => (
                <TextField
                  adForm
                  label="تعداد اتاق"
                  type="number"
                  {...field}
                  control={control}
                  errors={errors.features?.rooms}
                />
              )}
            />

            <Controller
              name="features.area"
              control={control}
              render={({ field }) => (
                <TextField
                  adForm
                  label="متراژ"
                  type="number"
                  {...field}
                  control={control}
                  errors={errors.features?.area}
                />
              )}
            />

            <Controller
              name="features.parkingCount"
              control={control}
              render={({ field }) => (
                <TextField
                  adForm
                  label="تعداد پارکینگ"
                  type="number"
                  {...field}
                  control={control}
                  errors={errors.features?.parkingCount}
                />
              )}
            />

            {/* <Controller
              name="features.hasElevator"
              control={control}
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <input type="checkbox" {...field}
                 checked={field.value} className="form-checkbox" />
                  <label>آسانسور دارد</label>
                </div>
              )}
            /> */}

            <Controller
              name="features.floor"
              control={control}
              render={({ field }) => (
                <TextField
                  adForm
                  label="طبقه"
                  type="number"
                  {...field}
                  control={control}
                  errors={errors.features?.floor}
                />
              )}
            />
          </div>
        )}

        {/* Step 4: عکس و ویدئو */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <Controller
              name="media.images"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block mb-2">تصاویر</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      field.onChange(files)
                    }}
                    className="form-input"
                  />
                  {errors.media?.images && <p className="text-red-500 text-sm mt-1">{errors.media.images.message}</p>}
                </div>
              )}
            />

            <Controller
              name="media.video"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block mb-2">ویدئو (اختیاری)</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      field.onChange(file)
                    }}
                    className="form-input"
                  />
                  {errors.media?.video && <p className="text-red-500 text-sm mt-1">{errors.media.video.message}</p>}
                </div>
              )}
            />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded-md ${
              currentStep === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            قبلی
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              بعدی
            </button>
          ) : (
            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
              ثبت آگهی
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default AdvertisementRegistrationForm
