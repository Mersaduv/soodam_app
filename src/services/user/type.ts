export interface PurchaseSubscriptionRequest {
  phoneNumber: string
  planType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  planName: string
  referralCode?: string
}
