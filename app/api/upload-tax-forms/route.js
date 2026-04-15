import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { withAuth } from '@/lib/auth-utils';
import Airtable from 'airtable';

const resend = new Resend(process.env.RESEND_API_KEY);

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
);

/**
 * POST /api/upload-tax-forms
 * Sends tax forms to Angela via email and marks completion in Airtable
 */
export const POST = withAuth(async (req, session) => {
  try {
    const { personName, personId, files } = await req.json();

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (!personName) {
      return NextResponse.json({ error: 'Person name required' }, { status: 400 });
    }

    // Format name for subject line (uppercase)
    const nameUpper = personName.toUpperCase();

    // Prepare attachments for Resend
    const attachments = files.map((file) => ({
      filename: file.filename,
      content: file.content, // base64 string
    }));

    // Send email to Angela
    const { error: emailError } = await resend.emails.send({
      from: 'Inside Voice <hello@insidevoice.co.nz>',
      to: 'angela@hunch.co.nz',
      subject: `${nameUpper} TAX FORMS`,
      text: `Here's tax forms uploaded from ${personName}.`,
      attachments,
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    // Update Airtable to mark both IRD and KiwiSaver as complete
    if (personId) {
      try {
        await base('Spark Team').update(personId, {
          'IRD Complete': true,
          'KiwiSaver Complete': true,
        });
      } catch (airtableError) {
        // Log but don't fail - email was sent successfully
        console.error('Airtable update error:', airtableError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Upload tax forms error:', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
});
