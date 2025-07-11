import baseApi from '@/services/baseApi'

import type {
  LoginQuery,
  LoginResult,
  MsgResult,
  UpdateUserInfoQuery,
  VerifyLoginQuery,
  VerifyLoginResult,
} from './types'
import { clearCredentials, setCredentials } from '@/store'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import productionApiSlice from '../productionBaseApi'
import { User } from '@/types'
import { generateUUID, getProvinceFromCoordinates, getToken, UserRoleType } from '@/utils'
// export const authApiSlice = createApi({
//   reducerPath: 'authApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: '',
//     timeout: 60000,
//   }),
//   endpoints: (builder) => ({
//     login: builder.mutation<LoginResult, LoginQuery>({
//       query: ({ phoneNumber }) => {
//         const body: LoginQuery = { phoneNumber: phoneNumber }
//         return {
//           url: 'http://37.32.6.188:4000/auth/get_ver_code',
//           method: 'POST',
//           body,
//         }
//       },
//     }),

//     verifyLogin: builder.mutation<VerifyLoginResult, VerifyLoginQuery>({
//       query: ({ code, phoneNumber, role }) => {
//         const body: VerifyLoginQuery = { code, phoneNumber, role }
//         return {
//           url: 'http://37.32.6.188:4000/auth/verify-code',
//           method: 'POST',
//           body,
//         }
//       },
//       async onQueryStarted(args, { dispatch, queryFulfilled }) {
//         try {
//           const { data } = await queryFulfilled
//           if (data) {
//             dispatch(
//               setCredentials({
//                 fullName: data.fullName || '',
//                 phoneNumber: data.phoneNumber,
//                 role: data.role,
//                 loggedIn: true,
//               })
//             )
//           }
//         } catch (error) {
//           console.error('verifyLogin:', error)
//         }
//       },
//     }),

//     logout: builder.mutation<MsgResult, void>({
//       query: () => ({
//         url: 'http://37.32.6.188:4000/auth/logout',
//         method: 'GET',
//       }),
//       async onQueryStarted(args, { dispatch, queryFulfilled }) {
//         try {
//           await queryFulfilled
//           dispatch(clearCredentials())
//         } catch (error) {
//           console.error('logout:', error)
//         }
//       },
//     }),
//   }),
// })

// export const { useLoginMutation, useVerifyLoginMutation, useLogoutMutation } = authApiSlice
export const authApiSlice = productionApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResult, LoginQuery>({
      query: ({ phoneNumber }) => {
        const body = { phone_number: phoneNumber }
        return {
          url: '/api/auth/get_ver_code',
          method: 'POST',
          body,
        }
      },
    }),

    verifyLogin: builder.mutation<VerifyLoginResult, VerifyLoginQuery>({
      query: ({ code, phoneNumber }) => {
        const body = { phone_number: phoneNumber, verify_code: code }

        return {
          url: '/api/auth/verify',
          method: 'POST',
          body,
        }
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          // Clear any existing cached data first to prevent old user data persistence
          // dispatch(productionApiSlice.util.resetApiState())

          const { data } = await queryFulfilled
          if (data) {
            // Clear any remaining stored data before setting new data
            localStorage.clear()

            localStorage.setItem('token', data.token)
            localStorage.setItem('userType', args.userType as string)
            const userInfoData = await dispatch(authApiSlice.endpoints.getUserInfo.initiate()).unwrap()
            console.log(userInfoData, 'userInfoData----------')

            const birthdate = userInfoData.birthday || ''

            const address = userInfoData.address || null
            const latitude = address?.latitude || null
            const longitude = address?.longitude || null
            const cityName = getProvinceFromCoordinates(latitude, longitude)

            const user: User = {
              id: userInfoData.id,
              first_name: userInfoData.first_name,
              last_name: userInfoData.last_name,
              father_name: userInfoData.father_name,
              security_number: userInfoData.security_number,
              email: userInfoData.email,
              phone_number: userInfoData.phone_number,
              is_verified: userInfoData.is_verified,
              is_active: userInfoData.is_active,
              user_type: userInfoData.user_type,
              user_group: userInfoData.user_group,
              birthday: birthdate,
              province: userInfoData.province,
              city: userInfoData.city,
              user_wallet: userInfoData.user_wallet,
              address: userInfoData.address,
              avatar: userInfoData.avatar,
              subscription: undefined,
            }

            localStorage.setItem('user', JSON.stringify(user))
            localStorage.setItem('userCity', JSON.stringify({ name: cityName, coordinates: [longitude, latitude] }))

            dispatch(
              setCredentials({
                fullName: '',
                phoneNumber: args.phoneNumber,
                // userType: (args.userType as unknown as number) || null,
                token: data.token,
                loggedIn: true,
              })
            )
          }
        } catch (error) {
          console.error('verifyLogin:', error)
        }
      },
    }),

    getUserInfo: builder.query<User, void>({
      query: () => ({
        url: `/api/user/profile`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              {
                type: 'User' as const,
                id: result.id,
              },
              'User',
            ]
          : ['User'],
    }),

    getVerifyCode: builder.mutation<{ code: string }, { phoneNumber: string }>({
      query: ({ phoneNumber }) => ({
        url: '/api/auth/see_ver_code',
        method: 'POST',
        body: { phone_number: phoneNumber },
      }),
    }),

    logout: builder.mutation<MsgResult, void>({
      query: () => ({
        url: '/api/auth/logout',
        method: 'GET',
        credentials: 'include', // Include credentials to properly handle server-side session
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled

          // Clear Redux state
          dispatch(clearCredentials())

          // Clear all localStorage and sessionStorage
          if (typeof window !== 'undefined') {
            localStorage.clear()
            sessionStorage.clear()
          }

          // Reset all API state to ensure no cached data persists
          dispatch(productionApiSlice.util.resetApiState())
        } catch (error) {
          console.error('logout:', error)

          // Even if API call fails, clear local data
          dispatch(clearCredentials())
          if (typeof window !== 'undefined') {
            localStorage.clear()
            sessionStorage.clear()
          }
          dispatch(productionApiSlice.util.resetApiState())
        }
      },
    }),

    updateUserInfo: builder.mutation<MsgResult, any>({
      query: (user) => ({
        url: '/api/user/profile',
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: user,
      }),
      invalidatesTags: ['User'],
    }),
  }),
})

export const {
  useLoginMutation,
  useVerifyLoginMutation,
  useLogoutMutation,
  useGetVerifyCodeMutation,
  useUpdateUserInfoMutation,
  useGetUserInfoQuery,
} = authApiSlice
