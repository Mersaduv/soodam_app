import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { IdQuery, UploadResult } from './allHousing/types'
import { generateQueryParams, getToken } from '@/utils'
import {
  AdFormValues,
  AdminAdvertisementResponse,
  CreateAds,
  Feature,
  Housing,
  NearbyAdsResponse,
  QueryParams,
  ServiceResponse,
} from '@/types'
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

    getFavorites: builder.query<any, QueryParams>({
      query: ({ ...params }) => {
        const queryParams = generateQueryParams(params)
        return {
          url: `/api/advertisements/favorites?${queryParams}`,
          method: 'GET',
          headers: {
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

    addFavorite: builder.mutation<any, IdQuery>({
      query: ({ id }) => ({
        url: `/api/advertisements/${id}/favorite`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      invalidatesTags: ['Housing'],
    }),

    viewAdvertisement: builder.mutation<any, IdQuery>({
      query: ({ id }) => ({
        url: `/api/advertisements/${id}/view`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      invalidatesTags: ['Housing'],
    }),

    getMyAdv: builder.query<{ items: Housing[]; total: number }, void>({
      query: () => ({
        url: `/api/advertisements/my_adv`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
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
    getEditAdvAdmin: builder.query<AdminAdvertisementResponse, QueryParams | void>({
      query: (params) => {
        const queryParams = params ? generateQueryParams(params) : ''
        return {
          url: `/api/admin/advertisement-edits${queryParams ? `?${queryParams}` : ''}`,
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
    deleteAdv: builder.mutation<ServiceResponse<Housing>, IdQuery>({
      query: ({ id }) => ({
        url: `/api/advertisements/${id}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      invalidatesTags: ['Housing'],
    }),
    reviewEditAdv: builder.mutation<
      any,
      { id: string; action: 'approve' | 'reject'; admin_notes?: string; body?: any }
    >({
      query: ({ id, action, admin_notes, body = {} }) => {
        const queryParams = new URLSearchParams();
        if (action) queryParams.append('action', action);
        if (admin_notes) queryParams.append('admin_notes', admin_notes);
        
        return {
          url: `/api/admin/advertisement-edits/${id}/review?${queryParams.toString()}`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body,
        };
      },
      invalidatesTags: ['Housing'],
    }),
    updateAdv: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/api/advertisements/${id}`,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: data,
      }),
      invalidatesTags: ['Housing'],
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
  useGetEditAdvAdminQuery,
  useDeleteAdvMutation,
  useReviewEditAdvMutation,
  useUpdateAdvMutation,
  useGetFavoritesQuery,
  useAddFavoriteMutation,
  useViewAdvertisementMutation,
} = productionApiSlice
export default productionApiSlice
