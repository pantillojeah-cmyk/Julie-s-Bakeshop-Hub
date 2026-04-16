import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET all raw materials
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT rm.*, s.name AS supplier_name
      FROM raw_materials rm
      LEFT JOIN suppliers s ON rm.supplier_id = s.id
      ORDER BY rm.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/raw-materials error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET single raw material by id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT rm.*, s.name AS supplier_name
       FROM raw_materials rm
       LEFT JOIN suppliers s ON rm.supplier_id = s.id
       WHERE rm.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Raw material not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/raw-materials/:id error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST create raw material
router.post('/', async (req, res) => {
  const { name, category, unit, stock, min_stock, expiry_date, supplier_id } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO raw_materials (name, category, unit, stock, min_stock, expiry_date, supplier_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, category, unit, stock || 0, min_stock || 1, expiry_date || null, supplier_id || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/raw-materials error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT update raw material
router.put('/:id', async (req, res) => {
  const { name, category, unit, stock, min_stock, expiry_date, supplier_id } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE raw_materials
       SET name=$1, category=$2, unit=$3, stock=$4, min_stock=$5,
           expiry_date=$6, supplier_id=$7, updated_at=NOW()
       WHERE id=$8
       RETURNING *`,
      [name, category, unit, stock, min_stock, expiry_date, supplier_id || null, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Raw material not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('PUT /api/raw-materials/:id error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE raw material
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM raw_materials WHERE id=$1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Raw material not found' });
    res.json({ message: 'Raw material deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/raw-materials/:id error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
