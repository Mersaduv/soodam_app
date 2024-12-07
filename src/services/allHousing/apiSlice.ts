// import baseApi from '@/services/baseApi'
// import { generateQueryParams } from '@/utils'

// export const authApiSlice = baseApi.injectEndpoints({
//   endpoints: (builder) => ({
//     getHousing: builder.query<any, any>({
//       query: ({ ...params }) => {
//         const queryParams = generateQueryParams(params)

//         return {
//           url: `/api/all-housing?${queryParams}`,
//           method: 'GET',
//         }
//       },
//       providesTags: (result) =>
//         result
//           ? [
//               ...result.housing.map(({ id }) => ({
//                 type: 'Housing' as const,
//                 id: id,
//               })),
//               'Housing',
//             ]
//           : ['Housing'],
//     }),
//   }),
// })

// export const { useGetHousingQuery } = authApiSlice
