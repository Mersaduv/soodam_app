import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import { useGetVerifyCodeMutation, useLoginMutation, useVerifyLoginMutation } from '@/services'
import { AdminPhoneFormValues, CodeFormValues, PhoneFormValues } from '@/types'
import { SubmitHandler } from 'react-hook-form'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { Controller, useForm } from 'react-hook-form'

import { DisplayError, LoginButton, TextField } from '@/components/ui'
import { adminPhoneSchema, phoneSchema } from '@/utils'
import { HandleResponse } from '@/components/shared'
import { setIsMemberUserLogin, setIsShowLogin, showAlert } from '@/store'
import { useAppDispatch, useAppSelector, useDisclosure } from '@/hooks'
import { roles } from '@/utils'
import { ArrowLeftIcon } from '@/icons'
import { AdminFirstLoginModal } from '@/components/modals'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { SerializedError } from '@reduxjs/toolkit'
import AdminHeader from '@/components/shared/AdminHeader'
import AdminUserLogin from '@/components/forms/login/AdminUserRegister'
import { NextPage } from 'next'
import DashboardLayout from '@/components/layouts/DashboardLayout'

const getRoleDisplayName = (role: string | string[] | undefined): string => {
  switch (role) {
    case 'admin_city':
      return 'ادمین شهر'
    case 'admin_news':
      return 'ادمین خبر'
    case 'admin_ad':
      return 'ادمین آگهی'
    case 'marketer':
      return 'بازاریاب'
    default:
      return 'ادمین'
  }
}

const RegisterPage: NextPage = () => {
  // ? States
  const [isShow, modalHandlers] = useDisclosure()
  const { isShowLogin, isMemberUserLogin } = useAppSelector((state) => state.isShowLogin)
  const [step, setStep] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState('')
  // ? Assets
  const { replace, query, push, back } = useRouter()
  const roleParam = query.role as string
  const roleName = getRoleDisplayName(roleParam)
  const dispatch = useAppDispatch()
  // ? Login User
  const [login, { data, isSuccess, isError, isLoading, error }] = useLoginMutation()

  // ? Handlers
  const submitHandler: SubmitHandler<PhoneFormValues> = (data) => {
    // Not needed for this mock implementation
  }

  const onSuccess = () => {
    setStep(2)
  }

  const handleBack = () => {
    back()
  }

  useEffect(() => {
    if (!roleParam) {
      modalHandlers.open()
    }
  }, [roleParam])

  // ? Render(s)
  return (
    <DashboardLayout>
      <>
        {/*  Handle Login Response */}
        {(isSuccess || isError) && (
          <HandleResponse
            isError={isError}
            isSuccess={isSuccess}
            error={error}
            message={isError ? 'شماره موبایل نامعتبر است' : 'کد تایید ارسال شد'}
            onSuccess={onSuccess}
          />
        )}
        <div className="flex flex-col min-h-screen">
          <Head>
            <title>سودم | ثبت نام {roleName}</title>
          </Head>

          <div className="bg-[#F6F7FB] rounded-t-[40px] flex-grow overflow-y-auto pb-6">
            {!roleParam ? <AdminFirstLoginModal isShow={isShow} onClose={modalHandlers.close} /> : <AdminUserLogin />}
          </div>
        </div>
      </>
    </DashboardLayout>
  )
}
export default RegisterPage
