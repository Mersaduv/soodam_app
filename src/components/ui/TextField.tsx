import { DisplayError } from '@/components/ui'

import { Control, FieldError, useController } from 'react-hook-form'

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  errors?: FieldError | undefined
  name: string
  control: Control<any>
  adForm?: boolean
}

const TextField: React.FC<Props> = (props) => {
  // ? Props
  const { label, adForm, errors, name, type = 'text', control, ...restProps } = props

  // ? Form Hook
  const { field } = useController({ name, control, rules: { required: true } })

  // const direction = name === 'phoneNumber' ? 'rtl' : /^[a-zA-Z0-9]+$/.test(field.value?.[0]) ? 'ltr' : 'rtl'

  // ? Handlers
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    if (type === 'number' && inputValue.length !== 0) {
      field.onChange(parseInt(inputValue))
    } else {
      field.onChange(inputValue)
    }
  }

  // ? Render(s)
  return (
    <div>
      {label && (
        <label
          className={`block ${adForm ? 'text-sm font-normal mb-2' : 'text-xs mb-3'}  text-gray-700 md:min-w-max lg:text-sm`}
          htmlFor={name}
        >
          {label}
        </label>
      )}
      <input
        className={`block w-full border ${
          adForm ? 'h-[40px] placeholder:text-xs font-normal px-2 border-[#E3E3E7] rounded-[8px]' : 'h-[48px] px-4 border-[#767372] rounded-[10px]'
        }  outline-none transition-colors placeholder:text-start focus:border-blue-600 text-sm`}
        // style={{ direction }}
        id={name}
        type={type}
        value={field?.value}
        name={field.name}
        onBlur={field.onBlur}
        onChange={onChangeHandler}
        ref={field.ref}
        {...restProps}
      />

      <div dir={'ltr'} className="w-fit">
        <DisplayError adForm errors={errors} />
      </div>
    </div>
  )
}

export default TextField
