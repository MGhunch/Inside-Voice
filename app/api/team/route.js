/**
 * app/api/team/route.js
 * Returns all active Spark Team members from Airtable.
 * Accessible to any authenticated user.
 */

import { getSparkTeam } from '@/lib/airtable';
import { withAuth } from '@/lib/auth-utils';

async function handler() {
  try {
    const team = await getSparkTeam();
    return Response.json(team);
  } catch (error) {
    console.error('Failed to fetch team:', error);
    return Response.json({ error: 'Failed to fetch team' }, { status: 500 });
  }
}

export const GET = withAuth(handler);
