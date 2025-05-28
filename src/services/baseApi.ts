import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_API_URL : process.env.NEXT_PUBLIC_API_URL_LOCAL,
    timeout: 60000,
  }),

  tagTypes: ['User', 'Housing', 'Category', 'Feature', 'Request', 'Subscription', 'News', 'Requests', 'Estates'],
  endpoints: (builder) => ({}),
})

export default apiSlice
