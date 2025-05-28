import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Only intercept API requests
  if (pathname.startsWith('/api/')) {
    // Handle OPTIONS requests (CORS preflight)
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    try {
      // Create URL for the API server with query parameters
      const apiUrl = new URL(`${pathname.replace(/^\/api/, '')}${search}`, 'http://194.5.193.119:8000/api');
      console.log('Proxying request to:', apiUrl.toString());
      
      // Clone headers to a mutable object
      const headers = new Headers(request.headers);
      
      // Forward the request to the API server
      const response = await fetch(apiUrl, {
        method: request.method,
        headers: headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
        redirect: 'follow',
      });
      
      // Get response data
      const data = await response.arrayBuffer();
      
      // Create headers for the response
      const responseHeaders = new Headers();
      
      // Copy original response headers
      response.headers.forEach((value, key) => {
        responseHeaders.set(key, value);
      });
      
      // Add CORS headers
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      // Create a NextResponse from the API response
      return new NextResponse(data, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (error) {
      console.error('API proxy error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch data from API' }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          } 
        }
      );
    }
  }

  return NextResponse.next();
}

// Run the middleware on all routes to make sure it catches API requests
export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};