/**
 * app/api/admins/route.js
 * Returns all active admins from Airtable.
 * Restricted to iv_admin only.
 */

import { getAllAdmins } from '@/lib/airtable';
import { withAuth, ROLES } from '@/lib/auth-utils';

async function handler() {
  try {
    const admins = await getAllAdmins();
    return Response.json(admins);
  } catch (error) {
    console.error('Failed to fetch admins:', error);
    return Response.json({ error: 'Failed to fetch admins' }, { status: 500 });
  }
}

export const GET = withAuth(handler, {
  roles: [ROLES.IV_ADMIN],
});
