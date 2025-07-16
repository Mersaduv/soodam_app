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
  try {
    const { worker } = await import('../mocks/browser')
    // Start MSW in all environments to ensure mock API endpoints work
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

export default function App({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    // Initialize MSW for all routes that may need it
    const initializeMSW = async () => {
      // Check if we're on client side
      if (typeof window !== 'undefined') {
        // Initialize MSW for admin messages or registration pages
        if (window.location.pathname.includes('/admin/messages') || 
            window.location.pathname.includes('/admin/authentication/register')) {
          await enableMocking()
        }
      }
    }

    initializeMSW()

    return () => clearTimeout(timer)
  }, [])

  // Listen for route changes to initialize MSW for certain routes
  useEffect(() => {
    const handleRouteChange = async (url: string) => {
      if (url.includes('/admin/messages') && typeof window !== 'undefined' && !window.mswWorkerInitialized) {
        await enableMocking()
      }
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router])

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
