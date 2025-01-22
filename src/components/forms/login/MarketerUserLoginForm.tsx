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
  UploadCloudIcon,
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
import { AdFormValues, Category, Feature, MarketerUserForm, RequestFormValues } from '@/types'
import { marketerUserFormValidationSchema, validationRequestSchema, validationSchema } from '@/utils'
import { IoMdClose } from 'react-icons/io'
import jalaali from 'jalaali-js'
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

const MarketerUserLoginForm: React.FC = () => {
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
  const [openIndex, setOpenIndex] = useState(null)
  const [openDropdowns, setOpenDropdowns] = useState({})
  const [selectedValues, setSelectedValues] = useState({})
  const [selectedNotionalCardFrontFile, setSelectedNotionalCardFrontFiles] = useState<any[]>([])
  const [selectedNotionalCardBackFile, setSelectedNotionalCardBackFiles] = useState<any[]>([])
  const [selectedIdImageFile, setSelectedIdImageFiles] = useState<any[]>([])
  const [selectedVideos, setSelectedVideos] = useState<File[]>([])

  const {
    handleSubmit,
    control,
    register,
    trigger,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<MarketerUserForm>({
    resolver: yupResolver(marketerUserFormValidationSchema) as unknown as Resolver<MarketerUserForm>,
    mode: 'onChange',
    defaultValues: {},
  })

  // ? Re-Renders

  //? submit final step
  const onSubmit = (data: MarketerUserForm) => {
    console.log('Form submitted:', data)
  }

  //? handlers
  const handleDateChange = (field: 'day' | 'month' | 'year', value: string) => {
    const birthDate = watch('birthDate') || ''
    const [year, month, day] = birthDate.split('/')
    const newBirthDate = {
      day: field === 'day' ? value : day,
      month: field === 'month' ? value : month,
      year: field === 'year' ? value : year,
    }
    setValue('birthDate', `${newBirthDate.year}/${newBirthDate.month}/${newBirthDate.day}`)
  }
  const handleModalClose = (): void => {
    modalHandlers.close()
  }

  const handleBack = () => {
    back()
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
          setValue('nationalCardFrontImage', file, { shouldValidate: true })
          setSelectedNotionalCardFrontFiles([...validFiles])
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
          setValue('nationalCardBackImage', file, { shouldValidate: true })
          setSelectedNotionalCardBackFiles([...validFiles])
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

  const handleDelete = (index: number) => {
    setSelectedVideos((prevFiles) => {
      const updatedFiles = [...prevFiles]
      updatedFiles.splice(index, 1)
      setValue('scannedImage', updatedFiles[0])
      return updatedFiles
    })
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
          <h1 className="font-bold text-lg">با ثبت فایل ملک درآمد کسب کن!</h1>
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
                label="کد ملی"
                type="number"
                {...field}
                control={control}
                errors={errors.notionalCode}
              />
            )}
          />

          <Controller
            name="idCode"
            control={control}
            render={({ field }) => (
              <TextField
                adForm
                isMarketerForm
                label="شماره شناسنامه"
                type="number"
                {...field}
                control={control}
                errors={errors.idCode}
              />
            )}
          />

          <Controller
            name="birthDate"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col">
                <label className="mb-1 text-sm  font-normal" htmlFor="">
                  تاریخ تولد
                </label>
                <div className="select-container flex items-center gap-1 w-full">
                  <select
                    className="w-full border border-[#E3E3E7] bg-[#FCFCFC] rounded-lg h-[40px]"
                    onChange={(e) => handleDateChange('day', e.target.value)}
                    value={field.value?.split('/')[2] || ''}
                  >
                    <option value="">روز</option>
                    {days.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                  <span className="text-[#7A7A7A] font-normal text-[20px]">/</span>
                  <select
                    className="w-full border border-[#E3E3E7] bg-[#FCFCFC] rounded-lg h-[40px]"
                    onChange={(e) => handleDateChange('month', e.target.value)}
                    value={field.value?.split('/')[1] || ''}
                  >
                    <option value="">ماه</option>
                    {months.map((month, index) => (
                      <option key={index + 1} value={String(index + 1)}>
                        {month}
                      </option>
                    ))}
                  </select>
                  <span className="text-[#7A7A7A] font-normal text-[20px]">/</span>
                  <select
                    className="w-full border border-[#E3E3E7] bg-[#FCFCFC] rounded-lg h-[40px]"
                    onChange={(e) => handleDateChange('year', e.target.value)}
                    value={field.value?.split('/')[0] || ''}
                  >
                    <option value="">سال</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          />

          <Controller
            name="bankAccountNumber"
            control={control}
            render={({ field }) => (
              <TextField
                adForm
                isMarketerForm
                label="شماره کارت"
                type="number"
                {...field}
                control={control}
                errors={errors.bankAccountNumber}
              />
            )}
          />

          <Controller
            name="shabaNumber"
            control={control}
            render={({ field }) => (
              <TextField
                adForm
                isMarketerForm
                label="شماره شبا"
                type="number"
                {...field}
                control={control}
                errors={errors.shabaNumber}
              />
            )}
          />

          <div>
            <span className="mb-1 text-sm  font-normal">وضعیت تاهل</span>
            <Controller
              name="maritalStatus"
              control={control}
              render={({ field }) => (
                <div className="flex gap-10 justify-start mt-2.5">
                  <div className="flex items-center">
                    <label
                      htmlFor="default-radio-1"
                      className="cursor-pointer flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      <input
                        id="default-radio-1"
                        type="radio"
                        {...field}
                        value="single"
                        checked={field.value === 'single'}
                        name="default-radio"
                        className="hidden"
                      />
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center border-[#E3E3E7]`}>
                        {field.value === 'single' && <div className="w-3 h-3 rounded-full bg-[#D52133]" />}
                      </div>

                      <span className="font-normal text-xs">مجرد</span>
                    </label>
                  </div>

                  <div className="flex items-center">
                    <label
                      htmlFor="default-radio-2"
                      className="cursor-pointer flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      <input
                        id="default-radio-2"
                        type="radio"
                        {...field}
                        value="single"
                        checked={field.value === 'married'}
                        name="default-radio"
                        className="hidden"
                      />
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center border-[#E3E3E7]`}>
                        {field.value === 'married' && <div className="w-3 h-3 rounded-full bg-[#D52133]" />}
                      </div>

                      <span className="font-normal text-xs">متاهل</span>
                    </label>
                  </div>
                </div>
              )}
            />
          </div>

          <div className="">
            <input
              type="file"
              className="hidden"
              id="thumbnail-1"
              onChange={handleNotionalCardBackFileChange}
              accept="image/jpeg"
            />
            <label htmlFor="thumbnail-1" className="block cursor-pointer text-sm font-normal">
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
              id="thumbnail-2"
              onChange={handleNotionalCardFrontFileChange}
              accept="image/jpeg"
            />
            <label htmlFor="thumbnail-2" className="block cursor-pointer text-sm font-normal">
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
              id="thumbnail-3"
              onChange={handleIdImageFileChange}
              accept="image/jpeg"
            />
            <label htmlFor="thumbnail-3" className="block cursor-pointer text-sm font-normal">
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

          <div className=" pb-6">
            <input type="file" accept="video/*" className="hidden" id="VideoThumbnail" onChange={handleVideoChange} />
            <div className="text-start mb-1.5 font-normal flex text-sm">
              اسکن تصویر( 5 ثانیه تصویر خود را اسکن کنید)<div className="text-[#7A7A7A] text-sm">(اختیاری)</div>
            </div>

            {selectedVideos.length > 0 ? (
              selectedVideos.map((file, index) => (
                <div key={index} className="relative custom-dashed p-[1px] pr-[1.5px]">
                  <div className="relative">
                    <video
                      src={URL.createObjectURL(file)}
                      className="h-[190px] w-full object-cover rounded-[4px]"
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
                      handleDelete(index)
                    }}
                  >
                    <IoMdClose className="text-base" />
                  </button>
                </div>
              ))
            ) : (
              <label htmlFor="VideoThumbnail" className="block cursor-pointer text-sm font-normal">
                <div className="h-[190px] bg-[#FCFCFC] rounded-lg custom-dashed-marketer flex-center">
                  <div className="flex flex-col gap-2 items-center">
                    <UploadCloudIcon width="56px" height="48px" />
                    <h1 className="font-normal text-[#5A5A5A] border-[#5A5A5A] border-b w-fit">افزودن اسکن تصویر</h1>
                  </div>
                </div>
              </label>
            )}
          </div>

          <div className='px-4 pb-6'>
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
                    با ورود و ثبت‌نام در اپلیکیشن، با <span className='font-medium text-xs text-[#D52133] border-b border-[#D52133]'>قوانین سودم</span> موافقت می‌کنم.
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
          onClick={() => push('/marketer/register')}
          className="w-full font-bold text-sm rounded-lg"
        >
          ثبت نام به عنوان بازاریاب{' '}
        </Button>
      </div>
    </form>
  )
}

export default MarketerUserLoginForm
