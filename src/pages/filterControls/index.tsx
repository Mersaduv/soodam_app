import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'

import { useChangeRoute, useDebounce } from '@/hooks'

import { Button, CustomCheckbox, TextField } from '@/components/ui'

import { Category, QueryParams } from '@/types'
import { NextPage } from 'next'
import { ClientLayout } from '@/components/layouts'
import { useGetCategoriesQuery } from '@/services'
import { Disclosure } from '@headlessui/react'
import { ArrowLeftIcon } from '@/icons'
import { useFilters } from '@/hooks/use-filter'
type FilterKeys =
  | 'priceRangeFrom'
  | 'priceRangeTo'
  | 'depositRangeFrom'
  | 'depositRangeTo'
  | 'rentFrom'
  | 'rentTo'
  | 'capacityFrom'
  | 'capacityTo'
  | 'extraPeopleFrom'
  | 'extraPeopleTo'
  | 'producerProfitPercentageFrom'
  | 'producerProfitPercentageTo'
  | 'ownerProfitPercentageFrom'
  | 'ownerProfitPercentageTo'

type FiltersType = Partial<Record<FilterKeys, string>>
const FilterControls: NextPage = (props) => {
  // ? Props

  // ? Assets
  const { query } = useRouter()
  const inStockQuery = !!query?.inStock || false
  const discountQuery = !!query?.discount || false
  const minPriceQuery = query.price && +query.price.toString().split('-')[0]
  const maxPriceQuery = query.price && +query.price.toString().split('-')[1]
  const pageQuery = Number(query?.page)

  const changeRoute = useChangeRoute()

  // ? State
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const { data: categoriesData, isFetching, ...categoryQueryProps } = useGetCategoriesQuery({ ...query })
  // const [filters, setFilters] = useState({
  //   priceRange: { from: '', to: '' },
  //   depositRange: { from: '', to: '' },
  //   rent: { from: '', to: '' },
  //   capacity: { from: '', to: '' },
  //   extraPeople: { from: '', to: '' },
  //   producerProfitPercentage: { from: '', to: '' },
  //   ownerProfitPercentage: { from: '', to: '' },
  // })
  // تابع عمومی برای آپدیت state فیلترها
  // const handleFilterChange = (field: string, value: string, isFrom: boolean) => {
  //   setFilters((prev) => ({
  //     ...prev,
  //     [field]: {
  //       ...prev[field],
  //       [isFrom ? 'from' : 'to']: value,
  //     },
  //   }))
  // }
  const { filters, updateFilters } = useFilters()
  const [tempFilters, setTempFilters] = useState<Partial<typeof filters>>(filters)
  const handleTempFilterChange = (field: string, value: string, isFrom: boolean) => {
    setTempFilters((prev) => ({
      ...prev,
      [`${field}${isFrom ? 'From' : 'To'}`]: value || undefined,
    }))
  }
  useEffect(() => {
    setTempFilters(filters)
  }, [filters])

  const handleApplyFilters = () => {
    // const cleanedFilters: QueryParams = Object.fromEntries(
    //   Object.entries(tempFilters).map(([key, value]) => [
    //     key,
    //     Array.isArray(value) ? value[0] : value
    //   ])
    // )

    updateFilters(tempFilters)
  }
  const getDealTypeFromCategory = (category: Category) => {
    if (!category) return null

    const categoryName = category.name.toLowerCase()
    const parentCategoryName = category.parentCategory?.name.toLowerCase() || ''

    if (
      categoryName.includes('ساخت') ||
      categoryName.includes('ساز') ||
      parentCategoryName.includes('ساخت') ||
      parentCategoryName.includes('ساز')
    ) {
      return 'constructionProjects'
    }

    if (categoryName.includes('اجاره کوتاه مدت') || parentCategoryName.includes('اجاره کوتاه مدت')) {
      return 'shortRent'
    }

    if (categoryName.includes('اجاره') || parentCategoryName.includes('اجاره')) {
      return 'rent'
    }

    if (categoryName.includes('خرید') || parentCategoryName.includes('خرید')) {
      return 'sale'
    }

    return null
  }

  const handleSelectCategory = useCallback((category: Category) => {
    setSelectedCategory(category)
    setIsOpen(false)
    setOpenIndex(null) // Reset open index when closing
  }, [])

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev)
    setOpenIndex(null) // Reset open index when toggling
  }, [])

  const findParentIndex = useCallback(
    (category: Category) => {
      if (!categoriesData?.data) return -1

      return categoriesData.data.findIndex((topCategory) => {
        if (topCategory.id === category.id) return true // Check if it's a top-level category

        return topCategory.children?.some(
          (sub) => sub.id === category.id || sub.children?.some((child) => child.id === category.id)
        )
      })
    },
    [categoriesData?.data]
  )
  const dealType = getDealTypeFromCategory(selectedCategory)

  if (filters) {
    console.log(filters, 'filters')
  }
  // ? Render(s)
  if (isFetching) return <div>loading...</div>
  return (
    <>
      <ClientLayout title="فیلتر">
        <div className="pt-[90px] pb-[100px] h-screen px-4">
          <div className="bg-white relative rounded-[16px] p-4 border">
            <h1 className="py-2 font-normal text-[14px]">دسته بندی</h1>
            <div className="bg-white">
              {/* Selected Dropdown */}
              <button
                onClick={toggleDropdown}
                className="w-full border-[1.5px] bg-[#FCFCFC] rounded-[8px] px-4 h-[40px] text-right text-[#5A5A5A] flex justify-between items-center"
              >
                <span className="text-[14px]">
                  {!isOpen && !selectedCategory && 'انتخاب'}
                  {selectedCategory ? selectedCategory.name : ''}
                </span>
                <ArrowLeftIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Items */}
              {isOpen && (
                <div className="mt-2 w-full bg-[#FCFCFC] border-[1.5px] rounded-[8px] z-10">
                  <div className="flex flex-col gap-y-3.5 px-4 py-2">
                    {categoriesData.data.map((item, index) => (
                      <Disclosure key={item.id}>
                        {() => (
                          <>
                            <Disclosure.Button
                              onClick={() => setOpenIndex((prev) => (prev === index ? null : index))}
                              className="!mt-0 flex w-full items-center justify-between py-2"
                            >
                              <div className="flex gap-x-1.5 items-center">
                                {item.imageUrl && (
                                  <img className="w-[24px] h-[24px]" src={item.imageUrl} alt={item.name} />
                                )}
                                <span className="pl-3 whitespace-nowrap font-normal text-[14px] tracking-wide text-[#5A5A5A]">
                                  {item.name}
                                </span>
                              </div>
                              <ArrowLeftIcon
                                className={`w-5 h-5 ${
                                  openIndex === index ? '' : 'rotate-90 text-gray-700'
                                } transition-all`}
                              />
                            </Disclosure.Button>

                            {item.children?.length > 0 && openIndex === index && (
                              <Disclosure.Panel className="-mt-2">
                                {item.children.map((subItem) => (
                                  <div key={subItem.id}>
                                    {subItem.children?.length > 0 ? (
                                      <Disclosure>
                                        {({ open: subOpen }) => (
                                          <>
                                            <Disclosure.Button
                                              className={`cursor-pointer mb-2 py-2 flex w-full items-center justify-between pr-[32px] ${
                                                selectedCategory?.id === subItem.id ? 'bg-gray-50 rounded-lg' : ''
                                              }`}
                                            >
                                              <span className="font-light text-[14px] text-[#5A5A5A]">
                                                {subItem.name}
                                              </span>
                                              <ArrowLeftIcon
                                                className={`w-5 h-5 ml-4 ${
                                                  subOpen ? '' : 'rotate-90 text-gray-700'
                                                } transition-all`}
                                              />
                                            </Disclosure.Button>

                                            <Disclosure.Panel className="-mt-2">
                                              {subItem.children.map((childItem) => (
                                                <div
                                                  key={childItem.id}
                                                  onClick={() => handleSelectCategory(childItem)}
                                                  className={`cursor-pointer mb-2 py-2 flex w-full items-center justify-between pr-[32px] ${
                                                    selectedCategory?.id === childItem.id ? 'bg-gray-50 rounded-lg' : ''
                                                  }`}
                                                >
                                                  <span className="font-light text-[14px] text-[#5A5A5A]">
                                                    {childItem.name}
                                                  </span>
                                                </div>
                                              ))}
                                            </Disclosure.Panel>
                                          </>
                                        )}
                                      </Disclosure>
                                    ) : (
                                      <div
                                        onClick={() => handleSelectCategory(subItem)}
                                        className={`cursor-pointer mb-2 py-2 flex w-full items-center justify-between pr-[32px] ${
                                          selectedCategory?.id === subItem.id ? 'bg-gray-50 rounded-lg' : ''
                                        }`}
                                      >
                                        <span className="font-light text-[14px] text-[#5A5A5A]">{subItem.name}</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </Disclosure.Panel>
                            )}
                          </>
                        )}
                      </Disclosure>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {selectedCategory && (
              <>
                <div className="flex items-center gap-2 mt-6 mb-5">
                  <div className={`flex-1 h-[1.5px] bg-[#E3E3E7]`}></div>
                  {selectedCategory && selectedCategory.name}
                  <div className={`flex-1 h-[2px] bg-[#E3E3E7]`}></div>
                </div>

                <div>
                  {dealType === 'sale' ? (
                    <div className="space-y-4">
                      <div className="flex">
                        <div className="flex gap-2 w-full">
                          <div className="flex items-end pb-3 font-normal text-sm">از</div>
                          <FilterTextField
                            isFromTo
                            compacted
                            label="قیمت فروش"
                            type="number"
                            value={tempFilters.priceRangeFrom || ''}
                            onChange={(value) => handleTempFilterChange('priceRange', value, true)}
                            placeholder="مثال: 100 میلیون تومان"
                          />
                        </div>
                        <div className="flex gap-2 w-full">
                          <div className="flex items-end pb-3 pr-2 font-normal text-sm">تا</div>
                          <FilterTextField
                            isFromTo
                            compacted
                            label="isTo"
                            type="number"
                            value={tempFilters.priceRangeTo}
                            onChange={(value) => handleTempFilterChange('priceRange', value, false)}
                            placeholder="مثال: 1 میلیارد تومان"
                          />
                        </div>
                      </div>
                    </div>
                  ) : dealType === 'rent' ? (
                    <div className="space-y-4">
                      <div className="flex">
                        <div className="flex gap-2 w-full">
                          <div className="flex items-end pb-3 font-normal text-sm">از</div>
                          <FilterTextField
                            isFromTo
                            compacted
                            label="رهن یا ودیعه"
                            type="number"
                            value={tempFilters.depositRangeFrom}
                            onChange={(value) => handleTempFilterChange('depositRange', value, true)}
                            placeholder="مثال: 100 میلیون تومان"
                          />
                        </div>
                        <div className="flex gap-2 w-full">
                          <div className="flex items-end pb-3 pr-2 font-normal text-sm">تا</div>
                          <FilterTextField
                            isFromTo
                            compacted
                            label="isTo"
                            type="number"
                            value={tempFilters.depositRangeTo}
                            onChange={(value) => handleTempFilterChange('depositRange', value, false)}
                            placeholder="مثال: 12 میلیارد تومان"
                          />
                        </div>
                      </div>

                      <div className="flex">
                        <div className="flex gap-2 w-full">
                          <div className="flex items-end pb-3 font-normal text-sm">از</div>
                          <FilterTextField
                            isFromTo
                            compacted
                            label="اجاره ماهیانه"
                            type="number"
                            value={tempFilters.rentFrom}
                            onChange={(value) => handleTempFilterChange('rent', value, true)}
                            placeholder="مثال: 100,000 تومان"
                          />
                        </div>
                        <div className="flex gap-2 w-full">
                          <div className="flex items-end pb-3 pr-2 font-normal text-sm">تا</div>
                          <FilterTextField
                            isFromTo
                            compacted
                            label="isTo"
                            type="number"
                            value={tempFilters.rentTo}
                            onChange={(value) => handleTempFilterChange('rent', value, false)}
                            placeholder="مثال: 10,000,000 تومان"
                          />
                        </div>
                      </div>
                    </div>
                  ) : dealType === 'shortRent' ? (
                    <div className="space-y-4">
                      <div className="flex">
                        <div className="flex gap-2 w-full">
                          <div className="flex items-end pb-3 font-normal text-sm">از</div>
                          <FilterTextField
                            isFromTo
                            compacted
                            label="ظرفیت"
                            type="number"
                            value={tempFilters.capacityFrom}
                            onChange={(value) => handleTempFilterChange('capacity', value, true)}
                            placeholder="مثال: 5 نفر"
                          />
                        </div>
                        <div className="flex gap-2 w-full">
                          <div className="flex items-end pb-3 pr-2 font-normal text-sm">تا</div>
                          <FilterTextField
                            isFromTo
                            compacted
                            label="isTo"
                            type="number"
                            value={tempFilters.capacityTo}
                            onChange={(value) => handleTempFilterChange('capacity', value, false)}
                            placeholder="مثال: 20 نفر"
                          />
                        </div>
                      </div>

                      <div className="flex">
                        <div className="flex gap-2 w-full">
                          <div className="flex items-end pb-3 font-normal text-sm">از</div>
                          <FilterTextField
                            isFromTo
                            compacted
                            label="نفرات اضافه"
                            type="number"
                            value={tempFilters.extraPeopleFrom}
                            onChange={(value) => handleTempFilterChange('extraPeople', value, true)}
                            placeholder="مثال: 1 نفر"
                          />
                        </div>
                        <div className="flex gap-2 w-full">
                          <div className="flex items-end pb-3 pr-2 font-normal text-sm">تا</div>
                          <FilterTextField
                            isFromTo
                            compacted
                            label="isTo"
                            type="number"
                            value={tempFilters.extraPeopleTo}
                            onChange={(value) => handleTempFilterChange('extraPeople', value, false)}
                            placeholder="مثال: 5 نفر"
                          />
                        </div>
                      </div>
                    </div>
                  ) : dealType === 'constructionProjects' ? (
                    <div className="space-y-4">
                      <div className="flex">
                        <div className="flex gap-2 w-full">
                          <div className="flex items-end pb-3 font-normal text-sm">از</div>
                          <FilterTextField
                            isFromTo
                            compacted
                            label="درصد سود سازنده"
                            type="number"
                            value={tempFilters.producerProfitPercentageFrom}
                            onChange={(value) => handleTempFilterChange('producerProfitPercentage', value, true)}
                            placeholder="مثال: 20 درصد"
                          />
                        </div>
                        <div className="flex gap-2 w-full">
                          <div className="flex items-end pb-3 pr-2 font-normal text-sm">تا</div>
                          <FilterTextField
                            isFromTo
                            compacted
                            label="isTo"
                            type="number"
                            value={tempFilters.producerProfitPercentageTo}
                            onChange={(value) => handleTempFilterChange('producerProfitPercentage', value, false)}
                            placeholder="مثال: 50 درصد"
                          />
                        </div>
                      </div>

                      <div className="flex">
                        <div className="flex gap-2 w-full">
                          <div className="flex items-end pb-3 font-normal text-sm">از</div>
                          <FilterTextField
                            isFromTo
                            compacted
                            label="درصد سود مالک"
                            type="number"
                            value={tempFilters.ownerProfitPercentageFrom}
                            onChange={(value) => handleTempFilterChange('ownerProfitPercentage', value, true)}
                            placeholder="مثال: 10 درصد"
                          />
                        </div>
                        <div className="flex gap-2 w-full">
                          <div className="flex items-end pb-3 pr-2 font-normal text-sm">تا</div>
                          <FilterTextField
                            isFromTo
                            compacted
                            label="isTo"
                            type="number"
                            value={tempFilters.ownerProfitPercentageTo}
                            onChange={(value) => handleTempFilterChange('ownerProfitPercentage', value, false)}
                            placeholder="مثال: 40 درصد"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>نوع معامله مشخص نیست</div>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="pb-20">
            <Button onClick={handleApplyFilters} className="w-full rounded-[8px] mt-8 mb-10">
              {' '}
              اعمال فیلترها
            </Button>
          </div>
        </div>
      </ClientLayout>
    </>
  )
}

interface FilterTextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string
  error?: string
  adForm?: boolean
  compacted?: boolean
  isFromTo?: boolean
  value?: string | string[]
  onChange?: (value: string) => void
}
const FilterTextField: React.FC<FilterTextFieldProps> = (props) => {
  // ? Props
  const { label, adForm, error, compacted, isFromTo, type = 'text', value, onChange, ...restProps } = props

  // ? Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    if (type === 'number') {
      const numericValue = inputValue.replace(/\D/g, '')
      onChange?.(numericValue)
    } else {
      onChange?.(inputValue)
    }
  }

  // ? Render(s)
  return (
    <div className={`${isFromTo && 'flex-1'}`}>
      {label && (
        <label
          className={`block  ${label === 'isTo' && 'h-5'} ${
            isFromTo && '-mr-4'
          } text-sm mb-1.5  font-normal  text-[#1A1E25]  md:min-w-max`}
          htmlFor={restProps.id}
        >
          {label !== 'isTo' && label}
        </label>
      )}

      <input
        className={`block farsi-digits w-full bg-[#FCFCFCCC] border h-[40px] placeholder:text-xs font-normal px-2 border-[#E3E3E7] rounded-[8px] outline-none transition-colors placeholder:text-start focus:border-blue-600 text-sm`}
        id={restProps.id}
        type={type}
        value={value}
        onChange={handleChange}
        {...restProps}
      />
    </div>
  )
}
export default FilterControls
