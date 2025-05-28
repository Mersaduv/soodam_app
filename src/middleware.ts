import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Only intercept API requests
  if (pathname.startsWith('/api/')) {
    // Create a URL for the API server with query parameters
    const apiUrl = new URL(`${pathname}${search}`, 'http://194.5.193.119:8000');
    
    // Clone the request to forward
    const apiRequest = new Request(apiUrl, {
      headers: request.headers,
      method: request.method,
      body: request.body,
      redirect: 'follow',
    });

    try {
      // Forward the request to the API server
      const response = await fetch(apiRequest);
      
      // Get response data
      const data = await response.blob();
      
      // Create headers for the response
      const responseHeaders = new Headers(response.headers);
      
      // Add CORS headers to allow the frontend to access the response
      responseHeaders.set('Access-Control-Allow-Origin', 'https://soodam-app.vercel.app');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      // Create a NextResponse from the API response
      const apiResponse = new NextResponse(data, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
      
      return apiResponse;
    } catch (error) {
      console.error('API proxy error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch data from API' }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://soodam-app.vercel.app',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          } 
        }
      );
    }
  }

  return NextResponse.next();
}

// Only run the middleware on API routes
export const config = {
  matcher: '/api/:path*',
};