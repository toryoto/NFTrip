'use server'

import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
	baseURL: process.env.BASE_URL
});

export async function getChatResponse(messages: { role: string, content: string }[]) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant for a tourist spot." },
        ...messages
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to get response from AI');
  }
}