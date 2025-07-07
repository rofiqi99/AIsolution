// File: api/config.js
export default function handler(req, res) {
  if (!process.env.PUBLIC_FIREBASE_CONFIG) {
    return res.status(500).json({ error: 'Konfigurasi Firebase tidak ditemukan di server.' });
  }
  try {
    const firebaseConfig = JSON.parse(process.env.PUBLIC_FIREBASE_CONFIG);
    res.status(200).json(firebaseConfig);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mem-parsing konfigurasi Firebase.' });
  }
}