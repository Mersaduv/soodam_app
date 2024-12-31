import { Dispatch, SetStateAction, useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'

import { DisplayError, LoginButton, TextField } from '../../ui'
import { codeSchema, phoneSchema } from '@/utils'

import React, { useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { CodeFormValues, PhoneFormValues } from '@/types'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { SerializedError } from '@reduxjs/toolkit'

interface Props {
  onSubmit: (data: CodeFormValues) => void
  resendHandler: (data: PhoneFormValues) => void
  isLoading: boolean
  phoneNumber: string
  setPhoneNumber: Dispatch<SetStateAction<string>>
  setStep: Dispatch<SetStateAction<number>>
  errorVerification: FetchBaseQueryError | SerializedError | undefined
  isSuccess: boolean
}
interface CodeFormArray {
  code: string[]
}
const VerificationCode: React.FC<Props> = ({
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
    const sanitizedValue = value.slice(0, 1);
    setValue(`code.${index}`, sanitizedValue);
  
    if (sanitizedValue && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  
    // Check if all fields are filled
    const allFieldsFilled = Array.from({ length: 6 }).every((_, idx) =>
      getValues(`code.${idx}`)
    );
    if (allFieldsFilled) {
      handleSubmit(onSubmitHandler)();
    }
  };
  

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !getValues(`code.${index}`) && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    const pastedValue = e.clipboardData.getData('Text');
    
    if (pastedValue.length === 6) {
      pastedValue.split('').forEach((char, idx) => {
        setValue(`code.${idx}`, char);
      });
      
      inputRefs.current[5]?.focus();
  
      handleSubmit(onSubmitHandler)();
    }
  };
  

  const onSubmitHandler = (data: CodeFormArray) => {
    const codeString = data.code.join('')
    onSubmit({ code: codeString })
  }
  const handleChangePhoneNumber = () => {
    setPhoneNumber('')
    setStep(1)
  }

  return (
    <div className="pt-20 px-4">
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
            className="font-normal cursor-pointer text-xs"
          >
            ارسال مجدد
          </div>
        </div>

        <LoginButton isLoading={isLoading}>ورود</LoginButton>
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

export default VerificationCode
