import { useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { Controller, useForm } from 'react-hook-form'

import { LoginButton, TextField } from '../../ui'
import { PhoneFormValues } from '@/types'
import { phoneSchema } from '@/utils'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  onSubmit: (data: PhoneFormValues) => void
  isLoading: boolean
}

const LoginForm: React.FC<Props> = (props) => {
  // ? Props
  const { onSubmit, isLoading } = props

  // ? Form Hook
  const {
    handleSubmit: handlePhoneSubmit,
    control,
    formState: { errors: formErrors },
    setFocus,
  } = useForm<PhoneFormValues>({
    resolver: yupResolver(phoneSchema),
  })
  // ? Focus On Mount
  useEffect(() => {
    setFocus('phoneNumber')
  }, [])

  return (
    <form className="flex flex-col justify-between h-full" onSubmit={handlePhoneSubmit(onSubmit)}>
      <Link passHref href={`/`} className="flex w-full justify-center pt-12">
        <Image src="/static/fingers-id.png" alt="عضو" layout="intrinsic" width={304} height={304} />
      </Link>
      <div className="bg-white space-y-7 rounded-r-[40px] rounded-l-[40px] rounded-b-none p-6 pt-7 shadow">
        <h1 className="font-bold text-lg">خوش آمدید!</h1>
        <p className="font-normal">برای ورود شماره موبایل خود را وارد نمایید.</p>{' '}
        <Controller
          name="phoneNumber"
          control={control}
          render={({ field }) => (
            <TextField
              type="number"
              {...field}
              control={control}
              errors={formErrors.phoneNumber}
              placeholder="شماره موبایل"
              inputMode="numeric"
              pattern="[0-9]*"
            />
          )}
        />
        <LoginButton isLoading={isLoading}>ارسال کد تایید</LoginButton>
      </div>
    </form>
  )
}

export default LoginForm
