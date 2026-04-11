import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: 'Jeahjeah77',
  database: 'IMS Julies_db',
});

async function test() {
  try {
    await client.connect();
    console.log('✅ Connected to IMS Julies_db successfully!');
    const res = await client.query('SELECT current_database()');
    console.log('Current DB:', res.rows[0].current_database);
    
    const tables = await client.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
    console.log('Tables in public schema:', tables.rows.map(r => r.tablename).join(', ') || 'NONE');
    
    await client.end();
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
  }
}

test();
