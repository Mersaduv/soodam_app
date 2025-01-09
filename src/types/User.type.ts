import { UserRoleType } from '@/utils'

export interface User {
  id: string
  phoneNumber: string
  role: UserRoleType
  subscription?: {
    type: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
    remainingViews: number
    totalViews: number
    startDate: string
    endDate: string
    status: 'ACTIVE' | 'EXPIRED'
    viewedProperties: string[]
  },
}
