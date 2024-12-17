import baseApi from '@/services/baseApi'
import { Category, QueryParams, ServiceResponse } from '@/types'

import { generateQueryParams } from '@/utils'

export const categoryApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<ServiceResponse<Category[]>, QueryParams>({
      query: ({ ...params }) => {
        const queryParams = generateQueryParams(params)
        return {
          url: `/api/categories?${queryParams}`,
          method: 'GET',
        }
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result?.data.map(({ id }) => ({
                type: 'Category' as const,
                id: id,
              })),
              'Category',
            ]
          : ['Category'],
    }),
  }),
})

export const { useGetCategoriesQuery } = categoryApiSlice
