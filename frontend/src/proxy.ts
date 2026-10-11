import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();
  const session = request.cookies.get('xpig_admin_session')?.value;
  const isAuthenticated = session === 'authenticated_admin';

  // 1. Handle admin.xpig.me subdomain
  if (hostname.startsWith('admin.xpig.me')) {
    // If requesting /login, rewrite to internal /admin/login route
    if (url.pathname === '/login') {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      url.pathname = '/admin/login';
      return NextResponse.rewrite(url);
    }

    // If requesting /admin/login directly
    if (url.pathname === '/admin/login') {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      return NextResponse.next();
    }

    // If not authenticated, redirect to /login
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Authenticated: rewrite root & subroutes to internal /admin structure
    if (!url.pathname.startsWith('/admin')) {
      url.pathname = `/admin${url.pathname === '/' ? '' : url.pathname}`;
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  // 2. Handle localhost or direct path /admin
  if (url.pathname.startsWith('/admin')) {
    if (url.pathname === '/admin/login') {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.next();
  }

  // Normal routing for public domain
  return NextResponse.next();
}

// Backwards compatibility export
export const middleware = proxy;

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
