// Mengimpor SDK Google Generative AI
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Handler default untuk Vercel Serverless Function
export default async function handler(req, res) {
    // Hanya izinkan metode POST
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        // Mengambil Kunci API dari Environment Variables Vercel (AMAN)
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY tidak diatur di Environment Variables.");
        }

        // Inisialisasi GoogleGenerativeAI dengan kunci yang aman
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Mengambil prompt dan skema dari body permintaan
        const { prompt, schema } = req.body;

        if (!prompt) {
            return res.status(400).json({ message: "Prompt tidak boleh kosong." });
        }

        // Konfigurasi untuk menghasilkan JSON jika skema ada
        const generationConfig = schema ? {
            responseMimeType: "application/json",
            responseSchema: schema,
        } : {};

        // Menghasilkan konten
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig,
        });

        const responseText = result.response.text();
        
        // Mengirim kembali hasil sebagai JSON
        res.status(200).json(JSON.parse(responseText));

    } catch (error) {
        console.error("Error di dalam API route:", error);
        res.status(500).json({ message: error.message || "Terjadi kesalahan internal pada server." });
    }
}
