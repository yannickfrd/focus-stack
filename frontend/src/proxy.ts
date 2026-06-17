import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const accept = request.headers.get('accept') ?? '';
  if (!accept.includes('application/json')) return NextResponse.next();

  const backendUrl = process.env.BACKEND_URL ?? 'http://127.0.0.1:8000';
  const { pathname, search } = request.nextUrl;
  return NextResponse.rewrite(`${backendUrl}${pathname}${search}`);
}

export const config = {
  matcher: ['/login', '/logout', '/register', '/tasks', '/tasks/:path+', '/token/:path+'],
};
