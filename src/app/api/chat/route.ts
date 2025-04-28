// src/app/api/chat/route.ts
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY in .env.local')
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  const { prompt, model = 'gpt-3.5-turbo' } = await request.json()

  if (typeof prompt !== 'string' || prompt.trim() === '') {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
  }

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user',   content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 512,
    })

    const reply = completion.choices?.[0]?.message?.content ?? ''
    return NextResponse.json({ completion: reply })
  } catch (e: any) {
    console.error('OpenAI error:', e)
    return NextResponse.json(
      { error: e.message || 'An error occurred' },
      { status: 500 }
    )
  }
}
