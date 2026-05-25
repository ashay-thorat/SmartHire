// Simple script to inspect JSearch response structure
require('dotenv').config({ path: 'd:/web Development/SmartHire/client/.env' });

(async () => {
  const query = encodeURIComponent('Frontend Developer React JavaScript Node.js in India');
  const url = `https://jsearch.p.rapidapi.com/search-v2?query=${query}&num_pages=1&date_posted=all`;
  console.log('Fetching URL:', url);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.VITE_RAPIDAPI_KEY,
        'x-rapidapi-host': 'jsearch.p.rapidapi.com'
      }
    });
    const data = await response.json();
    console.log('Full response:', JSON.stringify(data, null, 2).substring(0, 2000));
  } catch (e) {
    console.error('Fetch error:', e);
  }
})();
