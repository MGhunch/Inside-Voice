/**
 * app/api/auth/send-passcode/route.js
 * Generates a word-pair passcode, saves it to Airtable, emails it via Resend.
 * Public route — no auth required (it's part of the sign-in flow).
 */

import { getUserByEmail, savePasscode } from '@/lib/airtable';
import { generateWordPair } from '@/lib/wordpairs';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalised = email.trim().toLowerCase();

    // Check user exists — but always return ok: true to avoid email enumeration
    const user = await getUserByEmail(normalised);
    if (!user) {
      return Response.json({ ok: true });
    }

    const code = generateWordPair();
    await savePasscode(normalised, code);

    // Send via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Inside Voice <hello@insidevoice.co.nz>',
        to: normalised,
        subject: 'Your sign-in passcode',
        html: buildEmail(user.name, code),
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('Resend error:', err);
      return Response.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error('send-passcode error:', error);
    return Response.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

function buildEmail(name, code) {
  const firstName = name?.split(' ')[0] || 'there';
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
      <img src="https://insidevoice.co.nz/inside_voice_Logo.png" alt="Inside Voice" style="height: 24px; margin-bottom: 32px; opacity: 0.7;" />
      <p style="font-size: 16px; color: #444; margin: 0 0 8px;">Hi ${firstName},</p>
      <p style="font-size: 16px; color: #444; margin: 0 0 32px;">Here's your sign-in passcode:</p>
      <div style="background: #F8F8FA; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
        <span style="font-size: 28px; font-weight: 600; color: #584E9F; letter-spacing: 0.02em;">${code}</span>
      </div>
      <p style="font-size: 14px; color: #999; margin: 0;">This code expires in 15 minutes. If you didn't request this, you can ignore it.</p>
      <hr style="border: none; border-top: 1px solid #E8E8EC; margin: 32px 0;" />
      <p style="font-size: 12px; color: #ccc; margin: 0;">Inside Voice — The paperwork people.</p>
    </div>
  `;
}
