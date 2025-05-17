import { UserRoleType } from '@/utils'

export interface User {
  id: string
  first_name: string
  last_name: string
  father_name: string
  security_number: string
  email: string
  phone_number: string
  province: string
  city: string
  birthday: any
  role: UserRoleType
  userType?: string,
  address?: UserAddress,
  avatar?: string,
  user_wallet:number,
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
  content_type_id: string
  object_id: string
  province_id: string
  city_id: string
  street: string
  address: string
  zip_code: string
  srid: number
  longitude: number
  latitude: number
  geoLocation: {
    _ptr: any
    _cs: any
  }
}
