// File: api/generate.js
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY tidak diatur di Environment Variables Vercel.");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ message: "Prompt tidak boleh kosong." });
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        res.status(200).json({ text: text });

    } catch (error) {
        console.error("Error di dalam API generate:", error);
        res.status(500).json({ message: error.message || "Terjadi kesalahan internal pada server." });
    }
}