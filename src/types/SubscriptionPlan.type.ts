export interface SubscriptionPlan {
  id: string
  title: string
  duration: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  viewLimit: number
  price: number
  discount?: number
}
