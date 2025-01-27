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
  CameraIcon,
  CameraSmIcon,
  PictureSmIcon,
  VideoSmIcon,
  VideoIcon,
  Cube3DSmIcon,
  Cube3DIcon,
} from '@/icons'
import { Button, CustomCheckbox, DisplayError, Modal, TextField } from '@/components/ui'
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
import { AdFormValues, Category, Feature, RequestFormValues } from '@/types'
import { validationRequestSchema, validationSchema } from '@/utils'
import { IoMdClose } from 'react-icons/io'
const MapLocationPicker = dynamic(() => import('@/components/map/MapLocationPicker'), { ssr: false })

const RequestRegistrationForm: React.FC = () => {
  // ? Assets
  const { query } = useRouter()
  // ? States
  const [selectedCategory, setSelectedCategory] = useState<Category>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isShow, modalHandlers] = useDisclosure()
  const [featureData, setFeatureData] = useState<Feature[]>([])
  const [isConvertible, setIsConvertible] = useState(false)
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null)
  const [openIndex, setOpenIndex] = useState(null)
  const [openDropdowns, setOpenDropdowns] = useState({})
  const [selectedValues, setSelectedValues] = useState({})
  // ? Queries
  const { data: categoriesData, isFetching } = useGetCategoriesQuery({ ...query })
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
      return 'constructionProjects'
    }

    if (categoryName.includes('اجاره کوتاه مدت') || parentCategoryName.includes('اجاره کوتاه مدت')) {
      return 'shortRent'
    }

    if (categoryName.includes('اجاره') || parentCategoryName.includes('اجاره')) {
      return 'rent'
    }

    if (categoryName.includes('خرید') || parentCategoryName.includes('خرید')) {
      return 'sale'
    }

    return null
  }

  const dealType = getDealTypeFromCategory(selectedCategory)
  const {
    handleSubmit,
    control,
    register,
    trigger,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<RequestFormValues>({
    resolver: yupResolver(
      validationRequestSchema({ features: featureData, dealType })
    ) as unknown as Resolver<RequestFormValues>,
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
  const onSubmit = (data: RequestFormValues) => {
    console.log('Form submitted:', data)
  }

  const validateCurrentStep = async () => {
    let fieldsToValidate: string[] = []

    switch (currentStep) {
      case 0:
        fieldsToValidate = ['phoneNumber', 'fullName', 'category', 'location']
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

  const handleLocationChange = (location: [number, number]) => {
    setSelectedLocation(location)
  }

  const handleModalClose = (): void => {
    modalHandlers.close()
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

  const toggleDropdown = (id: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [id]: !prev[id] }))
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

  const steps = ['مشخصات', stepTitle, 'ویژگی‌ها']

  if (isFetching) return <div>loading...</div>
  if (errors) {
    console.log(errors, 'errors--errors')
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
                  <Disclosure key={item.id}>
                    {() => (
                      <>
                        <Disclosure.Button
                          onClick={() => setOpenIndex((prev) => (prev === index ? null : index))}
                          className="!mt-0 flex w-full items-center justify-between py-2"
                        >
                          <div className="flex gap-x-1.5 items-center">
                            {item.imageUrl && <img className="w-[24px] h-[24px]" src={item.imageUrl} alt={item.name} />}
                            <span className="pl-3 whitespace-nowrap font-normal text-[14px] tracking-wide text-[#5A5A5A]">
                              {item.name}
                            </span>
                          </div>
                          <ArrowLeftIcon
                            className={`w-5 h-5 ${openIndex === index ? '' : 'rotate-90 text-gray-700'} transition-all`}
                          />
                        </Disclosure.Button>

                        {item.children?.length > 0 && openIndex === index && (
                          <Disclosure.Panel className="-mt-2">
                            {item.children.map((subItem) => (
                              <div key={subItem.id}>
                                {subItem.children?.length > 0 ? (
                                  <Disclosure>
                                    {({ open: subOpen }) => (
                                      <>
                                        <Disclosure.Button
                                          className={`cursor-pointer mb-2 py-2 flex w-full items-center justify-between pr-[32px] ${
                                            selectedCategory?.id === subItem.id ? 'bg-gray-50 rounded-lg' : ''
                                          }`}
                                        >
                                          <span className="font-light text-[14px] text-[#5A5A5A]">{subItem.name}</span>
                                          <ArrowLeftIcon
                                            className={`w-5 h-5 ml-4 ${
                                              subOpen ? '' : 'rotate-90 text-gray-700'
                                            } transition-all`}
                                          />
                                        </Disclosure.Button>

                                        <Disclosure.Panel className="-mt-2">
                                          {subItem.children.map((childItem) => (
                                            <div
                                              key={childItem.id}
                                              onClick={() => handleSelectCategory(childItem)}
                                              className={`cursor-pointer mb-2 py-2 flex w-full items-center justify-between pr-[32px] ${
                                                selectedCategory?.id === childItem.id ? 'bg-gray-50 rounded-lg' : ''
                                              }`}
                                            >
                                              <span className="font-light text-[14px] text-[#5A5A5A]">
                                                {childItem.name}
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
                                      selectedCategory?.id === subItem.id ? 'bg-gray-50 rounded-lg' : ''
                                    }`}
                                  >
                                    <span className="font-light text-[14px] text-[#5A5A5A]">{subItem.name}</span>
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
            <HouseIcon width="24px" height="24px" />
            <div className="text-sm font-normal text-[#D52133] whitespace-nowrap mr-1">دسته بندی:</div>
            <div className="font-medium text-base text-[#D52133] pr-1.5 ">{selectedCategory.name}</div>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-4 pt-6">
          {/* Step 1: مشخصات */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <Controller
                name="fullName"
                control={control}
                render={({ field }) => (
                  <TextField
                    adForm
                    label="نام و نام خانوادگی"
                    type="text"
                    {...field}
                    control={control}
                    errors={errors.fullName}
                    placeholder="نام و نام خانوادگی (اجباری)"
                  />
                )}
              />
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
                    {selectedCategory ? selectedCategory.name : 'انتخاب'}
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
              <MapLocationPicker
                label={'محدوده ملک'}
                selectedLocation={selectedLocation}
                handleLocationChange={handleLocationChange}
              />
            </div>
          )}
          {/* /* Step 2: قیمت */}
          {currentStep === 1 &&
            (dealType === 'sale' ? (
              <div className="space-y-4">
                <div className="flex">
                  <div className="flex gap-2 w-full">
                    <div className="flex items-end pb-3 font-normal text-sm">از</div>
                    <Controller
                      name="priceRange.from"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          isFromTo
                          adForm
                          compacted
                          label="قیمت فروش"
                          type="number"
                          {...field}
                          control={control}
                          errors={errors.priceRange?.from}
                          placeholder="مثال: 100 میلیون تومان"
                        />
                      )}
                    />
                  </div>
                  <div className="flex gap-2 w-full">
                    <div className="flex items-end pb-3 pr-2 font-normal text-sm">تا</div>
                    <Controller
                      name="priceRange.to"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          isFromTo
                          adForm
                          compacted
                          label="isTo"
                          type="number"
                          {...field}
                          control={control}
                          errors={errors.priceRange?.to}
                          placeholder="مثال: 1 میلیارد تومان"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            ) : dealType === 'rent' ? (
              <div className="space-y-4">
                <div className="flex">
                  <div className="flex gap-2 w-full">
                    <div className="flex items-end pb-3 font-normal text-sm">از</div>
                    <Controller
                      name="depositRange.from"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          isFromTo
                          adForm
                          compacted
                          label="رهن یا ودیعه"
                          type="number"
                          {...field}
                          control={control}
                          errors={errors.depositRange?.from}
                          placeholder="مثال: 100 میلیون تومان"
                        />
                      )}
                    />
                  </div>
                  <div className="flex gap-2 w-full">
                    <div className="flex items-end pb-3 pr-2 font-normal text-sm">تا</div>
                    <Controller
                      name="depositRange.to"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          isFromTo
                          adForm
                          compacted
                          label="isTo"
                          type="number"
                          {...field}
                          control={control}
                          errors={errors.depositRange?.to}
                          placeholder="مثال: 12 میلیارد تومان"
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="flex">
                  <div className="flex gap-2 w-full">
                    <div className="flex items-end pb-3 font-normal text-sm">از</div>
                    <Controller
                      name="rent.from"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          isFromTo
                          adForm
                          compacted
                          label="اجاره ماهیانه"
                          type="number"
                          {...field}
                          control={control}
                          errors={errors.rent?.from}
                          placeholder="مثال: 100,000 تومان"
                        />
                      )}
                    />
                  </div>
                  <div className="flex gap-2 w-full">
                    <div className="flex items-end pb-3 pr-2 font-normal text-sm">تا</div>
                    <Controller
                      name="rent.to"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          isFromTo
                          adForm
                          compacted
                          label="isTo"
                          type="number"
                          {...field}
                          control={control}
                          errors={errors.rent?.to}
                          placeholder="مثال: 10,000,000 تومان"
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="flex flex-row-reverse items-center gap-2 w-full pt-2">
                  <CustomCheckbox
                    name={`convertible`}
                    checked={isConvertible}
                    onChange={() => setIsConvertible((prev) => !prev)}
                    label=""
                    customStyle="bg"
                  />
                  <label htmlFor="convertible" className="flex items-center gap-2 w-full font-normal text-sm">
                    <RepeatIcon width="24px" height="24px" />
                    قابل تبدیل
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <InfoCircleIcon width="16px" height="16px" />
                  <span className="text-[#5A5A5A] font-normal text-xs">
                    به ازای هر یک میلیون تومان ودیعه 30 هزار تومان اجاره عرف بازار می‌باشد.
                  </span>
                </div>
              </div>
            ) : dealType === 'shortRent' ? (
              <div className="space-y-4">
                <div className="flex">
                  <div className="flex gap-2 w-full">
                    <div className="flex items-end pb-3 font-normal text-sm">از</div>
                    <Controller
                      name="capacity.from"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          isFromTo
                          adForm
                          compacted
                          label="ظرفیت"
                          type="number"
                          {...field}
                          control={control}
                          errors={errors.capacity?.from}
                          placeholder="مثال: 5 نفر"
                        />
                      )}
                    />
                  </div>
                  <div className="flex gap-2 w-full">
                    <div className="flex items-end pb-3 pr-2 font-normal text-sm">تا</div>
                    <Controller
                      name="capacity.to"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          isFromTo
                          adForm
                          compacted
                          label="isTo"
                          type="number"
                          {...field}
                          control={control}
                          errors={errors.capacity?.to}
                          placeholder="مثال: 20 نفر"
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="flex">
                  <div className="flex gap-2 w-full">
                    <div className="flex items-end pb-3 font-normal text-sm">از</div>
                    <Controller
                      name="extraPeople.from"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          isFromTo
                          adForm
                          compacted
                          label="نفرات اضافه"
                          type="number"
                          {...field}
                          control={control}
                          errors={errors.extraPeople?.from}
                          placeholder="مثال: 1 نفر"
                        />
                      )}
                    />
                  </div>
                  <div className="flex gap-2 w-full">
                    <div className="flex items-end pb-3 pr-2 font-normal text-sm">تا</div>
                    <Controller
                      name="extraPeople.to"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          isFromTo
                          adForm
                          compacted
                          label="isTo"
                          type="number"
                          {...field}
                          control={control}
                          errors={errors.extraPeople?.to}
                          placeholder="مثال: 5 نفر"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            ) : dealType === 'constructionProjects' ? (
              <div className="space-y-4">
                <div className="flex">
                  <div className="flex gap-2 w-full">
                    <div className="flex items-end pb-3 font-normal text-sm">از</div>
                    <Controller
                      name="producerProfitPercentage.from"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          isFromTo
                          adForm
                          compacted
                          label="درصد سود سازنده"
                          type="number"
                          {...field}
                          control={control}
                          errors={errors.producerProfitPercentage?.from}
                          placeholder="مثال: 20 درصد"
                        />
                      )}
                    />
                  </div>
                  <div className="flex gap-2 w-full">
                    <div className="flex items-end pb-3 pr-2 font-normal text-sm">تا</div>
                    <Controller
                      name="producerProfitPercentage.to"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          isFromTo
                          adForm
                          compacted
                          label="isTo"
                          type="number"
                          {...field}
                          control={control}
                          errors={errors.producerProfitPercentage?.to}
                          placeholder="مثال: 50 درصد"
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="flex">
                  <div className="flex gap-2 w-full">
                    <div className="flex items-end pb-3 font-normal text-sm">از</div>
                    <Controller
                      name="ownerProfitPercentage.from"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          isFromTo
                          adForm
                          compacted
                          label="درصد سود مالک"
                          type="number"
                          {...field}
                          control={control}
                          errors={errors.ownerProfitPercentage?.from}
                          placeholder="مثال: 10 درصد"
                        />
                      )}
                    />
                  </div>
                  <div className="flex gap-2 w-full">
                    <div className="flex items-end pb-3 pr-2 font-normal text-sm">تا</div>
                    <Controller
                      name="ownerProfitPercentage.to"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          isFromTo
                          adForm
                          compacted
                          label="isTo"
                          type="number"
                          {...field}
                          control={control}
                          errors={errors.ownerProfitPercentage?.to}
                          placeholder="مثال: 40 درصد"
                        />
                      )}
                    />
                  </div>
                </div>
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
                      .map((field) => {
                        return (
                          <div key={field.id} className="flex">
                            <div className="flex gap-2 w-full">
                              <div className="flex items-end pb-3 font-normal text-sm">از</div>
                              <Controller
                                name={`features.${field.id}.from`}
                                control={control}
                                render={({ field: controllerField }) => (
                                  <TextField
                                    isFromTo
                                    adForm
                                    isDynamic
                                    compacted
                                    label={field.name}
                                    {...controllerField}
                                    control={control}
                                    placeholder={`${field.placeholder}`}
                                  />
                                )}
                              />
                            </div>
                            <div className="flex gap-2 w-full">
                              <div className="flex items-end pb-3 pr-2 font-normal text-sm">تا</div>
                              <Controller
                                name={`features.${field.id}.to`}
                                control={control}
                                render={({ field: controllerField }) => (
                                  <TextField
                                    isFromTo
                                    adForm
                                    isDynamic
                                    compacted
                                    label={'isTo'}
                                    {...controllerField}
                                    control={control}
                                    placeholder={`${field.placeholder}`}
                                  />
                                )}
                              />
                            </div>
                          </div>
                        )
                      })}
                </div>

                <div className="space-y-4 mb-4">
                  {features &&
                    features.data
                      .filter((item) => item.type === 'check')
                      .map((field) => (
                        <div
                          key={field.id}
                          className="flex items-center w-fit justify-between bg-white rounded-lg gap-2"
                        >
                          <Controller
                            name={`features.${field.id}`}
                            control={control}
                            defaultValue="false"
                            render={({ field: { onChange, value } }) => (
                              <label className="flex items-center cursor-pointer">
                                <div className="flex items-center cursor-pointer relative">
                                  <input
                                    type="checkbox"
                                    className="peer h-[18px] w-[18px] cursor-pointer transition-all appearance-none rounded border-[1.5px] border-[#17A586] checked:bg-[#17A586] checked:border-[#17A586]"
                                    checked={value === 'true'}
                                    onChange={(e) => onChange(e.target.checked ? 'true' : 'false')} // مقدار را به صورت string ذخیره می‌کند
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
                                <span className="font-normal text-xs text-[#5A5A5A] mr-2">{field.name}</span>
                              </label>
                            )}
                          />
                        </div>
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
                        {openDropdowns[item.id] && (
                          <div className="w-full mt-1.5 bg-[#FCFCFC] border border-[#E3E3E7] rounded-lg p-1">
                            {item.values.map((value) => (
                              <label
                                key={value.id}
                                className="inline-flex items-center p-3 hover:bg-[#F5F5F8] cursor-pointer w-full"
                              >
                                <div className="flex items-center cursor-pointer relative">
                                  <input
                                    type="radio"
                                    name={`radio-${item.id}`}
                                    checked={selectedValues[item.id] === value.id}
                                    onChange={() => {
                                      setSelectedValues((prev) => ({ ...prev, [item.id]: value.id }))
                                      setValue(`features.${item.id}`, value.name) // مقداردهی به فرم
                                    }}
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
                              defaultValue="اولویت ندارد"
                              render={({ field: { onChange, value } }) => (
                                <>
                                  <label className="flex items-center cursor-pointer">
                                    <input
                                      type="radio"
                                      className="hidden"
                                      checked={value === 'اولویت دارد'}
                                      onChange={() => onChange('اولویت دارد')}
                                    />
                                    <div
                                      className={`w-6 h-6 rounded-full border flex items-center justify-center border-[#E3E3E7]`}
                                    >
                                      {value === 'اولویت دارد' && <div className="w-3 h-3 rounded-full bg-[#D52133]" />}
                                    </div>
                                    <span className="mr-2 font-normal text-xs">اولویت دارد</span>
                                  </label>

                                  <label className="flex items-center cursor-pointer">
                                    <input
                                      type="radio"
                                      className="hidden"
                                      checked={value === 'اولویت ندارد'}
                                      onChange={() => onChange('اولویت ندارد')}
                                    />
                                    <div
                                      className={`w-6 h-6 rounded-full border flex items-center justify-center border-[#E3E3E7]`}
                                    >
                                      {value === 'اولویت ندارد' && (
                                        <div className="w-3 h-3 rounded-full bg-[#D52133]" />
                                      )}
                                    </div>
                                    <span className="mr-2 font-normal text-xs">اولویت ندارد</span>
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
              <Button
                type="submit"
                className="w-[120px] float-left h-[48px] whitespace-nowrap text-white rounded-lg font-bold text-sm hover:bg-[#f75263]"
              >
                ثبت نهایی{' '}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default RequestRegistrationForm
