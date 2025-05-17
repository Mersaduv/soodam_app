import { Feature } from "./Feature.type"

export interface Housing {
  id: string
  title: string
  description: string
  status: number
  location: { lat: number; lng: number }
  main_category: {
    id: string
    name: string
  }
  sub_category: {
    id: string
    name: string
  }
  user: {
    id: string
    phone_number: string
    first_name: string
    last_name: string
  }
  address?: {
    province: {
      id: string
      name: string
    }
    city: string
    address: string
    zip_code: string
    longitude: number
    latitude: number
  }
  review: number
  highlight_features: Feature[]
  features: Feature[]
  created_at: string
  updated_at: string
  medias: {
    id: string
    media_url: string
    media_type: string
  }[]
  adCode?: string
  views: number
  save: number
  contactOwner?: string
}
