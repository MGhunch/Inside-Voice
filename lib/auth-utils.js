/**
 * lib/auth-utils.js
 * Auth wrapper for API routes — session check + optional role enforcement.
 *
 * Usage:
 *   export const GET = withAuth(handler);                        // any logged-in user
 *   export const GET = withAuth(handler, { roles: [ROLES.IV_ADMIN] }); // role-restricted
 *
 * The handler receives (request, context, session) so you can use
 * session.user.access and session.user.name inside the route.
 */

import { auth } from './auth';

export const ROLES = {
  IV_ADMIN:      'iv_admin',      // Inside Voice team — full access
  SPARK_ADMIN:   'spark_admin',   // Spark admin — broad access
  CHAPTER_LEAD:  'chapter_lead',  // Chapter leads — team access
  EMPLOYEE:      'employee',      // Contractors — own data only
};

/**
 * Wraps a route handler with auth enforcement.
 *
 * @param {Function} handler  async (request, context, session) => Response
 * @param {Object}   options
 * @param {string[]} options.roles  If set, user must have one of these roles.
 */
export function withAuth(handler, { roles } = {}) {
  return async function (request, context) {
    const session = await auth();

    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (roles && !roles.includes(session.user.access)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    return handler(request, context, session);
  };
}
