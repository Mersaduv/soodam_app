import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

import { truncate } from '@/utils'

// import { useGetProductsQuery } from '@/services'

import { useAppSelector, useDebounce, useDisclosure } from '@/hooks'
import { FaArrowRight } from 'react-icons/fa'
import { Close, Search, SearchNormalIcon } from '@/icons'
import { EmptySearchList } from '@/components/emptyList'
// import { ProductDiscountTag, ProductPriceDisplay } from '@/components/product'
// import { DataStateDisplay } from '@/components/shared'
import { DataStateDisplay } from '../shared'
import Image from 'next/image'
import { useGetHousingQuery } from '@/services'
import { Modal } from '@/components/ui'
import { IoMdArrowRoundForward } from 'react-icons/io'
import { IoArrowForward } from 'react-icons/io5'
interface Props {}

const SearchModal: React.FC<Props> = (props) => {
  // ? Assets
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement | null>(null)
  const [isShowSearchModal, searchModalHanlders] = useDisclosure()
  const [isShowSearchInput, setIsShowSearchInput] = useState(false)
  const debouncedSearch = useDebounce(search, 1200)
  const searchInputRef = useRef<HTMLDivElement>(null)
  const { address } = useAppSelector((state) => state.statesData)
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
    <div className="flex-1">
      <div
        onClick={searchModalHanlders.open}
        className="flex gap-1.5 h-[48px] pr-3 w-full cursor-text rounded-lg z-0  bg-[#F2F2F3] items-center transition duration-700 ease-in-out"
      >
        <div>
          <SearchNormalIcon width="24px" height="20px" />
        </div>
        <div className="text-sm text-[#1A1E25] line-clamp-1 overflow-hidden text-ellipsis">{address}</div>
      </div>
      <Modal isShow={isShowSearchModal} onClose={searchModalHanlders.close} effect="bottom-to-top" isSearchModal>
        <Modal.Content
          onClose={searchModalHanlders.close}
          className="flex h-full flex-col gap-y-3 bg-white md:rounded-lg"
        >
          {/* <Modal.Header onClose={searchModalHanlders.close}>جستسجو</Modal.Header> */}
          <Modal.Body>
            <div className="pl-2 flex items-center flex-row-reverse pt-1 shadow-bottom  pr-3">
              <button type="button" className="p-1.5 pl-1" onClick={handleRemoveSearch}>
                <Close className=" text-gray-700 text-3xl" />
              </button>
              <input
                type="text"
                placeholder="شهر,کدپستی ویا آدرس"
                className="input grow bg-transparent p-1 py-3 pr-2 text-right outline-none border-none"
                ref={searchRef}
                value={search}
                onChange={handleChange}
              />
              {/* <button
                type="button"
                onClick={searchModalHanlders.close}
                className="p-0.5 right-0 text-white bg-black absolute border-[1.8px] border-black rounded-full"
              > */}
              <div className='cursor-pointer ' onClick={searchModalHanlders.close}>
                <IoArrowForward className="text-[29px]" />
              </div>
              {/* </button> */}
            </div>
            <div className="overflow-y-auto lg:max-h-[500px]">تاریخچه جستجو...</div>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      {/* <div
        className={`border-[#E3E3E7] flex-1 border-[0.8px] relative rounded-lg ${
          isShowSearchInput ? 'rounded-b-none' : ''
        } `}
      >
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
              تاریخچه جستجو ..
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsShowSearchInput(true)}
            className="flex gap-1.5 h-[48px] pr-3 w-full rounded-lgs cursor-text rounded-lg z-0  bg-[#F2F2F3] items-center transition duration-700 ease-in-out"
          >
            <div>
              <SearchNormalIcon width="24px" height="20px" />
            </div>
            <div className="text-sm text-[#1A1E25] line-clamp-1 overflow-hidden text-ellipsis">{address}</div>
          </div>
        )}
      </div> */}
    </div>
  )
}

export default SearchModal
