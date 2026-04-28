import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: "AIzaSyB1cD04pMxaUTYH0oayxC5jJFuYLEK86q0",
});

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Say hello",
    });

    console.log(response.text);
  } catch (err) {
    console.error(err);
  }
}

run();