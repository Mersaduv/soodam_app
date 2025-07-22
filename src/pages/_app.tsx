import '../styles/main.css'
import '../styles/browser-styles.css'
import 'react-toastify/dist/ReactToastify.css'
import 'leaflet/dist/leaflet.css'
import '../styles/main.css'
import '../styles/browser-styles.css'
import '../styles/swiper.css'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { Alert, LoadingScreen } from '@/components/ui'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { ToastContainer } from 'react-toastify'
import { AdminProtectedLayout } from '@/components/layouts'
import { useRouter } from 'next/router'
import { Toaster } from 'react-hot-toast'

async function enableMocking() {
  if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_MOCK_API === 'true') {
    try {
      const { worker } = await import('../mocks/browser')
      // Start MSW to ensure mock API endpoints work
      return worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/mockServiceWorker.js',
        }
      }).then(() => {
        console.log('%c[MSW] Mock API Server running', 'color: green; font-weight: bold')
        if (typeof window !== 'undefined') {
          window.mswWorkerInitialized = true
        }
      })
    } catch (error) {
      console.error('Failed to initialize MSW:', error)
    }
  }
  return Promise.resolve()
}

export default function App({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    // Initialize MSW in development mode or if mock API is enabled
    if ((process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_MOCK_API === 'true') && 
        typeof window !== 'undefined' && 
        !window.mswWorkerInitialized) {
      enableMocking()
    }

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  // Check if the current route is an admin route but not authentication
  const isAdminRoute = router.pathname.startsWith('/admin')
  const isAuthRoute = router.pathname.startsWith('/admin/authentication')
  
  // Wrap with AdminProtectedLayout if it's an admin route but not auth
  const WrappedComponent = isAdminRoute && !isAuthRoute ? (
    <AdminProtectedLayout>
      <Component {...pageProps} />
    </AdminProtectedLayout>
  ) : (
    <Component {...pageProps} />
  )

  return (
    <Provider store={store}>
      {WrappedComponent}
      {/* {!asPath.includes('/') ? <PageTransitionLoading /> : null} */}
      {/* <Alert /> */}
      <ToastContainer />
    </Provider>
  )
}

// Add TypeScript declaration for window
declare global {
  interface Window {
    mswWorkerInitialized?: boolean
  }
}
