import bcrypt from 'bcryptjs';
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

async function checkLogin() {
  try {
    const { rows } = await pool.query('SELECT username, password_hash FROM users WHERE username = $1', ['admin']);
    if (rows.length === 0) {
      console.log('User admin not found');
      return;
    }
    const user = rows[0];
    const match = await bcrypt.compare('admin', user.password_hash);
    console.log(`Password "admin" matches hash for "admin"? ${match}`);
    console.log(`Hash in DB: ${user.password_hash}`);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkLogin();
