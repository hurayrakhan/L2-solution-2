import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is missing!');
}

export const pool = new Pool({
  connectionString: databaseUrl,
});

pool.on('connect', () => {
  console.log('Database pool connected successfully');
});

pool.on('error', (err) => {
  console.error('Unexpected database error on idle client', err);
});
