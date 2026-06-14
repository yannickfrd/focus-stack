import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PAGES = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PAGES.includes(pathname);
  const hasRefreshToken = request.cookies.has('refresh_token');

  if (!hasRefreshToken && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (hasRefreshToken && isPublic) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
