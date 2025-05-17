import React, { useEffect, useState } from 'react'
import { useForm, Controller, Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { ArrowLeftIcon, UploadCloudIcon } from '@/icons'
import { Button, Combobox, DisplayError, TextField } from '@/components/ui'
import { useDisclosure } from '@/hooks'
import { useRouter } from 'next/router'
import { Category, EstateConsultantForm, Feature, MarketerUserForm } from '@/types'
import { estateConsultantRegisterFormValidationSchema, marketerUserFormValidationSchema } from '@/utils'
import { IoMdClose } from 'react-icons/io'
import jalaali from 'jalaali-js'
import dynamic from 'next/dynamic'
const iranCity = require('iran-city')
const toJalaali = (date: Date) => {
  const jalaaliDate = jalaali.toJalaali(date)
  return {
    day: jalaaliDate.jd,
    month: jalaaliDate.jm,
    year: jalaaliDate.jy,
  }
}
const days = Array.from({ length: 31 }, (_, i) => String(i + 1))
const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
const currentDateJalaali = toJalaali(new Date())
const currentYearJalaali = currentDateJalaali.year
const years = Array.from({ length: 100 }, (_, i) => String(currentYearJalaali - i))
const MapLocationPicker = dynamic(() => import('@/components/map/MapLocationPicker'), { ssr: false })
const EstateConsultantRegisterForm: React.FC = () => {
  // ? Assets
  const { query, push, back } = useRouter()
  // ? States
  const [selectedCategory, setSelectedCategory] = useState<Category>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isShow, modalHandlers] = useDisclosure()
  const [featureData, setFeatureData] = useState<Feature[]>([])
  const [isConvertible, setIsConvertible] = useState(false)
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null)
  const [drawnPoints, setDrawnPoints] = useState([])
  const [openIndex, setOpenIndex] = useState(null)
  const [openDropdowns, setOpenDropdowns] = useState({})
  const [selectedValues, setSelectedValues] = useState({})
  const [selectedBusinessLicenseFile, setSelectedBusinessLicenseFile] = useState<any[]>([])
  const [selectedNotionalCardBackFile, setSelectedNotionalCardBackFile] = useState<any[]>([])
  const [selectedNotionalCardFrontFile, setSelectedNotionalCardFrontFile] = useState<any[]>([])
  const [selectedIdImageFile, setSelectedIdImageFiles] = useState<any[]>([])
  const [selectedVideos, setSelectedVideos] = useState<File[]>([])
  const AllProvinces = iranCity.allProvinces()
  const [cities, setCities] = useState([])
  const {
    handleSubmit,
    control,
    register,
    trigger,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<EstateConsultantForm>({
    resolver: yupResolver(
      estateConsultantRegisterFormValidationSchema
    ) as unknown as Resolver<EstateConsultantForm>,
    mode: 'onChange',
    defaultValues: {},
  })

  // ? Re-Renders

  //? submit final step
  const onSubmit = (data: EstateConsultantForm) => {
    console.log('Form submitted:', data)
  }

  //? handlers

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name === 'province') {
        setCities(iranCity.citiesOfProvince(value.province?.id))
        setValue('city', {} as EstateConsultantForm['city'])
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, setValue])

  const handleModalClose = (): void => {
    modalHandlers.close()
  }

  const handleBack = () => {
    back()
  }

  const handleLocationChange = (location: [number, number]) => {
    setSelectedLocation(location)
  }

  const handleBusinessLicenseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const validFiles: any[] = []

      Array.from(files).forEach((file) => {
        const img = new Image()
        img.src = URL.createObjectURL(file)

        img.onload = () => {
          URL.revokeObjectURL(img.src)
          validFiles.push(file)
          setValue('businessLicenseImage', file, { shouldValidate: true })
          setSelectedBusinessLicenseFile([...validFiles])
        }
      })
    }
  }

  const handleNotionalCardBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const validFiles: any[] = []

      Array.from(files).forEach((file) => {
        const img = new Image()
        img.src = URL.createObjectURL(file)

        img.onload = () => {
          URL.revokeObjectURL(img.src)
          validFiles.push(file)
          setValue('businessLicenseImageBack', file, { shouldValidate: true })
          setSelectedNotionalCardBackFile([...validFiles])
        }
      })
    }
  }

  const handleNotionalCardFrontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const validFiles: any[] = []

      Array.from(files).forEach((file) => {
        const img = new Image()
        img.src = URL.createObjectURL(file)

        img.onload = () => {
          URL.revokeObjectURL(img.src)
          validFiles.push(file)
          setValue('businessLicenseImageFront', file, { shouldValidate: true })
          setSelectedNotionalCardFrontFile([...validFiles])
        }
      })
    }
  }

  const handleIdImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const validFiles: any[] = []

      Array.from(files).forEach((file) => {
        const img = new Image()
        img.src = URL.createObjectURL(file)

        img.onload = () => {
          URL.revokeObjectURL(img.src)
          validFiles.push(file)
          setValue('IdImage', file, { shouldValidate: true })
          setSelectedIdImageFiles([...validFiles])
        }
      })
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setSelectedVideos([...selectedVideos, ...Array.from(files)])
    }
  }

  if (errors) {
    console.log(errors, 'errors--errors')
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="">
      <div className="bg-white m-4 rounded-2xl border border-[#E3E3E7]">
        <div className="flex items-center gap-1 p-4">
          <button onClick={handleBack} className={`rounded-full w-fit p-1 -rotate-90 font-bold`}>
            <ArrowLeftIcon width="24px" height="24px" />
          </button>{' '}
          <h1 className="font-bold text-lg">ثبت نام املاک من</h1>
        </div>
        <div className="px-4 mt-3 space-y-4">
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => (
              <TextField
                adForm
                isMarketerForm
                label="نام و نام خانوادگی"
                {...field}
                control={control}
                isDarker
                errors={errors.fullName}
              />
            )}
          />

          <Controller
            name="fatherName"
            control={control}
            render={({ field }) => (
              <TextField
                adForm
                isMarketerForm
                isDarker
                label="نام پدر"
                {...field}
                control={control}
                errors={errors.fatherName}
              />
            )}
          />

          <Controller
            name="notionalCode"
            control={control}
            render={({ field }) => (
              <TextField
                adForm
                isMarketerForm
                isDarker
                label="کد ملی"
                type="number"
                {...field}
                control={control}
                errors={errors.notionalCode}
              />
            )}
          />

          <div className="space-y-1">
            <label htmlFor="" className="text-sm font-normal pb-1">
              استان
            </label>
            <Combobox
              control={control}
              name="province"
              list={AllProvinces}
              placeholder="لطفا استان خود را انتخاب کنید"
            />
            {errors.province?.name && <DisplayError errors={errors.province?.name} />}
          </div>
          <div className="space-y-1">
            <label htmlFor="" className="text-sm font-normal pb-1">
              شهر
            </label>
            <Combobox control={control} name="city" list={cities} placeholder="لطفا شهر خود را انتخاب کنید" />
            {errors.city?.name && <DisplayError errors={errors.city?.name} />}
          </div>

          <Controller
            name="licenseNumber"
            control={control}
            render={({ field }) => (
              <TextField
                adForm
                isMarketerForm
                label="شماره پروانه"
                isDarker
                type="number"
                {...field}
                control={control}
                errors={errors.licenseNumber}
              />
            )}
          />

          <Controller
            name="businessLicenseNumber"
            control={control}
            render={({ field }) => (
              <TextField
                adForm
                isMarketerForm
                label="شماره پروانه صنفی"
                isDarker
                type="number"
                {...field}
                control={control}
                errors={errors.businessLicenseNumber}
              />
            )}
          />

          <div className="">
            <input
              type="file"
              className="hidden"
              id="thumbnail-1"
              onChange={handleBusinessLicenseFileChange}
              accept="image/jpeg"
            />
            <label htmlFor="thumbnail-1" className="block cursor-pointer text-sm font-normal">
              <h3 className="text-start mb-1.5 font-normal">تصویر پروانه کسب</h3>
              {selectedBusinessLicenseFile.length > 0 ? (
                selectedBusinessLicenseFile.map((file: any, index: number) => (
                  <div
                    key={index}
                    className="text-sm rounded-lg p-0.5 text-gray-600 flex justify-center custom-dashed-marketer"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-[190px] object-contain  rounded-md"
                    />
                  </div>
                ))
              ) : (
                <div className="h-[190px] bg-[#FCFCFC] rounded-lg custom-dashed-marketer flex-center">
                  <div className="flex flex-col gap-2 items-center">
                    <UploadCloudIcon width="56px" height="48px" />
                    <h1 className="font-normal text-[#5A5A5A] border-[#5A5A5A] border-b w-fit">
                      افزودن تصویر پروانه کسب
                    </h1>
                  </div>
                </div>
              )}
            </label>
          </div>

          <div className="">
            <input
              type="file"
              className="hidden"
              id="thumbnail-2"
              onChange={handleNotionalCardBackFileChange}
              accept="image/jpeg"
            />
            <label htmlFor="thumbnail-2" className="block cursor-pointer text-sm font-normal">
              <h3 className="text-start mb-1.5 font-normal">تصویر کارت ملی (پشت)</h3>
              {selectedNotionalCardBackFile.length > 0 ? (
                selectedNotionalCardBackFile.map((file: any, index: number) => (
                  <div
                    key={index}
                    className="text-sm rounded-lg p-0.5 text-gray-600 flex justify-center custom-dashed-marketer"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-[190px] object-contain  rounded-md"
                    />
                  </div>
                ))
              ) : (
                <div className="h-[190px] bg-[#FCFCFC] rounded-lg custom-dashed-marketer flex-center">
                  <div className="flex flex-col gap-2 items-center">
                    <UploadCloudIcon width="56px" height="48px" />
                    <h1 className="font-normal text-[#5A5A5A] border-[#5A5A5A] border-b w-fit">
                      افزودن تصویر کارت ملی
                    </h1>
                  </div>
                </div>
              )}
            </label>
          </div>

          <div className="">
            <input
              type="file"
              className="hidden"
              id="thumbnail-3"
              onChange={handleNotionalCardFrontFileChange}
              accept="image/jpeg"
            />
            <label htmlFor="thumbnail-3" className="block cursor-pointer text-sm font-normal">
              <h3 className="text-start mb-1.5 font-normal">تصویر کارت ملی (رو)</h3>
              {selectedNotionalCardFrontFile.length > 0 ? (
                selectedNotionalCardFrontFile.map((file: any, index: number) => (
                  <div
                    key={index}
                    className="text-sm rounded-lg p-0.5 text-gray-600 flex justify-center custom-dashed-marketer"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-[190px] object-contain  rounded-md"
                    />
                  </div>
                ))
              ) : (
                <div className="h-[190px] bg-[#FCFCFC] rounded-lg custom-dashed-marketer flex-center">
                  <div className="flex flex-col gap-2 items-center">
                    <UploadCloudIcon width="56px" height="48px" />
                    <h1 className="font-normal text-[#5A5A5A] border-[#5A5A5A] border-b w-fit">
                      افزودن تصویر کارت ملی
                    </h1>
                  </div>
                </div>
              )}
            </label>
          </div>

          <div className="">
            <input
              type="file"
              className="hidden"
              id="thumbnail-4"
              onChange={handleIdImageFileChange}
              accept="image/jpeg"
            />
            <label htmlFor="thumbnail-4" className="block cursor-pointer text-sm font-normal">
              <h3 className="text-start mb-1.5 font-normal">تصویر صفحه اول شناسنامه</h3>
              {selectedIdImageFile.length > 0 ? (
                selectedIdImageFile.map((file: any, index: number) => (
                  <div
                    key={index}
                    className="text-sm rounded-lg p-0.5 text-gray-600 flex justify-center custom-dashed-marketer"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-[190px] object-contain  rounded-md"
                    />
                  </div>
                ))
              ) : (
                <div className="h-[190px] bg-[#FCFCFC] rounded-lg custom-dashed-marketer flex-center">
                  <div className="flex flex-col gap-2 items-center">
                    <UploadCloudIcon width="56px" height="48px" />
                    <h1 className="font-normal text-[#5A5A5A] border-[#5A5A5A] border-b w-fit">
                      افزودن تصویر شناسنامه
                    </h1>
                  </div>
                </div>
              )}
            </label>
          </div>

          <MapLocationPicker
            label={'لوکیشن دقیق ملک'}
            selectedLocation={selectedLocation}
            handleLocationChange={handleLocationChange}
            drawnPoints={drawnPoints}
            setDrawnPoints={setDrawnPoints}
            ads
          />

          <div className=" pb-6">
            <Controller
              name={`agreeToTerms`}
              control={control}
              defaultValue={false}
              render={({ field: { onChange, value } }) => (
                <label className="flex items-start cursor-pointer">
                  <div className="flex items-start cursor-pointer relative">
                    <input
                      type="checkbox"
                      className="peer h-[24px] w-[24px] cursor-pointer transition-all appearance-none rounded-lg border-[1.5px] checked:bg-[#D52133] checked:border-[#D52133]"
                      checked={value === true}
                      onChange={(e) => onChange(e.target.checked ? true : false)}
                    />
                    <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
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
                  <div className="font-medium text-xs text-[#5A5A5A] mr-2" style={{ lineHeight: '23px' }}>
                    با ورود و ثبت‌نام در اپلیکیشن، با{' '}
                    <span className="font-medium text-xs text-[#D52133] border-b border-[#D52133]">قوانین سودم</span>{' '}
                    موافقت می‌کنم.
                  </div>
                </label>
              )}
            />
          </div>
        </div>
      </div>
      {/* Navigation Buttons */}
      <div className="px-4 mt-10 pb-10">
        <Button
          type="submit"
          // onClick={() => push('/')}
          className="w-full font-bold text-sm rounded-lg"
        >
          ثبت نام به عنوان بازاریاب{' '}
        </Button>
      </div>
    </form>
  )
}

export default EstateConsultantRegisterForm
