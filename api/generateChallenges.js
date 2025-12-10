/* eslint-disable */
// @ts-nocheck

import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { habits = [], performance = {} } = req.body;

    const prompt = `
      Generate 5 personalized habit challenges.
      Habits: ${JSON.stringify(habits)}
      Performance: ${JSON.stringify(performance)}
      Return ONLY valid JSON: { "challenges": [...] }
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const json = JSON.parse(completion.choices[0].message.content);

    return res.status(200).json(json);
  } catch (error) {
    console.error("API ERROR:", error);
    return res.status(500).json({ error: "AI Challenge generation failed" });
  }
}
