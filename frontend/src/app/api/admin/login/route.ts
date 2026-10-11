import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    // Accepted admin email variations
    const allowedEmails = [
      'admin@xpig.me',
      'admin',
      'rafin@xpig.me',
      'rafin',
      'admin@admin.com',
      (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
    ].filter(Boolean);

    // Accepted admin password variations
    const allowedPasswords = [
      'Rafin@xpig',
      'rafin@xpig',
      'admin123',
      'admin',
      'Rafin123',
      'Admin@xpig',
      (process.env.ADMIN_PASSWORD || '').trim(),
    ].filter(Boolean);

    const isEmailValid = allowedEmails.includes(email);
    const isPasswordValid = allowedPasswords.includes(password);

    if (isEmailValid && isPasswordValid) {
      const cookieStore = await cookies();
      
      // 1. Set cookie in next/headers
      cookieStore.set('xpig_admin_session', 'authenticated_admin', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      // 2. Set cookie explicitly on NextResponse header
      const response = NextResponse.json({ 
        success: true, 
        message: 'Logged in successfully',
        token: 'authenticated_admin'
      });

      response.cookies.set('xpig_admin_session', 'authenticated_admin', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Invalid Admin Email or Password. Default: admin@xpig.me / Rafin@xpig' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Server error during authentication' },
      { status: 500 }
    );
  }
}
