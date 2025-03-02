import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

import { truncate } from '@/utils'
import debounce from 'lodash/debounce'
// import { useGetProductsQuery } from '@/services'

import { useAppDispatch, useAppSelector, useDebounce, useDisclosure } from '@/hooks'
import { FaArrowRight } from 'react-icons/fa'
import { Close, Search, SearchNormalIcon } from '@/icons'
import { EmptySearchList } from '@/components/emptyList'
// import { ProductDiscountTag, ProductPriceDisplay } from '@/components/product'
// import { DataStateDisplay } from '@/components/shared'
import { DataStateDisplay } from '../shared'
import Image from 'next/image'
import { useGetHousingQuery, useLazyFetchAddressesQuery } from '@/services'
import { Modal } from '@/components/ui'
import { IoMdArrowRoundForward } from 'react-icons/io'
import { IoArrowForward } from 'react-icons/io5'
import { setCenter, setSearchTriggered, setZoom } from '@/store'
interface Props {}

const SearchModal: React.FC<Props> = (props) => {
  // ? Assets
  const [query, setQuery] = useState('')
  const [addresses, setAddresses] = useState([])
  const dispatch = useAppDispatch()
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
  const [triggerFetchAddresses] = useLazyFetchAddressesQuery() // https://map.ir/search/v2/autocomplete?text=${searchQuery}
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
  const handleAddressSelect = (selectedAddress) => {
    const { coordinates } = selectedAddress.geom; 
    const newCenter = [coordinates[1], coordinates[0]]; 
    dispatch(setCenter(newCenter)); 
    dispatch(setZoom(13)); 
    dispatch(setSearchTriggered(true));
    searchModalHanlders.close();
  };
  const handleSearch = debounce(async (value: string) => {
    if (value) {
      try {
        const results = await triggerFetchAddresses(value).unwrap()
        if (results.value && results.value.length > 0) {
          setAddresses(results.value)
        } else {
          setAddresses([])
        }
      } catch (error) {
        console.error('خطا در دریافت آدرس‌ها:', error)
        setAddresses([])
      }
    } else {
      setAddresses([])
    }
  }, 500)
  const handleRemoveSearch = () => {
    setQuery('')
    setAddresses([])
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
  // console.log(addresses , "addressesaddressesaddresses");
  
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
          className="flex h-full flex-col gap-y-3 bg-white md:rounded-lg  overflow-auto"
        >
          {/* <Modal.Header onClose={searchModalHanlders.close}>جستسجو</Modal.Header> */}
          <Modal.Body>
            <div className="pl-2 flex items-center flex-row-reverse pt-1 shadow-bottom  pr-3">
              <button type="button" className="p-1.5 pl-1" onClick={handleRemoveSearch}>
                <Close className=" text-gray-700 text-3xl" />
              </button>
              <input
                type="text"
                placeholder="جستجو شهر ویا آدرس..."
                className="input grow bg-transparent p-1 py-3 pr-2 text-right outline-none border-none"
                ref={searchRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  handleSearch(e.target.value)
                }}
              />
              <div className="cursor-pointer " onClick={searchModalHanlders.close}>
                <IoArrowForward className="text-[29px]" />
              </div>
            </div>
            {/* <div className="overflow-y-auto lg:max-h-[500px]">تاریخچه جستجو...</div> */}
            <div className="flex flex-col items-start w-full">
              {search && handleSearch(search)}
              {addresses.length > 0 && (
                <div className="flex flex-col items-start gap-y-2 w-full h-full">
                  {addresses.map((address, index) => (
                    <div onClick={() => handleAddressSelect(address)} key={index} className="hover:bg-slate-50 w-full py-3 text-gray-600 px-6 cursor-pointer">
                      {address.address} {/* فرمت آدرس بر اساس پاسخ API */}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </div>
  )
}
export default SearchModal
