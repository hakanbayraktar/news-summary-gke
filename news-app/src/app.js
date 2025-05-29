const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const db = require('./db');
const newsRoutes = require('./routes/news');
const fetchNewsRoutes = require('./routes/fetchNews');
const { fetchAndSummarizeNews } = require('./services/newsService');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/news', newsRoutes);
app.use('/news/fetch', fetchNewsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Optional: Wait for DB before initial fetch
const waitForDB = async (retries = 5, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await db.query('SELECT 1');
      console.log("✅ [Startup] Database connection successful.");
      return;
    } catch (err) {
      console.log(`⏳ Waiting for DB... (${i + 1}/${retries})`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw new Error("❌ Database not reachable after retries.");
};

waitForDB()
  .then(fetchAndSummarizeNews)
  .then(() => console.log("✅ Local: News fetched"))
  .catch((err) => console.error("❌ Local fetch error:", err.message));
