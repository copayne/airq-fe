import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? '';
  const { pathname } = request.nextUrl;

  // Only rewrite the root path based on subdomain
  if (pathname === '/') {
    if (hostname.startsWith('news.')) {
      return NextResponse.rewrite(new URL('/news', request.url));
    }
    return NextResponse.rewrite(new URL('/dash', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/',
};
