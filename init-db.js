import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

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

async function run() {
  try {
    console.log('Creating tables...');
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR UNIQUE NOT NULL,
        name VARCHAR NOT NULL,
        role VARCHAR DEFAULT 'staff',
        password_hash VARCHAR NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS suppliers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR NOT NULL,
        contact VARCHAR,
        email VARCHAR,
        address TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR NOT NULL,
        category VARCHAR,
        unit VARCHAR,
        price NUMERIC,
        stock INTEGER DEFAULT 0,
        min_stock INTEGER DEFAULT 1,
        expiry_date DATE,
        supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

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

      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        raw_material_id UUID REFERENCES raw_materials(id) ON DELETE CASCADE,
        type VARCHAR NOT NULL,
        quantity INTEGER NOT NULL,
        performed_by UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('Tables created successfully.');

    // Insert default admin user if none exists
    const { rows } = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(rows[0].count) === 0) {
      console.log('No users found. Creating default admin user (admin / admin)...');
      const hash = await bcrypt.hash('admin', 10);
      await pool.query(
        "INSERT INTO users (username, name, role, password_hash) VALUES ($1, $2, $3, $4)",
        ['admin', 'Admin User', 'admin', hash]
      );
      console.log('Default admin user created.');
    } else {
      console.log(`Database already has ${rows[0].count} user(s). Skipping default user creation.`);
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    pool.end();
  }
}

run();
