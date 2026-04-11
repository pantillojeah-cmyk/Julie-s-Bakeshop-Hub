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

async function testQuery() {
  try {
    const username = 'admin';
    console.log(`Querying for user: ${username}`);
    const { rows } = await pool.query(
      'SELECT id, username, name, role, password_hash FROM users WHERE username=$1',
      [username]
    );
    console.log('Query result rows length:', rows.length);
    if (rows.length > 0) {
      console.log('User found:', rows[0].username);
      console.log('Hash length:', rows[0].password_hash.length);
    } else {
      console.log('User not found');
    }
  } catch (err) {
    console.error('Query error:', err);
  } finally {
    await pool.end();
  }
}

testQuery();
