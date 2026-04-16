import { Router } from 'express';
import pool from '../db.js';
import bcrypt from 'bcryptjs';

const router = Router();

// GET all users (omit password_hash)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, username, name, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/users error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST login — checks username + password (plain text from frontend)
router.post('/login', async (req, res) => {
  const { username, password } = req.body; // Rename to 'password' for clarity
  console.log('Login attempt request body:', JSON.stringify(req.body));
  console.log(`Login attempt for username: ${username}`);
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, username, name, role, password_hash FROM users WHERE username=$1',
      [username]
    );
    
    if (rows.length === 0) {
      console.log(`User not found: ${username}`);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      console.log(`Invalid password for user: ${username}`);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    console.log(`Login successful for user: ${username}`);
    // Success: return user without password_hash
    const { password_hash: _, ...userWithoutHash } = user;
    res.json({ user: userWithoutHash });
  } catch (err) {
    console.error('POST /api/users/login error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message, stack: err.stack });
  }
});

// POST create user
router.post('/', async (req, res) => {
  const { username, name, role, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (username, name, role, password_hash)
       VALUES ($1, $2, $3, $4) RETURNING id, username, name, role, created_at`,
      [username, name, role, hashedPassword]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/users error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
  const { username, name, role, password } = req.body;
  try {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const { rows } = await pool.query(
        `UPDATE users SET username=$1, name=$2, role=$3, password_hash=$4, updated_at=NOW()
         WHERE id=$5 RETURNING id, username, name, role, updated_at`,
        [username, name, role, hashedPassword, req.params.id]
      );
      if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
      res.json(rows[0]);
    } else {
      const { rows } = await pool.query(
        `UPDATE users SET username=$1, name=$2, role=$3, updated_at=NOW()
         WHERE id=$4 RETURNING id, username, name, role, updated_at`,
        [username, name, role, req.params.id]
      );
      if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
      res.json(rows[0]);
    }
  } catch (err) {
    console.error('PUT /api/users/:id error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    // Safety: prevent deleting the protected admin account
    const { rows: check } = await pool.query('SELECT username FROM users WHERE id=$1', [req.params.id]);
    if (check.length === 0) return res.status(404).json({ error: 'User not found' });
    if (check[0].username === 'admin') return res.status(403).json({ error: 'Cannot delete the admin account' });

    await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/users/:id error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;

