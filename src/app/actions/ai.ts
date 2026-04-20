'use server';

import { GoogleGenAI } from "@google/genai";

// Initialize with your API key
// The SDK can automatically pick up process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "" });

export async function enhanceBroadcastText(text: string, type: 'tactical' | 'promotional') {
  if (!text) return "";

  const systemPrompt = type === 'tactical'
    ? `You are a professional tactical security AI called 'Sentinel Lens'. 
       Convert the following user input into a professional, concise, and structured tactical broadcast.
       Use uppercase for critical status, and add prefix like 'STATUS_UPDATE' or 'SIGNAL_OVERRIDE'.
       Keep it short for mobile users.
       
       Input: ${text}`
    : `You are a hype-focused event promotion AI for 'Sentinel Lens'. 
       Convert the following user input into an engaging, high-energy community alert.
       Use emojis sparingly and keep it professional but exciting.
       
       Input: ${text}`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }]
    });

    return result.text || text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return text; // Return original text on failure
  }
}
