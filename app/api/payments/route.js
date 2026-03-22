/**
 * app/api/payments/route.js
 * Returns payment history from Airtable, keyed by month for easy lookup.
 * Restricted to iv_admin and spark_admin.
 */

import { getPayments } from '@/lib/airtable';
import { withAuth, ROLES } from '@/lib/auth-utils';

async function handler(request) {
  const { searchParams } = new URL(request.url);
  const fiscalYear = searchParams.get('fiscalYear');

  // Validate fiscalYear — allow "2024-2025" style values only
  if (fiscalYear && !/^\d{4}(-\d{4})?$/.test(fiscalYear)) {
    return Response.json({ error: 'Invalid fiscalYear parameter' }, { status: 400 });
  }

  try {
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

export const GET = withAuth(handler, {
  roles: [ROLES.IV_ADMIN, ROLES.SPARK_ADMIN],
});
