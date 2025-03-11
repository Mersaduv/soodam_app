export interface Request {
  id: string
  category: string
  location: {
    lat: number
    lng: number
  }
  title: string
  userInfo: {
    id: string
    fullName: string
    phoneNumber: string
    email: string
    image: string
  }
  address: string
  highlightFeatures: {
    id: string
    image: string
    title: string
    value: string
  }[]
  features: {
    id: string
    image: string
    title: string
    value: string
  }[]
  rentalTerm: {
    id: string
    name: string
  }
  rent?: number
  deposit?: number
  price?: number
  discount?: number
  capacity?: number
  extraPeople?: number
  ownerProfitPercentage?: number
  producerProfitPercentage?: number
  phoneNumber: string
  created: string
  updated: string
}
