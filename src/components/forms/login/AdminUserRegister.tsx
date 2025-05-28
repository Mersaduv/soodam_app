import React, { useEffect, useState } from 'react'
import { useForm, Controller, Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useRouter } from 'next/router'
import { Button, DisplayError, Combobox, TextField } from '@/components/ui'
import { ArrowLeftIcon } from '@/icons'
import { AdminRegisterForm } from '@/types'
import { adminFormValidationSchema } from '@/utils/validation'
import { getToken } from '@/utils'
import axios from 'axios'
import Link from 'next/link'

const AdminUserRegister: React.FC = () => {
  const { push, back } = useRouter()
  const [provinces, setProvinces] = useState([])
  const [cities, setCities] = useState([])

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AdminRegisterForm>({
    resolver: yupResolver(adminFormValidationSchema) as unknown as Resolver<AdminRegisterForm>,
    mode: 'onChange',
  })
  const selectedProvince = watch('province')

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
            Authorization: `Bearer ${getToken()}`,
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
  const onSubmit = (data: AdminRegisterForm) => {
    console.log('Form submitted:', data)
    // Handle form submission
  }

  const handleBack = () => {
    back()
  }
  console.log(selectedProvince, 'selectedProvince')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="">
      <div className="m-4 pt-7 px-1">
        <div className="space-y-2">
          <h1 className="font-bold text-lg">خوش آمدید!</h1>
          <p className="text-sm">برای درخواست ثبت نام اطلاعات خود را وارد کنید.</p>
        </div>

        <div className=" mt-5 space-y-4">
          <Controller
            name="full_name"
            control={control}
            render={({ field }) => (
              <TextField
                adForm
                adminHeight
                placeholder="نام و نام خانوادگی"
                {...field}
                control={control}
                errors={errors.full_name}
              />
            )}
          />

          <Controller
            name="phone_number"
            control={control}
            render={({ field }) => (
              <TextField
                adForm
                adminHeight
                type="number"
                {...field}
                control={control}
                errors={errors.phone_number}
                placeholder="شماره موبایل"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                adForm
                adminHeight
                type="email"
                placeholder="ایمیل"
                {...field}
                control={control}
                errors={errors.email}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                adForm
                adminHeight
                placeholder="رمز عبور"
                type="password"
                {...field}
                control={control}
                errors={errors.password}
              />
            )}
          />

          <Controller
            name="confirm_password"
            control={control}
            render={({ field }) => (
              <TextField
                adForm
                adminHeight
                type="password"
                placeholder="تکرار رمز عبور"
                {...field}
                control={control}
                errors={errors.confirm_password}
              />
            )}
          />

          <div className="space-y-1">
            <Combobox control={control} name="province" list={provinces} placeholder="استان" adminHeight />
            {errors.province?.name && <DisplayError errors={errors.province?.name} />}
          </div>
          <div className="space-y-1">
            <Combobox control={control} name="city" list={cities} placeholder="شهر" adminHeight />
            {errors.city?.name && <DisplayError errors={errors.city?.name} />}
          </div>

          <Controller
            name="security_number"
            control={control}
            render={({ field }) => (
              <TextField
                adForm
                adminHeight
                placeholder="کد ملی"
                {...field}
                control={control}
                errors={errors.security_number}
              />
            )}
          />
        </div>
      </div>

      <div className="px-4 mt-10">
        <Button type="submit" className="w-full py-[14px] font-bold text-sm rounded-lg bg-[#2C3E50]">
          ثبت نام درخواست
        </Button>
      </div>
      <div className="px-4 mt-6 pb-10 flex justify-center items-center gap-1">
        <p className="text-sm">قبلا حساب ساخته اید؟</p>
        <Link href="/login" className="text-blue-600 text-[13px] font-semibold">
          وارد شوید
        </Link>
      </div>
    </form>
  )
}

export default AdminUserRegister
