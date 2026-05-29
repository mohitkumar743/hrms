import { getPool, migrateJsonFilesToPostgres } from '../src/database/postgresDb.js';

try {
  await migrateJsonFilesToPostgres();

  const result = await getPool().query(`
    SELECT collection, COUNT(*)::int AS count
    FROM app_records
    GROUP BY collection
    ORDER BY collection
  `);

  console.table(result.rows);
} finally {
  await getPool().end();
}
