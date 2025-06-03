import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { UploadResult } from './allHousing/types'
import { generateQueryParams, getToken } from '@/utils'
import { AdFormValues, AdminAdvertisementResponse, CreateAds, Feature, Housing, NearbyAdsResponse, QueryParams, ServiceResponse } from '@/types'
import { QueryFeatureByCategory } from './feature/type'

const productionApiSlice = createApi({
  reducerPath: 'productionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
    timeout: 60000,
  }),

  tagTypes: ['MetaData', 'Feature', 'Housing', 'User'],
  endpoints: (builder) => ({
    uploadMedia: builder.mutation<UploadResult[], File[]>({
      query: (files) => {
        const formData = new FormData()
        if (files.length > 0) {
          files.forEach((file) => {
            formData.append('files', file)
          })
        }

        return {
          url: '/api/advertisements/upload_media',
          method: 'POST',
          headers: {
            Authorization: `Bearer ${getToken()}`,
            // Do NOT set Content-Type here; let the browser set it with the correct boundary
          },
          body: formData,
        }
      },
    }),

    addHousing: builder.mutation<any, any>({
      query: (data) => ({
        url: '/api/advertisements',
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

    getFeaturesByCategory: builder.query<{ features: Feature[] }, QueryFeatureByCategory>({
      query: ({ sub_category_id, sub_category_level_two_id }) => ({
        url: `/api/advertisements/features`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sub_category_id, sub_category_level_two_id }),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.features.map(({ id }) => ({
                type: 'Feature' as const,
                id: id,
              })),
              'Feature',
            ]
          : ['Feature'],
    }),

    getAdvByGeolocation: builder.query<NearbyAdsResponse, QueryParams>({
      query: ({ ...params }) => {
        const queryParams = generateQueryParams(params)
        return {
          url: `/api/advertisements/nearby?${queryParams}`,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      },
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map(({ id }) => ({
                type: 'Housing' as const,
                id,
              })),
              'Housing',
            ]
          : ['Housing'],
    }),

    getMyAdv: builder.query<{ items: Housing[]; total: number }, void>({
      query: () => ({
        url: `/api/advertisements/my_adv`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
    }),

    getAdvById: builder.query<Housing, string>({
      query: (id) => ({
        url: `/api/advertisements/${id}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      providesTags: (result, error, arg) => [{ type: 'Housing', id: arg }],
    }),
    getAdvByAdmin: builder.query<AdminAdvertisementResponse, QueryParams | void>({
      query: (params) => {
        const queryParams = params ? generateQueryParams(params) : ''
        return {
          url: `/api/admin/advertisements${queryParams ? `?${queryParams}` : ''}`,
          method: 'GET',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
        }
      },
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map(({ id }) => ({
                type: 'Housing' as const,
                id,
              })),
              'Housing',
            ]
          : ['Housing'],
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
  useGetAdvByAdminQuery,
} = productionApiSlice
export default productionApiSlice
