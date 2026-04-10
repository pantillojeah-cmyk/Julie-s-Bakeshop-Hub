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

async function resetPasswords() {
  try {
    const adminHash = await bcrypt.hash('admin', 10);
    const staffHash = await bcrypt.hash('staff1', 10);
    
    await pool.query('UPDATE users SET password_hash = $1 WHERE username = $2', [adminHash, 'admin']);
    await pool.query('UPDATE users SET password_hash = $1 WHERE username = $2', [staffHash, 'staff1']);
    
    console.log('Passwords reset to "admin" for admin and "staff1" for staff1.');
  } catch (err) {
    console.error('Error resetting passwords:', err.message);
  } finally {
    await pool.end();
  }
}

resetPasswords();
