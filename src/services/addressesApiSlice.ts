// addressesApiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const apiKey = process.env.NEXT_PUBLIC_MAP_API_KEY;
export const addressesApiSlice = createApi({
  reducerPath: 'addressesApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://map.ir' }),
  endpoints: (builder) => ({
    fetchAddresses: builder.query<any, string>({
      query: (searchQuery) => ({
        url: `/search/v2/autocomplete?text=${searchQuery}`,
        method: 'GET',
        headers: {
          'x-api-key': apiKey ?? '', // کلید API خود را وارد کنید
        },
      }),
    }),
  }),
})

export const { useLazyFetchAddressesQuery } = addressesApiSlice
