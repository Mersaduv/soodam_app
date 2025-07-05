import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
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

// Mock verification code
const MOCK_VERIFICATION_CODE = "123456";

// Mock API response types
interface MockSuccessResponse {
  code?: string;
  data?: any;
}

interface MockErrorResponse {
  status: number;
  data: {
    message: string;
  }
}

function LoginPage() {
  // ? States
  const [isShow, modalHandlers] = useDisclosure()
  const { isShowLogin, isMemberUserLogin } = useAppSelector((state) => state.isShowLogin)
  const [step, setStep] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState('')
  
  // ? Mock API states
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<MockErrorResponse | null>(null)
  const [data, setData] = useState<MockSuccessResponse | null>(null)
  
  const [isLoadingVerification, setIsLoadingVerification] = useState(false)
  const [isSuccessVerification, setIsSuccessVerification] = useState(false)
  const [isErrorVerification, setIsErrorVerification] = useState(false)
  const [errorVerification, setErrorVerification] = useState<MockErrorResponse | null>(null)
  const [verificationData, setVerificationData] = useState<MockSuccessResponse | null>(null)
  
  const [isSuccessVerifyCode, setIsSuccessVerifyCode] = useState(false)
  const [isErrorVerifyCode, setIsErrorVerifyCode] = useState(false)
  const [dataCode, setDataCode] = useState<MockSuccessResponse | null>(null)

  // ? Assets
  const { replace, query, push, back } = useRouter()
  const dispatch = useAppDispatch()

  // ? Mock API functions
  const mockLogin = (data: { phoneNumber: string }) => {
    setIsLoading(true)
    
    // Simulate API delay
    setTimeout(() => {
      if (data.phoneNumber && data.phoneNumber.length >= 10) {
        setIsSuccess(true)
        setIsError(false)
        setData({ code: MOCK_VERIFICATION_CODE })
      } else {
        setIsError(true)
        setIsSuccess(false)
        setError({
          status: 400,
          data: {
            message: 'شماره موبایل نامعتبر است'
          }
        })
      }
      setIsLoading(false)
    }, 1000)
  }
  
  const mockGetVerifyCode = (data: { phoneNumber: string }) => {
    // Simulate API delay
    setTimeout(() => {
      setIsSuccessVerifyCode(true)
      setIsErrorVerifyCode(false)
      setDataCode({ code: MOCK_VERIFICATION_CODE })
    }, 500)
  }
  
  const mockVerificationCode = (data: { code: string, phoneNumber: string }) => {
    setIsLoadingVerification(true)
    
    // Simulate API delay
    setTimeout(() => {
      if (data.code === MOCK_VERIFICATION_CODE) {
        setIsSuccessVerification(true)
        setIsErrorVerification(false)
        setVerificationData({ data: { token: 'mock-token' } })
      } else {
        setIsErrorVerification(true)
        setIsSuccessVerification(false)
        setErrorVerification({
          status: 400,
          data: {
            message: 'کد تایید نادرست می‌باشد!'
          }
        })
      }
      setIsLoadingVerification(false)
    }, 1000)
  }

  // ? Effects
  useEffect(() => {
    // Mock modal display without local storage dependency
    modalHandlers.open()
    dispatch(setIsShowLogin(true))
  }, [modalHandlers])
  
  useEffect(() => {
    if (isSuccess) {
      mockGetVerifyCode({
        phoneNumber,
      })
    }
  }, [isSuccess])

  // ? Handlers
  const submitHandler: SubmitHandler<PhoneFormValues> = ({ phoneNumber }) => {
    mockLogin({
      phoneNumber,
    })
    setPhoneNumber(phoneNumber)
  }

  const submitVerificationCodeHandler: SubmitHandler<CodeFormValues> = ({ code }) => {
    mockVerificationCode({
      code,
      phoneNumber,
    })
  }
  
  const onSuccess = () => {
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
      dispatch(setIsShowLogin(false))
      push('/admin')
    }, 50)
  }
  
  const handleBack = () => {
    back()
  }
  
  const handleModalClose = (): void => {
    dispatch(setIsShowLogin(false))
    modalHandlers.close()
  }
  
  const handleModalOpen = (): void => {
    modalHandlers.open()
    dispatch(setIsShowLogin(true))
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
        <div className="bg-[#2C3E50] h-screen">
          {isShowLogin && <AdminFirstLoginModal isShow={isShow} onClose={handleModalClose} />}
          <AdminHeader title="ورود" />

          <div className="bg-[#F6F7FB] rounded-t-[40px] h-full">
            {step === 1 ? (
              <LoginForm isLoading={isLoading} onSubmit={submitHandler} handleModalOpen={handleModalOpen} />
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
          </div>
        </div>
      </main>
    </>
  )
}

interface Props {
  onSubmit: (data: AdminPhoneFormValues) => void
  isLoading: boolean
  handleModalOpen: () => void
}

const LoginForm: React.FC<Props> = (props) => {
  // ? Props
  const { onSubmit, isLoading, handleModalOpen } = props

  // ? Form Hook
  const {
    handleSubmit: handlePhoneSubmit,
    control,
    formState: { errors: formErrors },
    setFocus,
  } = useForm<AdminPhoneFormValues>({
    resolver: yupResolver(adminPhoneSchema),
  })

  return (
    <form className="" onSubmit={handlePhoneSubmit(onSubmit)}>
      <div className=" flex flex-col justify-between p-6 pt-7">
        <div>
          <div className="space-y-2">
            <h1 className="font-bold text-lg">خوش آمدید!</h1>
            <p className="font-normal">برای ورود شماره موبایل خود را وارد نمایید.</p>
          </div>
          <div className="space-y-8">
            <div className="flex w-full justify-center pt-12">
              <Image src="/static/Illustration.png" alt="عضو" layout="intrinsic" width={213} height={304} />
            </div>
            <div className="space-y-4">
              <Controller
                name="security_number"
                control={control}
                render={({ field }) => (
                  <TextField
                    type="number"
                    {...field}
                    control={control}
                    errors={formErrors.security_number}
                    placeholder="کد ملی"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    borderDark
                  />
                )}
              />
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
                    borderDark
                  />
                )}
              />
            </div>
          </div>
        </div>
        <div className="mt-10">
          <LoginButton className="bg-[#2C3E50E5] w-full" isLoading={isLoading}>
            ارسال کد تایید
          </LoginButton>
          <div className="text-sm text-gray-500 flex items-center justify-center mt-6 gap-2">
            <span className="text-sm font-normal">حساب کاربری ندارید؟</span>
            <span className="text-[#1976D2] font-semibold cursor-pointer" onClick={handleModalOpen}>
              ثبت نام کنید
            </span>
          </div>
        </div>
      </div>
    </form>
  )
}

interface VerificationCodeProps {
  onSubmit: (data: CodeFormValues) => void
  resendHandler: (data: PhoneFormValues) => void
  isLoading: boolean
  phoneNumber: string
  setPhoneNumber: Dispatch<SetStateAction<string>>
  setStep: Dispatch<SetStateAction<number>>
  errorVerification: MockErrorResponse | null | undefined
  isSuccess: boolean
}
interface CodeFormArray {
  code: string[]
}
const VerificationCode: React.FC<VerificationCodeProps> = ({
  onSubmit,
  isLoading,
  phoneNumber,
  errorVerification,
  setPhoneNumber,
  setStep,
  isSuccess,
  resendHandler,
}) => {
  const { control, handleSubmit, setValue, getValues } = useForm<CodeFormArray>({
    defaultValues: { code: ['', '', '', '', '', ''] },
  })

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (value: string, index: number) => {
    const sanitizedValue = value.slice(0, 1)
    setValue(`code.${index}`, sanitizedValue)

    if (sanitizedValue && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Check if all fields are filled
    const allFieldsFilled = Array.from({ length: 6 }).every((_, idx) => getValues(`code.${idx}`))
    if (allFieldsFilled) {
      handleSubmit(onSubmitHandler)()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !getValues(`code.${index}`) && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    const pastedValue = e.clipboardData.getData('Text')

    if (pastedValue.length === 6) {
      pastedValue.split('').forEach((char, idx) => {
        setValue(`code.${idx}`, char)
      })

      inputRefs.current[5]?.focus()

      handleSubmit(onSubmitHandler)()
    }
  }

  const onSubmitHandler = (data: CodeFormArray) => {
    const codeString = data.code.join('')
    onSubmit({ code: codeString })
  }
  const handleChangePhoneNumber = () => {
    setPhoneNumber('')
    setStep(1)
  }

  return (
    <div className="pt-9 px-4">
      <form
        dir="ltr"
        onSubmit={handleSubmit(onSubmitHandler)}
        className="flex flex-col w-fit justify-center items-center mx-auto"
      >
        <div dir="rtl" className="flex flex-col w-full">
          <h1 className="font-medium text-lg mb-6">تایید کد فعالسازی</h1>
          <p className="font-normal text-[#5A5A5A] farsi-digits">کد فعالسازی به شماره {phoneNumber} ارسال گردید.</p>
          <button
            type="button"
            onClick={handleChangePhoneNumber}
            className="font-normal text-[#2F80ED] w-fit mt-2 text-start"
          >
            تغییر شماره موبایل
          </button>
        </div>
        <div className="my-4">
          <DisplayError errorVerification={errorVerification} />
          {isSuccess && DisplaySuccess()}
        </div>
        <div className="flex space-x-[7px] xxs:space-x-[16px] w-full justify-center">
          {Array.from({ length: 6 }).map((_, index) => {
            const value = getValues(`code.${index}`)
            const hasError = errorVerification && value
            return (
              <Controller
                key={index}
                name={`code.${index}`}
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    dir="ltr"
                    className={`w-[42px] h-[42px] xxs:w-12 xxs:h-12 font-bold farsi-digits text-center text-xl border rounded-[10px] focus:ring-1 outline-none ${
                      isSuccess ? 'border-green-500' : hasError ? 'border-red-600 ' : 'border-gray-600'
                    }`}
                    ref={(el) => {
                      inputRefs.current[index] = el
                    }}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={(e) => handlePaste(e, index)}
                  />
                )}
              />
            )
          })}
        </div>
        <div className="flex flex-row-reverse items-center gap-x-1 mt-4 mb-14">
          <span className="font-normal text-xs text-[#13131380]">کد را دریافت نکردید؟ </span>
          <div
            onClick={() => {
              resendHandler({ phoneNumber })
            }}
            className="font-normal cursor-pointer text-xs text-[#2F80ED]"
          >
            ارسال مجدد
          </div>
        </div>

        <LoginButton className="bg-[#2C3E50E5] w-full" isLoading={isLoading}>
          ورود
        </LoginButton>
      </form>
    </div>
  )
  // ? local components
  function DisplaySuccess() {
    return (
      <div dir="rtl" className="bg-[#D5FDEF] mt-1.5 flex items-center justify-center rounded-md px-3 py-2 text-sm">
        <span className="text-[#0EBE7F] font-normal">با موفقیت وارد شدید!</span>
      </div>
    )
  }
}

export default dynamic(() => Promise.resolve(LoginPage), { ssr: false })
