import { Feature } from './Feature.type'
import { User, UserAddress } from './User.type'

export interface Housing {
  id: string
  title: string
  description: string
  category: HousingCategory
  status: number
  price: {
    deposit: number
    rent: number
    amount: number
    currency: string
    is_negotiable: boolean
    discount_amount: number
    original_amount: number
    price_per_unit: number
    unit: string
  },
  full_address: UserAddress
  attributes: Feature[]
  images: MediaImage[]
  primary_image: string
  user: User
  tags?: string[]
  statistics?: {
    views: number
    favorites: number
    inquiries: number
    shares: number
    last_viewed_at: string | null
  }
  highlight_features?: Feature[]
  created_at: string
  updated_at: string
  expiry_date: string
}

export interface NearbyAdsResponse {
  items: Housing[]
  total: number
  page: number
  limit: number
  pages: number
  has_next: boolean
  has_prev: boolean
  filters: {
    category_id?: number
    latitude?: number
    longitude?: number
    radius?: number
  }
  sort: {
    field: string
    order: string
  }
}

export interface HousingCategory {
  id: string
  name?: string
  key?: string
  main_category?: {
    id: string
    name: string
  }
  icon?: string
}
export interface MediaImage {
  url: string
  is_primary: boolean
  order: number
  width: number
  height: number
  alt_text: string
}

