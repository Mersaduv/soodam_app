import { useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'

import { LoginButton, TextField } from '../../ui'
import { codeSchema, phoneSchema } from '@/utils'

import React, { useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { CodeFormValues } from '@/types'

interface Props {
  onSubmit: (data: CodeFormValues) => void
  isLoading: boolean
  phoneNumber: string
}
interface CodeFormArray {
  code: string[]
}
const VerificationCode: React.FC<Props> = ({ onSubmit, isLoading, phoneNumber }) => {
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
    }
  }

  const onSubmitHandler = (data: CodeFormArray) => {
    const codeString = data.code.join('') 
    onSubmit({ code: codeString })
  }

  return (
    <form dir="ltr" onSubmit={handleSubmit(onSubmitHandler)} className="flex flex-col items-center">
      <h1 className="font-bold text-lg">تایید کد فعالسازی</h1>
      <p className="font-normal text-[#5A5A5A]">کد فعالسازی به شماره {phoneNumber} ارسال گردید.</p>

      <div className="flex space-x-[16px]">
        {Array.from({ length: 6 }).map((_, index) => (
          <Controller
            key={index}
            name={`code.${index}`}
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                maxLength={1}
                dir="ltr"
                className="w-12 h-12 text-center text-xl border border-gray-600 rounded-[10px] focus:ring-1 focus:ring-blue-500 outline-none"
                ref={(el) => {
                  inputRefs.current[index] = el
                }}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={(e) => handlePaste(e, index)}
              />
            )}
          />
        ))}
      </div>

      <LoginButton isLoading={isLoading}>ورود</LoginButton>
    </form>
  )
}

export default VerificationCode