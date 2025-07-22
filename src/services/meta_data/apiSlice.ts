import baseApi from '@/services/baseApi'
import { Category, QueryParams, ServiceResponse } from '@/types'

import { generateQueryParams, getToken } from '@/utils'
import { IdQuery, MetaData } from './type'
import productionApiSlice from '../productionBaseApi'

export const metaDataApiSlice = productionApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMetaData: builder.query<MetaData, QueryParams>({
      query: ({ ...params }) => {
        // پارامترها را حذف می‌کنیم تا از تداخل با مسیر :id جلوگیری کنیم
        console.log('درخواست به سرویس متادیتا:', `/api/advertisements/meta`)
        return {
          url: `/api/advertisements/meta`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      },
      // Handle undefined result carefully
      providesTags: (result) => {
        // If result is null or undefined, return just the tag name
        if (!result) {
          return ['MetaData']
        }
        
        // If main_categories is undefined or not an array, return just the tag name
        if (!result.main_categories || !Array.isArray(result.main_categories)) {
          return ['MetaData']
        }
        
        // Otherwise return tags for each category
        return [
          ...result.main_categories.map(({ id }) => ({
            type: 'MetaData' as const,
            id: id,
          })),
          'MetaData',
        ]
      },
    }),

  }),
})

export const { useGetMetaDataQuery } = metaDataApiSlice
