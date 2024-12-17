import React, { ForwardedRef, forwardRef } from 'react'
import { Control, UseFormRegister, useController } from 'react-hook-form'

interface CustomCheckboxProps {
  label?: string
  name: string
  checked: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  customStyle?: string
  isNormal?: boolean
  inLabel?: boolean
}

export const CustomCheckbox = forwardRef(function CustomCheckboxComponent(
  props: CustomCheckboxProps,
  ref: ForwardedRef<HTMLInputElement>
) {
  const { label, name, checked = false, onChange, customStyle, isNormal, inLabel } = props

  return (
    <div className={`flex items-center justify-between ${customStyle ? '' : 'py-2.5'} ${inLabel ? '' : 'w-full'}`}>
      {inLabel ? null : <span className="w-3/4 font-medium text-gray-700">{label}</span>}
      <div dir="ltr" className="flex justify-center">
        <label title={label || ''} htmlFor={`switch-${name}`} className="h-6 relative inline-block">
          <input
            id={`switch-${name}`}
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            ref={ref}
            className="w-11 h-0 cursor-pointer inline-block focus:outline-0 dark:focus:outline-0 border-0 dark:border-0 focus:ring-offset-transparent dark:focus:ring-offset-transparent focus:ring-transparent dark:focus:ring-transparent focus-within:ring-0 dark:focus-within:ring-0 focus:shadow-none dark:focus:shadow-none after:absolute before:absolute after:top-0 before:top-0 after:block before:inline-block before:rounded-full after:rounded-full after:content-[''] after:w-5 after:h-5 after:mt-0.5 after:ml-0.5 after:shadow-md after:duration-100 before:content-[''] before:w-10 before:h-full before:shadow-[inset_0_0_#000] after:bg-white dark:after:bg-gray-50 before:bg-[#BDBDBD]  before:checked:bg-[#D52133] checked:after:duration-300 checked:after:translate-x-4 disabled:after:bg-opacity-75 disabled:cursor-not-allowed disabled:checked:before:bg-opacity-40"
          />
        </label>
      </div>
    </div>
  )
})

interface ControlledCheckboxProps {
  name: string
  control: Control<any>
  label: string
  inLabel?: boolean
}

export const ControlledCheckbox: React.FC<ControlledCheckboxProps> = ({ name, control, inLabel, ...restProps }) => {
  const { field } = useController({ name, control })

  return <CustomCheckbox inLabel checked={field.value} name={field.name} onChange={field.onChange} {...restProps} />
}
