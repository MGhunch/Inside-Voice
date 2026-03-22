/**
 * app/api/payments/route.js
 * Returns payment history from Airtable, keyed by month for easy lookup
 */

import { getPayments } from '@/lib/airtable';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fiscalYear = searchParams.get('fiscalYear');
    const records = await getPayments(fiscalYear);

    // Key by month so PaymentCalendar can do payments['jul'] etc.
    const byMonth = records.reduce((acc, record) => {
      acc[record.month] = record;
      return acc;
    }, {});

    return Response.json(byMonth);
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    return Response.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
