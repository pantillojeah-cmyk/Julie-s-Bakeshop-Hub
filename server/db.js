import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.PG_HOST || '127.0.0.1', // Default to 127.0.0.1 to avoid IPv6 issues
  port: parseInt(process.env.PG_PORT || '5432'),
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE || 'IMS Julies_db',
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database:', process.env.PG_DATABASE);
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err.message);
});

export default pool;
