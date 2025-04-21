import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const productionApiSlice = createApi({
  reducerPath: 'productionApi',
  baseQuery: fetchBaseQuery({
    baseUrl:'/',
    timeout: 60000,
  }),

  tagTypes: ['MetaData'],
  endpoints: (builder) => ({}),
})

export default productionApiSlice