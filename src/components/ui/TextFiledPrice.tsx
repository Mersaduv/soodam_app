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

// Helper function to format numbers with appropriate unit
const formatNumberWithUnit = (num: number): { value: string; unit: string } => {
  if (num >= 1000000000) {
    return {
      value: (num / 1000000000).toLocaleString(undefined, { maximumFractionDigits: 2 }),
      unit: 'میلیارد تومن'
    }
  } else if (num >= 1000000) {
    return {
      value: (num / 1000000).toLocaleString(undefined, { maximumFractionDigits: 2 }),
      unit: 'میلیون تومن'
    }
  } else {
    return {
      value: num.toLocaleString(),
      unit: 'تومن'
    }
  }
}

const TextFiledPrice: React.FC<TextFieldProps> = (props) => {
  const { label, errors, name, adForm, isDarker, isFromTo, isMarketerForm, formatPrice, value, onChange, ...rest } =
    props

  // State for raw input value (without commas)
  const [inputValue, setInputValue] = useState<string>('')
  // State for formatted value (with commas) to display below input
  const [formattedValue, setFormattedValue] = useState<{ value: string; unit: string } | null>(null)

  // Sync inputValue with props.value
  useEffect(() => {
    if (value !== undefined && value !== null && value !== '') {
      setInputValue(value.toString())
      if (formatPrice) {
        const numericValue = Number(value)
        setFormattedValue(formatNumberWithUnit(numericValue))
      }
    } else {
      setInputValue('')
      setFormattedValue(null)
    }
  }, [value, formatPrice])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any non-numeric characters
    const rawValue = e.target.value.replace(/[^0-9]/g, '')
    
    if (rawValue === '') {
      setInputValue('')
      setFormattedValue(null)
      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: '',
          },
        }
        onChange(syntheticEvent as any)
      }
      return
    }

    // Only allow numeric input
    if (!/^\d+$/.test(rawValue)) return

    const numberValue = parseInt(rawValue, 10)
    
    // Update input with raw value
    setInputValue(rawValue)
    
    // Update formatted value for display
    if (formatPrice) {
      setFormattedValue(formatNumberWithUnit(numberValue))
    }
    
    if (onChange) {
      // Pass the numeric value to the form controller
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
      <div className="relative">
        <input
          className={`block ${isDarker ? 'bg-[#FCFCFCCC]' : ''} farsi-digits w-full border ${
            adForm
              ? 'h-[40px] placeholder:text-xs font-normal px-2 border-[#E3E3E7] rounded-[8px]'
              : 'h-[48px] px-4 border-[#767372] rounded-[10px]'
          } outline-none transition-colors placeholder:text-start focus:border-blue-600 text-sm pr-4`}
          id={name}
          type="text"
          name={name}
          value={inputValue}
          onChange={handleChange}
          {...rest}
        />
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 text-sm">تومن</span>
      </div>
      {formattedValue && (
        <div className="text-xs text-gray-600 mt-1 px-2 farsi-digits">
          {formattedValue.value} {formattedValue.unit}
        </div>
      )}
      <div dir="ltr" className="w-fit">
        <DisplayError adForm errors={errors} />
      </div>
    </div>
  )
}

export default TextFiledPrice
