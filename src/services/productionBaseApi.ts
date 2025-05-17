import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { UploadResult } from './allHousing/types'
import { getToken } from '@/utils'
import { AdFormValues, CreateAds, Feature, Housing, ServiceResponse } from '@/types'
import { QueryFeatureByCategory } from './feature/type'

const productionApiSlice = createApi({
  reducerPath: 'productionApi',
  baseQuery: fetchBaseQuery({
<<<<<<< HEAD
    baseUrl: 'http://194.5.193.119:4000',
=======
    baseUrl:'/',
>>>>>>> 5ca8e4f7b658a465a9e8de6efb4e2056c178b0d2
    timeout: 60000,
  }),

  tagTypes: ['MetaData', 'Feature', 'Housing', 'User'],
  endpoints: (builder) => ({
    uploadMedia: builder.mutation<UploadResult, File[]>({
      query: (files) => {
        const formData = new FormData()
        files.forEach((file) => {
          formData.append('files', file)
        })

        return {
          url: '/api/adv/create_adv/upload_media',
          method: 'POST',
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
          body: formData,
        }
      },
    }),

    addHousing: builder.mutation<any, any>({
      query: (data) => ({
        url: '/api/adv/create_adv',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: data,
      }),
      invalidatesTags: ['Housing'],
    }),

    getRequestFeaturesByCategory: builder.query<ServiceResponse<Feature[]>, QueryFeatureByCategory>({
      query: ({ sub_category_id, sub_category_level_two_id }) => ({
        url: `/api/adv/get_features_by_category`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sub_category_id, sub_category_level_two_id }),
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result?.data.map(({ id }) => ({
                type: 'Feature' as const,
                id: id,
              })),
              'Feature',
            ]
          : ['Feature'],
    }),

    getFeaturesByCategory: builder.query<Feature[], QueryFeatureByCategory>({
      query: ({ sub_category_id, sub_category_level_two_id }) => ({
        url: `/api/adv/get_features_by_category`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sub_category_id, sub_category_level_two_id }),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: 'Feature' as const,
                id: id,
              })),
              'Feature',
            ]
          : ['Feature'],
    }),

    getAdvByGeolocation: builder.query<
      Housing[],
      {
        province?: number
        city?: number
        street?: string
        address?: string
        zip_code?: string
        latitude?: number
        longitude?: number
      }
    >({
      query: ({ province, city, street, address, zip_code, latitude, longitude }) => ({
        url: `/api/adv/get_adv_by_geolocation`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ province, city, street, address, zip_code, latitude, longitude }),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: 'Housing' as const,
                id: id,
              })),
              'Housing',
            ]
          : ['Housing'],
    }),

    getMyAdv: builder.query<Housing[], void>({
      query: () => ({
        url: `/api/adv/get_my_adv`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
    }),

    getAdvById: builder.query<Housing, string>({
      query: (id) => ({
        url: `/api/adv/get_adv_by_id/${id}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      providesTags: (result, error, arg) => [{ type: 'Housing', id: arg }],
    }),
  }),
})
export const {
  useUploadMediaMutation,
  useAddHousingMutation,
  useGetRequestFeaturesByCategoryQuery,
  useLazyGetRequestFeaturesByCategoryQuery,
  useGetFeaturesByCategoryQuery,
  useLazyGetFeaturesByCategoryQuery,
  useGetAdvByGeolocationQuery,
  useGetMyAdvQuery,
  useGetAdvByIdQuery,
} = productionApiSlice
export default productionApiSlice
