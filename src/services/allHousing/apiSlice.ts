import baseApi from '@/services/baseApi'
import { generateQueryParams } from '@/utils'
import { QueryParams, Housing , ServiceResponse} from '@/types'
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

    getSingleHousing: builder.query<ServiceResponse<Housing>, string>({
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
  }),
})

export const { useGetHousingQuery ,useGetHousingByCategoryQuery,useGetSingleHousingQuery} = housingApiSlice
