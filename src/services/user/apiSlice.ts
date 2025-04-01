import baseApi from '@/services/baseApi'
import { ServiceResponse, SubscriptionPlan, User } from '@/types'
import { PurchaseSubscriptionRequest } from './type'

export const subscriptionApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all subscriptions
    getSubscriptions: builder.query<ServiceResponse<SubscriptionPlan[]>, void>({
      query: () => ({
        url: '/api/subscriptions',
        method: 'GET',
      }),
      providesTags: ['Subscription'],
    }),

    // Purchase subscription
    purchaseSubscription: builder.mutation<ServiceResponse<User>, PurchaseSubscriptionRequest>({
      query: (body) => ({
        url: '/api/subscription/purchase',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Subscription'],
    }),

    // Get subscription status
    getSubscriptionStatus: builder.query<ServiceResponse<User['subscription']>, string>({
      query: (phoneNumber) => ({
        url: `/api/subscription/status?phoneNumber=${phoneNumber}`,
        method: 'GET',
      }),
      providesTags: ['Subscription'],
    }),

    viewProperty: builder.mutation<
      ServiceResponse<{ remainingViews: number }>,
      { phoneNumber: string; propertyId: string }
    >({
      query: (body) => ({
        url: '/api/properties/view',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Subscription'],
    }),
    // Get viewed properties
    getViewedProperties: builder.query<ServiceResponse<{ propertyId: string; viewedDate: string }[]>, string>({
      query: (phoneNumber) => ({
        url: `/api/properties/viewed-properties?phoneNumber=${phoneNumber}`,
        method: 'GET',
      }),
      providesTags: ['Subscription'],
    }),

    // Get all provinces
    // getProvinces: builder.query<ServiceResponse<Province[]>, void>({
    //   query: () => ({
    //     url: '/api/geolocation/get_provinces',
    //     method: 'GET',
    //   }),
    // }),

    // // Get cities by province ID
    // getCitiesByProvinceId: builder.query<ServiceResponse<City[]>, number>({
    //   query: (provinceId) => ({
    //     url: `/api/geolocation/get_cites_by_id/${provinceId}`,
    //     method: 'GET',
    //   }),
    // }),
  }),
})

export const {
  useGetSubscriptionsQuery,
  usePurchaseSubscriptionMutation,
  useGetSubscriptionStatusQuery,
  useViewPropertyMutation,
  useGetViewedPropertiesQuery,
} = subscriptionApiSlice
