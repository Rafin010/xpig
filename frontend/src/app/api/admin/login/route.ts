import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const validEmail = process.env.ADMIN_EMAIL || 'admin@xpig.me';
    const validPassword = process.env.ADMIN_PASSWORD || 'Rafin@xpig';

    if (email === validEmail && password === validPassword) {
      const cookieStore = await cookies();
      
      // Set secure admin session cookie (valid for 7 days)
      cookieStore.set('xpig_admin_session', 'authenticated_admin', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({ success: true, message: 'Logged in successfully' });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid Admin Email or Password' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Server error during authentication' },
      { status: 500 }
    );
  }
}
