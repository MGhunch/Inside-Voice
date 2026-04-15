/**
 * app/api/team/create/route.js
 * Create a new Spark Team member in Airtable.
 * Optionally sends welcome email via Resend.
 * 
 * Restricted to iv_admin only (Angela).
 */

import { createSparkTeamMember } from '@/lib/airtable';
import { withAuth, ROLES } from '@/lib/auth-utils';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function handler(request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.email) {
      return Response.json(
        { error: 'Name and email are required' }, 
        { status: 400 }
      );
    }

    // Create the record in Airtable
    const newPerson = await createSparkTeamMember(data);

    // Send welcome email if requested
    if (data.sendWelcomeEmail) {
      try {
        await resend.emails.send({
          from: 'Angela <angela@insidevoice.co.nz>',
          to: data.email,
          subject: 'Welcome to Spark with Inside Voice',
          html: `
            <div style="font-family: 'DM Sans', system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
              <p style="font-size: 16px; color: #1a1a1a; margin: 0 0 16px;">Hi there,</p>
              
              <p style="font-size: 16px; color: #1a1a1a; margin: 0 0 16px;">Congratulations on joining the Spark team.</p>
              
              <p style="font-size: 16px; color: #1a1a1a; margin: 0 0 16px;">By now you should be all set to do what you do best for Spark's customers and team.</p>
              
              <p style="font-size: 16px; color: #1a1a1a; margin: 0 0 16px;">Remember, even though your salary and leave is looked after by Inside Voice, you're still just like any other member of the Spark team.</p>
              
              <p style="font-size: 16px; color: #1a1a1a; margin: 0 0 24px;">You also have the Inside Voice portal to share your details, book leave and more.</p>
              
              <a href="https://spark.insidevoice.co.nz" style="display: inline-block; background: #00CEB4; color: #04342C; font-size: 16px; font-weight: 600; padding: 14px 28px; border-radius: 12px; text-decoration: none;">Get set up</a>
              
              <p style="font-size: 16px; color: #1a1a1a; margin: 24px 0 8px;">Get in touch with any questions,</p>
              <p style="font-size: 16px; color: #1a1a1a; margin: 0; font-weight: 500;">Angela</p>
            </div>
          `,
        });
      } catch (emailError) {
        // Log but don't fail the request if email fails
        console.error('Failed to send welcome email:', emailError);
      }
    }

    return Response.json(newPerson);
  } catch (error) {
    console.error('Failed to create team member:', error);
    return Response.json(
      { error: 'Failed to create team member' }, 
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler, { 
  roles: [ROLES.IV_ADMIN] 
});
