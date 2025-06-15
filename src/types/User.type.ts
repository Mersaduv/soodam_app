import { UserRoleType } from '@/utils'

export interface User {
  id: string
  uuid?: string
  first_name?: string
  last_name?: string
  full_name?: string
  username?: string
  father_name?: string
  security_number?: string
  email?: string
  phone_number?: string
  gender?: string
  is_verified?: boolean
  is_active?: boolean
  user_type?: number
  user_group?: number
  province?:
    | {
        id: number
        name: string
      }
    | string
  city?:
    | {
        id: number
        name: string
      }
    | string
  birthday?: any
  role?: UserRoleType
  userType?: number
  address?: UserAddress
  addresses?: UserAddress[]
  avatar?:
    | {
        url: string
        path: string
      }
    | string
  rating?: number
  member_since?: string
  user_wallet?: number
  subscription?: {
    type: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
    remainingViews: number
    totalViews: number
    startDate: string
    endDate: string
    status: 'ACTIVE' | 'EXPIRED'
    viewedProperties: Array<{ propertyId: string; viewedDate: string }>
  }
}

export interface UserAddress {
  id: string
  content_type_id?: string
  object_id?: string
  province?:
    | {
        id: number
        name: string
      }
    | string
  city?:
    | {
        id: number
        name: string
      }
    | string
  street?: string
  address?: string
  zip_code?: string
  srid?: number
  longitude?: number
  latitude?: number
  geoLocation?: {
    _ptr?: any
    _cs?: any
  }
}
