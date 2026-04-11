import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const { Pool } = pg;
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  : new Pool({
      host: process.env.PG_HOST || '127.0.0.1',
      port: process.env.PG_PORT || 5432,
      user: process.env.PG_USER || 'postgres',
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE || 'IMS Julies_db',
    });

async function run() {
  try {
    const hash = await bcrypt.hash('staff1', 10);
    // Use ON CONFLICT DO NOTHING in case it already exists
    await pool.query(
      `INSERT INTO users (username, name, role, password_hash)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (username) DO NOTHING`,
      ['staff1', 'Staff Member', 'staff', hash]
    );
    console.log('staff1 user created successfully.');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();
