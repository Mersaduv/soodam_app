/* eslint-disable tailwindcss/migration-from-tailwind-2 */
import { Fragment, useState } from 'react'

import { Combobox as HUICombobox, Transition } from '@headlessui/react'

import { HiCheck, HiChevronDown } from 'react-icons/hi'

import { Control, useController } from 'react-hook-form'
import { ArrowDownSmmIcon } from '@/icons'

// Todo export list type from address modal
interface Props {
  list: {
    id: number
    name: string
    slug?: string
    province_id?: number
  }[]
  name: string
  control: Control<any>
  placeholder: string
  adminHeight?: boolean
}

const Combobox: React.FC<Props> = (props) => {
  // ? Props
  const { list, name, control, placeholder, adminHeight } = props

  // ? Form Hook
  const { field } = useController({ name, control })

  // ? States
  const [query, setQuery] = useState('')

  // ? Handlers
  const filteredList =
    query === ''
      ? list
      : list.filter((item) => {
          return item.name.toLowerCase().includes(query.toLowerCase())
        })

  // ? Render(s)
  return (
    <HUICombobox value={field.value || null} name={field.name} onChange={field.onChange}>
      <div className="relative">
        <div className={`relative w-full cursor-default overflow-hidden ${!adminHeight ? 'rounded-lg' : 'rounded-[10px]'} border border-gray-200 bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm`}>
          <HUICombobox.Input
            className={`w-full border-none py-2 pl-3 pr-3 text-sm leading-5 text-gray-900 outline-none focus:ring-0 ${
              !adminHeight ? 'h-[40px]' : 'h-[48px] placeholder:text-[14px] px-3'
            }`}
            displayValue={(item: { name: string }) => (item?.name || "")}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            autoComplete="off"
          />
          <HUICombobox.Button className={`flex justify-end top-[2px] absolute inset-y-0 ${!adminHeight ? 'left-0' : 'left-1'} px-2 w-full`}>
            <ArrowDownSmmIcon className="w-[17px] text-[#9D9D9D]" aria-hidden="true" />
          </HUICombobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery('')}
        >
          <HUICombobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-100 bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredList.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none px-4 py-2 text-gray-700">هیچ موردی پیدا نشد!</div>
            ) : (
              filteredList.map((item) => (
                <HUICombobox.Option
                  key={item.id}
                  className={`relative cursor-pointer select-none py-3 pl-10 pr-4 text-white transition-colors hover:bg-red-100
                  ${field.value?.id === item.id ? 'bg-red-50' : ''}
                  `}
                  value={item}
                >
                  {({ active }) => (
                    <>
                      <span
                        className={`block truncate lg:text-sm ${
                          field.value?.id === item.id ? 'font-semibold' : 'font-normal'
                        }`}
                      >
                        {item.name}
                      </span>
                      {field.value?.id === item.id ? (
                        <span
                          className={`flex-center absolute inset-y-0 left-0 pl-3  ${
                            active ? 'text-white' : 'text-red-600'
                          }`}
                        >
                          <HiCheck className="icon text-red-600" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </HUICombobox.Option>
              ))
            )}
          </HUICombobox.Options>
        </Transition>
      </div>
    </HUICombobox>
  )
}

export default Combobox
