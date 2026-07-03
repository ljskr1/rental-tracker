import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const VALID_TOKENS = new Set([
  process.env.AUTH_TOKEN_USER1,
  process.env.AUTH_TOKEN_USER2,
].filter(Boolean));

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth for public routes
  if (
    pathname === '/auth' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Check for token in URL params or cookie
  const urlToken = request.nextUrl.searchParams.get('token');
  const cookieToken = request.cookies.get('auth_token')?.value;
  const token = urlToken || cookieToken;

  if (!token || !VALID_TOKENS.has(token)) {
    // Redirect to auth page with return URL
    const authUrl = new URL('/auth', request.url);
    authUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(authUrl);
  }

  // Valid token - set cookie for session persistence and add user header
  const response = NextResponse.next();
  response.headers.set('x-user-id', token);
  
  if (urlToken && !cookieToken) {
    response.cookies.set('auth_token', urlToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};