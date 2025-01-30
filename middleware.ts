import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the user is authenticated
  const isAuthenticated = request.cookies.get('auth')?.value === 'true';
  
  // If the user is not authenticated and trying to access protected routes
  if (!isAuthenticated && !request.nextUrl.pathname.startsWith('/login')) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If the user is authenticated and trying to access login page
  if (isAuthenticated && request.nextUrl.pathname.startsWith('/login')) {
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 