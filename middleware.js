/**
 * middleware.js
 * Protects all routes — redirects unauthenticated users to the homepage.
 * Role-based access happens inside each page/route.
 */

import { auth } from './lib/auth';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Public routes — always allow
  const publicRoutes = ['/api/auth', '/start'];
  const isPublic = pathname === '/' || publicRoutes.some((route) => pathname.startsWith(route));

  if (isPublic) return;

  // Everything else requires a session
  if (!isLoggedIn) {
    // API routes get a JSON 401, not a redirect
    if (pathname.startsWith('/api/')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Pages redirect to homepage where the SignInModal lives
    return Response.redirect(new URL('/', req.url));
  }
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|favicon.svg|inside_voice_Logo.png).*)'],
};
