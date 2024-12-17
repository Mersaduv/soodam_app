// import { useRouter } from 'next/router'

// interface Props {
//   children: React.ReactNode
//   allowedRoles: string[]
// }

// const ProtectedRouteWrapper: React.FC<Props> = (props) => {
//   // ? Props
//   const { allowedRoles, children } = props

//   // ? Assets
//   const { push, asPath } = useRouter()

//   // ? Get UserInfo
//   const { userInfo } = useUserInfo()



//   if (userInfo) {
//     if (allowedRoles?.includes(userInfo?.role as string)) {
//       return children
//     }
//   } else {
//     asPath.includes('/admin')
//       ? push(`/admin/authentication/login?redirectTo=${asPath}`)
//       : push(`/authentication/login?redirectTo=${asPath}`)

//     return null
//   }
// }

// export default ProtectedRouteWrapper
