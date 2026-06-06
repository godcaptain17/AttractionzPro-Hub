// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient }         from '@/lib/supabase';
import { signAdminJWT, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as { email: string; password: string };

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Use the secure validate_admin DB function (compares bcrypt hashes)
    const { data, error } = await supabase.rpc('validate_admin', {
      p_email:    email.trim().toLowerCase(),
      p_password: password,
    });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid credentials.' }, { status: 401 });
    }

    const admin = data[0] as { id: string; email: string };
    const token = await signAdminJWT(admin.id, admin.email);

    const response = NextResponse.json({ success: true, data: { email: admin.email } }, { status: 200 });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   60 * 60 * 8, // 8 hours
      path:     '/',
    });

    return response;
  } catch (err) {
    console.error('[Auth Login Error]', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, data: null }, { status: 200 });
  response.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
  return response;
}
