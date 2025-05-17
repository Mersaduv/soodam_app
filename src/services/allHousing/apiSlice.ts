import baseApi from '@/services/baseApi'
import { generateQueryParams } from '@/utils'
import { QueryParams, Housing, ServiceResponse, AdFormValues, Request } from '@/types'
import { IdQuery, UploadResult } from './types'

export const housingApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHousing: builder.query<ServiceResponse<Housing[]>, QueryParams>({
      query: ({ ...params }) => {
        const queryParams = generateQueryParams(params)

        return {
          url: `/api/all-housing?${queryParams}`,
          method: 'GET',
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: 'Housing' as const,
                id: id,
              })),
              'Housing',
            ]
          : ['Housing'],
    }),

    getSingleHousing: builder.query<Housing, string>({
      query: (query) => ({
        url: `/api/housing/${query}`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: 'Housing', id: arg }],
    }),

    getHousingByCategory: builder.query<ServiceResponse<Housing[]>, IdQuery>({
      query: ({ id }) => ({
        url: `/api/housings/category/${id}`,
        method: 'GET',
      }),
    }),

    getRequests: builder.query<ServiceResponse<Request[]>, QueryParams>({
      query: ({ ...params }) => {
        const queryParams = generateQueryParams(params)

        return {
          url: `/api/requests?${queryParams}`,
          method: 'GET',
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: 'Requests' as const,
                id: id,
              })),
              'Requests',
            ]
          : ['Requests'],
    }),

    getRequestById: builder.query<ServiceResponse<Request>, string>({
      query: (id) => ({
        url: `/api/requests/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: 'Requests', id: arg }],
    }),
    deleteHousing: builder.mutation<ServiceResponse<Housing>, IdQuery>({
      query: ({ id }) => ({
        url: `/api/housing/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Housing'],
    }),
  }),
})

export const {
  useGetHousingQuery,
  useGetHousingByCategoryQuery,
  useGetSingleHousingQuery,
  useGetRequestsQuery,
  useGetRequestByIdQuery,
  useDeleteHousingMutation,
  useLazyGetHousingQuery: useLazyFetchHousingQuery,
} = housingApiSlice
