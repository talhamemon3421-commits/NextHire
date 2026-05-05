// /src/services/Google_Gemini_API/index.js

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "AIzaSyCVb89zTxY-lmg-RJZMKZi3fHq7wpuqK28",
});

// ─── GENERATE JOB FROM PROMPT ────────────────────────────────────────────────
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

// ─── EVALUATE SINGLE APPLICANT ───────────────────────────────────────────────
export const evaluateSingleApplicant = async (jobData, applicantData) => {
  const systemInstruction = `You are an expert HR recruiter and talent evaluator. You will be given a job posting and an applicant's profile. Evaluate how well the applicant matches the job.

Return ONLY valid JSON — no markdown fences, no explanation, no extra text.

The JSON must follow this exact structure:
{
  "score": number (0-100, where 100 is a perfect match),
  "recommendation": "yes" | "maybe" | "no",
  "strengths": ["string", ...] (3-5 specific strengths relevant to the job),
  "weaknesses": ["string", ...] (2-4 areas of concern or gaps),
  "summary": "string (2-3 sentence professional assessment)"
}

Rules:
- Base the score on skills match, experience alignment, and overall fit
- Be specific — reference actual skills/requirements from both the job and the applicant
- Be honest but professional in the assessment
- If applicant has no skills listed, note it as a weakness but don't automatically score 0`;

  const prompt = `JOB POSTING:
${JSON.stringify(jobData, null, 2)}

APPLICANT PROFILE:
${JSON.stringify(applicantData, null, 2)}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction,
      temperature: 0.4,
    },
  });

  const rawText = response.text.trim();
  const cleaned = rawText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned);
};

// ─── RANK ALL APPLICANTS FOR A JOB ──────────────────────────────────────────
export const rankApplicants = async (jobData, applicantProfiles) => {
  const systemInstruction = `You are an expert HR recruiter. You will be given a job posting and multiple applicant profiles. Score and rank every applicant.

Return ONLY valid JSON — no markdown fences, no explanation, no extra text.

The JSON must be an array following this exact structure:
[
  {
    "applicationId": "string (the applicationId from the input)",
    "name": "string",
    "score": number (0-100),
    "rank": number (1 = best),
    "pros": ["string", ...] (2-4 specific strengths),
    "cons": ["string", ...] (1-3 specific weaknesses)
  },
  ...
]

Rules:
- Rank ALL applicants provided — do not skip any
- Order the array by rank (1 first, then 2, etc.)
- Be specific — reference actual skills and job requirements
- Differentiate scores meaningfully (don't give everyone 50-60)
- Use the applicationId exactly as provided in the input`;

  const prompt = `JOB POSTING:
${JSON.stringify(jobData, null, 2)}

APPLICANT PROFILES:
${JSON.stringify(applicantProfiles, null, 2)}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction,
      temperature: 0.4,
    },
  });

  const rawText = response.text.trim();
  const cleaned = rawText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned);
};