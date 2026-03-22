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
 * Get all active Spark Team members
 */
export async function getSparkTeam() {
  const records = await fetchAllRecords(TABLES.SPARK_TEAM, {
    filterByFormula: "NOT({Status} = 'Finished')",
  });
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
 */
function mapPaymentRecord(record) {
  const f = record.fields;
  return {
    id: record.id,
    month: (f['month'] || '').toLowerCase(),
    fiscalYear: f['fiscal_year'] || '',
    status: f['status'] || 'pending',
    business: f['business'] || 0,
    brand: f['brand'] || 0,
    customer: f['customer'] || 0,
    fees: f['fees'] || 0,
    margin: f['margin'] || 0,
    total: f['total'] || 0,
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
