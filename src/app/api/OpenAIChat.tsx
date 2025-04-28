// src/components/OpenAIChat.tsx
'use client'
import { useState } from 'react'

export function OpenAIChat() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState<string|null>(null)
  const [loading, setLoading] = useState(false)

  const send = async () => {
    setLoading(true)
    const r = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o', prompt }),
    })
    const data = await r.json()
    setResponse(data.text)
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <textarea
        className="w-full p-2 border rounded"
        rows={4}
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
      />
      <button
        onClick={send}
        disabled={loading}
        className="px-4 py-2 bg-white text-[#346066] rounded hover:bg-white/90 transition"
      >
        {loading ? 'Thinking…' : 'Send to OpenAI'}
      </button>
      {response && (
        <div className="p-4 bg-white/20 rounded">
          <pre>{response}</pre>
        </div>
      )}
    </div>
  )
}
