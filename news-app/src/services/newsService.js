const axios = require('axios');
const db = require('../db');
require('dotenv').config();

// One-time DB connection check
(async () => {
  try {
    await db.query('SELECT 1');
    console.log("✅ [Startup] Database connection successful.");
  } catch (err) {
    console.error("❌ [Startup] Database connection failed:", err.message);
  }
})();

// Fetch news from DB (not filtered)
async function getNews() {
  const [rows] = await db.query(
    'SELECT * FROM news ORDER BY published_at DESC'
  );
  return rows;
}

// Fetch and store news from US only
async function fetchAndSummarizeNews() {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.error("❌ NEWS_API_KEY is not defined.");
    return;
  }

  const country = 'us';
  const url = `https://newsapi.org/v2/top-headlines?country=${country}&language=en&apiKey=${apiKey}`;

  try {
    const response = await axios.get(url);
    const remaining = response.headers['x-ratelimit-remaining'];
    const limit = response.headers['x-ratelimit-limit'];
    const reset = response.headers['x-ratelimit-reset'];

    console.log(`📊 NewsAPI rate limit: ${remaining}/${limit} remaining`);
    console.log(`⏳ Limit resets at: ${new Date(reset * 1000).toLocaleString()}`);

    const articles = (response.data.articles || []).slice(0, 10);

    if (articles.length === 0) {
      console.warn("⚠️ No articles returned from NewsAPI.");
      return;
    }

    console.log(`🌍 Fetched ${articles.length} articles from US.`);

    for (const article of articles) {
      const title = article.title || 'No Title';
      const description = article.description || '';
      const summary = await summarizeText(`${title}. ${description}`);
      const publishedAt = article.publishedAt || new Date().toISOString();
      const formattedDate = new Date(publishedAt)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

      const lang = 'en';
      const country = 'us';

      await db.query(
        `INSERT INTO news 
          (title, summary, url, published_at, language, country)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE summary=?`,
        [title, summary, article.url, formattedDate, lang, country, summary]
      );
    }

    console.log(`✅ Saved ${articles.length} articles to DB.`);
  } catch (error) {
    console.error("❌ Error during fetch:", error.message);
  }
}

// Dummy summarizer (replace with AI if needed)
async function summarizeText(text) {
  return `Mock summary for: ${text}`;
}

module.exports = { getNews, fetchAndSummarizeNews };
