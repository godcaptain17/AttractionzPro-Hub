// middleware.ts — Protect all /admin/* routes except /admin/login
import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest }        from '@/lib/auth';

export const config = {
  matcher: ['/admin/:path*'],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow the login page through
  if (pathname === '/admin/login') return NextResponse.next();

  // Verify JWT from cookie
  const admin = await getAdminFromRequest(req);

  if (!admin) {
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
