import baseApi from '@/services/baseApi'
import { Category, QueryParams, ServiceResponse } from '@/types'

import { generateQueryParams, getToken } from '@/utils'
import { IdQuery, MetaData } from './type'
import productionApiSlice from '../productionBaseApi'

export const metaDataApiSlice = productionApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMetaData: builder.query<MetaData, QueryParams>({
      query: ({ ...params }) => {
        const queryParams = generateQueryParams(params)
        return {
          url: `/api/advertisements/meta?${queryParams}`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      },
      providesTags: (result) =>
        result.main_categories
          ? [
              ...result?.main_categories.map(({ id }) => ({
                type: 'MetaData' as const,
                id: id,
              })),
              'MetaData',
            ]
          : ['MetaData'],
    }),

  }),
})

export const { useGetMetaDataQuery } = metaDataApiSlice
