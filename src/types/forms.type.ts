export interface PhoneFormValues {
  phoneNumber?: string
}

export interface CodeFormValues {
  code: string
  phoneNumber?: number
  role?: string
}

export interface AdFormValues {
  phoneNumber: string
  nationalCode?: string
  postalCode: string
  address: string
  category: string | null
  location: {
    lat: number
    lng: number
  }

  price?: number
  discount?: number

  deposit?: number
  rent?: number
  convertible?: boolean

  producerProfitPercentage?: number
  ownerProfitPercentage?: number

  capacity?: number
  extraPeople?: number
  rentalTerms?: { id: number; name: string }

  title?: string
  features: {
    [key: string]: string
  }

  media: {
    images: File[]
    videos?: File[]
  }
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
    [key: string]:
      | string
      | {
          from: number
          to: number
        }
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
