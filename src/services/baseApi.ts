import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NODE_ENV === 'production' ? 'https://dev-soodam.vercel.app' : 'http://localhost:3000',
    timeout: 60000,
  }),

  tagTypes: ['User', 'Housing', 'Category', 'Feature', 'Request', 'Subscription', 'News', 'Requests', 'Estates'],
  endpoints: (builder) => ({}),
})

export default apiSlice
