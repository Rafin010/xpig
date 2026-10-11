import { NextResponse } from 'next/server';

// In-memory rate limiting map: ip -> { count: number, lockedUntil: number }
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown-client';
    const now = Date.now();
    const clientRecord = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };

    // Check if client is locked
    if (clientRecord.lockedUntil > now) {
      const remainingSeconds = Math.ceil((clientRecord.lockedUntil - now) / 1000);
      return NextResponse.json(
        {
          success: false,
          locked: true,
          remainingSeconds,
          message: `Too many failed attempts. Login is locked for ${remainingSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

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
      // Clear failed attempts on success
      loginAttempts.delete(ip);

      const response = NextResponse.json({
        success: true,
        message: 'Authenticated successfully',
        token: 'authenticated_admin',
        role: 'superuser',
      });

      response.cookies.set('xpig_admin_session', 'authenticated_admin', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return response;
    }

    // Increment failed attempts
    const newCount = clientRecord.count + 1;
    let locked = false;
    let lockedUntil = 0;

    if (newCount >= 3) {
      locked = true;
      lockedUntil = now + 60 * 1000; // 60 seconds lockout
      loginAttempts.set(ip, { count: 0, lockedUntil });
      return NextResponse.json(
        {
          success: false,
          locked: true,
          remainingSeconds: 60,
          message: 'Security Alert: 3 failed login attempts. Access is locked for 60 seconds.',
        },
        { status: 429 }
      );
    }

    loginAttempts.set(ip, { count: newCount, lockedUntil: 0 });

    return NextResponse.json(
      {
        success: false,
        failedAttempts: newCount,
        remainingAttempts: 3 - newCount,
        message: `Invalid email or password. Attempt ${newCount} of 3 before 60-second lockout.`,
      },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error during authentication' },
      { status: 500 }
    );
  }
}
