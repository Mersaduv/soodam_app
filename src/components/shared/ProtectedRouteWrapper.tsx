import { useRouter } from 'next/router'

import { tokens } from '@/utils'

interface Props {
  children: React.ReactNode
  allowedRoles: string[]
}

const ProtectedRouteWrapper: React.FC<Props> = (props) => {
  // ? Props
  const { allowedRoles, children } = props

  // ? Assets
  const { push, asPath } = useRouter()
  const login_token = localStorage.getItem('token')

  // ? Get UserInfo
  const userInfo = JSON.parse(localStorage.getItem('user'))
  if (login_token || userInfo) {
    if (allowedRoles?.includes(userInfo.userType as string)) {
      return children
    }
  } else {
    asPath.includes('/admin')
      ? push(`/admin/authentication/login?redirectTo=${asPath}`)
      : push(`/authentication/login?redirectTo=${asPath}`)

    return null
  }
}

export default ProtectedRouteWrapper
