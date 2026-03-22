/**
 * app/api/admins/route.js
 * Returns all active admins from Airtable
 */

import { getAllAdmins } from '@/lib/airtable';

export async function GET() {
  try {
    const admins = await getAllAdmins();
    return Response.json(admins);
  } catch (error) {
    console.error('Failed to fetch admins:', error);
    return Response.json({ error: 'Failed to fetch admins' }, { status: 500 });
  }
}
