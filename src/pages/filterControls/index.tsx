import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'

import { useChangeRoute, useDebounce } from '@/hooks'

import { Button, CustomCheckbox, TextField } from '@/components/ui'

import { Category, QueryParams } from '@/types'
import { NextPage } from 'next'
import { ClientLayout } from '@/components/layouts'
import { useGetCategoriesQuery, useLazyGetFeaturesByCategoryQuery } from '@/services'
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
  const { query, push, pathname } = useRouter()
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
  const [openDropdowns, setOpenDropdowns] = useState({})
  const { data: categoriesData, isFetching, ...categoryQueryProps } = useGetCategoriesQuery({ ...query })
  const [triggerGetFeaturesByCategory, { data: features }] = useLazyGetFeaturesByCategoryQuery()

  const { filters, updateFilters } = useFilters()
  const [tempFilters, setTempFilters] = useState<{ [key: string]: string | string[] | undefined }>({})

  useEffect(() => {
    if (categoriesData?.data && query.category) {
      const categoryId = query.category
      const findCategory = (categories) => {
        for (const cat of categories) {
          if (cat.id === categoryId) return cat
          if (cat.children) {
            const found = findCategory(cat.children)
            if (found) return found
          }
        }
        return null
      }
      const category = findCategory(categoriesData.data)
      if (category) {
        setSelectedCategory(category)
      } else {
        setSelectedCategory(null) // اگر دسته‌بندی در داده‌ها پیدا نشد
      }
    } else {
      setSelectedCategory(null) // اگر کوئری یا داده‌ها موجود نباشد
    }
  }, [categoriesData?.data, query.category])
  const handleTempFilterChange = (field: string, value: string, isFrom: boolean, isDynamic?: boolean) => {
    if (isDynamic) {
      setTempFilters((prev) => ({
        ...prev,
        [`${field}-${isFrom ? 'From' : 'To'}`]: value || undefined,
      }))
    } else {
      setTempFilters((prev) => ({
        ...prev,
        [`${field}${isFrom ? 'From' : 'To'}`]: value || undefined,
      }))
    }
  }
  useEffect(() => {
    setTempFilters(filters)
  }, [filters])

  const handleApplyFilters = () => {
    const cleanedFilters = {
      ...tempFilters,
      category: selectedCategory?.id || undefined,
    }

    const finalFilters = Object.fromEntries(
      Object.entries(cleanedFilters).filter(
        ([_, v]) => v !== undefined || v !== '' || (Array.isArray(v) ? v.length > 0 : v !== '')
      )
    )

    updateFilters(finalFilters)

    push({
      pathname: '/',
      query: {
        ...query,
        ...finalFilters,
      },
    })
  }

  const handleRemoveFilters = () => {
    setTempFilters({})
    updateFilters({})
    setSelectedCategory(null)
    setOpenIndex(null)
    setIsOpen(false)
    push({
      pathname: '/filterControls',
      query: {},
    })
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

    if (categoryName.includes('فروش') || parentCategoryName.includes('فروش')) {
      return 'sale'
    }

    return null
  }

  const handleSelectCategory = useCallback((category: Category) => {
    setSelectedCategory(category)
    setTempFilters((prev) => ({
      ...prev,
      category: category.id,
    }))
    setIsOpen(false)
    setOpenIndex(null)
  }, [])

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev)
    setOpenIndex(null) // Reset open index when toggling
  }, [])
  const toggleDropdownFeature = (id: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [id]: !prev[id] }))
  }

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

  useEffect(() => {
    const fetchFeatures = async (category: Category | null, level = 0) => {
      if (!category || level > 2) return

      // Trigger the query manually
      const fetchedFeatures = await triggerGetFeaturesByCategory(category.id)
      if (fetchedFeatures?.data?.data?.length === 0 && category.parentCategory) {
        // No features, try parent category
        fetchFeatures(category.parentCategory, level + 1)
      }
    }

    if (selectedCategory) {
      fetchFeatures(selectedCategory)
    }
  }, [selectedCategory, triggerGetFeaturesByCategory])

  const dealType = getDealTypeFromCategory(selectedCategory)

  if (filters) {
    console.log(filters, 'filters')
  }
  // ? Render(s)
  if (isFetching) return <div>loading...</div>
  return (
    <>
      <ClientLayout title="فیلتر" handleRemoveFilters={handleRemoveFilters}>
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
                            formatPrice
                            isFromTo
                            compacted
                            label="قیمت فروش"
                            type="text"
                            value={tempFilters.priceRangeFrom || ''}
                            onChange={(value) => handleTempFilterChange('priceRange', value, true)}
                            placeholder="مثال: 100 میلیون تومان"
                          />
                        </div>
                        <div className="flex gap-2 w-full">
                          <div className="flex items-end pb-3 pr-2 font-normal text-sm">تا</div>
                          <FilterTextField
                            formatPrice
                            isFromTo
                            compacted
                            label="isTo"
                            type="text"
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
                            formatPrice
                            isFromTo
                            compacted
                            label="رهن یا ودیعه"
                            type="text"
                            value={tempFilters.depositRangeFrom}
                            onChange={(value) => handleTempFilterChange('depositRange', value, true)}
                            placeholder="مثال: 100 میلیون تومان"
                          />
                        </div>
                        <div className="flex gap-2 w-full">
                          <div className="flex items-end pb-3 pr-2 font-normal text-sm">تا</div>
                          <FilterTextField
                            formatPrice
                            isFromTo
                            compacted
                            label="isTo"
                            type="text"
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
                            formatPrice
                            label="اجاره ماهیانه"
                            type="text"
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
                            formatPrice
                            label="isTo"
                            type="text"
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

                  <div className="space-y-4 mt-4">
                    {features?.data
                      .filter((item) => item.type === '')
                      .map((field) => (
                        <div key={field.id} className="flex">
                          <div className="flex gap-2 w-full">
                            <div className="flex items-end pb-3 font-normal text-sm">از</div>
                            <FilterTextField
                              isFromTo
                              compacted
                              label={field.name}
                              type="number"
                              value={tempFilters[`${field.id}-From`] || ''}
                              onChange={(value) => handleTempFilterChange(field.id, value, true, true)}
                              placeholder={field.placeholder}
                            />
                          </div>

                          <div className="flex gap-2 w-full">
                            <div className="flex items-end pb-3 pr-2 font-normal text-sm">تا</div>
                            <FilterTextField
                              isFromTo
                              compacted
                              label="isTo"
                              type="number"
                              value={tempFilters[`${field.id}-To`] || ''}
                              onChange={(value) => handleTempFilterChange(field.id, value, false, true)}
                              placeholder={field.placeholder}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className="space-y-4 mt-4">
                    {features?.data
                      .filter((item) => item.type === 'selective')
                      .map((field) => (
                        <div key={field.id} className="w-full mb-3">
                          <h1 className="font-normal text-sm mb-2">{field.name}</h1>

                          {/* دکمه باز/بستن Dropdown و نمایش مقادیر انتخاب‌شده */}
                          <div
                            className="bg-white px-4 h-[40px] rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer"
                            onClick={() => toggleDropdownFeature(field.id)}
                          >
                            <div className="flex items-center space-x-1 overflow-hidden">
                              <div className="flex items-center space-x-1 overflow-hidden">
                                {Array.isArray(tempFilters[field.id]) && tempFilters[field.id].length > 0 ? (
                                  (tempFilters[field.id] as string[]).map((selectedId, index) => {
                                    const selectedItem = field.values.find((v) => v.id === selectedId)
                                    return (
                                      <span key={index} className="text-sm text-gray-700 truncate">
                                        {selectedItem?.name}
                                        {index < (tempFilters[field.id] as string[]).length - 1 && ', '}
                                      </span>
                                    )
                                  })
                                ) : (
                                  <span className="text-sm text-gray-400">انتخاب کنید</span>
                                )}
                              </div>
                            </div>
                            <ArrowLeftIcon
                              className={`w-5 h-5 text-[#9D9D9D] transition-transform ${
                                openDropdowns[field.id] ? 'rotate-180' : ''
                              }`}
                            />
                          </div>

                          {/* لیست گزینه‌ها */}
                          {openDropdowns[field.id] && (
                            <div className="w-full mt-1.5 bg-[#FCFCFC] border border-[#E3E3E7] rounded-lg p-1">
                              {field.values.map((value) => (
                                <label
                                  key={value.id}
                                  className="inline-flex items-center p-3 hover:bg-[#F5F5F8] cursor-pointer w-full"
                                >
                                  <div className="flex items-center cursor-pointer relative">
                                    <input
                                      type="checkbox"
                                      name={`filter-${field.id}`}
                                      checked={
                                        (Array.isArray(tempFilters[field.id]) &&
                                          tempFilters[field.id].includes(value.id)) ||
                                        false
                                      }
                                      onChange={() => {
                                        setTempFilters((prev) => {
                                          const currentValues = Array.isArray(prev[field.id]) ? prev[field.id] : []
                                          const updatedValues = currentValues.includes(value.id)
                                            ? Array.isArray(currentValues) &&
                                              currentValues.filter((id) => id !== value.id)
                                            : [...currentValues, value.id]
                                          return {
                                            ...prev,
                                            [field.id]: updatedValues.length > 0 ? updatedValues : undefined,
                                          }
                                        })
                                      }}
                                      className="peer h-[18px] w-[18px] cursor-pointer transition-all appearance-none rounded border-[1.5px] border-[#D52133] checked:bg-[#D52133] checked:border-[#D52133]"
                                    />
                                    {/* آیکون تیک */}
                                    <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-3.5 w-3.5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </span>
                                  </div>
                                  <span className="mr-3 font-normal text-[13px] text-[#5A5A5A]">{value.name}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>

                  <div className="space-y-4 mt-4">
                    {features?.data
                      .filter((item) => item.type === 'radio')
                      .map((field) => (
                        <div key={field.id} className="flex items-center justify-between bg-white rounded-lg mb-3">
                          <span className="font-normal text-sm">{field.name}</span>
                          <div className="flex gap-4">
                            {/* گزینه اولویت دارد */}
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                className="hidden"
                                checked={tempFilters[field.id] === 'اولویت دارد'}
                                onChange={() => {
                                  setTempFilters((prev) => ({
                                    ...prev,
                                    [field.id]: prev[field.id] === 'اولویت دارد' ? undefined : 'اولویت دارد',
                                  }))
                                }}
                              />
                              <div className="w-6 h-6 rounded-full border flex items-center justify-center border-[#E3E3E7]">
                                {tempFilters[field.id] === 'اولویت دارد' && (
                                  <div className="w-3 h-3 rounded-full bg-[#D52133]" />
                                )}
                              </div>
                              <span className="mr-2 font-normal text-xs">اولویت دارد</span>
                            </label>

                            {/* گزینه اولویت ندارد */}
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                className="hidden"
                                checked={!tempFilters[field.id] || tempFilters[field.id] === 'اولویت ندارد'}
                                onChange={() => {
                                  setTempFilters((prev) => ({
                                    ...prev,
                                    [field.id]: prev[field.id] === 'اولویت ندارد' ? undefined : 'اولویت ندارد',
                                  }))
                                }}
                              />
                              <div className="w-6 h-6 rounded-full border flex items-center justify-center border-[#E3E3E7]">
                                {(tempFilters[field.id] === 'اولویت ندارد' || !tempFilters[field.id]) && (
                                  <div className="w-3 h-3 rounded-full bg-[#D52133]" />
                                )}
                              </div>
                              <span className="mr-2 font-normal text-xs">اولویت ندارد</span>
                            </label>
                          </div>
                        </div>
                      ))}
                  </div>
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
  formatPrice?: boolean
}
const FilterTextField: React.FC<FilterTextFieldProps> = (props) => {
  // ? Props
  const { label, adForm, error, compacted, isFromTo, type = 'text', value, onChange, formatPrice, ...restProps } = props

  // ? Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    if (type === 'number') {
      const numericValue = inputValue.replace(/\D/g, '')
      onChange?.(numericValue)
    } else {
      const numericValue = inputValue.replace(/,/g, '').replace(/\D/g, '')
      // فرمت عدد به صورت 3 به 3
      const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      if (formatPrice) {
        onChange?.(formattedValue)
      } else {
        onChange?.(inputValue)
      }
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
