import { setupWorker } from "msw";
import { handlers } from "./handlers";

// Create the worker for browser environment
export const worker = setupWorker(...handlers);

// Optional: Provide more helpful error handling during initialization
if (typeof window !== 'undefined') {
  worker.start({
    onUnhandledRequest: 'bypass', // Don't warn about unhandled requests (reduces console noise)
    quiet: true, // Reduce log noise
  }).catch(error => {
    console.error('Error starting MSW worker:', error);
  });
}
