import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

import { truncate } from '@/utils'

// import { useGetProductsQuery } from '@/services'

import { useDebounce, useDisclosure } from '@/hooks'

import { Close, Search, SearchNormalIcon } from '@/icons'
import { EmptySearchList } from '@/components/emptyList'
// import { ProductDiscountTag, ProductPriceDisplay } from '@/components/product'
// import { DataStateDisplay } from '@/components/shared'
import { DataStateDisplay } from '../shared'
import Image from 'next/image'
import { useGetHousingQuery } from '@/services'

interface Props {}

const SearchModal: React.FC<Props> = (props) => {
  // ? Assets
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement | null>(null)
  const [isShowSearchModal, searchModalHanlders] = useDisclosure()
  const [isShowSearchInput, setIsShowSearchInput] = useState(false)
  const debouncedSearch = useDebounce(search, 1200)
  const searchInputRef = useRef<HTMLDivElement>(null)
  // ? Search Products Query
  const { data, ...housingQueryProps } = useGetHousingQuery(
    {
      search,
    },
    { skip: !debouncedSearch }
  )

  // ? Re-Renders
  //* Reset Search
  useEffect(() => {
    if (!isShowSearchModal) {
      setSearch('')
    }
  }, [isShowSearchModal])

  //* Use useEffect to set focus after a delay when the modal is shown
  useEffect(() => {
    if (isShowSearchModal) {
      const timeoutId = setTimeout(() => {
        searchRef.current?.focus()
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [isShowSearchModal])

  // ? Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleRemoveSearch = () => {
    setSearch('')
  }
  useEffect(() => {
    if (isShowSearchInput && searchRef.current) {
      searchRef.current.focus() // فوکوس کردن بر روی input
    }
  }, [isShowSearchInput])
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setIsShowSearchInput(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  // ? Render(s)
  return (
    <>
      <div className={`border-[#E3E3E7] flex-1 border-[0.8px] relative rounded-lg ${isShowSearchInput ? 'rounded-b-none' : ''} `}>
        {/* input   */}
        {isShowSearchInput ? (
          <div ref={searchInputRef} className="w-full rounded-md rounded-b-none px-3 pb-2 bg-white shadow-item">
            <div className="flex items-center flex-row-reverse  border-b border-blue-300 w-full h-[48px]">
              <input
                type="text"
                placeholder="جستجو"
                className="input grow  h-[48px] placeholder:text-sm  pr-0 bg-transparent text-right focus:outline-none border-none focus:ring-0"
                ref={searchRef}
                value={search}
                onChange={handleChange}
              />
              <Search className="icon m-2 ml-2 mr-0 text-gray-500" />
            </div>
            <div className="absolute shadow-searchModal h-[500px] overflow-auto rounded-md rounded-t-none sm:top-12 right-0 left-0 bg-white w-full border border-gray-200   border-t-0 p-3 z-[9999]">
              {/* <DataStateDisplay
                {...housingQueryProps}
                dataLength={data ? data.data.length : 0}
                emptyComponent={<EmptySearchList />}
              >
                <div className="space-y-3 divide-y px-4 py-3">
                  {data?.data &&
                    data?.data?.length > 0 &&
                    search.length > 0 &&
                    data?.data?.map((item) => (
                      <div key={item.id} className="py-2">
                        <Link href={`/housing/${item.slug}`} onClick={() => searchModalHanlders.close()}>
                          <Image src={item.images[0]} alt={item.title} className="object-contain" width={20} height={20} />
                          <span className="py-2 text-sm">{truncate(item.title, 70)}</span>
                          <div className="flex justify-between">
                            <p className="text-sm font-bold">
                              {item.deposit === 0 && item.rent === 0
                                ? `فروشی ${item.sellingPrice.toLocaleString()} تومان`
                                : `ودیعه ${item.deposit.toLocaleString()} تومان / اجاره ${item.rent.toLocaleString()} تومان`}
                            </p>
                          </div>
                        </Link>
                      </div>
                    ))}
                </div>
              </DataStateDisplay> */}
              {/* <EmptySearchList /> */}
              تاریخچه جستجو ..
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsShowSearchInput(true)}
            className="flex gap-1.5 pr-3 h-[48px] w-full rounded-lgs cursor-text rounded-lg z-0  bg-[#F2F2F3] items-center transition duration-700 ease-in-out"
          >
            <SearchNormalIcon width='24px' height='20px' />
            <div className="text-sm text-[#1A1E25]">جستجو</div>
          </button>
        )}
      </div>
    </>
  )
}

export default SearchModal
