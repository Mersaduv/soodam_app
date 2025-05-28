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

const RegisterPage: NextPage = () => {
  // ? States
  const [isShow, modalHandlers] = useDisclosure()
  const { isShowLogin, isMemberUserLogin } = useAppSelector((state) => state.isShowLogin)
  const [step, setStep] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState('')
  // ? Assets
  const { replace, query, push, back } = useRouter()
  const role = query.role as string
  const roleName= role === roles.CityAdmin ? 'ادمین شهر' : role === roles.AdvAdmin ? 'ادمین آگهی' : role === roles.BlogAdmin ? 'ادمین خبر' : role === roles.Marketer ? 'بازاریاب' : role === roles.EstateConsultant ? 'مشاور املاک' : 'ادمین سودم'
  const dispatch = useAppDispatch()
  // ? Login User
  const [login, { data, isSuccess, isError, isLoading, error }] = useLoginMutation()

  // ? Handlers
  const submitHandler: SubmitHandler<PhoneFormValues> = (data) => {

  }
  // const onSuccess = () => replace(query?.redirectTo?.toString() || "/");
  const onSuccess = () => {
    // Dispatch an alert
    // dispatch(showAlert({ title: `کد تایید : ${data?.code}`, status: 'success' }))
    setStep(2)
  }

  const handleBack = () => {
    back()
  }

  // if (query) {
  //   console.log(query, 'query')
  // }
  // ? Render(s)
  return (
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
      <main className="">
        <Head>
          <title>سودم | ثبت نام</title>
        </Head>
        <div className="bg-[#2C3E50] h-screen">
          <AdminHeader title={`ثبت نام ${roleName}`} />

          <div className="bg-[#F6F7FB] rounded-t-[40px] h-full">
            <AdminUserLogin />
          </div>
        </div>
      </main>
    </>
  )
}
export default RegisterPage
