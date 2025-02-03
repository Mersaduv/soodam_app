import baseApi from '@/services/baseApi'

import type { LoginQuery, LoginResult, MsgResult, VerifyLoginQuery, VerifyLoginResult } from './types'
import { clearCredentials, setCredentials } from '@/store'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
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
export const authApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResult, LoginQuery>({
      query: ({ phoneNumber }) => {
        const body: LoginQuery = { phoneNumber: phoneNumber }
        return {
          url: '/api/auth/send-code',
          method: 'POST',
          body,
        }
      },
    }),

    verifyLogin: builder.mutation<VerifyLoginResult, VerifyLoginQuery>({
      query: ({ code, phoneNumber, role }) => {
        const body: VerifyLoginQuery = { code, phoneNumber, role }
        return {
          url: '/api/auth/verify-code',
          method: 'POST',
          body,
        }
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          if (data) {
            dispatch(
              setCredentials({
                fullName: data.fullName || '',
                phoneNumber: data.phoneNumber,
                role: data.role,
                loggedIn: true,
              })
            )
          }
        } catch (error) {
          console.error('verifyLogin:', error)
        }
      },
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
  }),
})

export const { useLoginMutation, useVerifyLoginMutation, useLogoutMutation } = authApiSlice
