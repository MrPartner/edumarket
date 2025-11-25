// backend/src/config/db.js
const { Pool } = require('pg');

const isProd = process.env.NODE_ENV === 'production';

let pool;

if (isProd) {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set in production');
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} else {
  // Config local de desarrollo (ajusta usuario/pass/db si hace falta)
  pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || 5432,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'edumarket',
  });
}

module.exports = pool;


