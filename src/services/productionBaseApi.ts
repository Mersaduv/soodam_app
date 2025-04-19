import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const productionApiSlice = createApi({
  reducerPath: 'productionApi',
  baseQuery: fetchBaseQuery({
    baseUrl:'http://194.5.193.119:4000',
    timeout: 60000,
  }),

  tagTypes: ['MetaData'],
  endpoints: (builder) => ({}),
})

export default productionApiSlice