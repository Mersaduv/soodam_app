import baseApi from '@/services/baseApi'

import type {
  LoginQuery,
  LoginResult,
  MsgResult,
  VerifyLoginQuery,
  VerifyLoginResult,
} from './types'
import { clearCredentials, setCredentials } from '@/store'

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
      query: ({ code }) => {
        const body: VerifyLoginQuery = { code: code }
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
                fullName: data.fullName,
                phoneNumber: data.phoneNumber,
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

export const {
  useLoginMutation,
  useVerifyLoginMutation,
  useLogoutMutation,
} = authApiSlice
