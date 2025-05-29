import React, { useEffect, useState } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL;

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [selectedNewsId, setSelectedNewsId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [lang, setLang] = useState('en');
  const [country, setCountry] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [uniqueLanguages, setUniqueLanguages] = useState([]);
  const [uniqueCountries, setUniqueCountries] = useState([]);
  const [highlightedIds, setHighlightedIds] = useState([]);
  const newsPerPage = 5;

  useEffect(() => {
    fetchNews();
  }, [lang]);

  useEffect(() => {
    filterNews();
  }, [country, searchTerm, news]);

  const fetchNews = async () => {
    try {
      const response = await fetch(`${BASE_URL}/news?lang=${lang}`);
      const data = await response.json();
      setNews(data);
      setFilteredNews(data);
      setCurrentPage(1);
      extractFilters(data);
    } catch (error) {
      console.error("❌ Failed to fetch news:", error.message);
    }
  };

  const fetchLatestNews = async () => {
    try {
      const response = await fetch(`${BASE_URL}/news/fetch`);
      if (response.ok) {
        const oldIds = news.map(item => item.id);
        await fetchNews(); // Refresh news after fetch
        const updatedIds = news.map(item => item.id);
        const newIds = updatedIds.filter(id => !oldIds.includes(id));
        setHighlightedIds(newIds);
      }
    } catch (error) {
      console.error("❌ Failed to fetch latest news:", error.message);
    }
  };

  const extractFilters = (data) => {
    const langs = Array.from(new Set(data.map((item) => item.language))).filter(Boolean);
    const countries = Array.from(new Set(data.map((item) => item.country))).filter(Boolean);
    setUniqueLanguages(langs);
    setUniqueCountries(countries);
  };

  const filterNews = () => {
    let filtered = [...news];

    if (country) {
      filtered = filtered.filter((item) => item.country === country);
    }

    if (searchTerm) {
      const keyword = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(keyword) ||
          item.summary.toLowerCase().includes(keyword)
      );
    }

    setFilteredNews(filtered);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleSummary = (id) => {
    setSelectedNewsId(prev => (prev === id ? null : id));
  };

  const openOriginalUrl = (url) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const indexOfLastNews = currentPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const currentNews = filteredNews.slice(indexOfFirstNews, indexOfLastNews);
  const totalPages = Math.ceil(filteredNews.length / newsPerPage);

  return (
    <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
      <h2>📰 News Summary Dashboard</h2>

      <div style={{ marginBottom: '1rem' }}>
        {uniqueLanguages.length > 1 && (
          <>
            <label>🌐 Language: </label>
            <select value={lang} onChange={(e) => setLang(e.target.value)}>
              {uniqueLanguages.map((l) => (
                <option key={l} value={l}>
                  {l === 'en' ? 'English' : l === 'tr' ? 'Turkish' : l}
                </option>
              ))}
            </select>
          </>
        )}

        <label style={{ marginLeft: '1rem' }}>📍 Country: </label>
        <select value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="">All</option>
          {uniqueCountries.map((c) => (
            <option key={c} value={c}>{c.toUpperCase()}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="🔍 Search title or summary"
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ marginLeft: '1rem', padding: '0.2rem' }}
        />

        <button onClick={fetchLatestNews} style={{ marginLeft: '1rem' }}>
          🔄 Fetch Latest News
        </button>
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <strong>📊 Total News: {filteredNews.length}</strong>
      </div>

      {currentNews.map((item) => (
        <div
          key={item.id}
          style={{
            marginBottom: '1rem',
            padding: '1rem',
            border: '1px solid #ccc',
            borderRadius: '5px',
            backgroundColor: highlightedIds.includes(item.id) ? '#e3fcef' : '#fff',
            cursor: 'pointer'
          }}
        >
          <h4 onClick={() => toggleSummary(item.id)} style={{ marginBottom: '0.3rem' }}>
            {item.title}
          </h4>
          {selectedNewsId === item.id && (
            <p onClick={() => openOriginalUrl(item.url)} style={{ color: '#007bff', cursor: 'pointer' }}>
              {item.summary}
            </p>
          )}
          <small>
            🌍 {item.country?.toUpperCase() || 'N/A'} | 🕒 {new Date(item.published_at).toLocaleString()}
          </small>
        </div>
      ))}

      {filteredNews.length === 0 && <p>No news available.</p>}

      <div style={{ marginTop: '1rem' }}>
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          ⬅ Prev
        </button>
        <span style={{ margin: '0 1rem' }}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next ➡
        </button>
      </div>
    </div>
  );
};

export default NewsList;
