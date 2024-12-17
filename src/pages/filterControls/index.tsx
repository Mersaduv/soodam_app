import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { useChangeRoute, useDebounce } from '@/hooks'

import { Button, CustomCheckbox } from '@/components/ui'

import { QueryParams } from '@/types'
import { NextPage } from 'next'
import { ClientLayout } from '@/components/layouts'
import { useGetCategoriesQuery } from '@/services'
import { Disclosure } from '@headlessui/react'
import { ArrowLeftIcon } from '@/icons'

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
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  //   const [price, setPrice] = useState({
  //     minPrice: mainMinPrice,
  //     maxPrice: mainMaxPrice,
  //   })

  // ? Assets
  const { data: categoriesData, isFetching, ...categoryQueryProps } = useGetCategoriesQuery({ ...query })

  //   // ? Debounced Values
  //   const debouncedMinPrice = useDebounce(price.minPrice!, 1200)
  //   const debouncedMaxPrice = useDebounce(price.maxPrice!, 1200)

  // ? Handlers
  const toggleDropdown = () => {
    setIsOpen((prev) => !prev)
  }

  const handleSelectCategory = (name) => {
    setSelectedCategory(name)
    setIsOpen(false) // بستن Dropdown پس از انتخاب
  }
  //   const handleChangeRoute = (newQueries: QueryParams) => {
  //     changeRoute({
  //       ...query,
  //       page: pageQuery && pageQuery > 1 ? 1 : '',
  //       ...newQueries,
  //     })
  //   }

  //   const handlefilter = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     const { name, type, checked, value } = e.target
  //     if (type === 'checkbox') handleChangeRoute({ [name]: checked })
  //     if (type === 'number') setPrice((prev) => ({ ...prev, [name]: +value }))
  //   }

  //   const handleResetFilters = () => {
  //     handleChangeRoute({ inStock: '', discount: '', price: '' })
  //     // onClose?.()
  //   }

  //   const canReset =
  //     inStockQuery || discountQuery || mainMinPrice !== debouncedMinPrice || mainMaxPrice !== debouncedMaxPrice

  // ? Re-Renders
  //*   Change Route After Debounce
  //   useEffect(() => {
  //     if (debouncedMinPrice && mainMinPrice !== debouncedMinPrice)
  //       handleChangeRoute({
  //         price: `${debouncedMinPrice}-${debouncedMaxPrice}`,
  //       })
  //   }, [debouncedMinPrice])

  //   useEffect(() => {
  //     if (debouncedMaxPrice && mainMaxPrice !== debouncedMaxPrice)
  //       handleChangeRoute({
  //         price: `${debouncedMinPrice}-${debouncedMaxPrice}`,
  //       })
  //   }, [debouncedMaxPrice])

  //*   Close Modal on Change Filter
  //   useEffect(() => {
  //     onClose?.()
  //   }, [discountQuery, inStockQuery, debouncedMaxPrice, debouncedMinPrice])

  // *  Change prices when mainMaxPrice and mainMinPrice of category changes
  //   useEffect(() => {
  //     if (minPriceQuery && maxPriceQuery)
  //       setPrice({
  //         minPrice: minPriceQuery,
  //         maxPrice: maxPriceQuery,
  //       })
  //     else {
  //       setPrice({
  //         minPrice: mainMinPrice,
  //         maxPrice: mainMaxPrice,
  //       })
  //     }
  //   }, [mainMinPrice, mainMaxPrice, minPriceQuery, maxPriceQuery])

  // ? Render(s)
  if (isFetching) return <div>loading...</div>
  return (
    <>
      <ClientLayout title='فیلتر'>
        <div className="pt-[90px] pb-[100px] h-screen px-4">
          <div className="bg-white relative rounded-[16px] p-4 border">
          <h1 className="py-2 font-normal text-[14px]">دسته بندی</h1>
            <div className="bg-white">
              {/* Selected Dropdown */}
              <button
                onClick={toggleDropdown}
                className="w-full border-[1.5px] bg-[#FCFCFC] rounded-[8px] px-4 h-[40px] text-right text-[#5A5A5A] flex justify-between items-center"
              >
                <span className="text-[14px]">{!isOpen && "انتخاب"}{selectedCategory ? selectedCategory : ''}</span>
                <ArrowLeftIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Items */}
              {isOpen && (
                <div className=" mt-2 w-full bg-[#FCFCFC] border-[1.5px] rounded-[8px] z-10">
                  <div className="flex flex-col gap-y-3.5 px-4 py-2">
                    {categoriesData.data.map((item, index) => (
                      <Disclosure key={index}>
                        {({ open }) => (
                          <>
                            <Disclosure.Button className="!mt-0 flex w-full items-center justify-between py-2">
                              <div className="flex gap-x-1.5 items-center">
                                <img className="w-[24px] h-[24px]" src={item.imageUrl} alt={item.name} />
                                <span className="pl-3 whitespace-nowrap font-normal text-[14px] tracking-wide text-[#5A5A5A]">
                                  {item.name}
                                </span>
                              </div>
                              <ArrowLeftIcon
                                className={`w-5 h-5 ${open ? '' : 'rotate-90 text-gray-700'} transition-all`}
                              />
                            </Disclosure.Button>
                            {item.children.length > 0 && (
                              <Disclosure.Panel>
                                {item.children.map((subItem, subIndex) => (
                                  <div
                                    key={subIndex}
                                    onClick={() => handleSelectCategory(subItem.name)}
                                    className="cursor-pointer mb-6 flex w-full items-center justify-between pr-[32px]"
                                  >
                                    <span className="font-light text-[14px] text-[#5A5A5A]">{subItem.name}</span>
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
          </div>
          <div className="pb-14">
          <Button className="w-full rounded-[8px] mt-8 mb-10">بعدی</Button>

          </div>
        </div>
      </ClientLayout>

      {/* <div className="flex justify-end ">
        <button type="button" className="text-sm text-sky-500" onClick={handleResetFilters} disabled={!canReset}>
          حذف فیلتر‌ها
        </button>
      </div> */}

      {/* <div className="divide-y">
        <CustomCheckbox name="inStock" checked={inStockQuery} onChange={handlefilter} label="فقط کالاهای موجود" />

        <CustomCheckbox name="discount" checked={discountQuery} onChange={handlefilter} label="فقط کالاهای فروش ویژه" />

        <div className="py-4">
          <span className="font-medium text-gray-700">محدوده قیمت</span>
          <div className="flex items-center justify-between gap-x-1">
            <span className="text-base">از</span>
            <input
              type="number"
              className="farsi-digits w-3/4 border-b border-gray-200 px-1 text-left text-xl outline-none"
              style={{ direction: 'ltr' }}
              name="minPrice"
              value={price.minPrice}
              onChange={handlefilter}
            />
            <Toman className="h-6 w-6" />
          </div>
          <div className="mb-4 mt-2 flex items-center justify-between gap-x-1">
            <span className="text-base">تا</span>
            <input
              type="number"
              className="farsi-digits w-3/4 border-b border-gray-200 px-1 text-left text-xl outline-none"
              style={{ direction: 'ltr' }}
              name="maxPrice"
              value={price.maxPrice}
              onChange={handlefilter}
            />

            <Toman className="h-6 w-6" />
          </div>
        </div>
      </div> */}
    </>
  )
}

export default FilterControls
