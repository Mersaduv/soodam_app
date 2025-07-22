import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '',  // Empty base URL to ensure MSW intercepts all requests
    timeout: 60000,
  }),

  tagTypes: ['User', 'Housing', 'Category', 'Feature', 'Request', 'Subscription', 'News', 'Requests', 'Estates'],
  endpoints: (builder) => ({}),
})

export default apiSlice
