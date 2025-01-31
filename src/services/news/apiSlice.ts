import { News, QueryParams, ServiceResponse } from '@/types'
import baseApi from '../baseApi'
import { generateQueryParams } from '@/utils'

export const newsApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNews: builder.query<ServiceResponse<News[]>, QueryParams>({
      query: ({ ...params }) => {
        const queryParams = generateQueryParams(params)

        return {
          url: `/api/all-news?${queryParams}`,
          method: 'GET',
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: 'News' as const,
                id: id,
              })),
              'News',
            ]
          : ['News'],
    }),
  }),
})

export const { useGetNewsQuery } = newsApiSlice
