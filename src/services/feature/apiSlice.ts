import baseApi from '@/services/baseApi'
import { Category, QueryParams, ServiceResponse,Feature } from '@/types'

import { generateQueryParams } from '@/utils'

export const featureApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeatures: builder.query<ServiceResponse<Feature[]>, QueryParams>({
      query: ({ ...params }) => {
        const queryParams = generateQueryParams(params)
        return {
          url: `/api/features?${queryParams}`,
          method: 'GET',
        }
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result?.data.map(({ id }) => ({
                type: 'Feature' as const,
                id: id,
              })),
              'Feature',
            ]
          : ['Feature'],
    }),
  }),
})

export const { useGetFeaturesQuery } = featureApiSlice
