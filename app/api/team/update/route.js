/**
 * app/api/team/update/route.js
 * Updates the current user's personal details.
 * Sends notification email to Angela.
 */

import { getSparkTeamMemberByEmail, updateSparkTeamMember } from '@/lib/airtable';
import { withAuth } from '@/lib/auth-utils';

async function handler(request, context, session) {
  try {
    const email = session.user.email;
    const body = await request.json();
    
    if (!email) {
      return Response.json({ error: 'No email in session' }, { status: 400 });
    }

    // Get current record to get the ID
    const member = await getSparkTeamMemberByEmail(email);
    
    if (!member) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Map form fields to Airtable field names
    const fields = {};
    
    if (body.firstName !== undefined) fields['First Name'] = body.firstName;
    if (body.lastName !== undefined) fields['Last Name'] = body.lastName;
    if (body.firstName && body.lastName) fields['Name'] = `${body.firstName} ${body.lastName}`;
    if (body.email !== undefined) fields['Email'] = body.email;
    if (body.address !== undefined) fields['Address'] = body.address;
    if (body.dateOfBirth !== undefined) fields['Date of Birth'] = body.dateOfBirth;
    if (body.mobile !== undefined) fields['Mobile'] = body.mobile;
    if (body.bankAccount !== undefined) fields['Bank Account'] = body.bankAccount;
    
    // Mark personal details as complete
    fields['Personal Details Complete'] = true;

    // Update Airtable
    const updated = await updateSparkTeamMember(member.id, fields);

    // TODO: Send email notification to Angela
    // await sendEmail({
    //   to: 'angela@hunch.co.nz',
    //   subject: `Personal details updated: ${body.firstName} ${body.lastName}`,
    //   body: `${body.firstName} ${body.lastName} has updated their personal details.`,
    // });

    return Response.json(updated);
  } catch (error) {
    console.error('Failed to update user:', error);
    return Response.json({ error: 'Failed to update user data' }, { status: 500 });
  }
}

export const POST = withAuth(handler);
