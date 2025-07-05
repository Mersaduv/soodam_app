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
  const { worker } = await import('../mocks/browser')
  if (process.env.NODE_ENV !== 'development') {
    worker.start({
      onUnhandledRequest: 'bypass',
    })
    return
  }

  // `worker.start()` retu rns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start()
}

export default function App({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    const startMocking = async () => {
      await enableMocking()
    }

    startMocking()

    // Initialize MSW only in development mode and for admin registration-related pages
    if (typeof window !== 'undefined' && 
        process.env.NODE_ENV === 'development' && 
        window.location.pathname.includes('/admin/authentication/register')) {
      // Initialize MSW
      import('../mocks/browser')
        .then(({ worker }) => {
          // Start is now handled in browser.ts
        })
        .catch(error => {
          console.error('Error importing MSW worker:', error)
        })
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
