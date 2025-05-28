import Link from 'next/link'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ClientLayout } from '@/components/layouts'
import {
  AdsMIcon,
  ArrowLeftIcon,
  CameraXsIcon,
  FaceScanIcon,
  InfoCircleIcon,
  PdfDownloadIcon,
  WalletAndCardIcon,
} from '@/icons'
import { Button, Combobox, DisplayError, SelectBox, TextField } from '@/components/ui'
import { Controller, Resolver, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { getToken, userInfoFormValidationSchema } from '@/utils'
import { UserInfoForm } from '@/types'
import { useEffect, useState } from 'react'
import Select from 'react-select'
const iranCity = require('iran-city')
import jalaali from 'jalaali-js'
import axios from 'axios'
import { useGetUserInfoQuery, useUpdateUserInfoMutation } from '@/services/auth/apiSlice'
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

const Account: NextPage = () => {
  const [selectedFile, setSelectedFiles] = useState<any[]>([])
  // const [provinceOptions, setProvinceOptions] = useState([])
  const [updateUserInfo, { isLoading }] = useUpdateUserInfoMutation()
  const { data: userInfo } = useGetUserInfoQuery()
  const [provinces, setProvinces] = useState([])
  const [cities, setCities] = useState([])
  const { back } = useRouter()

  const {
    handleSubmit,
    control,
    register,
    trigger,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm<UserInfoForm>({
    resolver: yupResolver(userInfoFormValidationSchema) as unknown as Resolver<UserInfoForm>,
    mode: 'onChange',
    defaultValues: {
      fullName: userInfo?.[0].first_name + ' ' + userInfo?.[0].last_name,
      fatherName: userInfo?.[0].father_name,
      notionalCode: userInfo?.[0].security_number,
      email: userInfo?.[0].email,
      mobileNumber: userInfo?.[0].phone_number,
      province: provinces.find((province) => province.id === userInfo[0].address?.province_id),
      city: cities.find((city) => city.id === userInfo[0].address?.city_id),
    },
  })
  const selectedProvince = watch('province') // ? Assets

  // useEffect(() => {
  //   if (address.province) {
  //     setCities(iranCity.citiesOfProvince(address.province.id))
  //   }
  //   reset(address)
  // }, [address, reset])

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name === 'province') {
        setCities(iranCity.citiesOfProvince(value.province?.id))
        setValue('city', {} as UserInfoForm['city'])
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, setValue])

  const handleBack = () => {
    back()
  }
  // const createAds = {
  //   title: data.title,
  //   security_code_owner_building: data.nationalCode || '',
  //   phone_number_owner_building: data.phoneNumber,
  //   description: data.description,
  //   sub_category_id: data.category,
  //   sub_sub_category_id: 0,
  //   full_address: {
  //     province_id: 27,
  //     city_id: 968,
  //     address: data.address,
  //     zip_code: data.postalCode,
  //     longitude: data.location.lng,
  //     latitude: data.location.lat,
  //   },
  //   features: formattedFeatures,
  //   medias: data.mediaImages.map((item) => ({
  //     media: item.url,
  //     type: getFileExtension(item.url),
  //   })),
  // }
  const onSubmit = (data: UserInfoForm) => {
    console.log('Form submitted:', data)

    const createUser = {
      id: userInfo?.[0].id,
      first_name: data.fullName,
      last_name: data.fatherName,
      father_name: data.fatherName,
      security_number: data.notionalCode,
      email: data.email,
      // mobile_number: data.mobileNumber,
      birthday: data.birthDate,
      gender: data.gender,
      full_address: {
        id: userInfo?.[0].address?.id,
        province_id: data.province.id,
        city_id: data.city.id,
        longitude: userInfo?.[0].address?.longitude,
        latitude: userInfo?.[0].address?.latitude,
      },
    }
    updateUserInfo(createUser)
  }
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

  const handleMainFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const validFiles: any[] = []

      Array.from(files).forEach((file) => {
        const img = new Image()
        img.src = URL.createObjectURL(file)

        img.onload = () => {
          URL.revokeObjectURL(img.src)

          validFiles.push(file)
          setValue('image', file, { shouldValidate: true })
          setSelectedFiles([...validFiles])
        }
      })
    }
  }

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/geolocation/get_provinces`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`, 
        },
      })
      .then((res) => {
        setProvinces(res.data)
      })
      .catch((err) => {
        console.error('Error fetching provinces:', err)
      })
  }, [])

  useEffect(() => {
    if (selectedProvince?.id) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/api/geolocation/get_cites_by_id/${selectedProvince.id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`, // ← اینجا هم تابع را اجرا کن
          },
        })
        .then((res) => {
          setCities(res.data)
          setValue('city', { name: '', id: 0 })
        })
        .catch((err) => {
          console.error('Error fetching cities:', err)
          setCities([])
        })
    } else {
      setCities([])
      setValue('city', { name: '', id: 0 })
    }
  }, [selectedProvince, setValue])

  if (errors) {
    console.log(errors, 'errors')
  }
  // ? Render(s)
  return (
    <>
      {' '}
      <form onSubmit={handleSubmit(onSubmit)} className="pb-[100px]">
        <div className="bg-white m-4 rounded-2xl border border-[#E3E3E7]">
          <div className="flex justify-center items-center gap-1 p-4">
            <h1 className="font-bold text-lg">اطلاعات حساب کاربری</h1>
          </div>
          <div className="flex flex-col">
            <div className="px-4 pb-4">
              <div className="flex justify-center">
                <div className="">
                  <input
                    type="file"
                    className="hidden"
                    id="MainThumbnail"
                    onChange={handleMainFileChange}
                    accept="image/*"
                  />
                  <label htmlFor="MainThumbnail" className="block cursor-pointer text-sm font-normal">
                    {selectedFile.length > 0 ? (
                      selectedFile.map((file: any, index: number) => (
                        <div key={index} className="">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="object-contain w-[76px] h-[76px] rounded-full"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="bg-[#fafafa] relative w-[76px] h-[76px] flex-center rounded-full border-[5px] border-[#a3a3a3]">
                        <img className="w-[57px]" src="/static/user.png" alt="product-placeholder" />
                        <div className="absolute bottom-0 left-0 bg-white rounded-full p-[3px] shadow">
                          <CameraXsIcon width="18px" height="18px" />
                        </div>
                      </div>
                    )}
                  </label>
                  <div dir={'ltr'} className="w-fit">
                    <DisplayError adForm errors={errors.image} />
                  </div>
                </div>
              </div>

              <div className=" mt-3 space-y-4">
                <Controller
                  name="fullName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      adForm
                      isDarker
                      isMarketerForm
                      label="نام و نام خانوادگی"
                      {...field}
                      control={control}
                      errors={errors.fullName}
                    />
                  )}
                />{' '}
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
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      adForm
                      isMarketerForm
                      isDarker
                      label="ایمیل"
                      {...field}
                      control={control}
                      errors={errors.email}
                    />
                  )}
                />
                <Controller
                  name="mobileNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      adForm
                      isDarker
                      isMarketerForm
                      label="شماره همراه"
                      type="number"
                      {...field}
                      control={control}
                      errors={errors.mobileNumber}
                    />
                  )}
                />
                <div className="space-y-1">
                  <label className="text-sm font-normal pb-1">استان</label>
                  <Combobox
                    control={control}
                    name="province"
                    list={provinces}
                    placeholder="لطفا استان خود را انتخاب کنید"
                  />
                  {errors.province?.name && <DisplayError errors={errors.province?.name} />}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-normal pb-1">شهر</label>
                  <Combobox control={control} name="city" list={cities} placeholder="لطفا شهر خود را انتخاب کنید" />
                  {errors.city?.name && <DisplayError errors={errors.city?.name} />}
                </div>
                {/* <div className="w-full space-y-1">
                  <label htmlFor="" className="text-sm font-normal pb-1">
                    استان
                  </label>
                  <SelectBox control={control} name="province" list={AllProvinces} placeholder="انتخاب شهر" />
                </div> */}
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
                          className="w-full border text-sm border-[#E3E3E7] bg-[#FCFCFC] rounded-lg h-[40px]"
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
                          className="w-full border text-sm border-[#E3E3E7] bg-[#FCFCFC] rounded-lg h-[40px]"
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
                          className="w-full border text-sm border-[#E3E3E7] bg-[#FCFCFC] rounded-lg h-[40px]"
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
                <div>
                  <span className="mb-1 text-sm  font-normal">جنسیت</span>
                  <Controller
                    name="gender"
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
                              value="female"
                              checked={field.value === 'female'}
                              name="default-radio"
                              className="hidden"
                            />
                            <div
                              className={`w-6 h-6 rounded-full border flex items-center justify-center border-[#E3E3E7]`}
                            >
                              {field.value === 'female' && <div className="w-3 h-3 rounded-full bg-[#D52133]" />}
                            </div>

                            <span className="font-normal text-xs">زن</span>
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
                              value="male"
                              checked={field.value === 'male'}
                              name="default-radio"
                              className="hidden"
                            />
                            <div
                              className={`w-6 h-6 rounded-full border flex items-center justify-center border-[#E3E3E7]`}
                            >
                              {field.value === 'male' && <div className="w-3 h-3 rounded-full bg-[#D52133]" />}
                            </div>

                            <span className="font-normal text-xs">مرد</span>
                          </label>
                        </div>
                      </div>
                    )}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <InfoCircleIcon width="16px" height="16px" />
                  <span className="text-[#5A5A5A] font-normal text-xs">
                    اطلاعات حساب کاربری شما محرمانه نگهداری می شود.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>{' '}
        <div className="px-4">
          <Button
            type="submit"
            //  onClick={() => push('/marketer/register')}
            className="w-full font-bold text-sm rounded-lg"
          >
            ذخیره اطلاعات
          </Button>
          <Button
            onClick={handleBack}
            className="w-full font-bold text-sm rounded-lg mt-4 text-[#D52133] border border-[#D52133] bg-[#FFFFFF]"
          >
            انصراف
          </Button>
        </div>
      </form>
    </>
  )
}

export default dynamic(() => Promise.resolve(Account), { ssr: false })
