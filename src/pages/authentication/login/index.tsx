import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import { useGetVerifyCodeMutation, useLoginMutation, useVerifyLoginMutation } from '@/services'
import { CodeFormValues, PhoneFormValues } from '@/types'
import { SubmitHandler } from 'react-hook-form'
import { LoginForm, VerificationCode } from '@/components/forms'
import { useEffect, useState } from 'react'
import { HandleResponse } from '@/components/shared'
import { setIsMemberUserLogin, setIsShowLogin, showAlert } from '@/store'
import { useAppDispatch } from '@/hooks'
import { userTypes } from '@/utils'

function LoginPage() {
  // ? States
  const [step, setStep] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState('')
  // ? Assets
  const { replace, query, push } = useRouter()
  const dispatch = useAppDispatch()
  // ? Login User
  const [login, { data, isSuccess, isError, isLoading, error }] = useLoginMutation()

  // ? get verification code
  // const {
  //   data: dataCode,
  //   isSuccess: isSuccessVerifyCode,
  //   isError: isErrorVerifyCode,
  // } = useGetVerifyCodeMutation(
  //   { phoneNumber },
  //   {
  //     skip: !isSuccess,
  //   }
  // )
  const [getVerifyCode, { data: dataCode, isSuccess: isSuccessVerifyCode, isError: isErrorVerifyCode }] =
    useGetVerifyCodeMutation()
  // ? VerificationLogin User
  const [
    verificationCode,
    {
      data: verificationData,
      isSuccess: isSuccessVerification,
      isError: isErrorVerification,
      isLoading: isLoadingVerification,
      error: errorVerification,
    },
  ] = useVerifyLoginMutation()
  // ? Effects
  useEffect(() => {
    if (isSuccess) {
      getVerifyCode({
        phoneNumber,
      })
    }
  }, [isSuccess])

  // ? Handlers
  const submitHandler: SubmitHandler<PhoneFormValues> = ({ phoneNumber }) => {
    login({
      phoneNumber,
    })
    setPhoneNumber(phoneNumber)
  }

  const submitVerificationCodeHandler: SubmitHandler<CodeFormValues> = ({ code }) => {
    verificationCode({
      code,
      phoneNumber,
      userType: query?.userType,
    })
  }
  // const onSuccess = () => replace(query?.redirectTo?.toString() || "/");
  const onSuccess = () => {
    // Dispatch an alert
    // dispatch(showAlert({ title: `کد تایید : ${data?.code}`, status: 'success' }))
    setStep(2)
  }
  useEffect(() => {
    if (isSuccessVerifyCode) {
      dispatch(showAlert({ title: `کد تایید : ${dataCode?.code}`, status: 'success' }))
    }
  }, [isSuccessVerifyCode])
  const onSuccessVerificationCode = () => {
    setTimeout(() => {
      replace(query?.redirectTo?.toString() || '/')
      localStorage.setItem('hasSeenModal', 'true')
      dispatch(setIsShowLogin(false))
      if (query?.userType === userTypes.Marketer.toString()) {
        push('/marketer')
      }
      if (query?.userType === userTypes.MemberUser.toString()) {
        dispatch(setIsMemberUserLogin(true))
      }
      if (query?.userType === userTypes.EstateAgent.toString()) {
        push('/estate-consultant')
      }
    }, 50)
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
      {(isSuccessVerification || isErrorVerification) && (
        <HandleResponse
          isError={isErrorVerification}
          isSuccess={isSuccessVerification}
          error={errorVerification}
          message={isErrorVerification ? 'کد تایید نادرست می‌باشد!' : 'ورود موفقیت‌آمیز بود'}
          onSuccess={onSuccessVerificationCode}
        />
      )}
      <main className="">
        <Head>
          <title>سودم | ورود</title>
        </Head>
        <section className="bg-[#F6F7FB] h-screen">
          {step === 1 ? (
            <LoginForm isLoading={isLoading} onSubmit={submitHandler} />
          ) : (
            <VerificationCode
              isLoading={isLoadingVerification}
              resendHandler={submitHandler}
              onSubmit={submitVerificationCodeHandler}
              phoneNumber={phoneNumber}
              errorVerification={errorVerification}
              setPhoneNumber={setPhoneNumber}
              setStep={setStep}
              isSuccess={isSuccessVerification}
            />
          )}
        </section>
      </main>
    </>
  )
}

export default dynamic(() => Promise.resolve(LoginPage), { ssr: false })
