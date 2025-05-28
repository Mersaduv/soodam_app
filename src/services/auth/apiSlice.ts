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
        // const body: VerifyLoginQuery = { code, phoneNumber, role }
        const body = { phone_number: phoneNumber, verify_code: code }

        return {
          url: '/api/auth/verify',
          method: 'POST',
          body,
        }
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          if (data) {
            localStorage.setItem('token', data.token)
            const userInfoData = await dispatch(authApiSlice.endpoints.getUserInfo.initiate()).unwrap()
            console.log(userInfoData, 'userInfoData----------')

            // const birthdate = `${userInfoData[0].birthday._date__year}/${userInfoData[0].birthday._date__month}/${userInfoData[0].birthday._date__day}`// 1402/01/01
            const birthdate = userInfoData.birthday || ""

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
              role: args.role as UserRoleType,
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
                role: (args.role as string) || '',
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
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(clearCredentials())
        } catch (error) {
          console.error('logout:', error)
        }
      },
    }),

    updateUserInfo: builder.mutation<MsgResult, UpdateUserInfoQuery>({
      query: (user) => ({
        url: '/api/user/edit_user_info',
        method: 'POST',
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
