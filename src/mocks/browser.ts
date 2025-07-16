import { setupWorker } from 'msw'
import { handlers } from './handlers'

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...handlers)

// Make sure the worker is initialized
if (typeof window !== 'undefined') {
  // Check if we're already running
  if (!window.mswWorkerInitialized) {
    worker.start({
      // Disable service worker registration in development
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
      // Log any request errors
      onUnhandledRequest: 'bypass',
    }).then(() => {
      console.log('%c[MSW] Mock API Server running', 'color: green; font-weight: bold;');
      window.mswWorkerInitialized = true;
    }).catch(error => {
      console.error('MSW worker start failed:', error);
    });
  }
}

// Add to window for debugging
if (typeof window !== 'undefined') {
  window.msw = { worker, handlers };
}

// Add TypeScript declaration for window
declare global {
  interface Window {
    mswWorkerInitialized?: boolean;
    msw?: {
      worker: typeof worker;
      handlers: typeof handlers;
    };
  }
}
