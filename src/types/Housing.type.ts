export interface Housing {
  id: string
  title: string
  status: number
  location: { lat: number; lng: number }
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
  deposit: number
  rent: number
  price: number
  ownerProfitPercentage: number
  producerProfitPercentage: number
  capacity: number
  extraPeople: number
  address: string
  categoryId: string
  category: string
  created: string
  updated: string
  adCode: string
  images: string[]
  views: number
  save: number
  description: string
  contactOwner: string
}
