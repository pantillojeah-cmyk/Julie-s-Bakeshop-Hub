import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET all transactions (with product and user info)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT t.*,
             p.name AS product_name,
             p.category AS product_category,
             rm.name AS raw_material_name,
             u.name AS performed_by_name
      FROM transactions t
      LEFT JOIN products p ON t.product_id = p.id
      LEFT JOIN raw_materials rm ON t.raw_material_id = rm.id
      LEFT JOIN users u ON t.performed_by = u.id
      ORDER BY t.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/transactions error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET transactions by product
router.get('/product/:productId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.*, u.name AS performed_by_name
       FROM transactions t
       LEFT JOIN users u ON t.performed_by = u.id
       WHERE t.product_id = $1
       ORDER BY t.created_at DESC`,
      [req.params.productId]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/transactions/product/:id error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST create transaction (stock-in or stock-out)
router.post('/', async (req, res) => {
  const { product_id, raw_material_id, type, quantity, performed_by, notes } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    /* 
    // Check stock for stock-out (Disabled to allow negative stock)
    if (type === 'stock-out') {
      const { rows } = await client.query('SELECT stock FROM products WHERE id=$1', [product_id]);
      if (rows.length === 0) throw new Error('Product not found');
      if (rows[0].stock < quantity) throw new Error('Insufficient stock');
    }
    */

    // Insert transaction
    const { rows } = await client.query(
      `INSERT INTO transactions (product_id, raw_material_id, type, quantity, performed_by, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [product_id || null, raw_material_id || null, type, quantity, performed_by, notes || null]
    );

    // Update stock
    const stockChange = type === 'stock-in' ? quantity : -quantity;
    if (product_id) {
      await client.query(
        'UPDATE products SET stock = stock + $1, updated_at = NOW() WHERE id = $2',
        [stockChange, product_id]
      );
    } else if (raw_material_id) {
      await client.query(
        'UPDATE raw_materials SET stock = stock + $1, updated_at = NOW() WHERE id = $2',
        [stockChange, raw_material_id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/transactions error:', err.message);
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

export default router;
