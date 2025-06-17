import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useForm, Controller, Resolver, useFieldArray, set } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  ArrowLeftIcon,
  CheckIcon,
  HouseIcon,
  InfoCircleIcon,
  RepeatIcon,
  CalendarIcon,
  CalendarTickIcon,
  CalendarSearchIcon,
  ProfileAddIcon,
  CameraIcon,
  CameraSmIcon,
  PictureSmIcon,
  VideoSmIcon,
  VideoIcon,
  Cube3DSmIcon,
  Cube3DIcon,
} from '@/icons'
import { Button, CustomCheckbox, DisplayError, Modal, TextField, TextFiledPrice, Skeleton } from '@/components/ui'
import * as yup from 'yup'
import dynamic from 'next/dynamic'
import { useAppDispatch, useDisclosure } from '@/hooks'
import { Disclosure } from '@headlessui/react'
import { useGetCategoriesQuery, useGetFeaturesQuery, useGetMetaDataQuery } from '@/services'
import { useRouter } from 'next/router'
import { AdFormValues, Category, CreateAds, Feature } from '@/types'
import { getToken, NEXT_PUBLIC_API_URL, validationSchema } from '@/utils'
import { IoMdClose } from 'react-icons/io'
import { setIsSuccess } from '@/store'
import { Control, FieldError } from 'react-hook-form'
import jalaali from 'jalaali-js'
import {
  useAddHousingMutation,
  useLazyGetFeaturesByCategoryQuery,
  useUploadMediaMutation,
  useGetAdvByIdQuery,
  useUpdateAdvMutation,
} from '@/services/productionBaseApi'
import { title } from 'process'
import axios from 'axios'
const toJalaali = (date: Date) => {
  const jalaaliDate = jalaali.toJalaali(date)
  return {
    day: jalaaliDate.jd,
    month: jalaaliDate.jm,
    year: jalaaliDate.jy,
  }
}
const days = Array.from({ length: 31 }, (_, i) => String(i + 1))
const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
const currentDateJalaali = toJalaali(new Date())
const currentYearJalaali = currentDateJalaali.year
const years = Array.from({ length: 100 }, (_, i) => String(currentYearJalaali - i))
const rentalTerms = [
  { id: 1, name: 'روزهای عادی (شنبه تا سه شنبه)', icon: CalendarIcon },
  { id: 2, name: 'آخر هفته (چهارشنبه تا جمعه)', icon: CalendarTickIcon },
  { id: 3, name: 'روزهای خاص (تعطیلات و مناسبت ها)', icon: CalendarSearchIcon },
  { id: 4, name: 'هزینه هر نفر اضافه (به ازای هر شب)', icon: ProfileAddIcon },
]
const getFileExtension = (url: string): string => {
  const cleanUrl = url.split('?')[0] // حذف query string
  const extension = cleanUrl.split('.').pop()
  return extension ? `.${extension}` : ''
}

const dealFieldsMap = {
  sale: ['price', 'discount'],
  rent: ['deposit', 'rent', 'convertible'],
  shortRent: ['capacity', 'extraPeople', 'rentalTerm'],
  constructionProjects: ['producerProfitPercentage', 'ownerProfitPercentage'],
}

const MapLocationPicker = dynamic(() => import('@/components/map/MapLocationPicker'), { ssr: false })
interface Props {
  roleUser: string
  adId?: string
  isEditMode?: boolean
}

// Static array for skeleton steps
const skeletonSteps = ['مشخصات', 'قیمت', 'ویژگی‌ها', 'عکس و ویدئو']

const AdvertisementRegistrationForm: React.FC<Props> = ({ roleUser, adId, isEditMode }) => {
  // ? Assets
  const { query, push } = useRouter()
  // ? States
  const [provinces, setProvinces] = useState([])
  const [cities, setCities] = useState([])
  const [selectedProvince, setSelectedProvince] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isShow, modalHandlers] = useDisclosure()
  const [isShowRentalTerms, modalRentalTermsHandlers] = useDisclosure()
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null)
  const [openIndex, setOpenIndex] = useState(null)
  const [isConvertible, setIsConvertible] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category>(null)
  const [selectedRentalTerm, setSelectedRentalTerm] = useState<{ id: number; name: string }>(null)
  const [isSelectCategorySkip, setIsSelectCategorySkip] = useState(true)
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValues, setSelectedValues] = useState({})
  const [openDropdowns, setOpenDropdowns] = useState({})
  const [featureData, setFeatureData] = useState<Feature[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const maxFiles = 8
  const [selectedVideos, setSelectedVideos] = useState<File[]>([])
  const maxVideos = 3
  const [playingIndex, setPlayingIndex] = useState(null)
  const [drawnPoints, setDrawnPoints] = useState([])
  const [selectedNames, setSelectedNames] = useState({})
  const [selectedParentCategory, setSelectedParentCategory] = useState<Category | null>(null)
  const [addressSuggestions, setAddressSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const addressInputRef = useRef(null)

  // Add loading states for media uploads
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const [loadingImages, setLoadingImages] = useState<{ [key: string]: boolean }>({})

  // Add isLoadingAddressSuggestions state
  const [isLoadingAddressSuggestions, setIsLoadingAddressSuggestions] = useState(false)

  // Add a state to track user category changes
  const [userChangedCategory, setUserChangedCategory] = useState(false)

  // Track if the title has been manually edited by the user
  const [isTitleManuallyEdited, setIsTitleManuallyEdited] = useState(false)

  const dispatch = useAppDispatch()
  const formRef = useRef<HTMLDivElement | null>(null)
  const previousDealType = useRef<string | null>(null)
  // ? Queries
  const { data: categoriesData, isFetching } = useGetMetaDataQuery({ ...query })
  const [triggerGetFeaturesByCategory, { data: features, isSuccess }] = useLazyGetFeaturesByCategoryQuery()
  const [
    addHousing,
    { isLoading: isLoadingCreate, isSuccess: isSuccessCreate, isError: isErrorCreate, error: errorCreate },
  ] = useAddHousingMutation()
  const [createUrl, { data: dataUpload, isSuccess: isSuccessUpload }] = useUploadMediaMutation()

  // Add update mutation
  const [updateHousing, { isLoading: isLoadingUpdate, isSuccess: isSuccessUpdate }] = useUpdateAdvMutation()

  // Fetch ad data if in edit mode
  const { data: adData, isLoading: isLoadingAd } = useGetAdvByIdQuery(adId || '', {
    skip: !isEditMode || !adId,
  })

  const getDealTypeFromCategory = (category: Category) => {
    if (!category) return null

    const categoryName = category.name.toLowerCase()

    if (categoryName.includes('مالک') || categoryName.includes('سازنده') || categoryName.includes('پیش فروش')) {
      return 'constructionProjects' // اجاره کوتاه مدت
    }

    if (categoryName.includes('اجاره کوتاه')) {
      return 'shortRent' // اجاره کوتاه مدت
    }

    if (categoryName.includes('اجاره')) {
      return 'rent' // اجاره بلندمدت
    }

    if (categoryName.includes('فروش')) {
      return 'sale' // فروش
    }

    return null // نامشخص
  }

  const dealType = getDealTypeFromCategory(selectedCategory)
  const {
    handleSubmit,
    control,
    register,
    trigger,
    setValue,
    getValues,
    watch,
    reset,
    resetField,
    formState: { errors, isValid },
  } = useForm<AdFormValues>({
    resolver: yupResolver(validationSchema({ features: featureData, dealType })) as unknown as Resolver<AdFormValues>,
    mode: 'onChange',
    context: { dealType },
    defaultValues: {
      features: featureData
        .filter((item) => item.type === 'bool')
        .reduce((acc, field) => {
          acc[field.id] = 'اولویت ندارد'
          return acc
        }, {}),
      convertible: false,
      mediaImages: [],
      mediaVideos: [],
      location: {
        lat: 0,
        lng: 0,
      },
      description: '',
    },
  })

  useEffect(() => {
    axios
      .get(`/api/geolocation/get_provinces`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
      })
      .then((res) => {
        setProvinces(res.data)
      })
      .catch((err) => {
        console.error('Error fetching provinces:', err)
      })
  }, [])

  useEffect(() => {
    if (selectedProvince) {
      axios
        .get(`/api/geolocation/get_cites_by_id/${selectedProvince.id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
        })
        .then((res) => {
          setCities(res.data)
        })
        .catch((err) => {
          console.error('Error fetching cities:', err)
          setCities([])
        })
    } else {
      setCities([])
    }
  }, [selectedProvince])

  const { fields, append, remove } = useFieldArray<AdFormValues>({
    control,
    name: 'mediaImages',
  })
  const {
    fields: videoFields,
    append: appendVideo,
    remove: removeVideo,
  } = useFieldArray<AdFormValues>({
    control,
    name: 'mediaVideos',
  })

  const handleAddUploadedImage = ({ url }: { url: string }) => append({ url })

  // Function to format address and remove redundant parts
  const formatAddress = (address: string): string => {
    if (!address) return ''

    // Remove postal codes (patterns like #####-#####)
    address = address.replace(/\d{5}-\d{5}/g, '')

    // Remove common parts that are not necessary
    const unnecessaryParts = [
      'ایران',
      'جمهوری اسلامی ایران',
      'Islamic Republic of Iran',
      'Iran',
      'استان',
      'شهرستان',
      'بخش مرکزی',
      'منطقه',
    ]

    // Split the address by commas
    let parts = address.split(',').map((part) => part.trim())

    // Filter out unnecessary parts
    parts = parts.filter((part) => {
      // Check if this part contains any of the unnecessary parts
      return !unnecessaryParts.some((unwanted) => part.includes(unwanted))
    })

    // Remove duplicates and empty strings
    let uniqueParts = [...new Set(parts)].filter((part) => part && part.length > 0)

    // Define major cities and provinces for identification
    const majorCities = ['تهران', 'مشهد', 'اصفهان', 'شیراز', 'تبریز', 'اهواز', 'کرج', 'قم', 'کرمانشاه', 'رشت', 'ارومیه']
    const provinces = [
      'تهران',
      'خراسان رضوی',
      'اصفهان',
      'فارس',
      'آذربایجان شرقی',
      'خوزستان',
      'البرز',
      'قم',
      'کرمانشاه',
      'گیلان',
      'آذربایجان غربی',
      'مازندران',
      'کرمان',
      'گلستان',
      'همدان',
      'سیستان و بلوچستان',
      'لرستان',
      'یزد',
      'هرمزگان',
      'اردبیل',
      'بوشهر',
      'زنجان',
      'قزوین',
      'مرکزی',
      'چهارمحال و بختیاری',
      'سمنان',
      'ایلام',
      'کهگیلویه و بویراحمد',
      'خراسان شمالی',
      'خراسان جنوبی',
    ]

    // Identify city and province parts
    const cityProvinceParts = []
    const otherParts = []

    uniqueParts.forEach((part) => {
      // Check if the part contains a city or province name
      const isCityOrProvince = [...majorCities, ...provinces].some((name) => part.includes(name) || part === name)

      if (isCityOrProvince) {
        cityProvinceParts.push(part)
      } else {
        otherParts.push(part)
      }
    })

    // For each identified city/province, ensure it appears only once (keep shortest)
    const uniqueCityProvinceParts = []

    cityProvinceParts.forEach((part) => {
      const shortestNamePart = uniqueCityProvinceParts.find((existingPart) => {
        // Check if they refer to the same city/province
        return [...majorCities, ...provinces].some((name) => existingPart.includes(name) && part.includes(name))
      })

      if (!shortestNamePart) {
        uniqueCityProvinceParts.push(part)
      } else if (part.length < shortestNamePart.length) {
        // Replace with shorter version
        const index = uniqueCityProvinceParts.indexOf(shortestNamePart)
        uniqueCityProvinceParts[index] = part
      }
    })

    // Reorder: city/province parts first, then other parts
    const reorderedParts = [...uniqueCityProvinceParts, ...otherParts]

    // Keep only maximum 4 parts for readability
    const relevantParts = reorderedParts.slice(0, Math.min(4, reorderedParts.length))

    // Join the parts back together with Persian comma
    return relevantParts.join('، ')
  }

  // Function to convert coordinates to address
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
        params: {
          format: 'json',
          lat,
          lon: lng,
          zoom: 18,
          addressdetails: 1,
          'accept-language': 'fa',
        },
        headers: {
          'User-Agent': 'Soodam-App2',
        },
      })

      if (response.data && response.data.display_name) {
        // Return formatted address
        return formatAddress(response.data.display_name)
      }
      return ''
    } catch (error) {
      console.error('Error in reverse geocoding:', error)
      return ''
    }
  }

  // Search for address suggestions
  const searchAddressSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setAddressSuggestions([])
      setShowSuggestions(false)
      setIsLoadingAddressSuggestions(false)
      return
    }

    setIsLoadingAddressSuggestions(true)

    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: query,
          format: 'json',
          limit: 5,
          'accept-language': 'fa',
        },
        headers: {
          'User-Agent': 'Soodam-App2',
        },
      })

      if (response.data && response.data.length > 0) {
        // Format the display_name field for each suggestion
        const formattedSuggestions = response.data.map((suggestion) => ({
          ...suggestion,
          display_name: formatAddress(suggestion.display_name),
          original_name: suggestion.display_name,
        }))

        setAddressSuggestions(formattedSuggestions)
        setShowSuggestions(true)
      } else {
        setAddressSuggestions([])
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error)
      setAddressSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsLoadingAddressSuggestions(false)
    }
  }

  // Debounce function to delay address search
  const debounce = (func, wait) => {
    let timeout

    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }

      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // Debounced version of search function
  const debouncedSearchAddress = debounce(searchAddressSuggestions, 500)

  // Handle address suggestion selection
  const handleSelectSuggestion = (suggestion: any) => {
    setValue('address', suggestion.display_name)
    setShowSuggestions(false)

    // Set map location based on selected suggestion
    if (suggestion.lat && suggestion.lon) {
      const newLocation: [number, number] = [parseFloat(suggestion.lat), parseFloat(suggestion.lon)]
      setSelectedLocation(newLocation)
      setValue('location.lat', newLocation[0])
      setValue('location.lng', newLocation[1])
    }
  }

  //? Re-Renders - اصلاح شده برای اطمینان از اینکه مقدار location در فرم به درستی تنظیم می‌شود
  useEffect(() => {
    if (selectedLocation) {
      console.log('selectedLocation updated in useEffect:', selectedLocation)

      // به‌روزرسانی مستقیم مقادیر به‌جای setValue('location.lat')
      setValue('location', {
        lat: selectedLocation[0],
        lng: selectedLocation[1],
      })

      // Get address from coordinates
      const getAddress = async () => {
        const address = await reverseGeocode(selectedLocation[0], selectedLocation[1])
        if (address) {
          setValue('address', address)
        }
      }

      getAddress()
    }
  }, [selectedLocation, setValue])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (addressInputRef.current && !addressInputRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (selectedLocation) {
      console.log(selectedLocation, 'selectedLocation')
    }
  }, [selectedLocation, setValue])

  // اصلاح useEffect برای تنظیم صحیح موقعیت مکانی در حالت ویرایش
  useEffect(() => {
    if (isEditMode && adData && !isLoadingAd) {
      console.log('Edit mode location effect')

      // تنظیم مستقیم موقعیت روی نقشه از اطلاعات آگهی
      if (adData.full_address?.latitude && adData.full_address?.longitude) {
        const newLocation: [number, number] = [adData.full_address.latitude, adData.full_address.longitude]

        // تنظیم مستقیم موقعیت نقشه
        setSelectedLocation(newLocation)

        // به روزرسانی مقادیر location در فرم
        setValue('location', {
          lat: adData.full_address.latitude,
          lng: adData.full_address.longitude,
        })

        console.log('Map location set to:', newLocation)
      }
    }
  }, [isEditMode, adData, isLoadingAd, setValue])

  // رفع مشکل فیلد عنوان
  useEffect(() => {
    if (isEditMode && adData?.title) {
      console.log('Setting title directly in form:', adData.title)
      setValue('title', adData.title || '')
      // Prevent auto-suggest from overwriting the existing title in edit mode
      setIsTitleManuallyEdited(true)
      setValue('description', adData.description || '')
    }
  }, [isEditMode, adData, setValue])

  useEffect(() => {
    const fetchFeatures = async (category: Category, parent: Category = null) => {
      if (!category) return

      // Only set current category ID, don't update the category itself
      setCurrentCategoryId(category.id)

      // Only fetch features if we don't already have them
      if (!features || features.features.length === 0) {
        console.log('Fetching features for category:', category.name)
        const params = {
          sub_category_id: parent !== null ? parent.id : category.id,
          sub_category_level_two_id: category.sub_sub_category === undefined ? category.id : 0,
        }
        triggerGetFeaturesByCategory(params)
      }
    }

    // Only proceed with setValue if this is first initialization, not a user selection
    if (selectedCategory && !userChangedCategory) {
      console.log('Setting form value for category (initialization):', selectedCategory.id)
      setValue('category', selectedCategory.id)
      fetchFeatures(selectedCategory, selectedParentCategory)
    } else if (selectedCategory && userChangedCategory) {
      // For user changes, just fetch features but don't update selectedCategory
      console.log('User selected category, fetching features without state update')
      fetchFeatures(selectedCategory, selectedParentCategory)
    }
  }, [selectedCategory, setValue, selectedParentCategory, triggerGetFeaturesByCategory, features, userChangedCategory])

  useEffect(() => {
    if (features) {
      setFeatureData(features.features)
    }
  }, [features])

  useEffect(() => {
    if (isConvertible) {
      setValue('convertible', isConvertible)
    }
  }, [isConvertible, setValue])

  // Function to find province and city based on coordinates
  // const findProvinceAndCity = async (lat: number, lng: number) => {
  //     // Fetch provinces if not already loaded
  //       const provincesResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/geolocation/get_provinces`, {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${getToken()}`,
  //         },
  //       })

  //     // Fetch cities for the selected province
  //     const citiesResponse = await axios.get(
  //       `${process.env.NEXT_PUBLIC_API_URL}/api/geolocation/get_cites_by_id/${selectedProvince.id}`,
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${getToken()}`,
  //         },
  //       }
  //     )

  // }
  const getProvinceAndCityFromCoordinates = async (lat: number, lng: number) => {
    try {
      // مرحله ۱: گرفتن نام استان و شهر از روی lat/lng با استفاده از reverse geocoding
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fa`
      const nominatimResponse = await axios.get(nominatimUrl)
      const address = nominatimResponse.data.address
      console.log(address, 'address')

      const cityName = address.city || address.town || address.village || address.county || ''
      const provinceName = address.province || address.state || ''

      console.log(`استان: "${provinceName}", شهر: "${cityName}"`)

      // دریافت لیست استان‌ها
      const provincesResponse = await axios.get(`/api/geolocation/get_provinces`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
      })

      // تلاش برای یافتن استان با چند روش مختلف
      let matchedProvince = provincesResponse.data.find(
        (p: any) =>
          p.name === provinceName ||
          `استان ${p.name}` === provinceName ||
          provinceName.includes(p.name) ||
          (p.name && provinceName && p.name.includes(provinceName))
      )

      // اگر استان پیدا نشد، اولین استان را انتخاب کنیم (تهران)
      if (!matchedProvince) {
        console.warn(`استان '${provinceName}' پیدا نشد، از استان پیش‌فرض استفاده می‌شود`)
        matchedProvince = provincesResponse.data[0] // معمولاً استان تهران
      }

      // مرحله ۳: گرفتن لیست شهرهای استان یافت‌شده
      const citiesResponse = await axios.get(`/api/geolocation/get_cites_by_id/${matchedProvince.id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
      })

      // تلاش برای یافتن شهر با چند روش مختلف
      let matchedCity = citiesResponse.data.find(
        (c: any) =>
          c.name === cityName ||
          cityName.includes(c.name) ||
          (c.name && c.name.includes(cityName)) ||
          (cityName.includes('شهر') && c.name === cityName.replace('شهر ', ''))
      )

      // اگر شهر پیدا نشد، اولین شهر استان را انتخاب کنیم
      if (!matchedCity && citiesResponse.data.length > 0) {
        console.warn(`شهر '${cityName}' در استان '${matchedProvince.name}' پیدا نشد، از اولین شهر استان استفاده می‌شود`)
        matchedCity = citiesResponse.data[0]
      }

      // اگر هیچ شهری در استان پیدا نشد، خطا بدهیم
      if (!matchedCity) {
        throw new Error(`هیچ شهری برای استان ${matchedProvince.name} یافت نشد`)
      }

      console.log(
        `استان '${matchedProvince.name}' (${matchedProvince.id}) و شهر '${matchedCity.name}' (${matchedCity.id}) انتخاب شدند`
      )

      return {
        province_id: matchedProvince.id,
        city_id: matchedCity.id,
      }
    } catch (error) {
      console.error('خطا در تبدیل مختصات به استان و شهر:', error)

      // در صورت بروز هر گونه خطا، مقادیر پیش‌فرض (تهران) را برگردان
      return {
        province_id: 8, // فرض می‌کنیم استان تهران با ID 8 است
        city_id: 100, // فرض می‌کنیم شهر تهران با ID 100 است
      }
    }
  }

  //? submit final step
  const onSubmit = async (data: AdFormValues) => {
    const valid = await trigger()
    if (!valid && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' })
    }
    console.log(data.features, 'F....data.features', featureData, 'featureData')

    const formattedFeatures = Object.keys(data.features)
      .map((key) => {
        const featureInfo = featureData.find((f) => f.id == key) // پیدا کردن اطلاعات ویژگی بر اساس id
        if (!featureInfo) return null
        console.log(featureData, '1. featureData')
        console.log(featureInfo, '2. featureInfo')

        let value: any = data.features[key]
        console.log(value, '3. data.features[key]', data.features[key])

        if (featureInfo.type === 'bool') {
          // مدیریت bool_convertible
          if (featureInfo.key === 'bool_convertible') {
            // اگر مقدار را به صورت boolean ذخیره کرده ایم
            if (typeof value === 'boolean') {
              value = value
            } else {
              value = value === 'دارد' || value === true || value === 'true'
            }
            console.log(`Converting convertible for API: ${value}`)
          } else {
            // مقدار‌دهی معمولی برای سایر فیلدهای bool
            value = value === 'دارد' || value === true || value === 'true'
          }
        } else if (featureInfo.type === 'choice') {
          if (Array.isArray(featureInfo.value)) {
            const selectedValue = featureInfo.value.find((v) => v.id === value.id)
            value = selectedValue ? { id: selectedValue.id, value: selectedValue.value } : null
          }
        }
        console.log(value, 'F. value,value')

        return {
          id: featureInfo.id,
          name: featureInfo.name,
          key: featureInfo.key,
          type: featureInfo.type,
          value:
            featureInfo.key === 'text_discount' ||
            featureInfo.key === 'text_mortgage_deposit' ||
            featureInfo.key === 'text_monthly_rent' ||
            featureInfo.key === 'text_selling_price' ||
            featureInfo.key === 'text_area' ||
            featureInfo.key.startsWith('text_')
              ? String(value || '0')
              : value,
        }
      })
      .filter(Boolean) // حذف null ها در صورت نبودن feature

    // Get province and city based on coordinates
    const locationInfo = await getProvinceAndCityFromCoordinates(data.location.lat, data.location.lng)

    // Extract price and discount information from features
    let priceAmount = 0
    let discountAmount = 0
    let depositAmount = 0
    let rentAmount = 0

    // Find price and discount features
    const priceFeature = formattedFeatures.find((f) => f.key === 'text_selling_price')
    const discountFeature = formattedFeatures.find((f) => f.key === 'text_discount')
    const depositFeature = formattedFeatures.find((f) => f.key === 'text_mortgage_deposit')
    const rentFeature = formattedFeatures.find((f) => f.key === 'text_monthly_rent')

    if (priceFeature && priceFeature.value) {
      // Convert formatted price string to number
      const priceStr = String(priceFeature.value)
      // Remove non-numeric characters and convert to number
      priceAmount = parseInt(priceStr.replace(/[^\d]/g, '')) || 0

      // اطمینان از اینکه مقدار در attributes به صورت string است
      priceFeature.value = String(priceFeature.value)
    }

    if (discountFeature && discountFeature.value) {
      // Convert formatted discount string to number
      const discountStr = String(discountFeature.value)
      // Remove non-numeric characters and convert to number
      discountAmount = parseInt(discountStr.replace(/[^\d]/g, '')) || 0

      // اطمینان از اینکه مقدار در attributes به صورت string است
      discountFeature.value = String(discountFeature.value)
    }

    if (depositFeature && depositFeature.value) {
      const depositStr = String(depositFeature.value)
      depositAmount = parseInt(depositStr.replace(/[^\d]/g, '')) || 0

      // اطمینان از اینکه مقدار در attributes به صورت string است
      depositFeature.value = String(depositFeature.value)
    }

    if (rentFeature && rentFeature.value) {
      const rentStr = String(rentFeature.value)
      rentAmount = parseInt(rentStr.replace(/[^\d]/g, '')) || 0

      // اطمینان از اینکه مقدار در attributes به صورت string است
      rentFeature.value = String(rentFeature.value)
    }

    const advData = {
      title: data.title,
      security_code_owner_building: data.nationalCode || '',
      phone_number_owner_building: data.phoneNumber,
      description: data.description,
      category_id: data.category,
      category_id_lvl_2: 0,
      full_address: {
        province_id: locationInfo.province_id,
        city_id: locationInfo.city_id,
        address: data.address,
        street: '',
        zip_code: data.postalCode,
        longitude: data.location.lng,
        latitude: data.location.lat,
      },
      price:
        depositFeature || rentFeature
          ? {
              deposit: depositAmount,
              rent: rentAmount,
              amount: priceAmount,
              currency: 'IRR',
              is_negotiable: true,
              discount_amount: discountAmount,
              original_amount: priceAmount,
              price_per_unit: 0,
              unit: '',
            }
          : {
              deposit: 0,
              rent: 0,
              amount: priceAmount,
              currency: 'IRR',
              is_negotiable: true,
              discount_amount: discountAmount,
              original_amount: priceAmount,
              price_per_unit: 0,
              unit: '',
            },
      attributes: formattedFeatures,
      images: data.mediaImages.map((item, index) => ({
        url: item.url,
        is_primary: index === 0, // First image is primary
        order: index,
        width: 1200, // Default width, can be updated if actual dimensions are available
        height: 800, // Default height, can be updated if actual dimensions are available
        alt_text: data.title || 'Property image', // Use title as alt text
      })),
      videos: data.mediaVideos.map((item, index) => ({
        url: item.url,
        thumbnail_url: '', // We don't have thumbnail URLs generated
        is_primary: index === 0, // First video is primary
        order: index,
        duration: 0, // Cannot determine duration easily
        title: data.title || 'Property video',
        description: data.description || 'Property video',
      })),
      expiry_date: '2023-12-31T23:59:59Z',
    }

    console.log('Submitting data:', isEditMode ? 'Update' : 'Create', advData)

    // If editing, update the ad; otherwise create a new one
    if (isEditMode && adId) {
      // Preserve any fields from the original ad that should be maintained
      const updatedData = {
        ...advData,
        // Maintain any important fields from the original ad that should not change
        status: adData?.status || 0,
      }

      // تبدیل نهایی تمام مقادیر متنی به string
      updatedData.attributes = updatedData.attributes.map((attr) => {
        if (attr.type === 'text' || attr.key.startsWith('text_')) {
          return {
            ...attr,
            value: String(attr.value || ''),
          }
        }
        return attr
      })

      console.log('Updating ad with ID:', adId, updatedData)

      // بررسی تبدیل صحیح مقادیر به string
      console.log(
        'Attributes values types:',
        updatedData.attributes.map((attr) => ({
          key: attr.key,
          value: attr.value,
          type: typeof attr.value,
        }))
      )

      updateHousing({ id: adId, data: updatedData })
    } else {
      // تبدیل نهایی تمام مقادیر متنی به string
      advData.attributes = advData.attributes.map((attr) => {
        if (attr.type === 'text' || attr.key.startsWith('text_')) {
          return {
            ...attr,
            value: String(attr.value || ''),
          }
        }
        return attr
      })

      console.log('Creating new ad:', advData)

      // بررسی تبدیل صحیح مقادیر به string
      console.log(
        'Attributes values types:',
        advData.attributes.map((attr) => ({
          key: attr.key,
          value: attr.value,
          type: typeof attr.value,
        }))
      )

      addHousing(advData)
    }
  }

  useEffect(() => {
    if (isSuccessCreate || isSuccessUpdate) {
      reset({
        title: '',
        description: '',
        phoneNumber: '',
        postalCode: '',
        address: '',
      })
      dispatch(setIsSuccess(true))
    }
  }, [isSuccessCreate, isSuccessUpdate])

  const validateCurrentStep = async () => {
    let fieldsToValidate: string[] = []

    switch (currentStep) {
      case 0:
        fieldsToValidate = ['phoneNumber', 'postalCode', 'address', 'category', 'location']
        break
      case 1:
        fieldsToValidate = [
          'price',
          'discount',
          // 'deposit',
          // 'rent',
          'capacity',
          'producerProfitPercentage',
          'ownerProfitPercentage',
        ]
        break
      case 2:
        fieldsToValidate = ['title', 'features', 'description']
        break
      case 3:
        fieldsToValidate = ['media']
        break
    }

    const result = await trigger(fieldsToValidate as any)
    return result
  }

  useEffect(() => {
    if (previousDealType.current && previousDealType.current !== dealType) {
      const fieldsToReset = dealFieldsMap[previousDealType.current as keyof typeof dealFieldsMap]
      fieldsToReset?.forEach((field) => resetField(field as keyof AdFormValues))
    }
    previousDealType.current = dealType
  }, [dealType, resetField])

  //? handlers
  const handleNext = async () => {
    const isStepValid = await validateCurrentStep()
    if (isStepValid && currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else if (formRef.current) {
    }
    formRef.current.scrollIntoView({ behavior: 'smooth' })
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleModalClose = (): void => {
    modalHandlers.close()
  }

  // اصلاح تابع handleLocationChange برای ذخیره صحیح مختصات در فرم
  const handleLocationChange = (location: [number, number]) => {
    console.log('New location selected:', location)

    // ذخیره مختصات در state
    setSelectedLocation(location)

    // ذخیره مختصات مستقیماً در فرم
    setValue('location', {
      lat: location[0],
      lng: location[1],
    })

    console.log('Location set in form:', { lat: location[0], lng: location[1] })

    setIsLoadingAddressSuggestions(true)

    // Get address from coordinates
    const getAddress = async () => {
      try {
        const address = await reverseGeocode(location[0], location[1])
        if (address) {
          setValue('address', address)
        }
      } catch (err) {
        console.error('Error getting address:', err)
      } finally {
        setIsLoadingAddressSuggestions(false)
      }
    }

    getAddress()
  }

  // Only keep one handleSelectCategory function
  const handleSelectCategory = (category: Category, parent?: Category) => {
    try {
      console.log('handleSelectCategory called with:', category.name, 'ID:', category.id)

      // Mark that user has changed the category manually - THIS IS CRITICAL
      setUserChangedCategory(true)

      // Set parent category if provided
      if (parent) {
        console.log('Setting parent category:', parent.name, 'ID:', parent.id)
        setSelectedParentCategory(parent)
      }

      // Always set the new category regardless of previous selection
      setSelectedCategory(category)
      setValue('category', category.id)

      // Reset features when changing category to avoid feature conflicts
      setFeatureData([])

      // Trigger feature fetching for the new category
      const categoryParams = {
        sub_category_id: parent ? parent.id : category.id,
        sub_category_level_two_id: category.sub_sub_category === undefined ? category.id : 0,
      }

      console.log('Fetching features with params:', categoryParams)
      triggerGetFeaturesByCategory(categoryParams)

      handleModalClose()

      console.log('Category selection completed successfully')
    } catch (error) {
      console.error('Error in handleSelectCategory:', error)
    }
  }

  const handleSelectRentalTerms = (item: { id: number; name: string }) => {
    if (selectedRentalTerm && selectedRentalTerm.id === item.id) {
      setSelectedRentalTerm(null)
      setValue('rentalTerms', null)
    } else {
      setSelectedRentalTerm(item)
      setValue('rentalTerms', item)
    }
    modalRentalTermsHandlers.close()
  }

  const toggleDropdown = (id: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList) return

    const files = Array.from(fileList)
    setIsUploadingMedia(true)
    createUrl(files)
  }

  useEffect(() => {
    if (isSuccessUpload && dataUpload) {
      // Check if it's a video or image based on file extension
      const videoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.mkv']

      dataUpload.forEach((item) => {
        const ext = getFileExtension(item.url).toLowerCase()

        if (videoExtensions.some((videoExt) => ext.includes(videoExt))) {
          // It's a video
          appendVideo({ url: item.url })
        } else {
          // It's an image - immediately set as not loading
          append({ url: item.url })

          // Force set loading state to false after a brief delay
          setTimeout(() => {
            setLoadingImages((prev) => ({ ...prev, [item.url]: false }))
          }, 500)
        }
      })

      setIsUploadingMedia(false)
    }
  }, [isSuccessUpload, dataUpload, append, appendVideo])

  useEffect(() => {
    if (isSuccess) {
      setSelectedParentCategory(null)
    }
  }, [isSuccess])

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList) return
    if (selectedVideos.length + fileList.length > maxVideos) return

    // Set uploading state
    setIsUploadingMedia(true)

    // Upload the videos through the API
    createUrl(Array.from(fileList))
  }

  // Add this function
  const handleVideoLoaded = (url: string) => {
    // Make sure video is not shown as loading anymore
    setLoadingImages((prev) => ({ ...prev, [url]: false }))
  }

  const handleDelete = (index: number, type = 'pic') => {
    if (type === 'pic') {
      remove(index) // Remove image from mediaImages field array
    } else {
      removeVideo(index) // Remove video from mediaVideos field array
    }
  }
  useEffect(() => {
    const getLocationInfo = async () => {
      if (selectedLocation && selectedLocation[0] && selectedLocation[1]) {
        try {
          const locationInfo = await getProvinceAndCityFromCoordinates(selectedLocation[0], selectedLocation[1])
          console.log(locationInfo, 'locationInfo')
        } catch (error) {
          console.error('خطا در دریافت اطلاعات موقعیت:', error)
          // خطا را نشان نمی‌دهیم، فقط لاگ می‌کنیم تا جریان کار متوقف نشود
        }
      }
    }
    getLocationInfo()
  }, [selectedLocation])

  const mapCategoryName = (name: string) => {
    if (name.includes('خرید')) {
      return name.replace('خرید', 'فروش')
    }
    return name
  }

  // Define step title based on category
  const getStepTitle = (): string => {
    if (!selectedCategory) return 'قیمت'

    if (
      selectedCategory.name?.includes('مالک') ||
      selectedCategory.name?.includes('سازنده') ||
      selectedCategory.name?.includes('پیش فروش')
    ) {
      return 'سود'
    } else if (selectedCategory.name?.includes('اجاره کوتاه')) {
      return 'شرایط اجاره'
    }
    return 'قیمت'
  }

  // Steps array for the actual form
  const steps = ['مشخصات', getStepTitle(), 'ویژگی‌ها', 'عکس و ویدئو']

  // Function to handle image loaded event
  const handleImageLoaded = (url: string) => {
    setLoadingImages((prev) => ({ ...prev, [url]: false }))
  }

  // Initialize form with ad data if in edit mode
  const [initialDataLoaded, setInitialDataLoaded] = useState(false)

  useEffect(() => {
    if (isEditMode && adData && !isLoadingAd) {
      console.log('Starting to load advertisement data for editing:', adData.id)

      // Mark this data as loaded to avoid reloading
      if (!initialDataLoaded) {
        setInitialDataLoaded(true)
      }

      // Set title and description
      setValue('title', adData.title || '')
      setValue('description', adData.description || '')

      // Set contact information if available
      if ('phone_number_owner_building' in adData) {
        const phoneNumber = adData.phone_number_owner_building as string
        setValue('phoneNumber', phoneNumber || '')
      }

      if ('security_code_owner_building' in adData) {
        const nationalCode = adData.security_code_owner_building as string
        setValue('nationalCode', nationalCode || '')
      }

      // Set address information
      if (adData.full_address) {
        setValue('postalCode', adData.full_address.zip_code || '')
        setValue('address', adData.full_address.address || '')

        // برای مختصات، مطمئن شویم که آنها وجود دارند
        if (adData.full_address.latitude && adData.full_address.longitude) {
          const newLocation: [number, number] = [adData.full_address.latitude, adData.full_address.longitude]

          // تنظیم مقادیر در فرم
          setValue('location', {
            lat: adData.full_address.latitude,
            lng: adData.full_address.longitude,
          })

          // تنظیم selectedLocation برای نقشه
          setSelectedLocation(newLocation)

          console.log('Setting map location to:', newLocation)
        }
      }

      // Set province and city
      if (adData.full_address.province && adData.full_address.city) {
        console.log('Setting province:', adData.full_address.province)
        // Find province in the provinces array
        const provinceObj = adData.full_address.province as { id: number; name: string }
        const province = provinces.find((p) => p.id === provinceObj.id)
        if (province) {
          setSelectedProvince(province)
        }
      }

      // Set category ONLY if user hasn't changed it AND it's the first load
      if (adData.category && !userChangedCategory) {
        console.log('Setting initial category from adData (no user changes detected):', adData.category)

        // First check if categoriesData is loaded
        if (categoriesData && categoriesData.main_categories) {
          // Try to find the category using the deep search helper
          const categoryResult = findCategoryDeep(categoriesData.main_categories, adData.category.id)

          if (categoryResult) {
            const { category, parent } = categoryResult
            console.log('Found category using deep search:', category.name, 'ID:', category.id)
            console.log('Parent category:', parent.name, 'ID:', parent.id)

            // Set the category and parent
            setSelectedCategory(category)
            setSelectedParentCategory(parent)
            setValue('category', category.id)

            // Trigger feature fetching for the initial category
            setTimeout(() => {
              console.log('Triggering initial feature fetching')
              const params = {
                sub_category_id: parent.id,
                sub_category_level_two_id: category.id,
              }
              triggerGetFeaturesByCategory(params)
            }, 500) // Short delay to ensure state is updated
          } else {
            // Fall back to original method
            console.log('Deep search failed, trying traditional lookup')
            const mainCategory = categoriesData.main_categories.find((c) => c.id === adData.category.main_category?.id)

            if (mainCategory && mainCategory.sub_categories) {
              const category = mainCategory.sub_categories.find((sc) => sc.id === adData.category.id)

              if (category) {
                console.log('Found matching category:', category.name, 'ID:', category.id)
                setSelectedCategory(category)
                setSelectedParentCategory(mainCategory)
                setValue('category', category.id)

                triggerGetFeaturesByCategory({
                  sub_category_id: mainCategory.id,
                  sub_category_level_two_id: category.id,
                })
              } else {
                console.warn('Could not find matching category in subcategories')
              }
            } else {
              console.warn('Main category has no subcategories')
            }
          }
        } else {
          console.warn('Categories data not loaded yet')
        }
      } else if (adData.category && userChangedCategory) {
        console.log(
          'Skipping category initialization because user already changed it to:',
          selectedCategory ? `${selectedCategory.name} (${selectedCategory.id})` : 'UNKNOWN'
        )
      } else {
        console.warn('No category in ad data')
      }

      // Set media
      if (adData.images && adData.images.length > 0) {
        const formattedImages = adData.images.map((img) => ({ url: img.url }))
        setValue('mediaImages', formattedImages)
      }

      // Set videos if available
      if ('videos' in adData && Array.isArray(adData.videos) && adData.videos.length > 0) {
        const formattedVideos = (adData.videos as any[]).map((vid) => ({ url: vid.url }))
        setValue('mediaVideos', formattedVideos)
      }

      // Handle attributes after features are loaded
      if (featureData.length > 0 && adData.attributes && adData.attributes.length > 0) {
        console.log('Setting attributes:', adData.attributes)

        adData.attributes.forEach((attr) => {
          const feature = featureData.find((f) => f.id === attr.id)
          if (feature) {
            console.log(`Setting feature ${feature.name} (${attr.id}) with value:`, attr.value)

            if (attr.type === 'bool') {
              // مدیریت مقادیر boolean
              const boolValue = attr.value === true ? 'دارد' : 'ندارد'

              // مدیریت ویژه برای قابل تبدیل بودن
              if (feature.key === 'bool_convertible') {
                const isConverted = attr.value === true
                console.log(`Setting convertible from API: ${isConverted}`)
                setIsConvertible(isConverted)
                setValue('convertible', isConverted)
                setValue(`features.${attr.id}`, isConverted) // ذخیره به عنوان boolean نه string
              }

              // مدیریت checkbox ها - bool_renovated و bool_document
              else if (feature.key === 'bool_renovated' || feature.key === 'bool_document') {
                setValue(`features.${attr.id}`, attr.value === true ? 'true' : 'false')
              }
              // سایر فیلدهای boolean
              else {
                setValue(`features.${attr.id}`, boolValue)
              }
            } else if (attr.type === 'choice' && attr.value) {
              // مدیریت choice items با مقداردهی dropdown
              // ذخیره در فرم
              setValue(`features.${attr.id}`, attr.value)

              // تنظیم مقادیر برای نمایش در dropdownها
              if (typeof attr.value === 'object' && attr.value !== null) {
                // بررسی کردن فرمت مناسب برای dropdown و اضافه کردن type assertion
                const choiceValue = attr.value as { id: string; value: string }
                if ('id' in attr.value && 'value' in attr.value) {
                  setSelectedValues((prev) => ({ ...prev, [attr.id]: choiceValue.id }))
                  setSelectedNames((prev) => ({ ...prev, [attr.id]: choiceValue.value }))
                }
              }
            } else if (attr.type === 'text' || attr.type === 'number' || attr.type === 'string') {
              setValue(`features.${attr.id}`, String(attr.value || ''))
            }
          }
        })
      }

      // Set price information
      if (adData.price) {
        // For deposit and rent (رهن و اجاره)
        if (adData.price.deposit) {
          const depositFeature = featureData.find((f) => f.key === 'text_mortgage_deposit')
          if (depositFeature) {
            setValue(`features.${depositFeature.id}`, String(adData.price.deposit))
          }
        }

        if (adData.price.rent) {
          const rentFeature = featureData.find((f) => f.key === 'text_monthly_rent')
          if (rentFeature) {
            setValue(`features.${rentFeature.id}`, String(adData.price.rent))
          }
        }

        // For sale price (قیمت فروش)
        if (adData.price.amount) {
          const priceFeature = featureData.find((f) => f.key === 'text_selling_price')
          if (priceFeature) {
            setValue(`features.${priceFeature.id}`, String(adData.price.amount))
          }
        }

        // For discount (تخفیف)
        if (adData.price.discount_amount) {
          const discountFeature = featureData.find((f) => f.key === 'text_discount')
          if (discountFeature) {
            setValue(`features.${discountFeature.id}`, String(adData.price.discount_amount))
          }
        }
      }

      console.log('Finished setting ad data for editing')
    }
  }, [
    isEditMode,
    adData,
    isLoadingAd,
    featureData,
    setValue,
    categoriesData,
    provinces,
    triggerGetFeaturesByCategory,
    userChangedCategory,
    selectedCategory,
  ])

  // اضافه کردن useEffect برای دیباگ مقادیر در زمان ویرایش
  useEffect(() => {
    if (isEditMode && Object.keys(selectedValues).length > 0) {
      console.log('Selected dropdown values:', selectedValues)
      console.log('Selected dropdown names:', selectedNames)
    }
  }, [isEditMode, selectedValues, selectedNames])

  console.log(adData, 'adData')

  // Add tracking effect for category changes
  useEffect(() => {
    if (selectedCategory) {
      console.log('TRACKING: Category changed to:', selectedCategory.name, 'ID:', selectedCategory.id)
    }
  }, [selectedCategory])

  // Reset userChangedCategory when ad data changes
  useEffect(() => {
    if (adData && isEditMode) {
      console.log('Ad data changed, resetting userChangedCategory flag')
      setUserChangedCategory(false)
    }
  }, [adData, isEditMode])

  // Debug category data
  useEffect(() => {
    if (isEditMode && adData?.category && categoriesData?.main_categories) {
      const mainCategory = categoriesData.main_categories.find((c) => c.id === adData.category.main_category?.id)

      console.log('DEBUG CATEGORY INFO:')
      console.log('- Ad Category ID:', adData.category.id)
      console.log('- Ad Main Category ID:', adData.category.main_category?.id)
      console.log('- Found Main Category:', mainCategory ? `${mainCategory.name} (${mainCategory.id})` : 'NOT FOUND')

      if (mainCategory?.sub_categories) {
        const subCategory = mainCategory.sub_categories.find((sc) => sc.id === adData.category.id)
        console.log('- Found Sub Category:', subCategory ? `${subCategory.name} (${subCategory.id})` : 'NOT FOUND')
      }

      console.log(
        '- Current Selected Category:',
        selectedCategory ? `${selectedCategory.name} (${selectedCategory.id})` : 'NONE'
      )
    }
  }, [isEditMode, adData, categoriesData, selectedCategory])

  // Helper function to find category deep in the hierarchy
  const findCategoryDeep = (categories: any[], targetId: string | number): { category: any; parent: any } | null => {
    if (!categories || !targetId) return null

    // First level search - direct subcategories
    for (const mainCat of categories) {
      if (mainCat.sub_categories) {
        for (const subCat of mainCat.sub_categories) {
          if (subCat.id === targetId) {
            return { category: subCat, parent: mainCat }
          }

          // Second level search - if there are sub_sub_categories
          if (subCat.sub_sub_category) {
            for (const subSubCat of subCat.sub_sub_category) {
              if (subSubCat.id === targetId) {
                return { category: subSubCat, parent: subCat }
              }
            }
          }
        }
      }
    }

    return null
  }

  // Add debug message for userChangedCategory
  useEffect(() => {
    console.log('User category selection state:', userChangedCategory ? 'MANUALLY CHANGED' : 'DEFAULT/INITIAL')
  }, [userChangedCategory])

  // Extract neighborhood from address
  const extractNeighborhood = (fullAddress: string): string => {
    if (!fullAddress) return ''

    // Split address by delimiter and take the last meaningful part as neighborhood
    const parts = fullAddress.split('، ')

    // If we have multiple parts, take the most specific part (often the last meaningful one)
    if (parts.length > 1) {
      // Skip parts that are likely postal codes or very short/generic
      for (let i = parts.length - 1; i >= 0; i--) {
        const part = parts[i].trim()
        // Skip postal codes or very short parts
        if (part.length > 3 && !/^\d+$/.test(part)) {
          return part
        }
      }
    }

    // If no suitable part found, return the original address or its last part
    return parts.length > 0 ? parts[parts.length - 1] : fullAddress
  }

  if (isSuccessCreate || isSuccessUpdate) {
  }

  if (isFetching)
    return (
      <div className="mx-auto py-5 border rounded-[16px] bg-white">
        {/* Skeleton for Progress Steps */}
        <div className="flex justify-between items-center mb-6 px-[33px]">
          <Skeleton count={1}>
            <Skeleton.Items className="flex justify-between items-center w-full">
              {skeletonSteps.map((_, index) => (
                <React.Fragment key={index}>
                  <Skeleton.Item height="h-5" width="w-5" animated="background" className="rounded-full" />
                  {index < skeletonSteps.length - 1 && (
                    <Skeleton.Item height="h-2" width="w-full mx-4" animated="background" />
                  )}
                </React.Fragment>
              ))}
            </Skeleton.Items>
          </Skeleton>
        </div>

        {/* Rest of skeleton component remains the same */}
        <div className="space-y-4 px-4 pt-6">
          <Skeleton count={1}>
            <Skeleton.Items className="space-y-4 w-full">
              {/* 5 form fields with labels */}
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="w-full">
                  <Skeleton.Item height="h-5" width="w-1/4" animated="background" className="mb-2" />
                  <Skeleton.Item height="h-10" width="w-full" animated="background" />
                </div>
              ))}

              {/* Map field */}
              <div>
                <Skeleton.Item height="h-5" width="w-1/3" animated="background" className="mb-2" />
                <Skeleton.Item height="h-52" width="w-full" animated="background" />
              </div>
            </Skeleton.Items>
          </Skeleton>

          {/* Navigation Buttons */}
          <div className="w-full mt-6 flex justify-between">
            <Skeleton.Item height="h-12" width="w-32" animated="background" />
            <Skeleton.Item height="h-12" width="w-32" animated="background" />
          </div>
        </div>
      </div>
    )

  if (features) {
    console.log(features, 'features')
  }

  if (errors) {
    console.log(errors, 'errors--errors')
  }
  return (
    <div ref={formRef} className="relative mb-44">
      <Modal isShow={isShow} onClose={handleModalClose} effect="buttom-to-fit">
        <Modal.Content
          onClose={handleModalClose}
          className="flex h-full flex-col gap-y-5 bg-white p-4 rounded-2xl rounded-b-none"
        >
          <Modal.Header onClose={handleModalClose}>
            <div className="pt-4">دسته بندی {selectedCategory && `( ${mapCategoryName(selectedCategory.name)})`}</div>
          </Modal.Header>
          <Modal.Body>
            <div className=" mt-2 w-full z-10">
              <div className="flex flex-col gap-y-3.5 px-4 py-2">
                {categoriesData?.main_categories.map((item, index) => (
                  <Disclosure key={item.id}>
                    {() => (
                      <>
                        <Disclosure.Button
                          onClick={() => setOpenIndex((prev) => (prev === index ? null : index))}
                          className="!mt-0 flex w-full items-center justify-between py-2"
                        >
                          <div className="flex gap-x-1.5 items-center">
                            {item.image && <img className="w-[24px] h-[24px]" src={`/${item.image}`} alt={item.name} />}
                            <span className="pl-3 whitespace-nowrap font-normal text-[14px] tracking-wide text-[#5A5A5A]">
                              {item.name}
                            </span>
                          </div>
                          <ArrowLeftIcon
                            className={`w-5 h-5 ${openIndex === index ? '' : 'rotate-90 text-gray-700'} transition-all`}
                          />
                        </Disclosure.Button>

                        {item.sub_categories?.length > 0 && openIndex === index && (
                          <Disclosure.Panel className="-mt-2">
                            {item.sub_categories.map((subItem) => (
                              <div key={subItem.id}>
                                {subItem.sub_sub_category?.length > 0 ? (
                                  <Disclosure>
                                    {({ open: subOpen }) => (
                                      <>
                                        <Disclosure.Button
                                          className={`cursor-pointer mb-2 py-2 flex w-full items-center justify-between pr-[32px] ${
                                            selectedCategory?.id === subItem.id
                                              ? 'bg-[#FFE2E5]  font-medium rounded-lg'
                                              : ''
                                          }`}
                                        >
                                          <span
                                            className={`text-[14px] ${
                                              selectedCategory?.id === subItem.id
                                                ? ' font-medium'
                                                : 'text-[#5A5A5A] font-light'
                                            }`}
                                          >
                                            {subItem.name}
                                          </span>
                                          <ArrowLeftIcon
                                            className={`w-5 h-5 ml-4 ${
                                              subOpen ? '' : 'rotate-90 text-gray-700'
                                            } transition-all`}
                                          />
                                        </Disclosure.Button>

                                        <Disclosure.Panel className="-mt-2">
                                          {subItem.sub_sub_category.map((childItem) => (
                                            <div
                                              key={childItem.id}
                                              onClick={() => handleSelectCategory(childItem, subItem)}
                                              className={`cursor-pointer mb-2 py-2 flex w-full items-center justify-between pr-[32px] ${
                                                selectedCategory?.id === childItem.id
                                                  ? 'bg-[#FFE2E5]  font-medium rounded-lg'
                                                  : ''
                                              }`}
                                            >
                                              <span
                                                className={`text-[14px] ${
                                                  selectedCategory?.id === childItem.id
                                                    ? ' font-medium'
                                                    : 'text-[#5A5A5A] font-light'
                                                }`}
                                              >
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
                                      selectedCategory?.id === subItem.id ? 'bg-[#FFE2E5]  font-medium rounded-lg' : ''
                                    }`}
                                  >
                                    <span
                                      className={`text-[14px] ${
                                        selectedCategory?.id === subItem.id
                                          ? ' font-medium'
                                          : 'text-[#5A5A5A] font-light'
                                      }`}
                                    >
                                      {subItem.name}
                                    </span>
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
          </Modal.Body>
        </Modal.Content>
      </Modal>

      <Modal isShow={isShowRentalTerms} onClose={modalRentalTermsHandlers.close} effect="buttom-to-fit">
        <Modal.Content
          onClose={modalRentalTermsHandlers.close}
          className="flex h-full flex-col gap-y-5 bg-white p-4 rounded-2xl rounded-b-none"
        >
          <Modal.Header onClose={modalRentalTermsHandlers.close}>
            <div className="pt-4">اجاره</div>
          </Modal.Header>
          <Modal.Body>
            <div className=" mt-2 w-full z-10">
              <div className="flex flex-col gap-y-3.5 px-1 py-2">
                {rentalTerms.map((item, index) => (
                  <Disclosure key={index}>
                    {() => (
                      <>
                        <Disclosure.Button
                          onClick={() => handleSelectRentalTerms({ id: item.id, name: item.name })}
                          className="!mt-0 flex w-full items-center justify-between py-2"
                        >
                          <div className="flex gap-x-2 items-center">
                            <item.icon />
                            <span className="pl-3 whitespace-nowrap font-normal text-[14px] tracking-wide text-[#5A5A5A]">
                              {item.name}
                            </span>
                          </div>
                          <ArrowLeftIcon className={`w-5 h-5 rotate-90 transition-all`} />
                        </Disclosure.Button>
                      </>
                    )}
                  </Disclosure>
                ))}
              </div>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <div className="mx-auto py-5 border rounded-[16px] bg-white">
        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-6 px-[33px]">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center relative">
                <div
                  className={`w-[20px] h-[20px] farsi-digits font-bold text-sm flex items-center justify-center rounded-full ${
                    index <= currentStep ? 'bg-[#D52133] text-white' : 'bg-[#E3E3E7] text-[#7A7A7A]'
                  }`}
                >
                  {index === currentStep ? <img src="/static/Eliiose2.png" alt="Eliiose2" /> : index + 1}
                </div>
                <div
                  className={`mt-2 text-[11px] flex gap-0.5 text-[#1A1E25] -bottom-[22px] absolute whitespace-nowrap ${
                    index === currentStep ? 'font-bold text-[#D52133]' : ''
                  }`}
                >
                  {index < currentStep && <CheckIcon width="12px" height="13px" />}
                  {step}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-[2px] ${index < currentStep ? 'bg-[#D52133]' : 'bg-[#E3E3E7]'}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {currentStep !== 0 && (
          <div className="h-[54px] bg-[#FFE2E5] border border-[#D52133] rounded-[8px] flex-center mx-4 mt-12 ">
            <HouseIcon width="24px" height="24px" />
            <div className="text-sm font-normal text-[#D52133] whitespace-nowrap mr-1">دسته بندی:</div>
            <div className="font-medium text-base text-[#D52133] pr-1.5 ">{mapCategoryName(selectedCategory.name)}</div>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-4 pt-6">
          {/* Step 1: مشخصات */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    adForm
                    label="شماره تماس مالک"
                    type="number"
                    {...field}
                    control={control}
                    errors={errors.phoneNumber}
                    placeholder="شماره تماس مالک (اجباری)"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                )}
              />

              <Controller
                name="nationalCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    adForm
                    label="کد ملی مالک"
                    type="number"
                    {...field}
                    control={control}
                    errors={errors.nationalCode}
                    placeholder="کد ملی (اختیاری)"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                )}
              />

              <Controller
                name="postalCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    adForm
                    type="number"
                    label="کد پستی"
                    {...field}
                    control={control}
                    errors={errors.postalCode}
                    placeholder="کد پستی (اجباری)"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                )}
              />
              <MapLocationPicker
                label={'لوکیشن دقیق ملک'}
                selectedLocation={selectedLocation}
                handleLocationChange={handleLocationChange}
                drawnPoints={drawnPoints}
                setDrawnPoints={setDrawnPoints}
                ads
              />

              <div className="space-y-31 relative">
                <label
                  className="block text-sm font-normal mb-2 text-gray-700 md:min-w-max lg:text-sm"
                  htmlFor="address"
                >
                  آدرس نوشتاری دقیق ملک را مشخص کنید
                </label>
                {isLoadingAddressSuggestions ? (
                  <div className="h-24 border border-[#E3E3E7] rounded-[8px] bg-white p-2">
                    <Skeleton count={1}>
                      <Skeleton.Items className="space-y-2 w-full">
                        <Skeleton.Item height="h-4" width="w-3/4" animated="background" />
                        <Skeleton.Item height="h-4" width="w-full" animated="background" />
                        <Skeleton.Item height="h-4" width="w-1/2" animated="background" />
                      </Skeleton.Items>
                    </Skeleton>
                  </div>
                ) : (
                  <textarea
                    ref={addressInputRef}
                    placeholder="آدرس کامل را وارد کنید"
                    className="input h-24 resize-none border-[#E3E3E7] rounded-[8px] bg-white placeholder:text-xs pr-2"
                    id="address"
                    {...register('address')}
                    onChange={(e) => {
                      register('address').onChange(e)
                      debouncedSearchAddress(e.target.value)
                    }}
                  />
                )}
                {showSuggestions && addressSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
                    {addressSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-right text-sm"
                        onClick={() => handleSelectSuggestion(suggestion)}
                      >
                        {suggestion.display_name}
                      </div>
                    ))}
                  </div>
                )}
                <div className="w-fit" dir={'ltr'}>
                  {' '}
                  <DisplayError adForm errors={errors.address} />
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-normal mb-2  text-gray-700 md:min-w-max lg:text-sm`}
                  htmlFor="category"
                >
                  دسته بندی
                </label>
                <div
                  onClick={modalHandlers.open}
                  className={`w-full cursor-pointer border-[1.5px] ${
                    selectedCategory ? '' : 'bg-[#FCFCFC]'
                  } rounded-[8px] px-4 h-[40px] text-right ${
                    selectedCategory ? '' : 'text-[#5A5A5A]'
                  } flex justify-between items-center`}
                >
                  <div className="flex flex-col">
                    <span className={`text-[14px] ${selectedCategory ? 'font-medium' : ''}`}>
                      {selectedCategory ? mapCategoryName(selectedCategory.name) : 'انتخاب'}
                    </span>
                  </div>
                  <ArrowLeftIcon
                    className={`w-5 h-5 ${selectedCategory ? '' : 'text-[#9D9D9D]'} transition-transform ${
                      isShow ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                <div className="w-fit" dir={'ltr'}>
                  {' '}
                  <DisplayError adForm errors={errors.category} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: قیمت */}
          {currentStep === 1 &&
            (dealType === 'sale' ? (
              <div className="space-y-4">
                {features &&
                  features.features.map((field) => {
                    switch (field.key) {
                      case 'text_selling_price':
                      case 'text_discount':
                        return (
                          <Controller
                            key={field.id}
                            name={`features.${field.id}`}
                            control={control}
                            render={({ field: controllerField }) => (
                              <TextFiledPrice
                                adForm
                                label={field.name}
                                type="text"
                                name={`features.${field.id}`}
                                value={
                                  typeof controllerField.value === 'string' || typeof controllerField.value === 'number'
                                    ? controllerField.value
                                    : ''
                                }
                                onChange={controllerField.onChange}
                                onBlur={controllerField.onBlur}
                                errors={errors.features?.[field.id]}
                                placeholder={`مثال : ${
                                  field.key === 'text_selling_price'
                                    ? 'مثال : 100 میلیون تومان'
                                    : 'مثال : 10 میلیون(اختیاری)'
                                }`}
                                formatPrice={true}
                                inputMode="numeric"
                                pattern="[0-9]*"
                              />
                            )}
                          />
                        )
                      default:
                        return null
                    }
                  })}
              </div>
            ) : dealType === 'rent' ? (
              <div className="space-y-4">
                {features &&
                  features.features.map((field) => {
                    switch (field.key) {
                      case 'text_mortgage_deposit':
                      case 'text_monthly_rent':
                        return (
                          <Controller
                            key={field.id}
                            name={`features.${field.id}`}
                            control={control}
                            render={({ field: controllerField }) => (
                              <TextFiledPrice
                                adForm
                                label={field.name}
                                type="text"
                                name={`features.${field.id}`}
                                value={
                                  typeof controllerField.value === 'string' || typeof controllerField.value === 'number'
                                    ? controllerField.value
                                    : ''
                                }
                                onChange={controllerField.onChange}
                                onBlur={controllerField.onBlur}
                                errors={errors.features?.[field.id]}
                                placeholder={`مثال : ${
                                  field.key === 'text_mortgage_deposit' ? '100 میلیون تومان' : '10 میلیون تومان'
                                }`}
                                formatPrice={true}
                                inputMode="numeric"
                                pattern="[0-9]*"
                              />
                            )}
                          />
                        )

                      case 'bool_convertible':
                        return (
                          <div key={field.id} className="flex flex-row-reverse items-center gap-2 w-full pt-2">
                            <CustomCheckbox
                              name={`features.${field.id}`}
                              checked={isConvertible}
                              onChange={() => {
                                const newValue = !isConvertible
                                setIsConvertible(newValue)
                                setValue(`features.${field.id}`, newValue) // نگهداری به عنوان boolean
                                setValue('convertible', newValue) // تنظیم مستقیم فیلد convertible
                                console.log(`Checkbox bool_convertible set to: ${newValue}`)
                              }}
                              label=""
                              customStyle="bg"
                            />
                            <label
                              htmlFor={`features.${field.id}`}
                              className="flex items-center gap-2 w-full font-normal text-sm"
                            >
                              <RepeatIcon width="24px" height="24px" />
                              {field.name}
                            </label>
                          </div>
                        )

                      default:
                        return null
                    }
                  })}

                <div className="flex items-center gap-2">
                  <InfoCircleIcon width="16px" height="16px" />
                  <span className="text-[#5A5A5A] font-normal text-xs">
                    به ازای هر یک میلیون تومان ودیعه 30 هزار تومان اجاره عرف بازار می‌باشد.
                  </span>
                </div>
              </div>
            ) : dealType === 'shortRent' ? (
              <div className="space-y-4">
                <Controller
                  name="capacity"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      adForm
                      compacted
                      label="ظرفیت"
                      type="number"
                      {...field}
                      control={control}
                      errors={errors.capacity}
                      placeholder="مثال : 10 نفر"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  )}
                />

                <Controller
                  name="extraPeople"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      adForm
                      compacted
                      label="نفرات اضافه"
                      type="number"
                      {...field}
                      control={control}
                      errors={errors.extraPeople}
                      placeholder="مثال : 2 نفر"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  )}
                />

                <div>
                  <label
                    className={`block text-sm font-normal mb-2  text-gray-700 md:min-w-max lg:text-sm`}
                    htmlFor="category"
                  >
                    اجاره
                  </label>
                  <div
                    onClick={modalRentalTermsHandlers.open}
                    className="w-full cursor-pointer border-[1.5px] bg-[#FCFCFC] rounded-[8px] px-4 h-[40px] text-right text-[#5A5A5A] flex justify-between items-center"
                  >
                    <span className="text-[14px]">
                      {!isShowRentalTerms}
                      {selectedRentalTerm ? selectedRentalTerm.name : 'انتخاب'}
                    </span>
                    <ArrowLeftIcon
                      className={`w-5 h-5 text-[#9D9D9D] transition-transform ${isShowRentalTerms ? 'rotate-180' : ''}`}
                    />
                  </div>
                </div>
              </div>
            ) : dealType === 'constructionProjects' ? (
              <div className="space-y-4">
                {/* <Controller
                  name="producerProfitPercentage"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      adForm
                      label="درصد سود سازنده"
                      type="number"
                      {...field}
                      control={control}
                      errors={errors.producerProfitPercentage}
                      placeholder="مثال: 50 درصد"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  )}
                />

                <Controller
                  name="ownerProfitPercentage"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      adForm
                      label="درصد سود مالک"
                      type="number"
                      {...field}
                      control={control}
                      errors={errors.ownerProfitPercentage}
                      placeholder="مثال: 50 درصد"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  )}
                /> */}

                {features &&
                  features.features.map((field) => {
                    switch (field.key) {
                      case 'text_owner_profit_percentage':
                      case 'text_producer_profit_percentage':
                        return (
                          <Controller
                            key={field.id}
                            name={`features.${field.id}`}
                            control={control}
                            render={({ field: controllerField }) => (
                              <TextFiledPrice
                                adForm
                                label={field.name}
                                type="text"
                                name={`features.${field.id}`}
                                value={
                                  typeof controllerField.value === 'string' || typeof controllerField.value === 'number'
                                    ? controllerField.value
                                    : ''
                                }
                                onChange={controllerField.onChange}
                                onBlur={controllerField.onBlur}
                                errors={errors.features?.[field.id]}
                                placeholder={`مثال: 50 درصد`}
                                formatPrice={true}
                                inputMode="numeric"
                                pattern="[0-9]*"
                              />
                            )}
                          />
                        )
                      default:
                        return null
                    }
                  })}
              </div>
            ) : (
              <div>نوع معامله مشخص نیست</div>
            ))}

          {/* Step 3: ویژگی‌ها */}
          {currentStep === 2 && (
            <div>
              <div className="relative w-full">
                <div className="space-y-3 mb-3">
                  {features &&
                    features.features
                      .filter(
                        (item) =>
                          item.type === 'text' &&
                          item.key !== 'text_mortgage_deposit' &&
                          item.key !== 'text_monthly_rent' &&
                          item.key !== 'text_discount' &&
                          item.key !== 'text_selling_price' &&
                          item.key !== 'text_owner_profit_percentage' &&
                          item.key !== 'text_producer_profit_percentage'
                      )
                      .map((field) => {
                        const isYearField = field.name.includes('سال')
                        return (
                          <Controller
                            key={field.id}
                            name={`features.${field.id}`}
                            control={control}
                            render={({ field: controllerField }) => {
                              if (isYearField) {
                                return (
                                  <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.name}</label>
                                    <select
                                      onChange={controllerField.onChange}
                                      onBlur={controllerField.onBlur}
                                      name={controllerField.name}
                                      ref={controllerField.ref}
                                      value={typeof controllerField.value === 'string' ? controllerField.value : ''}
                                      className="w-full border h-[40px] farsi-digits text-sm border-[#E3E3E7] rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                      <option value="">انتخاب کنید</option>
                                      {years.map((year) => (
                                        <option key={year} value={year}>
                                          {year}
                                        </option>
                                      ))}
                                    </select>
                                    {errors.features?.[field.id] && (
                                      <span className="text-red-500 text-xs">{errors.features[field.id]?.message}</span>
                                    )}
                                  </div>
                                )
                              }

                              return (
                                <TextField
                                  adForm
                                  isDynamic
                                  label={field.name}
                                  {...field}
                                  name={`features.${field.id}`}
                                  control={control}
                                  errors={errors.features?.[field.id]}
                                  placeholder={field.placeholder || ''}
                                  {...((field.name.includes('متراژ') ||
                                    field.name.includes('گذر') ||
                                    field.name.includes('سال')) && {
                                    inputMode: 'numeric',
                                    pattern: '[0-9]*',
                                    type: 'number',
                                  })}
                                />
                              )
                            }}
                          />
                        )
                      })}
                </div>
                <div className="space-y-4 mb-4">
                  {features &&
                    features.features
                      .filter((item) => item.key === 'bool_renovated' || item.key === 'bool_document')
                      .map((field) => (
                        <div
                          key={field.id}
                          className="flex items-center w-fit justify-between bg-white rounded-lg gap-2"
                        >
                          <Controller
                            name={`features.${field.id}`}
                            control={control}
                            defaultValue="false"
                            render={({ field: { onChange, value } }) => (
                              <label className="flex items-center cursor-pointer">
                                <div className="flex items-center cursor-pointer relative">
                                  <input
                                    type="checkbox"
                                    className="peer h-[18px] w-[18px] cursor-pointer transition-all appearance-none rounded border-[1.5px] border-[#17A586] checked:bg-[#17A586] checked:border-[#17A586]"
                                    checked={value === 'true' || value === true}
                                    onChange={(e) => {
                                      const newValue = e.target.checked ? 'true' : 'false'
                                      onChange(newValue)
                                      console.log(`Checkbox ${field.name} set to: ${newValue}`)
                                    }} // مقدار را به صورت string ذخیره می‌کند
                                  />
                                  <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3.5 w-3.5"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                      stroke="currentColor"
                                      strokeWidth="1"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      ></path>
                                    </svg>
                                  </span>
                                </div>
                                <span className="font-normal text-xs text-[#5A5A5A] mr-2">{field.name}</span>
                              </label>
                            )}
                          />
                        </div>
                      ))}
                </div>

                {features &&
                  features.features
                    .filter((item) => item.type === 'choice')
                    .map((item) => (
                      <div key={item.id} className="w-full mb-3">
                        <h1 className="font-normal text-sm mb-2">{item.name}</h1>
                        <div
                          className="bg-white px-4 h-[40px] rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer"
                          onClick={() => toggleDropdown(item.id)}
                        >
                          {selectedNames[item.id] ? (
                            <span className="text-sm text-gray-700">{selectedNames[item.id]}</span>
                          ) : (
                            <span>انتخاب کنید</span>
                          )}{' '}
                          <ArrowLeftIcon
                            className={`w-5 h-5 text-[#9D9D9D] transition-transform ${
                              openDropdowns[item.id] ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                        {openDropdowns[item.id] && (
                          <div className="w-full mt-1.5 bg-[#FCFCFC] border border-[#E3E3E7] rounded-lg p-1">
                            {Array.isArray(item.value) &&
                              // Sort values numerically if they are numbers
                              [...item.value]
                                .sort((a, b) => {
                                  // Extract number from start of string (handles cases like "6 اتاق یا بیشتر")
                                  const aMatch = a.value.match(/^(\d+)/)
                                  const bMatch = b.value.match(/^(\d+)/)

                                  // If both start with numbers, sort numerically
                                  if (aMatch && bMatch) {
                                    return parseInt(aMatch[1]) - parseInt(bMatch[1])
                                  }
                                  // If only a starts with number, a comes first
                                  else if (aMatch) {
                                    return -1
                                  }
                                  // If only b starts with number, b comes first
                                  else if (bMatch) {
                                    return 1
                                  }
                                  // Otherwise keep original order
                                  return 0
                                })
                                .map((value) => (
                                  <label
                                    key={value.id}
                                    className="inline-flex items-center p-3 hover:bg-[#F5F5F8] cursor-pointer w-full"
                                  >
                                    <div className="flex items-center cursor-pointer relative">
                                      <input
                                        type="radio"
                                        name={`radio-${item.id}`}
                                        checked={selectedValues[item.id] === value.id}
                                        onChange={() => {
                                          setSelectedValues((prev) => ({ ...prev, [item.id]: value.id }))
                                          setSelectedNames((prev) => ({ ...prev, [item.id]: value.value }))
                                          setValue(`features.${item.id}`, { id: value.id, value: value.value }) // 👈 ذخیره به شکل صحیح
                                          setOpenDropdowns((prev) => ({ ...prev, [item.id]: false }))
                                        }}
                                        className="peer h-[18px] w-[18px] cursor-pointer transition-all appearance-none rounded border-[1.5px] border-[#D52133] checked:bg-[#D52133] checked:border-[#D52133]"
                                        id={value.id}
                                      />
                                      <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-3.5 w-3.5"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                          stroke="currentColor"
                                          strokeWidth="1"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                          ></path>
                                        </svg>
                                      </span>
                                    </div>
                                    <span className="mr-3 font-normal text-[13px] text-[#5A5A5A]">{value.value}</span>
                                  </label>
                                ))}
                          </div>
                        )}
                        <div className="w-fit" dir={'ltr'}>
                          <DisplayError adForm errors={errors.features?.[item.id]} />
                        </div>
                      </div>
                    ))}

                <div className="space-y-4 mt-5">
                  {features &&
                    features.features
                      .filter(
                        (item) =>
                          item.type === 'bool' &&
                          item.key !== 'bool_renovated' &&
                          item.key !== 'bool_document' &&
                          item.key !== 'bool_convertible'
                      )
                      .map((field) => (
                        <div className="flex items-center justify-between  bg-white rounded-lg">
                          <span className="font-normal text-sm">{field.name}</span>
                          <div className="flex gap-4">
                            <Controller
                              name={`features.${field.id}`}
                              control={control}
                              defaultValue="ندارد"
                              render={({ field: { onChange, value } }) => (
                                <>
                                  <label className="flex items-center cursor-pointer">
                                    <input
                                      type="radio"
                                      className="hidden"
                                      checked={value === 'دارد'}
                                      onChange={() => onChange('دارد')}
                                    />
                                    <div
                                      className={`w-6 h-6 rounded-full border flex items-center justify-center border-[#E3E3E7]`}
                                    >
                                      {value === 'دارد' && <div className="w-3 h-3 rounded-full bg-[#D52133]" />}
                                    </div>
                                    <span className="mr-2 font-normal text-xs">دارد</span>
                                  </label>

                                  <label className="flex items-center cursor-pointer">
                                    <input
                                      type="radio"
                                      className="hidden"
                                      checked={value === 'ندارد'}
                                      onChange={() => onChange('ندارد')}
                                    />
                                    <div
                                      className={`w-6 h-6 rounded-full border flex items-center justify-center border-[#E3E3E7]`}
                                    >
                                      {value === 'ندارد' && <div className="w-3 h-3 rounded-full bg-[#D52133]" />}
                                    </div>
                                    <span className="mr-2 font-normal text-xs">ندارد</span>
                                  </label>
                                </>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                </div>
                <div className="mt-6">
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => {
                      // Generate suggested title based on category, area and location
                      useEffect(() => {
                        if (selectedCategory && features?.features) {
                          // Watch all feature values to respond to changes
                          const allValues = watch()

                          // Try to find features in this order: متراژ (area) -> سال ساخت (year) -> any text feature
                          let featureText = ''

                          // 1. First try to find area feature
                          const areaFeature = features.features.find(
                            (f) => f.type === 'text' && (f.name.includes('متراژ') || (f.key && f.key.includes('area')))
                          )

                          if (areaFeature && allValues.features?.[areaFeature.id]) {
                            featureText = ` ${allValues.features[areaFeature.id]} متری`
                          } else {
                            // 2. Try to find year built feature
                            const yearFeature = features.features.find(
                              (f) => f.type === 'text' && (f.name.includes('سال') || (f.key && f.key.includes('year')))
                            )

                            if (yearFeature && allValues.features?.[yearFeature.id]) {
                              featureText = ` سال ${allValues.features[yearFeature.id]}`
                            } else {
                              // 3. Try to find any text feature with value
                              const anyTextFeature = features.features.find(
                                (f) =>
                                  f.type === 'text' &&
                                  allValues.features?.[f.id] &&
                                  // Exclude unrelated text features
                                  !f.key?.includes('discount') &&
                                  !f.key?.includes('selling_price') &&
                                  !f.key?.includes('mortgage') &&
                                  !f.key?.includes('rent')
                              )

                              if (anyTextFeature && allValues.features?.[anyTextFeature.id]) {
                                featureText = ` ${anyTextFeature.name}: ${allValues.features[anyTextFeature.id]}`
                              }
                            }
                          }

                          // Get location from address (extract district/neighborhood)
                          const address = allValues.address || ''
                          let location = ''
                          if (address) {
                            // Try to extract neighborhood or most specific part
                            const addressParts = address.split('،').map((part) => part.trim())
                            if (addressParts.length > 0) {
                              // Use the most specific part (usually the last meaningful part)
                              const meaningfulParts = addressParts.filter(
                                (part) => part && !part.match(/^\d+$/) && part.length > 1
                              )
                              location =
                                meaningfulParts.length > 0 ? ` ${meaningfulParts[meaningfulParts.length - 1]}` : ''
                            }
                          }

                          const categoryName = selectedCategory.name
                            .replace('خرید', 'فروش')
                            .replace('پیش فروش', '')
                            .replace('رهن و اجاره', '')
                            .replace('اجاره کوتاه مدت', '')
                            .trim()

                          let suggestedTitle = categoryName
                          if (featureText) {
                            suggestedTitle += `، ${featureText.trim()}`
                          }
                          if (location) {
                            suggestedTitle += `، ${location.trim()}`
                          }

                          // Update suggested title whenever user has not manually edited
                          if (!isTitleManuallyEdited) {
                            field.onChange(suggestedTitle)
                          }
                        }
                      }, [selectedCategory, features, watch(), isTitleManuallyEdited])

                      return (
                        <TextField
                          adForm
                          label="عنوان آگهی"
                          {...field}
                          control={control}
                          errors={errors.title}
                          placeholder="مثال: خانه ویلایی 300 متری خیابان جمهوری"
                          onChange={(e) => {
                            const value = e?.target?.value ?? ''
                            if (!isTitleManuallyEdited && value !== '') {
                              setIsTitleManuallyEdited(true)
                            }
                            field.onChange(e)
                          }}
                        />
                      )
                    }}
                  />
                  <div className="w-fit" dir={'ltr'}>
                    <DisplayError adForm errors={errors.title} />
                  </div>
                </div>
                <div className="mt-4">
                  <label
                    className="block text-sm font-normal mb-2 text-gray-700 md:min-w-max lg:text-sm"
                    htmlFor="description"
                  >
                    توضیحات آگهی
                  </label>
                  <textarea
                    className="input h-24 resize-none border-[#E3E3E7] rounded-[8px] bg-white placeholder:text-xs pr-2"
                    id="description"
                    {...register('description')}
                  />
                  <div className="w-fit" dir={'ltr'}>
                    {' '}
                    <DisplayError adForm errors={errors.description} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: عکس و ویدئو */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-[#FFF0F2] rounded-[10px] p-1">
                    <CameraSmIcon width="24px" height="24px" />
                  </div>
                  <h3 className="font-medium text-start">عکس آگهی</h3>
                </div>
                <div>
                  <input
                    type="file"
                    accept="*"
                    multiple
                    className="hidden"
                    id="Thumbnail"
                    onChange={handleFileChange}
                  />

                  <label htmlFor="Thumbnail" className="block cursor-pointer h-[102px] custom-dashed">
                    <div className="flex justify-center flex-col items-center w-full h-full gap-y-2">
                      <CameraIcon width="43px" height="43px" />
                      <h1 className=" border-[#5A5A5A] border-b w-fit font-normal text-xs text-[#5A5A5A]">
                        افزودن عکس
                      </h1>
                    </div>
                  </label>
                  <div className="grid grid-cols-4 gap-3 mt-3">
                    {fields.map((file, index) => (
                      <div key={index} className="relative custom-dashed p-[1px] pr-[1.5px]">
                        <img
                          src={`${file.url}`}
                          alt={`file-${index}`}
                          className="h-[58px] w-full object-cover rounded-[4px]"
                        />
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 border hover:bg-red-500 hover:text-white bg-gray-50 p-0.5 rounded-full text-gray-500"
                          onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            handleDelete(index, 'pic')
                          }}
                        >
                          <IoMdClose className="text-base" />
                        </button>
                      </div>
                    ))}

                    {/* Show loading placeholder during upload */}
                    {isUploadingMedia && fields.length < maxFiles && (
                      <div className="h-[58px] w-full custom-dashed rounded-[4px] bg-gray-100 animate-pulse flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-[#D52133] rounded-full animate-spin"></div>
                      </div>
                    )}

                    {/* نمایش جایگاه‌های خالی */}
                    {Array.from({ length: maxFiles - fields.length - (isUploadingMedia ? 1 : 0) }).map((_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="w-full h-[58px] custom-dashed rounded-[4px] shadow-product flex items-center justify-center text-gray-500"
                      >
                        <PictureSmIcon width="24px" height="24px" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-[#FFF0F2] rounded-[10px] p-1">
                    <VideoSmIcon width="24px" height="24px" />
                  </div>
                  <h3 className="font-medium text-start">ویدئو آگهی</h3>
                </div>
                <div>
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    className="hidden"
                    id="VideoThumbnail"
                    onChange={handleVideoChange}
                  />
                  <label htmlFor="VideoThumbnail" className="block cursor-pointer h-[143px] custom-dashed">
                    <div className="flex justify-center flex-col items-center w-full h-full gap-y-2">
                      <VideoIcon width="43px" height="43px" />
                      <h1 className="border-[#5A5A5A] border-b w-fit font-normal text-xs text-[#5A5A5A]">
                        افزودن ویدئو
                      </h1>
                    </div>
                  </label>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {videoFields.map((file, index) => (
                      <div key={index} className="relative custom-dashed p-[1px] pr-[1.5px]">
                        <div className="relative">
                          <video
                            src={`${file.url}`}
                            className="h-[58px] w-full object-cover rounded-[4px]"
                            id={`video-${index}`}
                            onLoadedData={() => handleVideoLoaded(file.url)}
                          />
                          <div
                            className="absolute inset-0 flex items-center justify-center cursor-pointer"
                            onClick={() => {
                              const video = document.getElementById(`video-${index}`) as HTMLVideoElement
                              if (video.paused) {
                                video.play()
                              } else {
                                video.pause()
                              }
                            }}
                          >
                            <div className="w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                              <div id={`play-button-${index}`} className="flex items-center justify-center">
                                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 border hover:bg-red-500 hover:text-white bg-gray-50 p-0.5 rounded-full text-gray-500"
                          onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            handleDelete(index, 'video')
                          }}
                        >
                          <IoMdClose className="text-base" />
                        </button>
                      </div>
                    ))}

                    {/* Show loading placeholder for videos */}
                    {isUploadingMedia && videoFields.length < maxVideos && (
                      <div className="h-[58px] w-full custom-dashed rounded-[4px] bg-gray-100 animate-pulse flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-[#D52133] rounded-full animate-spin"></div>
                      </div>
                    )}

                    {/* Empty video slots */}
                    {Array.from({
                      length: maxVideos - videoFields.length - (isUploadingMedia ? 1 : 0),
                    }).map((_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="w-full h-[58px] custom-dashed rounded-[4px] shadow-product flex items-center justify-center text-gray-500"
                      >
                        <PictureSmIcon width="24px" height="24px" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-[#FFF0F2] rounded-[10px] p-1">
                    <Cube3DSmIcon width="24px" height="24px" />
                  </div>
                  <h3 className="font-medium text-start">3D آگهی</h3>
                </div>
                <div>
                  <label className="block cursor-pointer h-[143px] custom-dashed">
                    <div className="flex justify-center flex-col items-center w-full h-full gap-y-2">
                      <Cube3DIcon width="43px" height="43px" />
                      <h1 className=" border-[#5A5A5A] border-b w-fit font-normal text-xs text-[#5A5A5A]">
                        افزودن عکس
                      </h1>
                    </div>
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <InfoCircleIcon width="16px" height="16px" />
                <span className="text-[#5A5A5A] font-normal text-xs">توضیحات مرتبط</span>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="w-full mt-6 absolute left-0 right-0 -bottom-[80px]">
            {currentStep !== 0 && (
              <Button
                type="button"
                onClick={handlePrev}
                className="w-[120px] bg-[#F6F7FB] border border-[#D52133] float-right h-[48px] text-[#D52133] hover:text-white rounded-lg font-bold text-sm hover:bg-[#D52133]"
              >
                قبلی
              </Button>
            )}

            {currentStep < steps.length - 1 ? (
              <div
                onClick={handleNext}
                className="w-[120px] float-left h-[48px] text-white rounded-lg font-bold text-sm hover:bg-[#f75263] button cursor-pointer"
              >
                بعدی
              </div>
            ) : (
              <Button
                type="submit"
                isLoading={isLoadingCreate || isLoadingUpdate}
                className={` ${
                  isLoadingCreate || isLoadingUpdate ? 'w-auto' : 'w-[120px]'
                } whitespace-nowrap float-left h-[48px] text-white rounded-lg font-bold text-sm hover:bg-[#f75263]`}
              >
                {isEditMode ? 'بروزرسانی نهایی' : 'ثبت نهایی'}{' '}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdvertisementRegistrationForm
