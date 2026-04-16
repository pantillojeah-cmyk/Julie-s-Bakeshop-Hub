import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  : new Pool({
      host: process.env.PG_HOST || '127.0.0.1',
      port: parseInt(process.env.PG_PORT || '5432'),
      user: process.env.PG_USER || 'postgres',
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE || 'IMS Julies_db',
    });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting migration...');
    await client.query('BEGIN');

    console.log('Creating raw_materials table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS raw_materials (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR NOT NULL,
        category VARCHAR,
        unit VARCHAR,
        stock INTEGER DEFAULT 0,
        min_stock INTEGER DEFAULT 1,
        expiry_date DATE,
        supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Updating transactions table...');
    // Check if column exists before adding
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='transactions' AND column_name='raw_material_id'
    `);

    if (checkColumn.rows.length === 0) {
      await client.query('ALTER TABLE transactions ADD COLUMN raw_material_id UUID REFERENCES raw_materials(id) ON DELETE CASCADE;');
      console.log('Added raw_material_id to transactions table.');
    }

    await client.query('ALTER TABLE transactions ALTER COLUMN product_id DROP NOT NULL;');
    console.log('Made product_id nullable in transactions table.');

    await client.query('COMMIT');
    console.log('Migration completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
