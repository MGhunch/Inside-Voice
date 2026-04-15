/**
 * app/api/team/update/route.js
 * Updates the current user's personal details.
 * Saves to Airtable (except bank account) and emails summary to Angela.
 */

import { getSparkTeamMemberByEmail, updateSparkTeamMember } from '@/lib/airtable';
import { withAuth } from '@/lib/auth-utils';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Map form fields to Airtable field names (NO bank account)
    const fields = {};
    
    if (body.firstName !== undefined) fields['First Name'] = body.firstName;
    if (body.lastName !== undefined) fields['Last Name'] = body.lastName;
    if (body.firstName && body.lastName) fields['Name'] = `${body.firstName} ${body.lastName}`;
    if (body.email !== undefined) fields['Email'] = body.email;
    if (body.address !== undefined) fields['Address'] = body.address;
    if (body.dateOfBirth !== undefined) fields['Date of Birth'] = body.dateOfBirth;
    if (body.mobile !== undefined) fields['Mobile'] = body.mobile;
    // Bank account is NOT stored in Airtable — only emailed to Angela
    
    // Mark personal details as complete
    fields['Personal Details Complete'] = true;

    // Update Airtable
    const updated = await updateSparkTeamMember(member.id, fields);

    // Send summary email to Angela (includes bank account)
    try {
      const fullName = `${body.firstName} ${body.lastName}`;
      await resend.emails.send({
        from: 'Inside Voice <hello@insidevoice.co.nz>',
        to: 'angela@hunch.co.nz',
        subject: `Personal details submitted: ${fullName}`,
        html: `
          <div style="font-family: 'DM Sans', system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
            <h2 style="font-size: 24px; color: #1a1a1a; margin: 0 0 24px;">Personal details submitted</h2>
            
            <p style="font-size: 16px; color: #1a1a1a; margin: 0 0 24px;">
              <strong>${fullName}</strong> has submitted their personal details.
            </p>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #E8E8EC; color: #888;">Name</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #E8E8EC; color: #1a1a1a; text-align: right;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #E8E8EC; color: #888;">Email</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #E8E8EC; color: #1a1a1a; text-align: right;">${body.email}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #E8E8EC; color: #888;">Address</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #E8E8EC; color: #1a1a1a; text-align: right;">${body.address}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #E8E8EC; color: #888;">Date of birth</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #E8E8EC; color: #1a1a1a; text-align: right;">${body.dateOfBirth}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #E8E8EC; color: #888;">Mobile</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #E8E8EC; color: #1a1a1a; text-align: right;">${body.mobile}</td>
              </tr>
              <tr style="background: #FEC514; color: #412402;">
                <td style="padding: 12px; font-weight: 600;">Bank account</td>
                <td style="padding: 12px; text-align: right; font-weight: 600;">${body.bankAccount}</td>
              </tr>
            </table>
            
            <p style="font-size: 14px; color: #888; margin: 24px 0 0;">
              Bank account is not stored in Airtable — please enter into Smartly directly.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send Angela notification:', emailError);
      // Don't fail the request if email fails
    }

    return Response.json(updated);
  } catch (error) {
    console.error('Failed to update user:', error);
    return Response.json({ error: 'Failed to update user data' }, { status: 500 });
  }
}

export const POST = withAuth(handler);
