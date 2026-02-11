import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

// This is the key used to encrypt your session. 
// In a real app, you'd put this in your .env file.
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'unique-organizers-super-secret-key-2026'
);

export async function createSession(userId: string, role: string) {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
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

export async function logout() {
  (await cookies()).delete('session');
}