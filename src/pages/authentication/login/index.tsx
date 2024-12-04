import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import { useLoginMutation, useVerifyLoginMutation } from '@/services'
import { CodeFormValues, PhoneFormValues } from '@/types'
import { SubmitHandler } from 'react-hook-form'
import { LoginForm, VerificationCode } from '@/components/forms'
import { useState } from 'react'
import { HandleResponse } from '@/components/shared'
import { showAlert } from '@/store'
import { useAppDispatch } from '@/hooks'

function LoginPage() {
  // ? States
  const [step, setStep] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState('')
  // ? Assets
  const { replace, query } = useRouter()
  const dispatch = useAppDispatch()
  // ? Login User
  const [login, { data, isSuccess, isError, isLoading, error }] = useLoginMutation()

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
    })
  }
  // const onSuccess = () => replace(query?.redirectTo?.toString() || "/");
  const onSuccess = () => {
    // Dispatch an alert
    dispatch(showAlert({ title: `کد تایید : ${data?.code}`, status: 'success' }))
    setStep(2)
  }

  const onSuccessVerificationCode = () => {
    replace(query?.redirectTo?.toString() || "/")
  }

  // ? Render(s)
  return (
    <>
      {/*  Handle Login Response */}
      {(isSuccess || isError) && (
        <HandleResponse
          isError={isError}
          isSuccess={isSuccess}
          error={error}
          message={data?.code}
          onSuccess={onSuccess}
        />
      )}
      {(isSuccessVerification || isErrorVerification) && (
        <HandleResponse
          isError={isErrorVerification}
          isSuccess={isSuccessVerification}
          error={errorVerification}
          message={verificationData?.}
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
              onSubmit={submitVerificationCodeHandler}
              phoneNumber={phoneNumber}
            />
          )}
        </section>
      </main>
    </>
  )
}

export default dynamic(() => Promise.resolve(LoginPage), { ssr: false })
