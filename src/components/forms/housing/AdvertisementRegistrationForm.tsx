import React, { useEffect, useState } from 'react'
import { useForm, Controller, Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  ArrowLeftIcon,
  CheckIcon,
  HouseIcon,
  InfoCircleIcon,
  RepeatIcon,
  CalendarIcon,
  CalendarTickIcon,
  CalendarSearchIcon,
  ProfileAddIcon,
} from '@/icons'
import { Button, CustomCheckbox, DisplayError, Modal, TextField } from '@/components/ui'
interface Props {}
import * as yup from 'yup'
import dynamic from 'next/dynamic'
import { useDisclosure } from '@/hooks'
import { Disclosure } from '@headlessui/react'
import {
  useGetCategoriesQuery,
  useGetFeaturesByCategoryQuery,
  useGetFeaturesQuery,
  useLazyGetFeaturesByCategoryQuery,
} from '@/services'
import { useRouter } from 'next/router'
import { Category, Feature } from '@/types'
import { validationSchema } from '@/utils'
// مراحل فرم
const rentalTerms = [
  { id: 1, name: 'روزهای عادی (شنبه تا سه شنبه)', icon: CalendarIcon },
  { id: 2, name: 'آخر هفته (چهارشنبه تا جمعه)', icon: CalendarTickIcon },
  { id: 3, name: 'روزهای خاص (تعطیلات و مناسبت ها)', icon: CalendarSearchIcon },
  { id: 4, name: 'هزینه هر نفر اضافه (به ازای هر شب)', icon: ProfileAddIcon },
]
const options = [
  { id: 1, label: 'دو نیش' },
  { id: 2, label: 'سه نیش' },
  { id: 3, label: 'دو کله' },
  { id: 4, label: 'تک بر' },
]
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

  producerProfitPercentage?: number
  ownerProfitPercentage?: number

  capacity?: number
  extraPeople?: number
  rentalTerms?: { id: number; name: string }

  // مرحله 3 - ویژگی داینامیک چون دارایی سه نو هستن text , selective , radio
  title?: string
  features: {
    [key: string]: string // برای فیلدهای داینامیک
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
  // ? States
  const [currentStep, setCurrentStep] = useState(0)
  const [isShow, modalHandlers] = useDisclosure()
  const [isShowRentalTerms, modalRentalTermsHandlers] = useDisclosure()
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null)
  const [openIndex, setOpenIndex] = useState(null)
  const [isConvertible, setIsConvertible] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category>(null)
  const [selectedRentalTerm, setSelectedRentalTerm] = useState<{ id: number; name: string }>(null)
  const [isSelectCategorySkip, setIsSelectCategorySkip] = useState(true)
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValues, setSelectedValues] = useState({})
  const [openDropdowns, setOpenDropdowns] = useState({})
  const [featureData, setFeatureData] = useState<Feature[]>([])

  // ? Queries
  const { data: categoriesData, isFetching, ...categoryQueryProps } = useGetCategoriesQuery({ ...query })
  // const { data: featuresData, isFetching: isFetchingFeature, ...featureQueryProps } = useGetFeaturesQuery({ ...query })
  const [triggerGetFeaturesByCategory, { data: features }] = useLazyGetFeaturesByCategoryQuery()

  const getDealTypeFromCategory = (category: Category) => {
    if (!category) return null

    const categoryName = category.name.toLowerCase()
    const parentCategoryName = category.parentCategory?.name.toLowerCase() || ''

    if (
      categoryName.includes('ساخت') ||
      categoryName.includes('ساز') ||
      parentCategoryName.includes('ساخت') ||
      parentCategoryName.includes('ساز')
    ) {
      return 'constructionProjects' // اجاره کوتاه مدت
    }

    if (categoryName.includes('اجاره کوتاه مدت') || parentCategoryName.includes('اجاره کوتاه مدت')) {
      return 'shortRent' // اجاره کوتاه مدت
    }

    if (categoryName.includes('اجاره') || parentCategoryName.includes('اجاره')) {
      return 'rent' // اجاره بلندمدت
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
    resolver: yupResolver(validationSchema({ features: featureData, dealType })) as unknown as Resolver<FormValues>,
    mode: 'onChange',
    context: { dealType },
    defaultValues: {
      features: featureData
        .filter((item) => item.type === 'radio')
        .reduce((acc, field) => {
          acc[field.id] = 'ندارد'
          return acc
        }, {}),
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

  // ? Re-Renders
  useEffect(() => {
    if (selectedLocation) {
      setValue('location.lat', selectedLocation[0])
      setValue('location.lng', selectedLocation[1])
    }
  }, [selectedLocation, setValue])

  // useEffect(() => {
  //   if (selectedCategory) {
  //     setValue('category', selectedCategory.id)
  //     setIsSelectCategorySkip(false)
  //   }
  useEffect(() => {
    const fetchFeatures = async (category: Category | null, level = 0) => {
      if (!category || level > 2) return

      setCurrentCategoryId(category.id)

      // Trigger the query manually
      const fetchedFeatures = await triggerGetFeaturesByCategory(category.id)
      if (fetchedFeatures?.data?.data?.length === 0 && category.parentCategory) {
        // No features, try parent category
        fetchFeatures(category.parentCategory, level + 1)
      }
    }

    if (selectedCategory) {
      setValue('category', selectedCategory.id)
      fetchFeatures(selectedCategory)
    }
  }, [selectedCategory, setValue, triggerGetFeaturesByCategory])

  useEffect(() => {
    if (features) {
      setFeatureData(features.data)
    }
  }, [features])

  useEffect(() => {
    if (isConvertible) {
      setValue('convertible', isConvertible)
    }
  }, [isConvertible, setValue])

  //? submit final step
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
        fieldsToValidate = [
          'price',
          'discount',
          'deposit',
          'rent',
          'capacity',
          'producerProfitPercentage',
          'ownerProfitPercentage',
        ]
        break
      case 2:
        fieldsToValidate = ['title', 'features']
        break
      case 3:
        fieldsToValidate = ['media']
        break
    }

    const result = await trigger(fieldsToValidate as any)
    return result
  }

  //? handlers
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

  const handleSelectRentalTerms = (item: { id: number; name: string }) => {
    if (selectedRentalTerm && selectedRentalTerm.id === item.id) {
      setSelectedRentalTerm(null)
      setValue('rentalTerms', null)
    } else {
      setSelectedRentalTerm(item)
      setValue('rentalTerms', item)
    }
    modalRentalTermsHandlers.close()
  }

  const toggleDropdown = (id: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleSelect = (itemId: string, valueId: string) => {
    setSelectedValues((prev) => ({
      ...prev,
      [itemId]: prev[itemId]?.includes(valueId)
        ? prev[itemId].filter((v: string) => v !== valueId)
        : [...(prev[itemId] || []), valueId],
    }))
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

  if (features) {
    console.log(features, 'features')
  }

  let stepTitle = 'قیمت'
  if (
    selectedCategory?.parentCategory?.name?.includes('ساخت') ||
    selectedCategory?.parentCategory?.name?.includes('ساز')
  ) {
    stepTitle = 'سود'
  } else if (selectedCategory?.parentCategory?.name?.includes('اجاره کوتاه مدت')) {
    stepTitle = 'شرایط اجاره'
  }

  const steps = ['مشخصات', stepTitle, 'ویژگی‌ها', 'عکس و ویدئو']

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

      <Modal isShow={isShowRentalTerms} onClose={modalRentalTermsHandlers.close} effect="buttom-to-fit">
        <Modal.Content
          onClose={modalRentalTermsHandlers.close}
          className="flex h-full flex-col gap-y-5 bg-white p-4 rounded-2xl rounded-b-none"
        >
          <Modal.Header onClose={modalRentalTermsHandlers.close}>
            <div className="pt-4">اجاره</div>
          </Modal.Header>
          <Modal.Body>
            <div className=" mt-2 w-full z-10">
              <div className="flex flex-col gap-y-3.5 px-1 py-2">
                {rentalTerms.map((item, index) => (
                  <Disclosure key={index}>
                    {({ open }) => (
                      <>
                        <Disclosure.Button
                          onClick={() => handleSelectRentalTerms({ id: item.id, name: item.name })}
                          className="!mt-0 flex w-full items-center justify-between py-2"
                        >
                          <div className="flex gap-x-2 items-center">
                            <item.icon />
                            <span className="pl-3 whitespace-nowrap font-normal text-[14px] tracking-wide text-[#5A5A5A]">
                              {item.name}
                            </span>
                          </div>
                          <ArrowLeftIcon className={`w-5 h-5 rotate-90 transition-all`} />
                        </Disclosure.Button>
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
                  {index < currentStep && <CheckIcon width="12px" height="13px" />}
                  {step}
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
            <HouseIcon width='24px' height='24px' />
            <div className="text-sm font-normal text-[#D52133] whitespace-nowrap mr-1">دسته بندی:</div>
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
            ) : dealType === 'rent' ? (
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
                    <RepeatIcon  width="24px" height="24px" />
                    قابل تبدیل
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <InfoCircleIcon />
                  <span className="text-[#5A5A5A] font-normal text-xs">
                    به ازای هر یک میلیون تومان ودیعه 30 هزار تومان اجاره عرف بازار می باشد.
                  </span>
                </div>
              </div>
            ) : dealType === 'shortRent' ? (
              <div className="space-y-4">
                <Controller
                  name="capacity"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      adForm
                      compacted
                      label="ظرفیت"
                      type="number"
                      {...field}
                      control={control}
                      errors={errors.capacity}
                      placeholder="مثال : 10 نفر"
                    />
                  )}
                />

                <Controller
                  name="extraPeople"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      adForm
                      compacted
                      label="نفرات اضافه"
                      type="number"
                      {...field}
                      control={control}
                      errors={errors.extraPeople}
                      placeholder="مثال : 2 نفر"
                    />
                  )}
                />

                {/* <Controller
                name="rentalTerms"
                control={control}
                render={({ field }) => (
                  <TextField
                    adForm
                    compacted
                    label="شرایط اجاره"
                    type="text"
                    {...field}
                    control={control}
                    errors={errors.rentalTerms}
                    placeholder="شرایط اجاره را وارد کنید"
                  />
                )}
              /> */}
                <div>
                  <label
                    className={`block text-sm font-normal mb-2  text-gray-700 md:min-w-max lg:text-sm`}
                    htmlFor="category"
                  >
                    اجاره
                  </label>
                  <div
                    onClick={modalRentalTermsHandlers.open}
                    className="w-full cursor-pointer border-[1.5px] bg-[#FCFCFC] rounded-[8px] px-4 h-[40px] text-right text-[#5A5A5A] flex justify-between items-center"
                  >
                    <span className="text-[14px]">
                      {!isShowRentalTerms}
                      {selectedRentalTerm ? selectedRentalTerm.name : 'انتخاب'}
                    </span>
                    <ArrowLeftIcon
                      className={`w-5 h-5 text-[#9D9D9D] transition-transform ${isShowRentalTerms ? 'rotate-180' : ''}`}
                    />
                  </div>
                </div>
              </div>
            ) : dealType === 'constructionProjects' ? (
              <div className="space-y-4">
                <Controller
                  name="producerProfitPercentage"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      adForm
                      label="درصد سود سازنده"
                      type="number"
                      {...field}
                      control={control}
                      errors={errors.producerProfitPercentage}
                      placeholder="مثال: 50 درصد"
                    />
                  )}
                />

                <Controller
                  name="ownerProfitPercentage"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      adForm
                      label="درصد سود مالک"
                      type="number"
                      {...field}
                      control={control}
                      errors={errors.ownerProfitPercentage}
                      placeholder="مثال: 50 درصد"
                    />
                  )}
                />
              </div>
            ) : (
              <div>نوع معامله مشخص نیست</div>
            ))}

          {/* Step 3: ویژگی‌ها */}
          {currentStep === 2 && (
            <div>
              <div className="relative w-full">
                <div className="mb-3">
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        adForm
                        label="عنوان آگهی"
                        {...field}
                        control={control}
                        errors={errors.title}
                        placeholder="مثال: خانه ویلایی 300 متری خیابان جمهوری"
                      />
                    )}
                  />
                </div>

                <div className="space-y-3 mb-3">
                  {features &&
                    features.data
                      .filter((item) => item.type === '')
                      .map((field) => (
                        <Controller
                          key={field.id}
                          name={`features.${field.id}`}
                          control={control}
                          render={() => (
                            <TextField
                              adForm
                              label={field.name}
                              {...field}
                              control={control}
                              errors={errors.features?.[field.id]}
                              placeholder={field.placeholder}
                            />
                          )}
                        />
                      ))}
                </div>
                {features &&
                  features.data
                    .filter((item) => item.type === 'selective')
                    .map((item) => (
                      <div key={item.id} className="w-full mb-3">
                        <h1 className="font-normal text-sm mb-2">{item.name}</h1>
                        <div
                          className="bg-white px-4 h-[40px] rounded-lg border border-gray-200 flex justify-end items-center cursor-pointer"
                          onClick={() => toggleDropdown(item.id)}
                        >
                          <ArrowLeftIcon
                            className={`w-5 h-5 text-[#9D9D9D] transition-transform ${
                              openDropdowns[item.id] ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                        {/* Dropdown Content */}
                        {openDropdowns[item.id] && (
                          <div className="w-full mt-1.5 bg-[#FCFCFC] border border-[#E3E3E7] rounded-lg p-1">
                            {item.values.map((value) => (
                              <label
                                key={value.id}
                                className="inline-flex items-center p-3 hover:bg-[#F5F5F8] cursor-pointer w-full"
                              >
                                <div className="flex items-center cursor-pointer relative">
                                  <input
                                    type="radio" // تغییر به نوع radio
                                    name={`radio-${item.id}`} // استفاده از نام مشترک برای گروه بندی
                                    checked={selectedValues[item.id] === value.id} // بررسی مقدار انتخاب‌شده
                                    onChange={() => setSelectedValues((prev) => ({ ...prev, [item.id]: value.id }))}
                                    className="peer h-[18px] w-[18px] cursor-pointer transition-all appearance-none rounded border-[1.5px] border-[#D52133] checked:bg-[#D52133] checked:border-[#D52133]"
                                    id={value.id}
                                  />
                                  <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3.5 w-3.5"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                      stroke="currentColor"
                                      strokeWidth="1"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      ></path>
                                    </svg>
                                  </span>
                                </div>
                                <span className="mr-3 font-normal text-[13px] text-[#5A5A5A]">{value.name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        <div className="w-fit" dir={'ltr'}>
                          {' '}
                          <DisplayError adForm errors={errors.features?.[item.id]} />
                        </div>
                      </div>
                    ))}

                <div className="space-y-4 mt-5">
                  {features &&
                    features.data
                      .filter((item) => item.type === 'radio')
                      .map((field) => (
                        <div className="flex items-center justify-between  bg-white rounded-lg">
                          <span className="font-normal text-sm">{field.name}</span>
                          <div className="flex gap-4">
                            <Controller
                              name={`features.${field.id}`}
                              control={control}
                              defaultValue=""
                              render={({ field: { onChange, value } }) => (
                                <>
                                  <label className="flex items-center cursor-pointer">
                                    <input
                                      type="radio"
                                      className="hidden"
                                      checked={value === 'دارد'}
                                      onChange={() => onChange('دارد')}
                                    />
                                    <div
                                      className={`w-6 h-6 rounded-full border flex items-center justify-center border-[#E3E3E7]`}
                                    >
                                      {value === 'دارد' && <div className="w-3 h-3 rounded-full bg-[#D52133]" />}
                                    </div>
                                    <span className="mr-2 font-normal text-xs">دارد</span>
                                  </label>

                                  <label className="flex items-center cursor-pointer">
                                    <input
                                      type="radio"
                                      className="hidden"
                                      checked={value === 'ندارد'}
                                      onChange={() => onChange('ندارد')}
                                    />
                                    <div
                                      className={`w-6 h-6 rounded-full border flex items-center justify-center border-[#E3E3E7]`}
                                    >
                                      {value === 'ندارد' && <div className="w-3 h-3 rounded-full bg-[#D52133]" />}
                                    </div>
                                    <span className="mr-2 font-normal text-xs">ندارد</span>
                                  </label>
                                </>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                </div>
              </div>
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
