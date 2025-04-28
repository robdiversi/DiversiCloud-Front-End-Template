// src/app/api/chat/route.ts
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// 1. Define your generic-to-cloud mapping
const SERVICE_MAPPING = {
  "Virtual Machines": {
    aws: "EC2",
    azure: "Virtual Machines",
    gcp: "Compute Engine"
  },
  "Object Storage": {
    aws: "S3",
    azure: "Blob Storage",
    gcp: "Cloud Storage"
  },
  "SQL Database": {
    aws: "RDS",
    azure: "SQL Database",
    gcp: "Cloud SQL"
  }
}

export async function POST(req: Request) {
  const { prompt, model = 'gpt-4-0613' } = await req.json()

  // 2. System prompt with mapping and instructions
  const system = {
    role: 'system' as const,
    content: `
You are a multi-cloud pricing assistant.  You must only talk about the following generic services, mapped as:
${Object.entries(SERVICE_MAPPING).map(([gen, clouds]) =>
  `• ${gen}: AWS → ${clouds.aws}, Azure → ${clouds.azure}, GCP → ${clouds.gcp}`
).join('\n')}

When the user asks for a comparison:
• Return a breakdown of pros & cons per provider.
• Give a cost estimate per cloud (in USD/month).
• Highlight the delta (e.g. “AWS is 10% cheaper than Azure for this workload”).
• Answer only about those services.`
  }

  const user = { role: 'user' as const, content: prompt }
  const chat = await openai.chat.completions.create({
    model,
    messages: [system, user],
    temperature: 0.2,
    functions: [],         // you can define function signatures here later
    function_call: 'none'
  })

  const reply = chat.choices[0].message?.content ?? ''
  return NextResponse.json({ completion: reply })
}
