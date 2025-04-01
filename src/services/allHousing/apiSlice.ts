import baseApi from '@/services/baseApi'
import { generateQueryParams } from '@/utils'
import { QueryParams, Housing, ServiceResponse, AdFormValues, Request } from '@/types'
import { IdQuery } from './types'

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
    addHousing: builder.mutation<ServiceResponse<Housing>, AdFormValues>({
      query: (data) => ({
        url: '/api/adv/create_adv',
        method: 'POST',
        body: data,
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
  }),
})

export const {
  useGetHousingQuery,
  useGetHousingByCategoryQuery,
  useGetSingleHousingQuery,
  useAddHousingMutation,
  useGetRequestsQuery,
  useGetRequestByIdQuery,
} = housingApiSlice
