'use server'

import OpenAI from 'openai'
import { ChatMessage } from '../types/chat'
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
	baseURL: process.env.BASE_URL
})
import { LocationWithThumbnail } from '../types/location'

export async function getChatResponse(messages: ChatMessage[], location: LocationWithThumbnail) {
  try {
    const systemPrompt = generatePrompt(location)
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
    })

    return response.choices[0].message.content
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to get response from AI')
  }
}

function generatePrompt(location: LocationWithThumbnail) {
  const systemPrompt = `
  あなたは${location.name}の歴史・文化について詳しく解説する観光ガイドです。
  以下の要件を絶対に満たしてください。
  - 回答にli, strong, pタグなどを使用してWebサイトで閲覧しやすくして
  - 回答は常に簡潔に、かつ興味深い詳細を含め、観光満足度が向上する内容にしてください。
  - 観光に関係のない質問の場合は必ず「${location.name}関する質問しか回答できません」と回答してください
  - ${location.name}以外の観光地以外に関する質問の場合も必ず${location.name}関する質問しか回答できません」と回答してください
  - 観光客からの質問がイベントや行事に関連するものであれば、${location.name}で毎年行われているイベントの情報を簡潔に提供してください
  - 観光客はおすすめの観光地を質問する場合があります。その場合は、${location.name}に関する観光地や、${location.name}周辺の有名観光地を概要とともに回答してください
  - 必要に応じて、追加の質問を促し、訪問者の興味を引き出してください。
  `

  return systemPrompt
}

