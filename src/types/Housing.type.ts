export interface Housing {
  id: string
  title: string
  slug: string
  location: {
    lat: number // ......Latitude
    lng: number // ........Longitude
  }
  address: string
  bedrooms: number
  bathrooms: number
  floors: number
  onFloor: number
  deposit: number
  rent: number
  sellingPrice: number
  created: string //... ISO date format
  updated: string //... ISO date format
  adId: string
  parking: number
  warehouse: number
  elevator: number
  floorMaterial: string
  bathroomType: string
  coolingSystem: string
  heatingSystem: string
  homeAge: string
  geographicalLocation: string
  documentType: string
  securityFeatures: string
  otherFacilities: string
  visitingTime: string
  views: number
  save: number
  images: string[]
  cubicMeters: number
  categoryId: string
  category: string
}
