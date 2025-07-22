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
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }

  if (window.mswWorkerInitialized) {
    console.log('MSW already initialized')
    return Promise.resolve()
  }

  try {
    const { worker } = await import('../mocks/browser')
    // Start MSW with improved settings
    return worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
        options: {
          scope: '/'
        }
      }
    }).then(() => {
      console.log('%c[MSW] Mock API Server running', 'color: green; font-weight: bold')
      window.mswWorkerInitialized = true
    })
  } catch (error) {
    console.error('Failed to initialize MSW:', error)
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

    // Always initialize MSW
    enableMocking()

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
