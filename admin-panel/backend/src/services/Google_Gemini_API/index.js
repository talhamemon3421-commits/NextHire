// /src/services/Google_Gemini_API/index.js

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "AIzaSyB1cD04pMxaUTYH0oayxC5jJFuYLEK86q0",
});

export const generateJobFromPrompt = async (prompt) => {
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const systemInstruction = `You are a professional job posting assistant. Given a user's prompt about a job, generate a complete, realistic job posting as a JSON object.

Return ONLY valid JSON — no markdown fences, no explanation, no extra text.

The JSON must follow this exact structure:
{
  "title": "string (3–150 chars)",
  "description": "string (20–5000 chars, detailed and professional)",
  "jobType": "full-time" | "part-time" | "contract" | "internship" | "freelance",
  "location": "string or null",
  "isRemote": boolean,
  "isUrgent": boolean,
  "salary": {
    "min": number or null,
    "max": number or null,
    "currency": "PKR" | "USD"
  },
  "experienceLevel": "entry" | "junior" | "mid" | "senior" | "lead",
  "responsibilities": ["string", ...] (max 10 items),
  "requirements": ["string", ...] (max 10 items),
  "benefits": ["string", ...] (max 10 items),
  "skills": ["string", ...] (max 10 items),
  "deadline": "ISO datetime string or null",
  "isActive": true
}

Rules:
- If job is remote → isRemote: true, location: null is acceptable
- If job is NOT remote → provide a specific city/location string
- Default currency is PKR unless the prompt implies USD
- If no deadline is mentioned, use: "${thirtyDaysFromNow}"
- Keep responsibilities, requirements, benefits, and skills as concise single-sentence strings
- Make the description detailed (at least 150 chars), professional, and relevant`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction,
      temperature: 0.7,
    },
  });

  const rawText = response.text.trim();

  // Strip accidental markdown fences if Gemini adds them
  const cleaned = rawText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  console.log("Gemini raw response:", rawText);
  return JSON.parse(cleaned);
};