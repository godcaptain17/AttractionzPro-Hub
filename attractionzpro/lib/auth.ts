import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import type { AdminJWTPayload } from '@/types';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const COOKIE_NAME = 'apro_admin_token';
const TOKEN_EXPIRY = '8h';

export async function signAdminJWT(id: string, email: string): Promise<string> {
  return new SignJWT({ sub: id, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyAdminJWT(token: string): Promise<AdminJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AdminJWTPayload;
  } catch {
    return null;
  }
}

export async function getAdminFromRequest(req: NextRequest): Promise<AdminJWTPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminJWT(token);
}

export async function getAdminFromCookies(): Promise<AdminJWTPayload | null> {
  return null;
}

export { COOKIE_NAME };