import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const productsCount = await pool.query('SELECT COUNT(*) FROM products');
    const ingredientsCount = await pool.query('SELECT COUNT(*) FROM raw_materials');
    
    const lowStockCount = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM products WHERE stock <= min_stock) +
        (SELECT COUNT(*) FROM raw_materials WHERE stock <= min_stock) AS count
    `);
    
    const expiredCount = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM products WHERE expiry_date < CURRENT_DATE) +
        (SELECT COUNT(*) FROM raw_materials WHERE expiry_date < CURRENT_DATE) AS count
    `);

    const expiringSoonCount = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM products WHERE expiry_date >= CURRENT_DATE AND expiry_date <= CURRENT_DATE + INTERVAL '7 days') +
        (SELECT COUNT(*) FROM raw_materials WHERE expiry_date >= CURRENT_DATE AND expiry_date <= CURRENT_DATE + INTERVAL '7 days') AS count
    `);
    
    const transactionsToday = await pool.query(
      'SELECT COUNT(*) FROM transactions WHERE DATE(created_at) = CURRENT_DATE'
    );

    res.json({
      totalProducts: parseInt(productsCount.rows[0].count),
      totalIngredients: parseInt(ingredientsCount.rows[0].count),
      lowStockItems: parseInt(lowStockCount.rows[0].count),
      expiredItems: parseInt(expiredCount.rows[0].count),
      expiringSoon: parseInt(expiringSoonCount.rows[0].count),
      todayTransactions: parseInt(transactionsToday.rows[0].count),
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
