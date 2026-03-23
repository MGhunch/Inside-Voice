/**
 * app/api/team/me/route.js
 * Returns the current user's own Spark Team record.
 * Only accessible to authenticated users.
 */

import { getSparkTeamMemberByEmail } from '@/lib/airtable';
import { withAuth } from '@/lib/auth-utils';

async function handler(request, context, session) {
  try {
    const email = session.user.email;
    
    if (!email) {
      return Response.json({ error: 'No email in session' }, { status: 400 });
    }

    const member = await getSparkTeamMemberByEmail(email);
    
    if (!member) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json(member);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return Response.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}

export const GET = withAuth(handler);
