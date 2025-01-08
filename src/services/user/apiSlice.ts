import baseApi from '@/services/baseApi'
import { ServiceResponse, SubscriptionPlan } from '@/types'

export const userApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptions: builder.query<ServiceResponse<SubscriptionPlan[]>, void>({
      query: () => {
        return {
          url: `/api/subscriptions`,
          method: 'GET',
        }
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result?.data.map(({ id }) => ({
                type: 'Subscription' as const,
                id: id,
              })),
              'Subscription',
            ]
          : ['Subscription'],
    }),
  }),
})

export const { useGetSubscriptionsQuery } = userApiSlice
