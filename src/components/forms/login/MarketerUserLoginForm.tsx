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
  // ? Queries

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

          
        </div>
      </div>
      {/* Navigation Buttons */}
      <div className="px-4 mt-10 pb-10">
        <Button onClick={() => push('/marketer/register')} className="w-full font-bold text-sm rounded-lg">
          ثبت نام به عنوان بازاریاب{' '}
        </Button>
      </div>
    </form>
  )
}

export default MarketerUserLoginForm
