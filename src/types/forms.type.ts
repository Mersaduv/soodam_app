export interface PhoneFormValues {
  phoneNumber?: string
}

export interface AdminPhoneFormValues {
  phoneNumber?: string
  security_number?: string
}

export interface CodeFormValues {
  code: string
  phoneNumber?: number
  userType?: string
}

export interface AdFormValues {
  phoneNumber: string
  nationalCode?: string
  status?: number
  postalCode: string
  address: string
  category: string | null
  location: {
    lat: number
    lng: number
  }
  // deal 1
  price?: number
  discount?: number
  // deal 2
  deposit?: number
  rent?: number
  convertible?: boolean
  // deal 3
  producerProfitPercentage?: number
  ownerProfitPercentage?: number
  // deal 4
  capacity?: number
  extraPeople?: number
  rentalTerms?: { id: number; name: string }

  title?: string
  features: {
    [key: string]: string | boolean | { id: string; value: string }
  }
  description: string

  mediaImages: { url: string }[]
  mediaVideos: { url: string }[]
}

export interface CreateAds {
  title: string
  security_code_owner_building: string
  phone_number_owner_building: string
  description: string
  deposit: number
  rent: number
  price: number
  sub_category_id: string | number
  sub_sub_category_id: number
  full_address: {
    province_id: number
    city_id: number
    address: string
    zip_code: string
    longitude: number
    latitude: number
  }
  features: any
  media: {
    media: string
    type: string
  }[][]
}

export interface RequestFormValues {
  fullName?: string
  phoneNumber: string
  address: string
  category: string | null
  location: {
    lat: number
    lng: number
  }
  drawnPoints: number[]
  priceRange?: {
    from: number
    to: number
  }

  areaRange?: {
    from: number
    to: number
  }

  buildYearRange?: {
    from: number
    to: number
  }

  depositRange?: {
    from: number
    to: number
  }

  rent?: {
    from: number
    to: number
  }
  convertible?: boolean

  producerProfitPercentage?: {
    from: number
    to: number
  }
  ownerProfitPercentage?: {
    from: number
    to: number
  }

  capacity?: {
    from: number
    to: number
  }
  extraPeople?: {
    from: number
    to: number
  }

  title?: string
  features: {
    [key: string]: string | string[] | { from: number; to: number }
  }
}

export interface MarketerUserForm {
  fullName: string
  fatherName: string
  notionalCode: string
  idCode: string
  birthDate: string
  bankAccountNumber: string
  shabaNumber: string
  maritalStatus: string
  nationalCardFrontImage: File
  nationalCardBackImage: File
  IdImage: File
  scannedImage?: File
  agreeToTerms: boolean
}

export interface UserInfoForm {
  image: File
  fullName: string
  fatherName: string
  notionalCode: string
  email: string
  mobileNumber: string
  province: {
    id?: number
    name: string
    slug?: string
  }
  city: {
    id?: number
    name: string
    slug?: string
    province_id?: number
  }
  birthDate: string
  gender: string
}

export interface ContactUsForm {
  fullName: string
  phoneNumber: string
  address: string
  description: string
}

export interface EstateConsultantForm {
  fullName: string
  fatherName: string
  notionalCode: string
  province: {
    id?: number
    name: string
    slug?: string
  }
  city: {
    id?: number
    name: string
    slug?: string
    province_id?: number
  }
  licenseNumber: string
  businessLicenseNumber: string
  businessLicenseImage: File
  businessLicenseImageBack: File
  businessLicenseImageFront: File
  IdImage: File
  agreeToTerms: boolean
  location: {
    lat: number
    lng: number
  }
}

export interface AdminRegisterForm {
  full_name?: string
  phone_number?: string
  email?: string
  password?: string
  confirm_password?: string
  province?: {
    id?: number
    name: string
    slug?: string
  }
  city?: {
    id?: number
    name: string
    slug?: string
    province_id?: number
  }
  security_number?: string
}
