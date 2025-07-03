// File: api/generate.js
const fetch = require('node-fetch');

const apiKeys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
].filter(Boolean);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (apiKeys.length === 0) {
    console.error("No API keys configured.");
    return res.status(500).json({ error: "Konfigurasi Kunci API di server belum diatur." });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Permintaan harus menyertakan sebuah prompt." });
  }

  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  };

  for (const apiKey of apiKeys) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        return res.status(200).json({ result });
      }
      
      if (response.status === 429) {
        console.warn(`API key quota limit. Trying next key...`);
        continue;
      }

      const errorBody = await response.json().catch(() => ({ error: `Request failed with status ${response.status}` }));
      console.error(`API call failed with status ${response.status}:`, errorBody);
      // Jangan langsung break, coba kunci lain jika ada
    } catch (error) {
      console.error(`Network error:`, error.message);
    }
  }

  return res.status(500).json({ error: "Semua layanan AI sedang sibuk atau gagal." });
};