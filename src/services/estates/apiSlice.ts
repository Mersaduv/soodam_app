import baseApi from '@/services/baseApi'
import { generateQueryParams } from '@/utils'
import { QueryParams, Housing, ServiceResponse, AdFormValues, Request, Estate } from '@/types'
import { IdQuery } from './type'

export const estatesApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEstates: builder.query<ServiceResponse<Estate[]>, QueryParams>({
      query: ({ ...params }) => {
        const queryParams = generateQueryParams(params)

        return {
          url: `/api/estates?${queryParams}`,
          method: 'GET',
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: 'Estates' as const,
                id: id,
              })),
              'Estates',
            ]
          : ['Estates'],
    }),
  }),
})

export const { useGetEstatesQuery } = estatesApiSlice
