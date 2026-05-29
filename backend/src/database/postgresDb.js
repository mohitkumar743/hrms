import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

const collections = [
  'companies.json',
  'users.json',
  'employees.json',
  'attendance.json',
  'notices.json',
  'events.json',
  'leaves.json',
  'payrolls.json',
  'settings.json',
  'activityLogs.json',
  'companyPagePermissions.json',
  'pages.json'
];

const commonColumns = [
  ['id', 'TEXT PRIMARY KEY'],
  ['created_at', 'TIMESTAMPTZ NOT NULL DEFAULT NOW()'],
  ['updated_at', 'TIMESTAMPTZ NOT NULL DEFAULT NOW()'],
  ['is_deleted', 'BOOLEAN NOT NULL DEFAULT FALSE'],
  ['deleted_at', 'TIMESTAMPTZ'],
  ['deleted_by', 'TEXT']
];

const tableConfigs = {
  'companies.json': {
    table: 'companies',
    columns: [
      ['name', 'TEXT NOT NULL'],
      ['legal_name', 'TEXT'],
      ['industry', 'TEXT'],
      ['company_type', 'TEXT'],
      ['registration_number', 'TEXT'],
      ['gst_number', 'TEXT'],
      ['pan_number', 'TEXT'],
      ['email', 'TEXT'],
      ['phone', 'TEXT'],
      ['website', 'TEXT'],
      ['address_line1', 'TEXT'],
      ['address_line2', 'TEXT'],
      ['city', 'TEXT'],
      ['state', 'TEXT'],
      ['country', 'TEXT'],
      ['pincode', 'TEXT'],
      ['contact_person_name', 'TEXT'],
      ['contact_person_email', 'TEXT'],
      ['contact_person_phone', 'TEXT'],
      ['admin_name', 'TEXT'],
      ['admin_email', 'TEXT'],
      ['admin_password', 'TEXT'],
      ['established_date', 'TEXT'],
      ['employee_strength', 'TEXT'],
      ['status', 'TEXT NOT NULL DEFAULT \'ACTIVE\'']
    ]
  },
  'users.json': {
    table: 'users',
    columns: [
      ['company_id', 'TEXT'],
      ['employee_id', 'TEXT'],
      ['name', 'TEXT NOT NULL'],
      ['email', 'TEXT NOT NULL'],
      ['password_hash', 'TEXT NOT NULL'],
      ['role', 'TEXT NOT NULL'],
      ['status', 'TEXT NOT NULL DEFAULT \'ACTIVE\'']
    ],
    indexes: ['CREATE UNIQUE INDEX IF NOT EXISTS users_email_active_idx ON users (LOWER(email)) WHERE is_deleted = FALSE']
  },
  'employees.json': {
    table: 'employees',
    columns: [
      ['company_id', 'TEXT NOT NULL'],
      ['employee_code', 'TEXT NOT NULL'],
      ['full_name', 'TEXT NOT NULL'],
      ['phone', 'TEXT'],
      ['email', 'TEXT'],
      ['password', 'TEXT'],
      ['department', 'TEXT'],
      ['designation', 'TEXT'],
      ['joining_date', 'TEXT'],
      ['monthly_salary', 'NUMERIC(12,2) NOT NULL DEFAULT 0'],
      ['shift_start', 'TEXT'],
      ['shift_end', 'TEXT'],
      ['custom_shift_enabled', 'BOOLEAN NOT NULL DEFAULT FALSE'],
      ['status', 'TEXT NOT NULL DEFAULT \'ACTIVE\''],
      ['qr_code', 'TEXT']
    ],
    indexes: [
      'CREATE UNIQUE INDEX IF NOT EXISTS employees_company_code_active_idx ON employees (company_id, employee_code) WHERE is_deleted = FALSE',
      'CREATE UNIQUE INDEX IF NOT EXISTS employees_qr_code_active_idx ON employees (qr_code) WHERE qr_code IS NOT NULL AND is_deleted = FALSE'
    ]
  },
  'attendance.json': {
    table: 'attendance',
    columns: [
      ['company_id', 'TEXT NOT NULL'],
      ['employee_id', 'TEXT NOT NULL'],
      ['date', 'TEXT NOT NULL'],
      ['check_in_time', 'TIMESTAMPTZ'],
      ['check_out_time', 'TIMESTAMPTZ'],
      ['status', 'TEXT NOT NULL'],
      ['late_minutes', 'INTEGER NOT NULL DEFAULT 0'],
      ['overtime_minutes', 'INTEGER NOT NULL DEFAULT 0'],
      ['attendance_method', 'TEXT']
    ],
    indexes: ['CREATE INDEX IF NOT EXISTS attendance_company_employee_date_idx ON attendance (company_id, employee_id, date)']
  },
  'notices.json': {
    table: 'notices',
    columns: [
      ['company_id', 'TEXT NOT NULL'],
      ['title', 'TEXT NOT NULL'],
      ['message', 'TEXT NOT NULL'],
      ['expiry_date', 'TEXT'],
      ['is_active', 'BOOLEAN NOT NULL DEFAULT TRUE'],
      ['created_by', 'TEXT']
    ]
  },
  'events.json': {
    table: 'events',
    columns: [
      ['company_id', 'TEXT NOT NULL'],
      ['title', 'TEXT NOT NULL'],
      ['event_date', 'TEXT NOT NULL'],
      ['start_time', 'TEXT'],
      ['end_time', 'TEXT'],
      ['lead', 'TEXT'],
      ['expiry_date', 'TEXT'],
      ['is_active', 'BOOLEAN NOT NULL DEFAULT TRUE'],
      ['created_by', 'TEXT']
    ]
  },
  'leaves.json': {
    table: 'leaves',
    columns: [
      ['company_id', 'TEXT NOT NULL'],
      ['employee_id', 'TEXT NOT NULL'],
      ['employee_name', 'TEXT'],
      ['employee_code', 'TEXT'],
      ['leave_type', 'TEXT NOT NULL'],
      ['day_type', 'TEXT NOT NULL'],
      ['start_date', 'TEXT NOT NULL'],
      ['end_date', 'TEXT NOT NULL'],
      ['reason', 'TEXT'],
      ['status', 'TEXT NOT NULL DEFAULT \'PENDING\''],
      ['remark', 'TEXT'],
      ['decided_by', 'TEXT'],
      ['decided_at', 'TIMESTAMPTZ']
    ]
  },
  'payrolls.json': {
    table: 'payrolls',
    columns: [
      ['company_id', 'TEXT NOT NULL'],
      ['employee_id', 'TEXT NOT NULL'],
      ['month', 'TEXT NOT NULL'],
      ['present_days', 'INTEGER NOT NULL DEFAULT 0'],
      ['absent_days', 'INTEGER NOT NULL DEFAULT 0'],
      ['late_count', 'INTEGER NOT NULL DEFAULT 0'],
      ['deductions', 'NUMERIC(12,2) NOT NULL DEFAULT 0'],
      ['overtime_amount', 'NUMERIC(12,2) NOT NULL DEFAULT 0'],
      ['final_salary', 'NUMERIC(12,2) NOT NULL DEFAULT 0'],
      ['locked', 'BOOLEAN NOT NULL DEFAULT FALSE']
    ],
    indexes: ['CREATE INDEX IF NOT EXISTS payrolls_company_month_idx ON payrolls (company_id, month)']
  },
  'settings.json': {
    table: 'settings',
    columns: [
      ['company_id', 'TEXT NOT NULL'],
      ['company_profile', 'JSONB'],
      ['office_start_time', 'TEXT'],
      ['office_end_time', 'TEXT'],
      ['grace_period_minutes', 'INTEGER NOT NULL DEFAULT 0'],
      ['late_fine_enabled', 'BOOLEAN NOT NULL DEFAULT TRUE'],
      ['late_fine_amount', 'NUMERIC(12,2) NOT NULL DEFAULT 0'],
      ['late_count_threshold', 'INTEGER NOT NULL DEFAULT 0']
    ],
    indexes: ['CREATE UNIQUE INDEX IF NOT EXISTS settings_company_active_idx ON settings (company_id) WHERE is_deleted = FALSE']
  },
  'activityLogs.json': {
    table: 'activity_logs',
    columns: [
      ['company_id', 'TEXT'],
      ['user_id', 'TEXT'],
      ['employee_id', 'TEXT'],
      ['user_name', 'TEXT'],
      ['user_email', 'TEXT'],
      ['role', 'TEXT'],
      ['action', 'TEXT'],
      ['resource', 'TEXT'],
      ['resource_id', 'TEXT'],
      ['description', 'TEXT'],
      ['metadata', 'JSONB'],
      ['date', 'TEXT'],
      ['time', 'TEXT']
    ],
    indexes: ['CREATE INDEX IF NOT EXISTS activity_logs_company_date_idx ON activity_logs (company_id, date)']
  },
  'companyPagePermissions.json': {
    table: 'company_page_permissions',
    columns: [
      ['company_id', 'TEXT NOT NULL'],
      ['page_ids', 'TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]']
    ],
    indexes: ['CREATE UNIQUE INDEX IF NOT EXISTS company_page_permissions_company_active_idx ON company_page_permissions (company_id) WHERE is_deleted = FALSE']
  },
  'pages.json': {
    table: 'pages',
    columns: [
      ['label', 'TEXT NOT NULL'],
      ['path', 'TEXT NOT NULL'],
      ['icon', 'TEXT'],
      ['parent_id', 'TEXT'],
      ['roles', 'TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]'],
      ['sort_order', 'INTEGER NOT NULL DEFAULT 0'],
      ['is_active', 'BOOLEAN NOT NULL DEFAULT TRUE']
    ],
    indexes: ['CREATE UNIQUE INDEX IF NOT EXISTS pages_path_active_idx ON pages (path) WHERE is_deleted = FALSE']
  }
};

const systemPages = [
  {
    id: 'page_super_admin_dashboard',
    label: 'Dashboard',
    path: '/super-admin-dashboard',
    icon: 'LayoutDashboard',
    parentId: null,
    roles: ['SUPER_ADMIN'],
    sortOrder: 5,
    isActive: true,
    createdAt: '2026-05-29T00:00:00.000Z',
    updatedAt: '2026-05-29T00:00:00.000Z'
  },
  {
    id: 'page_company_onboard',
    label: 'Onboard Company',
    path: '/companies/onboard',
    icon: 'UserPlus',
    parentId: 'page_companies',
    roles: ['SUPER_ADMIN'],
    sortOrder: 11,
    isActive: true,
    createdAt: '2026-05-29T00:00:00.000Z',
    updatedAt: '2026-05-29T00:00:00.000Z'
  },
  {
    id: 'page_company_view',
    label: 'View Companies',
    path: '/companies/view',
    icon: 'List',
    parentId: 'page_companies',
    roles: ['SUPER_ADMIN'],
    sortOrder: 12,
    isActive: true,
    createdAt: '2026-05-29T00:00:00.000Z',
    updatedAt: '2026-05-29T00:00:00.000Z'
  },
  {
    id: 'page_company_info',
    label: 'Company Info',
    path: '/company-info',
    icon: 'Building2',
    parentId: null,
    roles: ['COMPANY_ADMIN'],
    sortOrder: 15,
    isActive: true,
    createdAt: '2026-05-29T00:00:00.000Z',
    updatedAt: '2026-05-29T00:00:00.000Z'
  }
];

let pool;
let initialized;
let isEnsuringDatabase = false;

function getConnectionString() {
  try {
    const url = new URL(env.databaseUrl);
    if (url.searchParams.get('sslmode') === 'require') {
      url.searchParams.set('sslmode', 'verify-full');
    }
    return url.toString();
  } catch {
    return env.databaseUrl;
  }
}

export function getPool() {
  if (!env.databaseUrl) {
    throw new Error('Postgres connection string missing. Set DATABASE_URL or POSTGRES_URL in backend/.env.');
  }

  if (!pool) {
    pool = new Pool({
      connectionString: getConnectionString(),
      max: Number(process.env.PG_POOL_MAX || 5),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });
  }

  return pool;
}

function configFor(collection) {
  const config = tableConfigs[collection];
  if (!config) throw new Error(`Unknown database collection: ${collection}`);
  return config;
}

function toCamelCase(value) {
  return value.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

function timestampToIso(value) {
  if (!value) return value;
  if (value instanceof Date) return value.toISOString();
  return value;
}

function numberOrNull(value) {
  if (value === null || value === undefined) return value;
  const number = Number(value);
  return Number.isNaN(number) ? value : number;
}

const columnDefaults = {
  is_deleted: false,
  status: 'ACTIVE',
  monthly_salary: 0,
  custom_shift_enabled: false,
  late_minutes: 0,
  overtime_minutes: 0,
  is_active: true,
  present_days: 0,
  absent_days: 0,
  late_count: 0,
  deductions: 0,
  overtime_amount: 0,
  final_salary: 0,
  locked: false,
  grace_period_minutes: 0,
  late_fine_enabled: true,
  late_fine_amount: 0,
  late_count_threshold: 0,
  roles: [],
  page_ids: []
};

function rowToRecord(row) {
  const record = {};

  for (const [key, value] of Object.entries(row)) {
    const camelKey = toCamelCase(key);
    if (['createdAt', 'updatedAt', 'deletedAt', 'decidedAt', 'checkInTime', 'checkOutTime'].includes(camelKey)) {
      record[camelKey] = timestampToIso(value);
    } else if (['monthlySalary', 'deductions', 'overtimeAmount', 'finalSalary', 'lateFineAmount'].includes(camelKey)) {
      record[camelKey] = numberOrNull(value);
    } else {
      record[camelKey] = value;
    }
  }

  return record;
}

function recordValue(record, column) {
  const key = toCamelCase(column);
  const value = record[key];
  const resolvedValue = value ?? columnDefaults[column] ?? null;
  if (['metadata', 'company_profile'].includes(column)) return resolvedValue == null ? null : JSON.stringify(resolvedValue);
  if (column === 'roles' || column === 'page_ids') return Array.isArray(resolvedValue) ? resolvedValue : [];
  return resolvedValue;
}

function tableColumnNames(config) {
  return [...commonColumns, ...config.columns].map(([name]) => name);
}

async function createTable(config) {
  const columns = [...commonColumns, ...config.columns].map(([name, type]) => `${name} ${type}`).join(',\n        ');
  await getPool().query(`CREATE TABLE IF NOT EXISTS ${config.table} (${columns})`);

  for (const statement of config.indexes || []) {
    await getPool().query(statement);
  }
}

export async function ensureDatabase() {
  if (initialized) return initialized;

  initialized = (async () => {
    isEnsuringDatabase = true;
    try {
      for (const collection of collections) {
        await createTable(configFor(collection));
      }
      await ensureSystemRecords();
    } finally {
      isEnsuringDatabase = false;
    }
  })();

  return initialized;
}

async function ensureSystemRecords() {
  for (const page of systemPages) {
    await upsertRecord('pages.json', page, false);
  }

  const permissions = await findRecords('companyPagePermissions.json');
  for (const permission of permissions) {
    const pageIds = new Set(permission.pageIds || []);
    if (!pageIds.has('page_company_info')) {
      pageIds.add('page_company_info');
      await upsertRecord('companyPagePermissions.json', {
        ...permission,
        pageIds: [...pageIds],
        updatedAt: new Date().toISOString()
      });
    }
  }
}

export async function findRecords(collection) {
  if (!isEnsuringDatabase) await ensureDatabase();

  const config = configFor(collection);
  const result = await getPool().query(`SELECT * FROM ${config.table} WHERE is_deleted = FALSE ORDER BY created_at ASC, id ASC`);
  return result.rows.map(rowToRecord);
}

export async function findRecordById(collection, id) {
  if (!isEnsuringDatabase) await ensureDatabase();

  const config = configFor(collection);
  const result = await getPool().query(`SELECT * FROM ${config.table} WHERE id = $1 LIMIT 1`, [id]);
  return result.rows[0] ? rowToRecord(result.rows[0]) : null;
}

export async function upsertRecord(collection, record, overwrite = true) {
  if (!isEnsuringDatabase) await ensureDatabase();

  const config = configFor(collection);
  const now = new Date().toISOString();
  const nextRecord = {
    ...record,
    createdAt: record.createdAt || now,
    updatedAt: record.updatedAt || record.createdAt || now,
    isDeleted: record.isDeleted || false,
    deletedAt: record.deletedAt || null,
    deletedBy: record.deletedBy || null
  };

  const columns = tableColumnNames(config);
  const values = columns.map((column) => recordValue(nextRecord, column));
  const placeholders = columns.map((column, index) => {
    const cast = ['metadata', 'company_profile'].includes(column) ? '::jsonb' : '';
    return `$${index + 1}${cast}`;
  });
  const updateColumns = columns.filter((column) => column !== 'id' && column !== 'created_at');
  const conflictAction = overwrite
    ? `DO UPDATE SET ${updateColumns.map((column) => `${column} = EXCLUDED.${column}`).join(', ')}`
    : 'DO NOTHING';

  const result = await getPool().query(
    `INSERT INTO ${config.table} (${columns.join(', ')})
     VALUES (${placeholders.join(', ')})
     ON CONFLICT (id) ${conflictAction}
     RETURNING *`,
    values
  );

  return result.rows[0] ? rowToRecord(result.rows[0]) : nextRecord;
}
