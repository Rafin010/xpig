import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  // If visiting admin.xpig.me, map it to the /admin route system and protect with Basic Auth
  if (hostname.startsWith('admin.xpig.me')) {
    
    // BASIC AUTH CHECK
    const basicAuth = request.headers.get('authorization')
    
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1]
      const [user, pwd] = atob(authValue).split(':')
      
      const validUser = process.env.ADMIN_EMAIL || 'info@xpig.me';
      const validPwd = process.env.ADMIN_PASSWORD || 'Rafin@xpig';

      if (user === validUser && pwd === validPwd) {
        // Auth successful, rewrite to /admin
        if (!url.pathname.startsWith('/admin')) {
          url.pathname = `/admin${url.pathname === '/' ? '' : url.pathname}`;
          return NextResponse.rewrite(url);
        }
        return NextResponse.next();
      }
    }

    // Auth failed or missing, prompt Basic Auth
    return new NextResponse('Auth Required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="XPIG Admin Secure Area"'
      }
    });
  }

  // If someone tries to access /admin from the main domain, block them
  if (url.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Normal routing for main domain
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
