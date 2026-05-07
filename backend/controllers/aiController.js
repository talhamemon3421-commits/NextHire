const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatWithAI = async (req, res) => {
    try {
        const { message, history } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // System instructions to ensure it acts as a Career Coach
        const chat = model.startChat({
            history: history || [],
            generationConfig: { maxOutputTokens: 500 },
        });

        const prompt = `You are an expert Career Coach and Interviewer. 
        Context: The user is a job seeker on the NextHire platform.
        User Message: ${message}`;

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (err) {
        console.error("AI Chat Error:", err);
        res.status(500).json({ msg: "AI Assistant is temporarily unavailable" });
    }
};