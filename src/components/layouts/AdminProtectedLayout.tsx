import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'

interface AdminProtectedLayoutProps {
  children: ReactNode
}

const AdminProtectedLayout = ({ children }: AdminProtectedLayoutProps) => {
  const router = useRouter()
  const { user } = useSelector((state: any) => state.auth)

  useEffect(() => {
    // Check if user exists and is admin (Super Admin = 1 or Admin = 2)
    const checkAuth = () => {
      if (!user) {
        // Try to get user from localStorage if not in redux
        const localUser = localStorage.getItem('user')
        if (localUser) {
          const parsedUser = JSON.parse(localUser)
          if (parsedUser.user_group !== 1 && parsedUser.user_group !== 2) {
            router.replace('/')
          }
        } else {
          router.replace('/')
        }
      } else if (user.user_group !== 1 && user.user_group !== 2) {
        // If user exists but is not admin, redirect to home
        router.replace('/')
      }
    }

    checkAuth()
  }, [user, router])

  return <>{children}</>
}

export default AdminProtectedLayout 