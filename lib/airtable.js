/**
 * lib/airtable.js
 * Airtable client and data fetching for Inside Voice Hub
 */

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

const headers = {
  Authorization: `Bearer ${AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json',
};

// ─── Table names ────────────────────────────────────────────────────────────

const TABLES = {
  SPARK_TEAM: 'Spark',
  ADMINS: 'Admins',
  PAYMENTS: 'Payments',
  PASSCODES: 'Passcodes',
};

// ─── Core fetch helper ───────────────────────────────────────────────────────

async function airtableFetch(table, params = {}) {
  const url = new URL(`${BASE_URL}/${encodeURIComponent(table)}`);

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => url.searchParams.append(key, v));
    } else {
      url.searchParams.set(key, value);
    }
  });

  const res = await fetch(url.toString(), { headers });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Airtable error: ${error.error?.message || res.statusText}`);
  }

  return res.json();
}

// Paginate through all records (Airtable returns max 100 per page)
async function fetchAllRecords(table, params = {}) {
  const records = [];
  let offset;

  do {
    const data = await airtableFetch(table, { ...params, ...(offset ? { offset } : {}) });
    records.push(...data.records);
    offset = data.offset;
  } while (offset);

  return records;
}

// ─── Spark Team ──────────────────────────────────────────────────────────────

/**
 * Map a raw Airtable Spark Team record to the shape the app uses
 */
function mapSparkTeamRecord(record) {
  const f = record.fields;
  return {
    id: record.id,
    name: f['Name'] || '',
    jobTitle: f['Job title'] || '',
    email: f['Email'] || '',
    tribe: f['Tribe'] || '',
    chapterLead: f['Chapter Lead'] || '',
    startDate: f['Start date'] || '',
    endDate: f['End date'] || '',
    status: f['Status'] || '',
    access: f['Access'] || 'Employee',
    // Financial fields
    salary: parseCurrency(f['Salary']),
    hours: f['Hours'] || 40,
    kiwiSaver: f['Kiwisaver'] === true,
    allowances: parseCurrency(f['Allowances']),
    marginPercent: parsePercent(f['Margin %']),
    // Computed fields from Airtable (used as reference)
    monthlySalary: parseCurrency(f['Monthly Salary']),
    billable: parseCurrency(f['Billable']),
    totalToBill: parseCurrency(f['Total to Bill']),
    notes: f['Notes'] || '',
    setupFee: f['Set up fee'] || 0,
    adminFee: parseCurrency(f['Admin fee']),
  };
}

/**
 * Get all active Spark Team members (excludes Finished)
 */
export async function getSparkTeam() {
  const records = await fetchAllRecords(TABLES.SPARK_TEAM, {
    filterByFormula: "NOT({Status} = 'Finished')",
  });
  return records.map(mapSparkTeamRecord);
}

/**
 * Get ALL Spark Team members including Finished (for historical calculations)
 */
export async function getAllSparkTeam() {
  const records = await fetchAllRecords(TABLES.SPARK_TEAM);
  return records.map(mapSparkTeamRecord);
}

/**
 * Get a single Spark Team member by email
 */
export async function getSparkTeamMemberByEmail(email) {
  const data = await airtableFetch(TABLES.SPARK_TEAM, {
    filterByFormula: `{Email} = '${email}'`,
    maxRecords: 1,
  });
  if (!data.records.length) return null;
  return mapSparkTeamRecord(data.records[0]);
}

/**
 * Get Spark Team members filtered by tribe
 */
export async function getSparkTeamByTribe(tribe) {
  const data = await airtableFetch(TABLES.SPARK_TEAM, {
    filterByFormula: `AND({Tribe} = '${tribe}', NOT({Status} = 'Finished'))`,
  });
  return data.records.map(mapSparkTeamRecord);
}

/**
 * Update a Spark Team member record
 */
export async function updateSparkTeamMember(recordId, fields) {
  const url = `${BASE_URL}/${encodeURIComponent(TABLES.SPARK_TEAM)}/${recordId}`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Airtable update error: ${error.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return mapSparkTeamRecord(data);
}

// ─── Admins ──────────────────────────────────────────────────────────────────

/**
 * Map a raw Airtable Admins record to the shape the app uses
 */
function mapAdminRecord(record) {
  const f = record.fields;
  return {
    id: record.id,
    name: f['Name'] || '',
    email: f['Email'] || '',
    access: f['Access'] || '',
    active: f['Active'] === true,
  };
}

/**
 * Get an admin by email (active only)
 */
export async function getAdminByEmail(email) {
  const data = await airtableFetch(TABLES.ADMINS, {
    filterByFormula: `AND({Email} = '${email}', {Active} = 1)`,
    maxRecords: 1,
  });
  if (!data.records.length) return null;
  return mapAdminRecord(data.records[0]);
}

/**
 * Get all active admins
 */
export async function getAllAdmins() {
  const records = await fetchAllRecords(TABLES.ADMINS, {
    filterByFormula: '{Active} = 1',
  });
  return records.map(mapAdminRecord);
}

// ─── Auth lookup ─────────────────────────────────────────────────────────────

/**
 * Look up a user by email across both tables.
 * Returns { name, email, access } or null if not found.
 *
 * Check order:
 * 1. Admins table (chapter leads, spark admins, iv admins)
 * 2. Spark Team table (employees)
 */
export async function getUserByEmail(email) {
  // Check Admins first
  const admin = await getAdminByEmail(email);
  if (admin) {
    return {
      name: admin.name,
      email: admin.email,
      access: admin.access, // 'iv_admin' | 'spark_admin' | 'chapter_lead'
    };
  }

  // Fall back to Spark Team
  const member = await getSparkTeamMemberByEmail(email);
  if (member) {
    return {
      name: member.name,
      email: member.email,
      access: 'employee',
    };
  }

  return null;
}

// ─── Payments ────────────────────────────────────────────────────────────────

/**
 * Map a raw Airtable Payments record to the shape the app uses
 * Note: amounts are now calculated from Spark Team, not stored here
 */
function mapPaymentRecord(record) {
  const f = record.fields;
  return {
    id: record.id,
    month: (f['month'] || '').toLowerCase(),
    fiscalYear: f['fiscal_year'] || '',
    status: f['status'] || 'pending',
  };
}

/**
 * Get all payment records, optionally filtered by fiscal year
 */
export async function getPayments(fiscalYear = null) {
  const params = fiscalYear
    ? { filterByFormula: `{fiscal_year} = '${fiscalYear}'` }
    : {};
  const records = await fetchAllRecords(TABLES.PAYMENTS, params);
  return records.map(mapPaymentRecord);
}

/**
 * Update payment status for a specific month
 */
export async function updatePaymentStatus(recordId, status) {
  const url = `${BASE_URL}/${encodeURIComponent(TABLES.PAYMENTS)}/${recordId}`;
  
  const res = await fetch(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ fields: { status } }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Airtable update error: ${error.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return mapPaymentRecord(data);
}

/**
 * Create a payment record for a month (status only)
 */
export async function createPaymentRecord(month, fiscalYear, status = 'pending') {
  const url = `${BASE_URL}/${encodeURIComponent(TABLES.PAYMENTS)}`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      fields: { month, fiscal_year: fiscalYear, status },
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Airtable create error: ${error.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return mapPaymentRecord(data);
}

// ─── Passcodes ───────────────────────────────────────────────────────────────

/**
 * Save a new passcode for an email address.
 * Expires in 15 minutes. Any previous codes for this email remain in the table
 * but will be ignored — they'll either be expired or already used.
 */
export async function savePasscode(email, code) {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  const url = `${BASE_URL}/${encodeURIComponent(TABLES.PASSCODES)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      fields: { email, code, expires_at: expiresAt },
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Airtable error: ${error.error?.message || res.statusText}`);
  }

  return res.json();
}

/**
 * Find a valid (unused, unexpired) passcode for this email + code combination.
 * Returns the record (with id) or null.
 */
export async function getValidPasscode(email, code) {
  const data = await airtableFetch(TABLES.PASSCODES, {
    filterByFormula: `AND({email}='${email}', {code}='${code}', NOT({used}))`,
    maxRecords: 1,
  });

  if (!data.records.length) return null;

  const record = data.records[0];
  const expiresAt = new Date(record.fields.expires_at);

  // Check expiry in JS — expires_at is stored as a text ISO string
  if (Date.now() > expiresAt.getTime()) return null;

  return { id: record.id, email: record.fields.email };
}

/**
 * Mark a passcode as used so it can't be reused.
 */
export async function markPasscodeUsed(recordId) {
  const url = `${BASE_URL}/${encodeURIComponent(TABLES.PASSCODES)}/${recordId}`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ fields: { used: true } }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Airtable error: ${error.error?.message || res.statusText}`);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseCurrency(value) {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  return parseInt(value.replace(/[$,]/g, ''), 10) || 0;
}

function parsePercent(value) {
  if (!value) return 5;
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 5;
  return parseInt(value.replace('%', ''), 10) || 5;
}
