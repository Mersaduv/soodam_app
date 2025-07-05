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
      unit: 'میلیارد تومان'
    }
  } else if (num >= 1000000) {
    return {
      value: (num / 1000000).toLocaleString(undefined, { maximumFractionDigits: 2 }),
      unit: 'میلیون تومان'
    }
  } else {
    return {
      value: num.toLocaleString(),
      unit: 'تومان'
    }
  }
}

// Function to add commas to number
const addCommas = (num: string): string => {
  if (!num) return '';
  
  // Remove existing commas first
  const withoutCommas = num.replace(/,/g, '');
  
  // Add commas for thousands separator
  return withoutCommas.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Function to remove commas
const removeCommas = (num: string): string => {
  return num.replace(/,/g, '');
}

const TextFiledPrice: React.FC<TextFieldProps> = (props) => {
  const { label, errors, name, adForm, isDarker, isFromTo, isMarketerForm, formatPrice, value, onChange, ...rest } =
    props

  // State for raw input value (without commas)
  const [rawValue, setRawValue] = useState<string>('')
  // State for formatted value (with commas) to display in input
  const [displayValue, setDisplayValue] = useState<string>('')
  // State for formatted value (with unit) to display below input
  const [formattedValue, setFormattedValue] = useState<{ value: string; unit: string } | null>(null)

  // Sync rawValue with props.value
  useEffect(() => {
    if (value !== undefined && value !== null && value !== '') {
      const valueString = value.toString();
      setRawValue(valueString);
      setDisplayValue(addCommas(valueString));
      
      if (formatPrice) {
        const numericValue = Number(valueString);
        if (!isNaN(numericValue)) {
          setFormattedValue(formatNumberWithUnit(numericValue));
        }
      }
    } else {
      setRawValue('');
      setDisplayValue('');
      setFormattedValue(null);
    }
  }, [value, formatPrice])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Get the current cursor position
    const cursorPosition = e.target.selectionStart || 0;
    
    // Get the current value and remove all non-numeric characters
    const inputVal = e.target.value;
    const strippedValue = inputVal.replace(/[^0-9]/g, '');
    
    if (strippedValue === '') {
      setRawValue('');
      setDisplayValue('');
      setFormattedValue(null);
      
      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: '',
          },
        }
        onChange(syntheticEvent as any);
      }
      return;
    }

    // Update raw value (without commas)
    setRawValue(strippedValue);
    
    // Format with commas for display
    const withCommas = addCommas(strippedValue);
    setDisplayValue(withCommas);
    
    // Calculate new cursor position (accounting for added commas)
    const addedCommas = (withCommas.match(/,/g) || []).length - (inputVal.slice(0, cursorPosition).match(/,/g) || []).length;
    const newPosition = cursorPosition + addedCommas;
    
    // Update formatted value for unit display if needed
    if (formatPrice) {
      const numberValue = parseInt(strippedValue, 10);
      setFormattedValue(formatNumberWithUnit(numberValue));
    }
    
    if (onChange) {
      // Pass the numeric value to the form controller
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: strippedValue,  // Pass raw numeric value to form
        },
      };
      onChange(syntheticEvent as any);
    }
    
    // Set cursor position after state update
    setTimeout(() => {
      if (e.target) {
        e.target.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
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
          value={displayValue}
          onChange={handleChange}
          {...rest}
        />
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 text-sm">تومان</span>
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
