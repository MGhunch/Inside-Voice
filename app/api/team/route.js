/**
 * app/api/team/route.js
 * Returns all active Spark Team members from Airtable
 */

import { getSparkTeam } from '@/lib/airtable';

export async function GET() {
  try {
    const team = await getSparkTeam();
    return Response.json(team);
  } catch (error) {
    console.error('Failed to fetch team:', error);
    return Response.json({ error: 'Failed to fetch team' }, { status: 500 });
  }
}
