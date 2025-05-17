import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'

import { iranProvincesByPopulation, truncate } from '@/utils'
import debounce from 'lodash/debounce'
// import { useGetProductsQuery } from '@/services'
import { LuHistory } from 'react-icons/lu'

import { useAppDispatch, useAppSelector, useDebounce, useDisclosure } from '@/hooks'
import { FaArrowRight } from 'react-icons/fa'
import { Close, GpsIcon, LocationSmIcon, Search, SearchNormalIcon, SendIcon } from '@/icons'
import { EmptySearchList } from '@/components/emptyList'
// import { ProductDiscountTag, ProductPriceDisplay } from '@/components/product'
// import { DataStateDisplay } from '@/components/shared'
import { DataStateDisplay } from '../shared'
import Image from 'next/image'
import {
  useGetCategoriesQuery,
  useGetFeaturesQuery,
  useGetHousingQuery,
  useGetMetaDataQuery,
  useLazyFetchAddressesQuery,
  useLazyFetchHousingQuery,
} from '@/services'
import { Modal } from '@/components/ui'
import { IoMdArrowRoundForward } from 'react-icons/io'
import { IoArrowForward } from 'react-icons/io5'
import { setCenter, setSearchTriggered, setZoom } from '@/store'
import { Category, Feature, Housing } from '@/types'
import { useRouter } from 'next/router'
interface Props {}

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, '')
    .split(' ')
    .filter(Boolean)
}

export function parseSearchQuery(
  input: string,
  categories: Category[] = [],
  features: Feature[] = []
): {
  title: string
  categoryIds?: string[]
  featureIds?: string[]
} {
  let query = input.trim()
  const flatCategories = Array.isArray(categories) ? flattenCategories(categories) : []
  const queryWords = normalize(query)
  console.log(flatCategories, 'flatCategories')

  const matchedCategories: { cat: Category; score: number }[] = []

  for (const cat of flatCategories) {
    const catName = cat.name?.toLowerCase() || ''
    let score = 0

    for (const word of queryWords) {
      if (catName.startsWith(word)) {
        score += 3
      } else if (catName.includes(word)) {
        score += 1
      }
    }

    if (score > 0) {
      matchedCategories.push({ cat, score })
    }
  }

  const topMatches = matchedCategories.length > 0 ? matchedCategories.map((m) => m.cat.id) : undefined

  // ویژگی
  let featureIds: string[] = []

  for (const feat of features ?? []) {
    const allNames = [feat.name?.toLowerCase(), ...(Array.isArray(feat.value) ? feat.value.map((v) => v.value?.toLowerCase()) : [])]

    const match = allNames.find((name) => queryWords.some((word) => name?.includes(word)))

    if (match) {
      featureIds.push(feat.id)
      query = query.replace(match, '').trim()
    }
  }

  return {
    title: queryWords.join(' '),
    categoryIds: topMatches,
    featureIds,
  }
}

function flattenCategories(categories: Category[]): Category[] {
  const result: Category[] = []
  const stack = [...categories]

  while (stack.length > 0) {
    const current = stack.pop()
    if (current) {
      result.push(current)
      if (current.sub_categories?.length) {
        stack.push(...current.sub_categories)
      }
    }
  }

  return result
}

const SearchModal: React.FC<Props> = (props) => {
  // ? Assets
  const [query, setQuery] = useState('')
  const [addresses, setAddresses] = useState([])
  const [housingData, setHousingData] = useState<Housing[]>([])
  const { query: queries } = useRouter()
  const dispatch = useAppDispatch()
  const [search, setSearch] = useState('')
  const [searchHistory, setSearchHistory] = useState([])
  const searchRef = useRef<HTMLInputElement | null>(null)
  const [isShowSearchModal, searchModalHanlders] = useDisclosure()
  const [isShowSearchInput, setIsShowSearchInput] = useState(false)
  const debouncedSearch = useDebounce(search, 1200)
  const searchInputRef = useRef<HTMLDivElement>(null)
  const { address, userCityLocation, drawnPoints } = useAppSelector((state) => state.statesData)
  const latUser = userCityLocation[0]
  const lngUser = userCityLocation[1]
  // ? Search Products Query
  const { data, ...housingQueryProps } = useGetHousingQuery(
    {
      search,
    },
    { skip: !debouncedSearch }
  )

  const { data: metaData } = useGetCategoriesQuery({ ...queries })
  const { data: features } = useGetFeaturesQuery({ ...queries })
  const [triggerFetchAddresses] = useLazyFetchAddressesQuery() // https://map.ir/search/v2/autocomplete?text=${searchQuery}
  const [triggerFetchHousing] = useLazyFetchHousingQuery() // https://map.ir/search/v2/autocomplete?text=${searchQuery}
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
        setQuery('')
        searchRef.current?.focus()
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [isShowSearchModal])

  useEffect(() => {
    if (!query) {
      setHousingData([])
    }
  }, [query])

  // ? Handlers
  const handleAddressSelect = (selectedAddress) => {
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

  // const handleSearch = debounce(async (value: string) => {
  //   if (value) {
  //     try {
  //       const results = await triggerFetchAddresses(value).unwrap()
  //       if (results.value && results.value.length > 0) {
  //         const sortedResults = [...results.value].sort((a, b) => {
  //           const [lngA, latA] = a.geom.coordinates
  //           const [lngB, latB] = b.geom.coordinates
  //           return getDistance(latUser, lngUser, latA, lngA) - getDistance(latUser, lngUser, latB, lngB)
  //         })
  //         setAddresses(sortedResults)
  //       } else {
  //         setAddresses([])
  //       }
  //     } catch (error) {
  //       console.error('خطا در دریافت آدرس‌ها:', error)
  //       setAddresses([])
  //     }

  //   } else {
  //     setAddresses([])
  //   }
  // }, 500)

  const handleSearch = debounce(async (value: string) => {
    const parsed = parseSearchQuery(value, metaData.data, features.data)
    console.log(drawnPoints, 'drawnPoints')

    if (query) {
      try {
        const results = await triggerFetchHousing({
          title: parsed.title,
          category: parsed.categoryIds,
          feature: parsed.featureIds?.join(','),
          drawnPoints: JSON.stringify(drawnPoints),
          userCity: 1,
        }).unwrap()
        console.log(results, 'results')

        if (results.data?.length > 0) {
          setHousingData(results.data)
        } else {
          setHousingData([])
        }
      } catch (error) {
        console.error(error)
        setHousingData([])
      }
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

  const handleSearchClick = async () => {
    if (query) {
      try {
        const results = await triggerFetchAddresses(query).unwrap()

        if (results.value && results.value.length > 0) {
          const matchedAddress =
            results.value.find((addr) => addr.address.toLowerCase().includes(query.toLowerCase())) || results.value[0]

          // استخراج استان، شهرستان و شهر
          const province = matchedAddress.province || ''
          const county = matchedAddress.county || ''
          const city = matchedAddress.city || ''

          const simplified = {
            address: `استان ${province} ${county && `، شهرستان ${county}`} ${city && `، شهر ${city}`}`,
            query: query,
            geom: matchedAddress.geom,
          }

          // ذخیره در localStorage
          const storedHistory = localStorage.getItem('searchHistory')
          let history = storedHistory ? JSON.parse(storedHistory) : []

          const isExist = history.find((item) => item.address === simplified.address)
          if (!isExist) {
            history.unshift(simplified)
            if (history.length > 10) {
              history = history.slice(0, 10)
            }
            localStorage.setItem('searchHistory', JSON.stringify(history))
          }

          handleAddressSelect(simplified)
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
        className="flex gap-1.5 h-[48px] pr-3 w-full cursor-text rounded-lg z-0  bg-[#F2F2F3] border border-[#E3E3E7] items-center transition duration-700 ease-in-out"
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
                placeholder="جستجو..."
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
              {searchHistory.length > 0 && !query && (
                <>
                  <div className="text-xs text-gray-500 px-6 pt-2">تاریخچه جستجو</div>
                  {searchHistory.map((address, index) => (
                    <div
                      key={`history-${index}`}
                      className="hover:bg-slate-100 w-full py-3 text-gray-700 px-6 cursor-pointer flex items-center gap-3"
                      onClick={() => handleAddressSelect(address)}
                    >
                      <div>
                        <LuHistory className="w-6 h-6" />{' '}
                      </div>{' '}
                      {address.query}
                    </div>
                  ))}
                </>
              )}
              {housingData.length > 0 && (
                <div className="flex flex-col items-start gap-y-2 w-full h-full">
                  {housingData.map((housing, index) => (
                    <div
                      // onClick={() => handleAddressSelect(address)}
                      key={index}
                      className="flex items-center gap-3 hover:bg-slate-100 w-full py-2 text-gray-600 px-4 cursor-pointer"
                    >
                      <div className="bg-gray-50 flex-center rounded-full p-3">
                        <LocationSmIcon width="16px" height="16px" />
                      </div>
                      <div>{housing.title}</div>
                    </div>
                  ))}
                </div>
              )}
              {iranProvincesByPopulation.length > 0 && (
                <div className="flex flex-col items-start gap-y-2 w-full h-full">
                  {iranProvincesByPopulation
                    .sort((a, b) => b.population - a.population)
                    .map((item, index) => (
                      <div
                        onClick={() => handleAddressSelect(item)}
                        key={index}
                        className="flex items-center gap-3 hover:bg-slate-100 w-full py-2 text-gray-600 px-4 cursor-pointer"
                      >
                        <div className="bg-gray-50 flex-center rounded-full p-3">
                        <SendIcon width="16px" height="16px" />
                        </div>
                        <div>{item.province}</div>
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
