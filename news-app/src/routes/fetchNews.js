const express = require('express');
const router = express.Router();
const { fetchAndSummarizeNews } = require('../services/newsService');

router.get('/', async (req, res) => {
  try {
    await fetchAndSummarizeNews();
    res.status(200).json({ message: '✅ News fetched successfully.' });
  } catch (error) {
    console.error('❌ Error in fetch route:', error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

module.exports = router;