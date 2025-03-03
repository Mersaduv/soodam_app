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
import { Button, CustomCheckbox, DisplayError, Modal, TextField, TextFiledPrice } from '@/components/ui'
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
import { AdFormValues, Category, Feature } from '@/types'
import { validationSchema } from '@/utils'
import { IoMdClose } from 'react-icons/io'
const rentalTerms = [
  { id: 1, name: 'روزهای عادی (شنبه تا سه شنبه)', icon: CalendarIcon },
  { id: 2, name: 'آخر هفته (چهارشنبه تا جمعه)', icon: CalendarTickIcon },
  { id: 3, name: 'روزهای خاص (تعطیلات و مناسبت ها)', icon: CalendarSearchIcon },
  { id: 4, name: 'هزینه هر نفر اضافه (به ازای هر شب)', icon: ProfileAddIcon },
]

const MapLocationPicker = dynamic(() => import('@/components/map/MapLocationPicker'), { ssr: false })
interface Props {
  roleUser: string
}
const AdvertisementRegistrationForm: React.FC<Props> = ({ roleUser }) => {
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const maxFiles = 8
  const [selectedVideos, setSelectedVideos] = useState<File[]>([])
  const maxVideos = 3
  const [playingIndex, setPlayingIndex] = useState(null)
  const [drawnPoints, setDrawnPoints] = useState([])
  const [selectedNames, setSelectedNames] = useState({})

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
      return 'constructionProjects' // اجاره کوتاه مدت
    }

    if (categoryName.includes('اجاره کوتاه مدت') || parentCategoryName.includes('اجاره کوتاه مدت')) {
      return 'shortRent' // اجاره کوتاه مدت
    }

    if (categoryName.includes('اجاره') || parentCategoryName.includes('اجاره')) {
      return 'rent' // اجاره بلندمدت
    }

    if (categoryName.includes('فروش') || parentCategoryName.includes('فروش')) {
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
    getValues,
    formState: { errors },
  } = useForm<AdFormValues>({
    resolver: yupResolver(validationSchema({ features: featureData, dealType })) as unknown as Resolver<AdFormValues>,
    mode: 'onChange',
    context: { dealType },
    defaultValues: {
      features: featureData
        .filter((item) => item.type === 'radio')
        .reduce((acc, field) => {
          acc[field.id] = 'اولویت ندارد'
          return acc
        }, {}),
      convertible: false,
      media: {
        images: [],
        videos: [],
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

  useEffect(() => {
    if (drawnPoints) {
      setValue('drawnPoints', drawnPoints)
    }
  }, [drawnPoints, setValue])

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
  const onSubmit = (data: AdFormValues) => {
    console.log('Form submitted:', data, roleUser)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (selectedFiles.length === maxFiles) return
    if (files) {
      const validFiles: any[] = []

      Array.from(files).forEach((file) => {
        const img = new Image()
        img.src = URL.createObjectURL(file)

        img.onload = () => {
          URL.revokeObjectURL(img.src)
          validFiles.push(file)
          if (validFiles.length === Array.from(files).length) {
            setSelectedFiles((prevFiles) => [...prevFiles, ...validFiles])
            if (validFiles.length > 0) {
              setValue('media.images', ((getValues('media.images') as File[]) || []).concat(validFiles))
            } else {
              setValue('media.images', [])
            }
          }
        }
      })
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (selectedVideos.length === maxVideos) return
    if (files) {
      setSelectedVideos([...selectedVideos, ...Array.from(files)])
    }
  }

  const handleDelete = (index: number, type = 'pic') => {
    if (type === 'pic') {
      setSelectedFiles((prevFiles) => {
        const updatedFiles = [...prevFiles]
        updatedFiles.splice(index, 1)
        return updatedFiles
      })

      setValue(
        'media.images',
        ((getValues('media.images') as File[]) || []).filter((_, i) => i !== index)
      )
    } else {
      setSelectedVideos((prevFiles) => {
        const updatedFiles = [...prevFiles]
        updatedFiles.splice(index, 1)
        return updatedFiles
      })

      setValue(
        'media.videos',
        ((getValues('media.videos') as File[]) || []).filter((_, i) => i !== index)
      )
    }
  }

  const mapCategoryName = (name: string) => {
    if (name.includes('خرید')) {
      return name.replace('خرید', 'فروش')
    }
    return name
  }

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
                    {() => (
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
            <HouseIcon width="24px" height="24px" />
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

              <MapLocationPicker
                label={'لوکیشن دقیق ملک'}
                selectedLocation={selectedLocation}
                handleLocationChange={handleLocationChange}
                drawnPoints={drawnPoints}
                setDrawnPoints={setDrawnPoints}
              />

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
                    <TextFiledPrice
                      adForm
                      label="قیمت فروش"
                      type="text"
                      name="price"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      errors={errors.price}
                      formatPrice={true}
                      placeholder="مثال : 100 میلیون تومان"
                    />
                  )}
                />

                <Controller
                  name="discount"
                  control={control}
                  render={({ field }) => (
                    <TextFiledPrice
                      adForm
                      label="تخفیف"
                      type="text"
                      name="discount"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      errors={errors.discount}
                      placeholder="مثال : 10 میلیون(اختیاری)"
                      formatPrice={true}
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
                    <TextFiledPrice
                      adForm
                      label="رهن یا ودیعه"
                      type="text"
                      name="deposit"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      errors={errors.deposit}
                      placeholder="مثال : 100 میلیون تومان"
                      formatPrice={true}
                    />
                  )}
                />

                <Controller
                  name="rent"
                  control={control}
                  render={({ field }) => (
                    <TextFiledPrice
                      adForm
                      label="اجاره ماهیانه"
                      type="text"
                      name="rent"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      errors={errors.rent}
                      placeholder="مثال : 10 میلیون "
                      formatPrice={true}
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
                    <RepeatIcon width="24px" height="24px" />
                    قابل تبدیل
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <InfoCircleIcon width="16px" height="16px" />
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
                      .map((field) => {
                        return (
                          <Controller
                            key={field.id}
                            name={`features.${field.id}`}
                            control={control}
                            render={() => (
                              <TextField
                                adForm
                                isDynamic
                                label={field.name}
                                {...field}
                                name={`features.${field.id}`}
                                control={control}
                                errors={errors.features?.[field.id]}
                                placeholder={field.placeholder}
                              />
                            )}
                          />
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
                          className="bg-white px-4 h-[40px] rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer"
                          onClick={() => toggleDropdown(item.id)}
                        >
                          {selectedNames[item.id] ? (
                            <span className="text-sm text-gray-700">{selectedNames[item.id]}</span>
                          ) : (
                            <span>انتخاب کنید</span>
                          )}{' '}
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
                                      setSelectedNames((prev) => ({ ...prev, [item.id]: value.name }))
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
                              defaultValue="ندارد"
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
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-[#FFF0F2] rounded-[10px] p-1">
                    <CameraSmIcon width="24px" height="24px" />
                  </div>
                  <h3 className="font-medium text-start">عکس آگهی</h3>
                </div>
                <div>
                  <input type="file" multiple className="hidden" id="Thumbnail" onChange={handleFileChange} />
                  <label htmlFor="Thumbnail" className="block cursor-pointer h-[102px] custom-dashed">
                    <div className="flex justify-center flex-col items-center w-full h-full gap-y-2">
                      <CameraIcon width="43px" height="43px" />
                      <h1 className=" border-[#5A5A5A] border-b w-fit font-normal text-xs text-[#5A5A5A]">
                        افزودن عکس
                      </h1>
                    </div>
                  </label>
                  <div className="grid grid-cols-4 gap-3 mt-3">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative custom-dashed p-[1px] pr-[1.5px]">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="h-[58px] w-full object-cover rounded-[4px]"
                        />
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 border hover:bg-red-500 hover:text-white bg-gray-50 p-0.5 rounded-full text-gray-500"
                          onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            handleDelete(index)
                          }}
                        >
                          <IoMdClose className="text-base" />
                        </button>
                      </div>
                    ))}
                    {/* نمایش جایگاه‌های خالی */}
                    {Array.from({ length: maxFiles - selectedFiles.length }).map((_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="w-full h-[58px] custom-dashed rounded-[4px] shadow-product flex items-center justify-center text-gray-500"
                      >
                        <PictureSmIcon width="24px" height="24px" />
                      </div>
                    ))}
                  </div>
                </div>
                {errors?.media?.images && <p className="text-red-500 text-sm mt-1">{errors.media.images.message}</p>}
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-[#FFF0F2] rounded-[10px] p-1">
                    <VideoSmIcon width="24px" height="24px" />
                  </div>
                  <h3 className="font-medium text-start">ویدئو آگهی</h3>
                </div>
                <div>
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    className="hidden"
                    id="VideoThumbnail"
                    onChange={handleVideoChange}
                  />
                  <label htmlFor="VideoThumbnail" className="block cursor-pointer h-[143px] custom-dashed">
                    <div className="flex justify-center flex-col items-center w-full h-full gap-y-2">
                      <VideoIcon width="43px" height="43px" />
                      <h1 className="border-[#5A5A5A] border-b w-fit font-normal text-xs text-[#5A5A5A]">
                        افزودن ویدئو
                      </h1>
                    </div>
                  </label>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {selectedVideos.map((file, index) => (
                      <div key={index} className="relative custom-dashed p-[1px] pr-[1.5px]">
                        <div className="relative">
                          <video
                            src={URL.createObjectURL(file)}
                            className="h-[58px] w-full object-cover rounded-[4px]"
                            id={`video-${index}`}
                            onPlay={() => {
                              const playButton = document.getElementById(`play-button-${index}`)
                              playButton.innerHTML = `
                                <div class="w-1 h-3 bg-white mx-0.5"></div>
                                <div class="w-1 h-3 bg-white mx-0.5"></div>
                              `
                            }}
                            onPause={() => {
                              const playButton = document.getElementById(`play-button-${index}`)
                              playButton.innerHTML = `
                                <div class="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                              `
                            }}
                          />
                          <div
                            className="absolute inset-0 flex items-center justify-center cursor-pointer"
                            onClick={() => {
                              const video = document.getElementById(`video-${index}`) as HTMLVideoElement
                              if (video.paused) {
                                video.play()
                              } else {
                                video.pause()
                              }
                            }}
                          >
                            <div className="w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                              <div id={`play-button-${index}`} className="flex items-center justify-center">
                                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 border hover:bg-red-500 hover:text-white bg-gray-50 p-0.5 rounded-full text-gray-500"
                          onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            handleDelete(index, 'vid')
                          }}
                        >
                          <IoMdClose className="text-base" />
                        </button>
                      </div>
                    ))}
                    {Array.from({
                      length: maxVideos - selectedVideos.length,
                    }).map((_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="w-full h-[58px] custom-dashed rounded-[4px] shadow-product flex items-center justify-center text-gray-500"
                      >
                        <PictureSmIcon width="24px" height="24px" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-[#FFF0F2] rounded-[10px] p-1">
                    <Cube3DSmIcon width="24px" height="24px" />
                  </div>
                  <h3 className="font-medium text-start">3D آگهی</h3>
                </div>
                <div>
                  <label className="block cursor-pointer h-[143px] custom-dashed">
                    <div className="flex justify-center flex-col items-center w-full h-full gap-y-2">
                      <Cube3DIcon width="43px" height="43px" />
                      <h1 className=" border-[#5A5A5A] border-b w-fit font-normal text-xs text-[#5A5A5A]">
                        افزودن عکس
                      </h1>
                    </div>
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <InfoCircleIcon width="16px" height="16px" />
                <span className="text-[#5A5A5A] font-normal text-xs">توضیحات مرتبط </span>
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

export default AdvertisementRegistrationForm
