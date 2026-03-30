/**
 * app/api/team/admin-update/route.js
 * Admin endpoint for updating Spark Team members.
 * Requires iv_admin or spark_admin role.
 */

import { updateSparkTeamMember } from '@/lib/airtable';
import { withAuth } from '@/lib/auth-utils';

async function handler(request, context, session) {
  try {
    // Check admin access
    const access = session.user.access;
    if (access !== 'iv_admin' && access !== 'spark_admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return Response.json({ error: 'Record ID required' }, { status: 400 });
    }

    // Map frontend field names to Airtable field names
    // Note: Status is computed in Airtable - don't try to write it directly
    const fields = {};
    
    if (updates.jobTitle !== undefined) fields['Job title'] = updates.jobTitle;
    if (updates.tribe !== undefined) fields['Tribe'] = updates.tribe;
    // if (updates.status !== undefined) fields['Status'] = updates.status; // Computed field - can't write
    if (updates.chapterLead !== undefined) fields['Chapter Lead'] = updates.chapterLead;
    if (updates.startDate !== undefined) fields['Start date'] = updates.startDate;
    if (updates.endDate !== undefined) fields['End date'] = updates.endDate || null;
    if (updates.salary !== undefined) fields['Salary'] = updates.salary;
    if (updates.hours !== undefined) fields['Hours'] = updates.hours;
    if (updates.kiwiSaver !== undefined) fields['Kiwisaver'] = updates.kiwiSaver;
    if (updates.allowances !== undefined) fields['Allowances'] = updates.allowances;
    if (updates.marginPercent !== undefined) fields['Margin %'] = updates.marginPercent / 100;
    
    // Handle effective dates for salary/hours changes
    // Note: These fields may not exist in Airtable yet - uncomment when added
    // if (updates.salaryEffective) fields['Salary Effective'] = updates.salaryEffective;
    // if (updates.hoursEffective) fields['Hours Effective'] = updates.hoursEffective;
    
    // Handle finishing status fields
    // Note: These fields may not exist in Airtable yet - uncomment when added
    // if (updates.holidayDays !== undefined) fields['Holiday Days'] = updates.holidayDays;
    // if (updates.holidayPayout !== undefined) fields['Holiday Payout'] = updates.holidayPayout;

    // Update Airtable
    const updated = await updateSparkTeamMember(id, fields);

    return Response.json(updated);
  } catch (error) {
    console.error('Failed to update team member:', error);
    return Response.json({ error: 'Failed to update team member' }, { status: 500 });
  }
}

export const POST = withAuth(handler);
