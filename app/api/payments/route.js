/**
 * app/api/payments/route.js
 * Payment status tracking.
 * GET: Returns payment statuses by month
 * POST: Create a new payment status record
 * PATCH: Update an existing payment status
 * Restricted to iv_admin and spark_admin.
 */

import { getPayments, updatePaymentStatus, createPaymentRecord } from '@/lib/airtable';
import { withAuth, ROLES } from '@/lib/auth-utils';

async function getHandler(request) {
  const { searchParams } = new URL(request.url);
  const fiscalYear = searchParams.get('fiscalYear');

  try {
    const records = await getPayments(fiscalYear);

    // Return as array — component will convert to lookup
    return Response.json(records);
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    return Response.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

async function postHandler(request) {
  try {
    const { month, fiscalYear, status } = await request.json();
    
    if (!month || !fiscalYear) {
      return Response.json({ error: 'month and fiscalYear required' }, { status: 400 });
    }
    
    const record = await createPaymentRecord(month, fiscalYear, status || 'pending');
    return Response.json(record);
  } catch (error) {
    console.error('Failed to create payment:', error);
    return Response.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}

async function patchHandler(request) {
  try {
    const { id, status } = await request.json();
    
    if (!id || !status) {
      return Response.json({ error: 'id and status required' }, { status: 400 });
    }
    
    const record = await updatePaymentStatus(id, status);
    return Response.json(record);
  } catch (error) {
    console.error('Failed to update payment:', error);
    return Response.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, {
  roles: [ROLES.IV_ADMIN, ROLES.SPARK_ADMIN],
});

export const POST = withAuth(postHandler, {
  roles: [ROLES.IV_ADMIN, ROLES.SPARK_ADMIN],
});

export const PATCH = withAuth(patchHandler, {
  roles: [ROLES.IV_ADMIN, ROLES.SPARK_ADMIN],
});
