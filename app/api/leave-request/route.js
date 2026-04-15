/**
 * app/api/leave-request/route.js
 * Sends leave request email to Angela
 */

import { withAuth } from '@/lib/auth-utils';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Format date for email display
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-NZ', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long',
    year: 'numeric'
  });
}

async function handler(request) {
  try {
    const body = await request.json();
    const { name, email, chapterLead, leaveType, fromDate, untilDate, workingDays, notes } = body;

    if (!name || !fromDate || !untilDate) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Send email to Angela
    await resend.emails.send({
      from: 'Inside Voice <hello@insidevoice.co.nz>',
      to: 'angela@hunch.co.nz',
      subject: `Leave request: ${name} — ${workingDays} day${workingDays === 1 ? '' : 's'}`,
      html: `
        <div style="font-family: 'DM Sans', system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
          
          <div style="background: #584E9F; border-radius: 16px 16px 0 0; padding: 24px; text-align: center;">
            <h2 style="font-size: 22px; color: #ffffff; margin: 0; font-weight: 600;">
              Leave Request
            </h2>
          </div>
          
          <div style="background: #ffffff; border: 1px solid #E8E8EC; border-top: none; border-radius: 0 0 16px 16px; padding: 24px;">
            
            <div style="background: #fafafa; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
              <p style="font-size: 18px; color: #1a1a1a; margin: 0 0 4px; font-weight: 600;">
                ${name}
              </p>
              <p style="font-size: 14px; color: #666; margin: 0;">
                ${email || 'No email provided'}
              </p>
              ${chapterLead ? `
                <p style="font-size: 13px; color: #888; margin: 12px 0 0; padding-top: 12px; border-top: 1px solid #E8E8EC;">
                  Chapter lead: <strong style="color: #444;">${chapterLead}</strong>
                </p>
              ` : ''}
            </div>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #E8E8EC; color: #888;">Type</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #E8E8EC; color: #1a1a1a; text-align: right; font-weight: 500;">${leaveType}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #E8E8EC; color: #888;">From</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #E8E8EC; color: #1a1a1a; text-align: right;">${formatDate(fromDate)}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #E8E8EC; color: #888;">Until</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #E8E8EC; color: #1a1a1a; text-align: right;">${formatDate(untilDate)}</td>
              </tr>
              <tr style="background: linear-gradient(135deg, #00CEB4 0%, #00B89F 100%);">
                <td style="padding: 14px; color: #ffffff; font-weight: 600; border-radius: 0 0 0 8px;">Working days</td>
                <td style="padding: 14px; color: #ffffff; text-align: right; font-size: 20px; font-weight: 700; border-radius: 0 0 8px 0;">${workingDays}</td>
              </tr>
            </table>
            
            ${notes ? `
              <div style="margin-top: 20px; padding: 16px; background: #fafafa; border-radius: 12px;">
                <p style="font-size: 12px; color: #888; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.5px;">Notes</p>
                <p style="font-size: 14px; color: #1a1a1a; margin: 0; line-height: 1.5;">${notes}</p>
              </div>
            ` : ''}
            
          </div>
          
          <p style="font-size: 13px; color: #888; margin: 20px 0 0; text-align: center;">
            Sent from Inside Voice Hub
          </p>
          
        </div>
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Failed to send leave request:', error);
    return Response.json({ error: 'Failed to send request' }, { status: 500 });
  }
}

export const POST = withAuth(handler);
