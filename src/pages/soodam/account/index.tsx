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
import { getToken, NEXT_PUBLIC_API_URL, userInfoFormValidationSchema } from '@/utils'
import { UserInfoForm } from '@/types'
import { useEffect, useState } from 'react'
import Select from 'react-select'
const iranCity = require('iran-city')
import jalaali from 'jalaali-js'
import axios from 'axios'
import { useGetUserInfoQuery, useUpdateUserInfoMutation } from '@/services/auth/apiSlice'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
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
  const [avatarUrl, setAvatarUrl] = useState<any>('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [updateUserInfo, { isLoading, isSuccess }] = useUpdateUserInfoMutation()
  const { data: userInfo } = useGetUserInfoQuery()
  const [provinces, setProvinces] = useState([])
  const [cities, setCities] = useState([])
  const { back, push } = useRouter()

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
      fullName: userInfo ? `${userInfo.first_name ?? null} ${userInfo.last_name ?? null}`.trim() : '',
      fatherName: userInfo?.father_name ?? null,
      notionalCode: userInfo?.security_number ?? null,
      email: userInfo?.email ?? null,
      mobileNumber: userInfo?.phone_number ?? null,
      province: null,
      city: null,
      gender: '',
      birthDate: userInfo?.birthday ?? null,
    },
  })
  const selectedProvince = watch('province') // ? Assets

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name === 'province') {
        setCities(iranCity.citiesOfProvince(value.province?.id))
        setValue('city', {} as UserInfoForm['city'])
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, setValue])

  useEffect(() => {
    axios
      .get(`${NEXT_PUBLIC_API_URL}/api/geolocation/get_provinces`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
      })
      .then((res) => {
        setProvinces(res.data)

        // Set province and load cities after provinces are loaded
        if (userInfo?.province && typeof userInfo.province === 'object' && 'id' in userInfo.province) {
          // Use type assertion with unknown first to avoid direct type conversion error
          const provinceData = userInfo.province as unknown as { id: number; name: string; slug: string }
          const provinceObj = res.data.find((p: any) => p.id === provinceData.id)

          if (provinceObj) {
            setValue('province', provinceObj)

            // Load cities for this province
            axios
              .get(`${NEXT_PUBLIC_API_URL}/api/geolocation/get_cites_by_id/${provinceObj.id}`, {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${getToken()}`,
                },
              })
              .then((citiesRes) => {
                const citiesData = citiesRes.data
                setCities(citiesData)

                // Set city if it exists and belongs to this province
                if (userInfo?.city && typeof userInfo.city === 'object' && 'id' in userInfo.city) {
                  // Use type assertion with unknown first to avoid direct type conversion error
                  const cityData = userInfo.city as unknown as { id: number; name: string; slug: string }

                  // Only set the city if it belongs to the current province
                  const cityObj = citiesData.find((c: any) => c.id === cityData.id)
                  if (cityObj) {
                    console.log('Setting city:', cityObj)
                    // Use a timeout to ensure this happens after any potential city reset
                    setTimeout(() => {
                      setValue('city', cityObj)
                    }, 100)
                  }
                }
              })
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching provinces:', err)
      })
  }, [userInfo, setValue])

  useEffect(() => {
    if (userInfo) {
      reset({
        fullName: `${userInfo.first_name ?? null} ${userInfo.last_name ?? null}`.trim(),
        fatherName: userInfo.father_name ?? null,
        notionalCode: userInfo.security_number ?? null,
        email: userInfo.email ?? null,
        mobileNumber: userInfo.phone_number ?? null,
        gender: userInfo.user_type === 'male' || userInfo.user_type === 'female' ? userInfo.user_type : '',
        birthDate: userInfo.birthday ?? null,
      })

      if (userInfo.avatar) {
        setAvatarUrl(userInfo.avatar)
      }
    }
  }, [userInfo, reset])

  // Handle province change
  useEffect(() => {
    if (selectedProvince?.id) {
      axios
        .get(`${NEXT_PUBLIC_API_URL}/api/geolocation/get_cites_by_id/${selectedProvince.id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
        })
        .then((res) => {
          setCities(res.data)

          // Don't reset the city if the user is just loading the form
          // Only reset if the user manually changes the province
          const currentCity = getValues('city')
          if (!currentCity || (currentCity.province_id && currentCity.province_id !== selectedProvince.id)) {
            setValue('city', { name: '', id: 0 })
          }
        })
        .catch((err) => {
          console.error('Error fetching cities:', err)
          setCities([])
        })
    } else {
      setCities([])
      setValue('city', { name: '', id: 0 })
    }
  }, [selectedProvince, setValue, getValues])

  // Handle successful profile update
  useEffect(() => {
    if (isSuccess) {
      toast.success('اطلاعات حساب کاربری با موفقیت بروز رسانی شد', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })

      // Redirect after toast is shown
      setTimeout(() => {
        push('/soodam')
      }, 2000)
    }
  }, [isSuccess, push])

  const handleBack = () => {
    back()
  }
  const onSubmit = (data: UserInfoForm) => {
    console.log('Form submitted:', data)

    // Helper function to convert empty strings or 0 to null
    const nullIfEmpty = (value: string | number | undefined | null) => {
      if (value === '' || value === 0 || value === undefined) return null
      return value
    }

    // Prepare full_address data
    const addressData = {
      province_id: nullIfEmpty(data.province?.id || 0),
      city_id: nullIfEmpty(data.city?.id || 0),
      street: nullIfEmpty('') || '',
      address: nullIfEmpty('') || '',
      zip_code: nullIfEmpty(userInfo?.addresses?.[0]?.zip_code) || null,
      longitude: nullIfEmpty(userInfo?.addresses?.[0]?.longitude || 0),
      latitude: nullIfEmpty(userInfo?.addresses?.[0]?.latitude || 0),
    }

    // Check if all address fields are null
    const isAddressEmpty = Object.values(addressData).every((value) => value === null || value === '')

    const createUser = {
      id: nullIfEmpty(userInfo?.id || 0),
      first_name: nullIfEmpty(data.fullName.split(' ')[0]) || null,
      last_name: nullIfEmpty(data.fullName.split(' ').slice(1).join(' ')) || null,
      phone_number: nullIfEmpty(data.mobileNumber),
      father_name: nullIfEmpty(data.fatherName) || null,
      security_number: nullIfEmpty(data.notionalCode) || null,
      email: nullIfEmpty(data.email) || null,
      birthday: nullIfEmpty(
        data.birthDate
          ?.split('/')
          .map((num) => num.padStart(2, '0'))
          .join('-')
      ),
      gender: nullIfEmpty(data.gender) || 'Unknown',
      province_id: nullIfEmpty(data.province?.id || 0),
      city_id: nullIfEmpty(data.city?.id || 0),
      avatar: nullIfEmpty(avatarUrl?.path || (avatarUrl?.url ? avatarUrl.url.replace('/media/', '') : '')),
      full_address: isAddressEmpty ? null : addressData,
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

  const handleMainFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      try {
        setUploadingAvatar(true)
        const formData = new FormData()
        formData.append('file', files[0])

        const response = await axios.post('http://194.5.193.119:4000/api/user/avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${getToken()}`,
          },
        })

        if (response.data.status === 'success') {
          const avatarUrl = response.data.avatar.url
          setAvatarUrl(avatarUrl)

          // Show a preview of the selected image
          const img = new Image()
          img.src = URL.createObjectURL(files[0])
          img.onload = () => {
            URL.revokeObjectURL(img.src)
            setSelectedFiles([files[0]])
          }
        }
      } catch (error) {
        console.error('Error uploading avatar:', error)
      } finally {
        setUploadingAvatar(false)
      }
    }
  }

  if (errors) {
    console.log(errors, 'errors')
  }
  // ? Render(s)
  return (
    <>
      <ToastContainer rtl />{' '}
      <form onSubmit={handleSubmit(onSubmit)} className="pb-[100px]">
        <div className="bg-white m-4 rounded-2xl border border-[#E3E3E7]">
          <div className="flex justify-center items-center gap-1 p-4">
            <h1 className="font-bold text-lg">اطلاعات حساب کاربری</h1>
          </div>
          <div className="flex flex-col">
            <div className="px-4 pb-4">
              <div className="flex justify-center">
                {/* user avatar section  */}
                <div className="">
                  <input
                    type="file"
                    className="hidden"
                    id="MainThumbnail"
                    onChange={handleMainFileChange}
                    accept="image/*"
                  />
                  <label htmlFor="MainThumbnail" className="block cursor-pointer text-sm font-normal">
                    {uploadingAvatar ? (
                      <div className="bg-[#fafafa] relative w-[76px] h-[76px] flex-center rounded-full border-[5px] border-[#a3a3a3]">
                        <span className="text-xs">در حال آپلود...</span>
                      </div>
                    ) : selectedFile.length > 0 ? (
                      <div className="">
                        <img
                          src={URL.createObjectURL(selectedFile[0])}
                          alt="avatar"
                          className="object-cover w-[76px] h-[76px] rounded-full"
                        />
                      </div>
                    ) : avatarUrl && avatarUrl.url ? (
                      <div className="">
                        <img
                          src={`http://194.5.193.119:4000${avatarUrl.url}`}
                          alt="user-avatar"
                          className="object-cover w-[76px] h-[76px] rounded-full"
                        />
                      </div>
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
                      disabled
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
                  {errors.city?.message && <span className="text-xs text-[#D52133]">{errors.city.message}</span>}
                </div>
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
          <Button type="submit" disabled={isLoading} className="w-full font-bold text-sm rounded-lg">
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
