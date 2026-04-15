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
          cc: 'angela@insidevoice.co.nz',
          subject: 'Welcome to Spark',
          html: `
            <div style="font-family: 'DM Sans', system-ui, sans-serif; max-width: 520px; margin: 0 auto;">
              <!-- Header with logo -->
              <div style="padding: 28px 32px 24px; border-bottom: 1px solid #E8E8EC;">
                <img src="https://spark.insidevoice.co.nz/inside_voice_Logo.png" alt="Inside Voice" width="140" height="56" style="display: block;" />
              </div>
              
              <!-- Body -->
              <div style="padding: 32px;">
                <p style="font-size: 16px; color: #1a1a1a; line-height: 1.7; margin: 0 0 20px;">Hi there,</p>
                
                <p style="font-size: 16px; color: #1a1a1a; line-height: 1.7; margin: 0 0 20px;">Congratulations on joining the Spark team.</p>
                
                <p style="font-size: 16px; color: #1a1a1a; line-height: 1.7; margin: 0 0 20px;">By now, your Chapter Lead should have shared what you need to know to do what you do best for Spark's customers and team.</p>
                
                <p style="font-size: 16px; color: #1a1a1a; line-height: 1.7; margin: 0 0 28px;">Use the portal below to share your details, book leave and more.</p>
                
                <a href="https://spark.insidevoice.co.nz" style="display: inline-block; background: #00CEB4; color: #ffffff; font-size: 16px; font-weight: 600; padding: 14px 28px; border-radius: 8px; text-decoration: none;">Get set up</a>
                
                <p style="font-size: 16px; color: #1a1a1a; line-height: 1.7; margin: 32px 0 8px;">Get in touch with any questions,</p>
                <p style="font-size: 16px; color: #1a1a1a; margin: 0; font-weight: 500;">Angela</p>
                <p style="font-size: 14px; color: #888780; margin: 4px 0 0;">Inside Voice</p>
              </div>
              
              <!-- Footer with logo -->
              <div style="padding: 20px 32px; background: #F5F5F5; border-top: 1px solid #E8E8EC; text-align: center;">
                <img src="https://spark.insidevoice.co.nz/inside_voice_Logo.png" alt="Inside Voice" width="100" height="40" style="display: inline-block; opacity: 0.6;" />
              </div>
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
