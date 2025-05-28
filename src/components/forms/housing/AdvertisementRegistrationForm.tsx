import React, { useEffect, useRef, useState } from 'react'
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
import { Button, CustomCheckbox, DisplayError, Modal, TextField, TextFiledPrice } from '@/components/ui'
import * as yup from 'yup'
import dynamic from 'next/dynamic'
import { useAppDispatch, useDisclosure } from '@/hooks'
import { Disclosure } from '@headlessui/react'
import { useGetCategoriesQuery, useGetFeaturesQuery, useGetMetaDataQuery } from '@/services'
import { useRouter } from 'next/router'
import { AdFormValues, Category, CreateAds, Feature } from '@/types'
import { getToken, validationSchema } from '@/utils'
import { IoMdClose } from 'react-icons/io'
import { setIsSuccess } from '@/store'
import { Control, FieldError } from 'react-hook-form'
import jalaali from 'jalaali-js'
import {
  useAddHousingMutation,
  useLazyGetFeaturesByCategoryQuery,
  useUploadMediaMutation,
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
}
const AdvertisementRegistrationForm: React.FC<Props> = ({ roleUser }) => {
  // ? Assets
  const { query } = useRouter()
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
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/geolocation/get_provinces`, {
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
        .get(`${process.env.NEXT_PUBLIC_API_URL}/api/geolocation/get_cites_by_id/${selectedProvince.id}`, {
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
    const uniqueParts = [...new Set(parts)].filter((part) => part && part.length > 0)

    // Keep only the most relevant parts (maximum 4 parts for readability)
    let relevantParts = uniqueParts.slice(0, Math.min(4, uniqueParts.length))

    // Check for cities and provinces - make sure they're not repeated
    const majorcities = ['تهران', 'مشهد', 'اصفهان', 'شیراز', 'تبریز', 'اهواز', 'کرج', 'قم', 'کرمانشاه', 'رشت', 'ارومیه']

    // For each city, ensure it appears only once
    majorcities.forEach((city) => {
      const cityParts = relevantParts.filter((part) => part.includes(city))
      if (cityParts.length > 1) {
        // Keep only the shortest mention of the city (usually just the city name)
        const shortestPart = cityParts.reduce(
          (shortest, current) => (current.length < shortest.length ? current : shortest),
          cityParts[0]
        )

        relevantParts = relevantParts.filter((part) => !part.includes(city) || part === shortestPart)
      }
    })

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
          'User-Agent': 'Soodam-App',
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
      return
    }

    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: query,
          format: 'json',
          limit: 5,
          'accept-language': 'fa',
        },
        headers: {
          'User-Agent': 'Soodam-App',
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

  //? Re-Renders
  useEffect(() => {
    if (selectedLocation) {
      setValue('location.lat', selectedLocation[0])
      setValue('location.lng', selectedLocation[1])

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

  // useEffect(() => {
  //   if (selectedCategory) {
  //     setValue('category', selectedCategory.id)
  //     setIsSelectCategorySkip(false)
  //   }

  useEffect(() => {
    const fetchFeatures = async (category: Category, parent: Category = null) => {
      if (!category) return

      setCurrentCategoryId(category.id)

      const fetchedFeatures = await triggerGetFeaturesByCategory({
        sub_category_id: parent !== null ? parent.id : category.id,
        sub_category_level_two_id: category.sub_sub_category === undefined ? category.id : 0,
      })

      //   // فقط اگه ویژگی نداشت، دیگه دنبال بالا رفتن تو parentCategory نیستیم چون حذف شده
      //   // پس نیازی به fetchFeatures دوباره نداریم
    }

    if (selectedCategory) {
      setValue('category', selectedCategory.id)
      fetchFeatures(selectedCategory, selectedParentCategory)
    }
  }, [
    selectedCategory,
    setValue,
    // triggerGetFeaturesByCategory
  ])

  useEffect(() => {
    const fetchFeatures = async (category: Category, parent: Category = null) => {
      if (!category) return

      // Trigger the query manually
      const fetchedFeatures = await triggerGetFeaturesByCategory({
        sub_category_id: parent !== null ? parent.id : category.id,
        sub_category_level_two_id: category.sub_sub_category === undefined ? category.id : 0,
      })
    }

    if (selectedCategory) {
      setValue('category', selectedCategory.id)
      fetchFeatures(selectedCategory, selectedParentCategory)
    }
  }, [selectedCategory, triggerGetFeaturesByCategory])

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
    // مرحله ۱: گرفتن نام استان و شهر از روی lat/lng با استفاده از reverse geocoding
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fa`
    const nominatimResponse = await axios.get(nominatimUrl)
    const address = nominatimResponse.data.address
    console.log(address, 'address')

    const cityName = address.city || address.town || address.village || ''
    const provinceName = address.province || ''

    const provincesResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/geolocation/get_provinces`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    })

    const matchedProvince = provincesResponse.data.find(
      (p: any) => p.name === provinceName || `استان ${p.name}` === provinceName
    )

    if (!matchedProvince) {
      throw new Error(`استان '${provinceName}' در لیست یافت نشد`)
    }

    // مرحله ۳: گرفتن لیست شهرهای استان یافت‌شده
    const citiesResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/geolocation/get_cites_by_id/${matchedProvince.id}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
      }
    )

    const matchedCity = citiesResponse.data.find((c: any) => c.name === cityName)

    if (!matchedCity) {
      throw new Error(`شهر '${cityName}' در استان '${provinceName}' یافت نشد`)
    }

    return {
      province_id: matchedProvince.id,
      city_id: matchedCity.id,
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
          value = value === 'دارد' ? true : false
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
          key: featureInfo.key, // یا هرچی که بجاش داری
          type: featureInfo.type,
          value: featureInfo.key === 'text_discount' ? value ?? '0' : featureInfo.key === 'text_mortgage_deposit' ? value ?? '0' : featureInfo.key === 'text_monthly_rent' ? value ?? '0' : value,
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
    }

    if (discountFeature && discountFeature.value) {
      // Convert formatted discount string to number
      const discountStr = String(discountFeature.value)
      // Remove non-numeric characters and convert to number
      discountAmount = parseInt(discountStr.replace(/[^\d]/g, '')) || 0
    }

    if (depositFeature && depositFeature.value) {
      const depositStr = String(depositFeature.value)
      depositAmount = parseInt(depositStr.replace(/[^\d]/g, '')) || 0
    }

    if (rentFeature && rentFeature.value) {
      const rentStr = String(rentFeature.value)
      rentAmount = parseInt(rentStr.replace(/[^\d]/g, '')) || 0
    }

    const finalData = {
      ...data,
      features: formattedFeatures,
    }

    console.log(finalData, 'finalData')
    console.log('Form submitted:', data, roleUser)
    data.status = 1
    const createAds = {
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
    console.log(createAds, 'data-submit')

    addHousing(createAds)
  }

  useEffect(() => {
    if (isSuccessCreate) {
      dispatch(setIsSuccess(true))
    }
  }, [isSuccessCreate, dispatch])

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
        fieldsToValidate = ['title', 'features']
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

  const handleLocationChange = (location: [number, number]) => {
    setSelectedLocation(location)
  }

  const handleSelectCategory = (category: Category, parent?: Category) => {
    if (parent) setSelectedParentCategory(parent)
    if (selectedCategory && selectedCategory.id === category.id) {
      setSelectedCategory(null)
      setValue('category', null)
    } else {
      setSelectedCategory(category)
    }
    handleModalClose()
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
    createUrl(files)
    // if (selectedFiles.length === maxFiles) return
    // if (files) {
    //   const validFiles: any[] = []

    //   Array.from(files).forEach((file) => {
    //     const img = new Image()
    //     img.src = URL.createObjectURL(file)

    //     img.onload = () => {
    //       URL.revokeObjectURL(img.src)
    //       validFiles.push(file)
    //       if (validFiles.length === Array.from(files).length) {
    //         setSelectedFiles((prevFiles) => [...prevFiles, ...validFiles])
    //         if (validFiles.length > 0) {
    //           setValue('media.images', ((getValues('media.images') as File[]) || []).concat(validFiles))
    //         } else {
    //           setValue('media.images', [])
    //         }
    //       }
    //     }
    //   })
    // }
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
          // It's an image
          append({ url: item.url })
        }
      })
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

    // Upload the videos through the API
    createUrl(Array.from(fileList))
  }

  const handleDelete = (index: number, type = 'pic') => {
    // if (type === 'pic') {
    //   setSelectedFiles((prevFiles) => {
    //     const updatedFiles = [...prevFiles]
    //     updatedFiles.splice(index, 1)
    //     return updatedFiles
    //   })
    //   setValue(
    //     'media.images',
    //     ((getValues('media.images') as File[]) || []).filter((_, i) => i !== index)
    //   )
    // } else {
    //   setSelectedVideos((prevFiles) => {
    //     const updatedFiles = [...prevFiles]
    //     updatedFiles.splice(index, 1)
    //     return updatedFiles
    //   })
    //   setValue(
    //     'media.videos',
    //     ((getValues('media.videos') as File[]) || []).filter((_, i) => i !== index)
    //   )
    // }
  }
  useEffect(() => {
    const getLocationInfo = async () => {
      if (selectedLocation) {
        const locationInfo = await getProvinceAndCityFromCoordinates(selectedLocation[0], selectedLocation[1])
        console.log(locationInfo, 'locationInfo')
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

  if (isFetching) return <div>loading...</div>

  if (features) {
    console.log(features, 'features')
  }

  let stepTitle = 'قیمت'
  if (
    selectedCategory?.name?.includes('مالک') ||
    selectedCategory?.name?.includes('سازنده') ||
    selectedCategory?.name?.includes('پیش فروش')
  ) {
    stepTitle = 'سود'
  } else if (selectedCategory?.name?.includes('اجاره کوتاه')) {
    stepTitle = 'شرایط اجاره'
  }

  const steps = ['مشخصات', stepTitle, 'ویژگی‌ها', 'عکس و ویدئو']

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
            <div className="pt-4">دسته بندی</div>
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
                            {item.image && (
                              <img
                                className="w-[24px] h-[24px]"
                                src={`${process.env.NEXT_PUBLIC_API_URL}/${item.image}`}
                                alt={item.name}
                              />
                            )}
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
                                            selectedCategory?.id === subItem.id ? 'bg-gray-50 rounded-lg' : ''
                                          }`}
                                        >
                                          <span className="font-light text-[14px] text-[#5A5A5A]">{subItem.name}</span>
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
                  className="w-full cursor-pointer border-[1.5px] bg-[#FCFCFC] rounded-[8px] px-4 h-[40px] text-right text-[#5A5A5A] flex justify-between items-center"
                >
                  <span className="text-[14px]">
                    {!isShow}
                    {selectedCategory ? mapCategoryName(selectedCategory.name) : 'انتخاب'}
                  </span>
                  <ArrowLeftIcon
                    className={`w-5 h-5 text-[#9D9D9D] transition-transform ${isShow ? 'rotate-180' : ''}`}
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
                                setIsConvertible((prev) => !prev)
                                setValue(`features.${field.id}`, !isConvertible)
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
            ) : // <div className="space-y-4">
            //   <Controller
            //     name="deposit"
            //     control={control}
            //     render={({ field }) => (
            //       <TextFiledPrice
            //         adForm
            //         label="رهن یا ودیعه"
            //         type="text"
            //         name="deposit"
            //         value={field.value}
            //         onChange={field.onChange}
            //         onBlur={field.onBlur}
            //         errors={errors.deposit}
            //         placeholder="مثال : 100 میلیون تومان"
            //         formatPrice={true}
            //         inputMode="numeric"
            //         pattern="[0-9]*"
            //       />
            //     )}
            //   />

            //   <Controller
            //     name="rent"
            //     control={control}
            //     render={({ field }) => (
            //       <TextFiledPrice
            //         adForm
            //         label="اجاره ماهیانه"
            //         type="text"
            //         name="rent"
            //         value={field.value}
            //         onChange={field.onChange}
            //         onBlur={field.onBlur}
            //         errors={errors.rent}
            //         placeholder="مثال : 10 میلیون "
            //         formatPrice={true}
            //         inputMode="numeric"
            //         pattern="[0-9]*"
            //       />
            //     )}
            //   />

            //   <div className="flex flex-row-reverse items-center gap-2 w-full pt-2">
            //     <CustomCheckbox
            //       name={`convertible`}
            //       checked={isConvertible}
            //       onChange={() => setIsConvertible((prev) => !prev)}
            //       label=""
            //       customStyle="bg"
            //     />
            //     <label htmlFor="convertible" className="flex items-center gap-2 w-full font-normal text-sm">
            //       <RepeatIcon width="24px" height="24px" />
            //       قابل تبدیل
            //     </label>
            //   </div>
            //   <div className="flex items-center gap-2">
            //     <InfoCircleIcon width="16px" height="16px" />
            //     <span className="text-[#5A5A5A] font-normal text-xs">
            //       به ازای هر یک میلیون تومان ودیعه 30 هزار تومان اجاره عرف بازار می باشد.
            //     </span>
            //   </div>
            // </div>
            dealType === 'shortRent' ? (
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
                                    checked={value === 'true'}
                                    onChange={(e) => onChange(e.target.checked ? 'true' : 'false')} // مقدار را به صورت string ذخیره می‌کند
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
                                  const aMatch = a.value.match(/^(\d+)/);
                                  const bMatch = b.value.match(/^(\d+)/);
                                  
                                  // If both start with numbers, sort numerically
                                  if (aMatch && bMatch) {
                                    return parseInt(aMatch[1]) - parseInt(bMatch[1]);
                                  }
                                  // If only a starts with number, a comes first
                                  else if (aMatch) {
                                    return -1;
                                  }
                                  // If only b starts with number, b comes first
                                  else if (bMatch) {
                                    return 1;
                                  }
                                  // Otherwise keep original order
                                  return 0;
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
                    render={({ field }) => (
                      <TextField
                        adForm
                        label="عنوان آگهی"
                        {...field}
                        control={control}
                        errors={errors.title}
                        placeholder="مثال: خانه ویلایی 300 متری خیابان جمهوری"
                      />
                    )}
                  />
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
                    accept=".jpg,.jpeg,.png,.webp"
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
                          src={`${process.env.NEXT_PUBLIC_API_URL}${file.url}`}
                          alt={`file-${index}`}
                          className="h-[58px] w-full object-cover rounded-[4px]"
                        />
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 border hover:bg-red-500 hover:text-white bg-gray-50 p-0.5 rounded-full text-gray-500"
                          onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            handleDelete(index)
                          }}
                        >
                          <IoMdClose className="text-base" />
                        </button>
                      </div>
                    ))}
                    {/* نمایش جایگاه‌های خالی */}
                    {Array.from({ length: maxFiles - fields.length }).map((_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="w-full h-[58px] custom-dashed rounded-[4px] shadow-product flex items-center justify-center text-gray-500"
                      >
                        <PictureSmIcon width="24px" height="24px" />
                      </div>
                    ))}
                  </div>
                </div>
                {/* {errors?.media?.images && <p className="text-red-500 text-sm mt-1">{errors.media.images.message}</p>} */}
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
                            src={`${process.env.NEXT_PUBLIC_API_URL}${file.url}`}
                            className="h-[58px] w-full object-cover rounded-[4px]"
                            id={`video-${index}`}
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
                            removeVideo(index)
                          }}
                        >
                          <IoMdClose className="text-base" />
                        </button>
                      </div>
                    ))}
                    {/* Empty video slots */}
                    {Array.from({
                      length: maxVideos - videoFields.length,
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
                <span className="text-[#5A5A5A] font-normal text-xs">توضیحات مرتبط </span>
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
                className="w-[120px] float-left h-[48px] whitespace-nowrap text-white rounded-lg font-bold text-sm hover:bg-[#f75263]"
              >
                ثبت نهایی{' '}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdvertisementRegistrationForm
