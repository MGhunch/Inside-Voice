/**
 * app/api/team/route.js
 * Returns Spark Team members from Airtable.
 * - Default: active only (Ongoing + Fixed Term)
 * - ?all=true: includes Finished (for historical calculations)
 * Accessible to any authenticated user.
 */

import { getSparkTeam, getAllSparkTeam } from '@/lib/airtable';
import { withAuth } from '@/lib/auth-utils';

async function handler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('all') === 'true';
    
    const team = includeAll ? await getAllSparkTeam() : await getSparkTeam();
    return Response.json(team);
  } catch (error) {
    console.error('Failed to fetch team:', error);
    return Response.json({ error: 'Failed to fetch team' }, { status: 500 });
  }
}

export const GET = withAuth(handler);
