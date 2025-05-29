const express = require('express');
const cors = require('cors');
const newsRoutes = require('./routes/news');
const fetchNewsRoutes = require('./routes/fetchNews');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// 🛠️ ROUTES
app.use('/news', newsRoutes);        // GET /news?lang=en
app.use('/news/fetch', fetchNewsRoutes); // GET /news/fetch

app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
