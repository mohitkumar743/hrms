import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../data');

export const collections = [
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

let pool;
let initialized;
const recordsCache = new Map();

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
    throw new Error('Postgres connection string missing. Set DATABASE_URL or prosgressurl in backend/.env.');
  }

  if (!pool) {
    pool = new Pool({
      connectionString: getConnectionString(),
      max: Number(process.env.PG_POOL_MAX || 1),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });
  }

  return pool;
}

export async function ensureDatabase() {
  if (initialized) return initialized;

  initialized = (async () => {
    await getPool().query(`
      CREATE TABLE IF NOT EXISTS app_records (
        collection TEXT NOT NULL,
        id TEXT NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (collection, id)
      )
    `);

    await getPool().query('CREATE INDEX IF NOT EXISTS app_records_collection_idx ON app_records (collection)');
    await ensureSystemRecords();
  })();

  return initialized;
}

async function ensureSystemRecords() {
  for (const page of systemPages) {
    await getPool().query(
      `INSERT INTO app_records (collection, id, data, created_at, updated_at)
       VALUES ($1, $2, $3::jsonb, $4, $5)
       ON CONFLICT (collection, id) DO NOTHING`,
      ['pages.json', page.id, JSON.stringify(page), page.createdAt, page.updatedAt]
    );
  }
  recordsCache.delete('pages.json');

  const result = await getPool().query(
    'SELECT data FROM app_records WHERE collection = $1',
    ['companyPagePermissions.json']
  );

  for (const { data: permission } of result.rows) {
    const pageIds = new Set(permission.pageIds || []);
    if (!pageIds.has('page_company_info')) {
      pageIds.add('page_company_info');
      const updated = { ...permission, pageIds: [...pageIds], updatedAt: new Date().toISOString() };
      await getPool().query(
        `UPDATE app_records
         SET data = $3::jsonb, updated_at = $4
         WHERE collection = $1 AND id = $2`,
        ['companyPagePermissions.json', permission.id, JSON.stringify(updated), updated.updatedAt]
      );
      recordsCache.delete('companyPagePermissions.json');
    }
  }
}

export async function migrateJsonFilesToPostgres() {
  await ensureDatabase();

  for (const collection of collections) {
    const filePath = path.join(dataDir, collection);
    let records = [];

    try {
      const raw = await fs.readFile(filePath, 'utf8');
      records = raw.trim() ? JSON.parse(raw) : [];
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }

    for (const record of records) {
      if (!record?.id) continue;
      await upsertRecord(collection, record, false);
    }
  }
}

export async function findRecords(collection) {
  await ensureDatabase();

  if (recordsCache.has(collection)) {
    return recordsCache.get(collection);
  }

  const result = await getPool().query(
    `SELECT data
     FROM app_records
     WHERE collection = $1
     ORDER BY created_at ASC, id ASC`,
    [collection]
  );

  const records = result.rows.map((row) => row.data);
  recordsCache.set(collection, records);
  return records;
}

export async function findRecordById(collection, id) {
  await ensureDatabase();

  if (recordsCache.has(collection)) {
    return recordsCache.get(collection).find((record) => record.id === id) || null;
  }

  const result = await getPool().query(
    'SELECT data FROM app_records WHERE collection = $1 AND id = $2 LIMIT 1',
    [collection, id]
  );

  return result.rows[0]?.data || null;
}

export async function upsertRecord(collection, record, overwrite = true) {
  await ensureDatabase();

  const createdAt = record.createdAt || new Date().toISOString();
  const updatedAt = record.updatedAt || createdAt;
  const conflictAction = overwrite
    ? `DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at`
    : 'DO NOTHING';

  const result = await getPool().query(
    `INSERT INTO app_records (collection, id, data, created_at, updated_at)
     VALUES ($1, $2, $3::jsonb, $4, $5)
     ON CONFLICT (collection, id) ${conflictAction}
     RETURNING data`,
    [collection, record.id, JSON.stringify(record), createdAt, updatedAt]
  );

  recordsCache.delete(collection);
  return result.rows[0]?.data || record;
}
