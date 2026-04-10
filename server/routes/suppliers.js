import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET all suppliers
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM suppliers ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('GET /api/suppliers error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET single supplier
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM suppliers WHERE id=$1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Supplier not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/suppliers/:id error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST create supplier
router.post('/', async (req, res) => {
  const { name, contact, email, address } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO suppliers (name, contact, email, address)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, contact, email, address]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/suppliers error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT update supplier
router.put('/:id', async (req, res) => {
  const { name, contact, email, address } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE suppliers
       SET name=$1, contact=$2, email=$3, address=$4, updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [name, contact, email, address, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Supplier not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('PUT /api/suppliers/:id error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE supplier
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM suppliers WHERE id=$1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Supplier not found' });
    res.json({ message: 'Supplier deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/suppliers/:id error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
