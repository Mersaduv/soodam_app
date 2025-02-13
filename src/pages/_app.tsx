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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    const startMocking = async () => {
      await enableMocking()
    }

    startMocking()

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <Provider store={store}>
      <Component {...pageProps} />
      {/* {!asPath.includes('/') ? <PageTransitionLoading /> : null} */}
      {/* <Alert /> */}
      <ToastContainer />
    </Provider>
  )
}
