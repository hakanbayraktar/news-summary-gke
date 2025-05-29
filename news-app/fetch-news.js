// fetch-news.js
require('dotenv').config();
const { fetchAndSummarizeNews } = require('./src/services/newsService');

fetchAndSummarizeNews()
  .then(() => console.log("✅ GitHub Action fetch complete"))
  .catch((err) => {
    console.error("❌ GitHub Action fetch failed:", err.message);
    process.exit(1);
  });
