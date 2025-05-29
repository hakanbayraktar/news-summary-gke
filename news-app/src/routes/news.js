const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const [rows] = await db.query(
      'SELECT * FROM news WHERE language = ? ORDER BY id DESC',
      [lang]
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching news from DB:', err.message);
    res.status(500).json({ error: 'Failed to fetch news from DB' });
  }
});

module.exports = router;
