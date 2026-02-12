// src/proxy.ts
import { jwtVerify } from 'jose';

/**
 * src/proxy.ts
 *
 * This file exports a named `proxy` function and a default export.
 * It enforces the same /admin JWT protection as your original middleware.
 *
 * Notes:
 * - This runs in the Web runtime; use Web Request/Response objects.
 * - It parses cookies from the request header to find `admin_token`.
 * - If the path does not start with /admin, it returns a 404 "Not proxied".
 */

function parseCookies(cookieHeader: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const name = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    cookies[name] = decodeURIComponent(value);
  }
  return cookies;
}

export async function proxy(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Only handle /admin routes here
    if (!pathname.startsWith('/admin')) {
      return new Response('Not proxied', { status: 404 });
    }

    // Allow the login page itself
    if (pathname === '/admin/login') {
      return new Response(null, { status: 204 });
    }

    // Parse cookies from header
    const cookieHeader = request.headers.get('cookie');
    const cookies = parseCookies(cookieHeader);
    const token = cookies['admin_token'];

    if (!token) {
      // Redirect to /admin/login
      const redirectUrl = new URL('/admin/login', request.url);
      return Response.redirect(redirectUrl.toString(), 302);
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? '');
      await jwtVerify(token, secret);
      // Token valid: allow request to continue (204 No Content indicates pass-through)
      return new Response(null, { status: 204 });
    } catch (err) {
      // Invalid token -> redirect to login
      const redirectUrl = new URL('/admin/login', request.url);
      return Response.redirect(redirectUrl.toString(), 302);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: 'Proxy error', message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}

export default proxy;
