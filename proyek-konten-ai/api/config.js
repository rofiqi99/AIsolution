
export default function handler(req, res) {
  // Pastikan variabel lingkungan ada
  if (!process.env.PUBLIC_FIREBASE_CONFIG) {
    return res.status(500).json({ error: 'Konfigurasi Firebase tidak ditemukan di server.' });
  }

  try {
    // Mengirim konfigurasi sebagai respons JSON
    const firebaseConfig = JSON.parse(process.env.PUBLIC_FIREBASE_CONFIG);
    res.status(200).json(firebaseConfig);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mem-parsing konfigurasi Firebase.' });
  }
}