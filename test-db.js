import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })
  : new Pool({
      host: process.env.PG_HOST || '127.0.0.1',
      port: parseInt(process.env.PG_PORT || '5432'),
      user: process.env.PG_USER || 'postgres',
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE || 'IMS Julies_db',
    });

console.log('Using URL:', process.env.DATABASE_URL ? 'yes' : 'no');

pool.connect()
  .then(client => {
    console.log('✅ Success!');
    client.release();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
