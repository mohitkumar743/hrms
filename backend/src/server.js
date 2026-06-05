import app from './app.js';
import { env } from './config/env.js';
import { ensureDatabase } from './database/postgresDb.js';

await ensureDatabase();

app.listen(env.port, () => {
  console.log(`Attendo API running on port ${env.port}`);
});
