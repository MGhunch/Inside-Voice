/**
 * middleware.js  (lives at the root of the project, next to package.json)
 * Protects all routes — redirects unauthenticated users to /login.
 * Role-based routing happens inside each page.
 */

import { auth } from './lib/auth';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Public routes — always allow
  const publicRoutes = ['/login', '/check-email', '/start'];
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

  if (isPublic) return;

  // Everything else requires a session
  if (!isLoggedIn) {
    // API routes get a JSON 401, not a login redirect
    if (pathname.startsWith('/api/')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  // Run middleware on all routes except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|inside_voice_Logo.png).*)'],
};
