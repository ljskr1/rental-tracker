import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const VALID_TOKEN = process.env.AUTH_TOKEN;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  const urlToken = request.nextUrl.searchParams.get('token');
  const cookieToken = request.cookies.get('auth_token')?.value;
  const token = urlToken || cookieToken;

  if (!token || token !== VALID_TOKEN) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  if (urlToken && !cookieToken) {
    response.cookies.set('auth_token', urlToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
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