import baseApi from '@/services/baseApi'
import { Category, QueryParams, ServiceResponse } from '@/types'

import { generateQueryParams } from '@/utils'
import { IdQuery } from './type'

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

    getSingleCategory: builder.query<ServiceResponse<Category>, IdQuery>({
      query: ({ id }) => ({
        url: `/api/category/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: 'Category', id: arg.id }],
    }),
  }),
})

export const { useGetCategoriesQuery, useGetSingleCategoryQuery } = categoryApiSlice
