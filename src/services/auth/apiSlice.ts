import baseApi from '@/services/baseApi'

import type { LoginQuery, LoginResult, MsgResult, VerifyLoginQuery, VerifyLoginResult } from './types'
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

            const birthdate = `${userInfoData[0].birthday._date__year}/${userInfoData[0].birthday._date__month}/${userInfoData[0].birthday._date__day}`

            const address = userInfoData[0].address
            const latitude = address.latitude
            const longitude = address.longitude
            const cityName = getProvinceFromCoordinates(latitude, longitude)

            const user: User = {
              id: userInfoData[0].id,
              first_name: userInfoData[0].first_name,
              last_name: userInfoData[0].last_name,
              father_name: userInfoData[0].father_name,
              security_number: userInfoData[0].security_number,
              email: userInfoData[0].email,
              phone_number: userInfoData[0].phone_number,
              role: args.role as UserRoleType,
              birthday: birthdate,
              province: userInfoData[0].province,
              city: userInfoData[0].city,
              user_wallet: userInfoData[0].user_wallet,
              address: userInfoData[0].address,
              avatar: userInfoData[0].avatar,
              // userType: userInfoData[0].phone_number == '09014689030' ? 'ادمین اصلی' : 'کاربر',

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

    getUserInfo: builder.query<User[], void>({
      query: () => ({
        url: `/api/user/get_user_info`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: 'User' as const,
                id: id,
              })),
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
  }),
})

export const { useLoginMutation, useVerifyLoginMutation, useLogoutMutation, useGetVerifyCodeMutation } = authApiSlice
