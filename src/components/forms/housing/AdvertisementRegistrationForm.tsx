import React, { useEffect, useState } from 'react'
import { useForm, Controller, Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { ArrowLeftIcon, CheckIcon, HouseIcon, InfoCircleIcon, RepeatIcon } from '@/icons'
import { Button, CustomCheckbox, DisplayError, Modal, TextField } from '@/components/ui'
interface Props {}
import * as yup from 'yup'
import dynamic from 'next/dynamic'
import { useDisclosure } from '@/hooks'
import { Disclosure } from '@headlessui/react'
import { useGetCategoriesQuery, useGetFeaturesQuery } from '@/services'
import { useRouter } from 'next/router'
import { Category } from '@/types'
import { validationSchema } from '@/utils'
// مراحل فرم
const steps = ['مشخصات', 'قیمت', 'ویژگی‌ها', 'عکس و ویدئو']

interface FormValues {
  // مرحله 1 - مشخصات
  phoneNumber: string
  nationalCode?: string
  postalCode: string
  address: string
  category: string | null
  location: {
    lat: number
    lng: number
  }

  // مرحله 2 - قیمت
  price?: number
  discount?: number

  deposit?: number
  rent?: number
  convertible?: boolean

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

const MapLocationPicker = dynamic(() => import('@/components/map/MapLocationPicker'), { ssr: false })

const AdvertisementRegistrationForm: React.FC = () => {
  // ? Assets
  const { query } = useRouter()
  // ? Queries
  const { data: categoriesData, isFetching, ...categoryQueryProps } = useGetCategoriesQuery({ ...query })
  const { data: featuresData, isFetching:isFetchingFeature, ...featureQueryProps } = useGetFeaturesQuery({ ...query })
  // ? States
  const [currentStep, setCurrentStep] = useState(0)
  const [isShow, modalHandlers] = useDisclosure()
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category>(null)
  const [openIndex, setOpenIndex] = useState(null)
  const [isConvertible, setIsConvertible] = useState(false)

  const getDealTypeFromCategory = (category: Category) => {
    if (!category) return null

    const categoryName = category.name.toLowerCase()
    const parentCategoryName = category.parentCategory?.name.toLowerCase() || ''

    if (categoryName.includes('اجاره') || parentCategoryName.includes('اجاره')) {
      return 'rent' // اجاره
    }

    if (categoryName.includes('خرید') || parentCategoryName.includes('خرید')) {
      return 'sale' // فروش
    }

    return null // نامشخص
  }
  const dealType = getDealTypeFromCategory(selectedCategory)
  const {
    handleSubmit,
    control,
    register,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormValues>,
    mode: 'onChange',
    context: { dealType },
    defaultValues: {
      features: {
        rooms: 0,
        area: 0,
        parkingCount: 0,
        hasElevator: false,
        floor: 0,
      },
      convertible: false,
      media: {
        images: [],
      },
      location: {
        lat: 0,
        lng: 0,
      },
    },
  })

  useEffect(() => {
    if (selectedLocation) {
      setValue('location.lat', selectedLocation[0])
      setValue('location.lng', selectedLocation[1])
    }
  }, [selectedLocation, setValue])

  useEffect(() => {
    if (selectedCategory) {
      setValue('category', selectedCategory.id)
    }
  }, [selectedCategory, setValue])

  useEffect(() => {
    if (isConvertible) {
      setValue('convertible', isConvertible)
    }
  }, [isConvertible, setValue])

  const onSubmit = (data: FormValues) => {
    console.log('Form submitted:', data)
  }

  const validateCurrentStep = async () => {
    let fieldsToValidate: string[] = []

    switch (currentStep) {
      case 0:
        fieldsToValidate = ['phoneNumber', 'postalCode', 'address', 'category', 'location']
        break
      case 1:
        fieldsToValidate = ['price', 'discount', 'deposit', 'rent']
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

  const handleModalClose = (): void => {
    modalHandlers.close()
  }

  const handleLocationChange = (location: [number, number]) => {
    setSelectedLocation(location)
  }

  const handleSelectCategory = (category: Category) => {
    if (selectedCategory && selectedCategory.id === category.id) {
      setSelectedCategory(null)
      setValue('category', null)
    } else {
      setSelectedCategory(category)
    }
    handleModalClose()
  }

  const mapCategoryName = (name: string) => {
    if (name.includes('خرید')) {
      return name.replace('خرید', 'فروش')
    }
    return name
  }

  // تابع برای تشخیص نوع معامله
  // if (selectedCategory) {
  //   console.log(selectedCategory, 'selectedCategory')
  // }
  if (isFetching) return <div>loading...</div>
  if (isFetchingFeature) return <div>loading...</div>

  if (featuresData) {
    console.log(featuresData,"featuresData");
    
  }
  return (
    <div className="relative mb-44">
      <Modal isShow={isShow} onClose={handleModalClose} effect="buttom-to-fit">
        <Modal.Content
          onClose={handleModalClose}
          className="flex h-full flex-col gap-y-5 bg-white p-4 rounded-2xl rounded-b-none"
        >
          <Modal.Header onClose={handleModalClose}>
            <div className="pt-4">دسته بندی</div>
          </Modal.Header>
          <Modal.Body>
            <div className=" mt-2 w-full z-10">
              <div className="flex flex-col gap-y-3.5 px-4 py-2">
                {categoriesData.data.map((item, index) => (
                  <Disclosure key={index}>
                    {({ open }) => (
                      <>
                        <Disclosure.Button
                          onClick={() => setOpenIndex(openIndex === index ? null : index)}
                          className="!mt-0 flex w-full items-center justify-between py-2"
                        >
                          <div className="flex gap-x-1.5 items-center">
                            <img className="w-[24px] h-[24px]" src={item.imageUrl} alt={item.name} />
                            <span className="pl-3 whitespace-nowrap font-normal text-[14px] tracking-wide text-[#5A5A5A]">
                              {mapCategoryName(item.name)}
                            </span>
                          </div>
                          <ArrowLeftIcon
                            className={`w-5 h-5 ${openIndex === index ? '' : 'rotate-90 text-gray-700'} transition-all`}
                          />
                        </Disclosure.Button>
                        {item.children.length > 0 && openIndex === index && (
                          <Disclosure.Panel className="-mt-2">
                            {item.children.map((subItem, subIndex) => (
                              <div key={subIndex}>
                                {subItem.children && subItem.children.length > 0 ? (
                                  <Disclosure>
                                    {({ open: subOpen }) => (
                                      <>
                                        <Disclosure.Button
                                          className={`cursor-pointer mb-2 py-2 flex w-full items-center justify-between pr-[32px] ${
                                            selectedCategory && selectedCategory.id === subItem.id
                                              ? 'bg-gray-50 rounded-lg'
                                              : ''
                                          }`}
                                        >
                                          <span className="font-light text-[14px] text-[#5A5A5A]">
                                            {mapCategoryName(subItem.name)}
                                          </span>
                                          <ArrowLeftIcon
                                            className={`w-5 h-5 ml-4 ${
                                              subOpen ? '' : 'rotate-90 text-gray-700'
                                            } transition-all`}
                                          />
                                        </Disclosure.Button>
                                        <Disclosure.Panel className="-mt-2">
                                          {subItem.children.map((childItem, childIndex) => (
                                            <div
                                              key={childIndex}
                                              onClick={() => handleSelectCategory(childItem)}
                                              className={`cursor-pointer mb-2 py-2 flex w-full items-center justify-between pr-[32px] ${
                                                selectedCategory && selectedCategory.id === childItem.id
                                                  ? 'bg-gray-50 rounded-lg'
                                                  : ''
                                              }`}
                                            >
                                              <span className="font-light text-[14px] text-[#5A5A5A]">
                                                {mapCategoryName(childItem.name)}
                                              </span>
                                            </div>
                                          ))}
                                        </Disclosure.Panel>
                                      </>
                                    )}
                                  </Disclosure>
                                ) : (
                                  <div
                                    onClick={() => handleSelectCategory(subItem)}
                                    className={`cursor-pointer mb-2 py-2 flex w-full items-center justify-between pr-[32px] ${
                                      selectedCategory && selectedCategory.id === subItem.id
                                        ? 'bg-gray-50 rounded-lg'
                                        : ''
                                    }`}
                                  >
                                    <span className="font-light text-[14px] text-[#5A5A5A]">
                                      {mapCategoryName(subItem.name)}
                                    </span>
                                  </div>
                                )}
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
      <div className="mx-auto py-5 border rounded-[16px] bg-white">
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

        {currentStep !== 0 && (
          <div className="h-[54px] bg-[#FFE2E5] border border-[#D52133] rounded-[8px] flex-center mx-4 mt-12 ">
            <HouseIcon />
            <div className="text-sm font-normal text-[#D52133] whitespace-nowrap">دسته بندی:</div>
            <div className="font-medium text-base text-[#D52133] pr-1.5 ">{mapCategoryName(selectedCategory.name)}</div>
          </div>
        )}

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

              <MapLocationPicker selectedLocation={selectedLocation} handleLocationChange={handleLocationChange} />

              <div className="space-y-31">
                <label
                  className="block text-sm font-normal mb-2 text-gray-700 md:min-w-max lg:text-sm"
                  htmlFor="address"
                >
                  آدرس نوشتاری دقیق ملک را مشخص کنید
                </label>
                <textarea
                  placeholder="آدرس کامل را وارد کنید"
                  className="input h-24 resize-none border-[#E3E3E7] rounded-[8px] bg-white placeholder:text-xs pr-2"
                  id="address"
                  {...register('address')}
                />
                <div className="w-fit" dir={'ltr'}>
                  {' '}
                  <DisplayError adForm errors={errors.address} />
                </div>
              </div>

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
                    {!isShow}
                    {selectedCategory ? mapCategoryName(selectedCategory.name) : 'انتخاب'}
                  </span>
                  <ArrowLeftIcon
                    className={`w-5 h-5 text-[#9D9D9D] transition-transform ${isShow ? 'rotate-180' : ''}`}
                  />
                </div>
                <div className="w-fit" dir={'ltr'}>
                  {' '}
                  <DisplayError adForm errors={errors.category} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: قیمت */}
          {currentStep === 1 &&
            (dealType === 'sale' ? (
              <div className="space-y-4">
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      adForm
                      label="قیمت فروش"
                      type="number"
                      {...field}
                      control={control}
                      errors={errors.price}
                      placeholder="مثال : 100 میلیون تومان"
                    />
                  )}
                />

                <Controller
                  name="discount"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      adForm
                      label="تخفیف"
                      type="number"
                      {...field}
                      control={control}
                      errors={errors.discount}
                      placeholder="مثال : 10 میلیون(اختیاری)"
                    />
                  )}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <Controller
                  name="deposit"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      adForm
                      compacted
                      label="رهن یا ودیعه"
                      type="number"
                      {...field}
                      control={control}
                      errors={errors.deposit}
                      placeholder="مثال : 100 میلیون تومان"
                    />
                  )}
                />

                <Controller
                  name="rent"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      adForm
                      compacted
                      label="اجاره ماهیانه"
                      type="number"
                      {...field}
                      control={control}
                      errors={errors.rent}
                      placeholder="مثال : 10 میلیون "
                    />
                  )}
                />

                <div className="flex flex-row-reverse items-center gap-2 w-full pt-2">
                  <CustomCheckbox
                    name={`convertible`}
                    checked={isConvertible}
                    onChange={() => setIsConvertible((prev) => !prev)}
                    label=""
                    customStyle="bg"
                  />
                  <label htmlFor="convertible" className="flex items-center gap-2 w-full font-normal text-sm">
                    <RepeatIcon />
                    قابل تبدیل
                  </label>
                </div>
                <div className='flex items-center gap-2'>
                  <InfoCircleIcon />
                  <span className="text-[#5A5A5A] font-normal text-xs">
                    به ازای هر یک میلیون تومان ودیعه 30 هزار تومان اجاره عرف بازار می باشد.
                  </span>
                </div>
              </div>
            ))}

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
          <div className="w-full mt-6 absolute left-0 right-0 -bottom-[80px]">
            {currentStep !== 0 && (
              <Button
                type="button"
                onClick={handlePrev}
                className="w-[120px] bg-[#F6F7FB] border border-[#D52133] float-right h-[48px] text-[#D52133] hover:text-white rounded-lg font-bold text-sm hover:bg-[#D52133]"
              >
                قبلی
              </Button>
            )}

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="w-[120px] float-left h-[48px] text-white rounded-lg font-bold text-sm hover:bg-[#f75263]"
              >
                بعدی
              </Button>
            ) : (
              <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                ثبت آگهی
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdvertisementRegistrationForm
