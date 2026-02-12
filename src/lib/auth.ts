import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'unique-organizers-2026-secure-key'
);

export async function createSession(userId: string, role: string) {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d') // Persistent for 30 days
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
    sameSite: 'lax'
  });
}

export async function getSession() {
  const session = (await cookies()).get('session')?.value;
  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, SECRET_KEY);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function isAdmin() {
  const session = await getSession();
  return session?.role === 'ADMIN';
}

export async function logout() {
  (await cookies()).delete('session');
}