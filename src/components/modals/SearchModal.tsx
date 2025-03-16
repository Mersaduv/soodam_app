import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'

import { truncate } from '@/utils'
import debounce from 'lodash/debounce'
// import { useGetProductsQuery } from '@/services'
import { LuHistory } from 'react-icons/lu'

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
  const [searchHistory, setSearchHistory] = useState([])
  const searchRef = useRef<HTMLInputElement | null>(null)
  const [isShowSearchModal, searchModalHanlders] = useDisclosure()
  const [isShowSearchInput, setIsShowSearchInput] = useState(false)
  const debouncedSearch = useDebounce(search, 1200)
  const searchInputRef = useRef<HTMLDivElement>(null)
  const { address, userCityLocation } = useAppSelector((state) => state.statesData)
  const latUser = userCityLocation[0]
  const lngUser = userCityLocation[1]
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

  useEffect(() => {
    const storedHistory = localStorage.getItem('searchHistory')
    const history = storedHistory ? JSON.parse(storedHistory) : []
    setSearchHistory(history)
  }, [isShowSearchModal, query])

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
    // خواندن تاریخچه جستجو از localStorage
    const storedHistory = localStorage.getItem('searchHistory')
    let history = storedHistory ? JSON.parse(storedHistory) : []

    // بررسی وجود مورد مشابه برای جلوگیری از تکرار
    const isExist = history.find((item) => item.address === selectedAddress.address)
    if (!isExist) {
      // اضافه کردن نتیجه جستجو به ابتدای آرایه
      history.unshift(selectedAddress)
      // در صورت نیاز، می‌توانید تاریخچه را به تعداد معینی محدود کنید (مثلاً 10 مورد)
      if (history.length > 10) {
        history = history.slice(0, 10)
      }
      localStorage.setItem('searchHistory', JSON.stringify(history))
    }

    // ادامه عملکرد پس از ذخیره در تاریخچه
    const { coordinates } = selectedAddress.geom
    const newCenter = [coordinates[1], coordinates[0]]
    dispatch(setCenter(newCenter))
    dispatch(setZoom(13))
    dispatch(setSearchTriggered(true))
    searchModalHanlders.close()
  }

  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const toRad = (value: number) => (value * Math.PI) / 180
    const R = 6371 // Radius of the earth in km
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const handleSearch = debounce(async (value: string) => {
    if (value) {
      try {
        const results = await triggerFetchAddresses(value).unwrap()
        if (results.value && results.value.length > 0) {
          const sortedResults = [...results.value].sort((a, b) => {
            const [lngA, latA] = a.geom.coordinates
            const [lngB, latB] = b.geom.coordinates
            return getDistance(latUser, lngUser, latA, lngA) - getDistance(latUser, lngUser, latB, lngB)
          })
          setAddresses(sortedResults)
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

  // تابعی برای محاسبه شباهت ساده (در این مثال از بررسی وجود متن جستجو در آدرس استفاده می‌شود)
  const handleSearchClick = async () => {
    if (query) {
      try {
        const results = await triggerFetchAddresses(query).unwrap()
        if (results.value && results.value.length > 0) {
          const matchedAddress =
            results.value.find((addr) => addr.address.toLowerCase().includes(query.toLowerCase())) || results.value[0]

          // ✅ ذخیره در localStorage - مشابه handleAddressSelect
          const storedHistory = localStorage.getItem('searchHistory')
          let history = storedHistory ? JSON.parse(storedHistory) : []

          const isExist = history.find((item) => item.address === matchedAddress.address)
          if (!isExist) {
            history.unshift(matchedAddress)
            if (history.length > 10) {
              history = history.slice(0, 10)
            }
            localStorage.setItem('searchHistory', JSON.stringify(history))
          }

          // ادامه عملکرد
          handleAddressSelect(matchedAddress)
        } else {
          console.log('هیچ آدرسی یافت نشد.')
        }
      } catch (error) {
        console.error('خطا در دریافت آدرس‌ها:', error)
      }
    }
  }

  const isMobile = useMemo(() => {
    if (typeof window !== 'undefined') {
      return /Mobi|Android/i.test(navigator.userAgent)
    }
    return false
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
                onKeyDown={(e) => {
                  if (!isMobile && e.key === 'Enter') {
                    handleSearchClick()
                  }
                }}
              />
              <div className="cursor-pointer " onClick={searchModalHanlders.close}>
                <IoArrowForward className="text-[29px]" />
              </div>
            </div>
            {/* <div className="overflow-y-auto lg:max-h-[500px]">تاریخچه جستجو...</div> */}
            <div className="flex flex-col items-start w-full">
              {search && handleSearch(search)}
              {query && (
                <div
                  className="hover:bg-slate-50 w-full py-3 text-gray-600 px-6 cursor-pointer"
                  onClick={handleSearchClick}
                >
                  جستجو {`<<${query}>>`}
                </div>
              )}
              {/* تاریخچه جستجو */}
              {searchHistory.length > 0 && (
                <>
                  <div className="text-xs text-gray-500 px-6 pt-2">تاریخچه جستجو</div>
                  {searchHistory.map((address, index) => (
                    <div
                      key={`history-${index}`}
                      className="hover:bg-slate-100 w-full py-3 text-gray-700 px-6 cursor-pointer flex items-center gap-2"
                      onClick={() => handleAddressSelect(address)}
                    >
                      <div>
                        <LuHistory className="w-6 h-6" />{' '}
                      </div>{' '}
                      {address.address}
                    </div>
                  ))}
                </>
              )}
              {addresses.length > 0 && (
                <div className="flex flex-col items-start gap-y-2 w-full h-full">
                  {addresses.map((address, index) => (
                    <div
                      onClick={() => handleAddressSelect(address)}
                      key={index}
                      className="hover:bg-slate-50 w-full py-3 text-gray-600 px-6 cursor-pointer"
                    >
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
