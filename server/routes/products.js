import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET all products (with supplier name joined)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.*, s.name AS supplier_name
      FROM products p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/products error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET single product by id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, s.name AS supplier_name
       FROM products p
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/products/:id error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST create product
router.post('/', async (req, res) => {
  const { name, category, unit, price, stock, min_stock, expiry_date, supplier_id } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO products (name, category, unit, price, stock, min_stock, expiry_date, supplier_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, category, unit, price, stock, min_stock, expiry_date, supplier_id || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/products error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT update product
router.put('/:id', async (req, res) => {
  const { name, category, unit, price, stock, min_stock, expiry_date, supplier_id } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE products
       SET name=$1, category=$2, unit=$3, price=$4, stock=$5, min_stock=$6,
           expiry_date=$7, supplier_id=$8, updated_at=NOW()
       WHERE id=$9
       RETURNING *`,
      [name, category, unit, price, stock, min_stock, expiry_date, supplier_id || null, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('PUT /api/products/:id error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM products WHERE id=$1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/products/:id error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
