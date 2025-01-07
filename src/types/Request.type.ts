export interface Request {
  id: string
  category: string
  location: string
  name: string
  image: string
  address: string
  features: { id: string; name: string }[]
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
