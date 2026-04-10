import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

async function listUsers() {
  try {
    const { rows } = await pool.query('SELECT username, password_hash, role FROM users');
    console.log('Available Users:');
    console.table(rows);
  } catch (err) {
    console.error('Error listing users:', err.message);
  } finally {
    await pool.end();
  }
}

listUsers();
