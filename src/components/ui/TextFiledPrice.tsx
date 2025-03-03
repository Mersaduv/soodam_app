import { useState } from 'react'

import { useEffect } from 'react'
import { FieldError } from 'react-hook-form'
import { DisplayError } from '.'

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  errors?: FieldError | undefined
  name: string
  adForm?: boolean
  isDynamic?: boolean
  isFromTo?: boolean
  isMarketerForm?: boolean
  isDarker?: boolean
  formatPrice?: boolean
}

const TextFiledPrice: React.FC<TextFieldProps> = (props) => {
  const { label, errors, name, adForm, isDarker, isFromTo, isMarketerForm, formatPrice, value, onChange, ...rest } =
    props

  // state نگهدارنده مقدار نمایش داده شده (با یا بدون کاما)
  const [displayValue, setDisplayValue] = useState<string>('')

  // هماهنگ‌سازی displayValue با مقدار دریافتی از props.value
  useEffect(() => {
    if (value !== undefined && value !== null && value !== '') {
      if (formatPrice) {
        const numericValue = Number(value)
        setDisplayValue(numericValue.toLocaleString())
      } else {
        setDisplayValue(value.toString())
      }
    } else {
      setDisplayValue('')
    }
  }, [value, formatPrice])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // حذف کاما در صورت وجود اگر formatPrice فعال است
    let rawValue = formatPrice ? e.target.value.replace(/,/g, '') : e.target.value
    if (rawValue === '') {
      setDisplayValue('')
      if (onChange) onChange(e)
      return
    }
    // تنها اجازه ورود اعداد (عدد صحیح) را می‌دهد
    if (!/^\d+$/.test(rawValue)) return

    const numberValue = parseInt(rawValue, 10)
    // بروزرسانی displayValue بر اساس مقدار formatPrice
    if (formatPrice) {
      setDisplayValue(numberValue.toLocaleString())
    } else {
      setDisplayValue(rawValue)
    }
    if (onChange) {
      // ایجاد یک رویداد سینتتیک که مقدار عددی (بدون کاما) را به onChange ارسال کند
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: numberValue,
        },
      }
      onChange(syntheticEvent as any)
    }
  }

  return (
    <div className={isFromTo ? 'flex-1' : ''}>
      {label && (
        <label
          className={`block ${isDarker ? 'text-sm font-normal' : ''} ${label === 'isTo' ? 'h-5' : ''} ${
            isFromTo ? '-mr-4' : ''
          } ${adForm ? 'text-sm font-normal mb-2' : 'text-xs mb-3'} text-[#1A1E25] ${
            isMarketerForm ? 'mb-[4px]' : ''
          } md:min-w-max`}
          htmlFor={name}
        >
          {label !== 'isTo' && label}
        </label>
      )}
      <input
        className={`block ${isDarker ? 'bg-[#FCFCFCCC]' : ''} farsi-digits w-full border ${
          adForm
            ? 'h-[40px] placeholder:text-xs font-normal px-2 border-[#E3E3E7] rounded-[8px]'
            : 'h-[48px] px-4 border-[#767372] rounded-[10px]'
        } outline-none transition-colors placeholder:text-start focus:border-blue-600 text-sm`}
        id={name}
        type="text" // از text استفاده می‌کنیم تا امکان فرمت کردن مقدار فراهم شود
        name={name}
        value={displayValue}
        onChange={handleChange}
        {...rest}
      />
      <div dir="ltr" className="w-fit">
        <DisplayError adForm errors={errors} />
      </div>
    </div>
  )
}

export default TextFiledPrice
