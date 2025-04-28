// src/app/ai/page.tsx
'use client'

import { useState } from 'react'

export default function AIPage() {
  const [prompt, setPrompt] = useState('')
  const [reply, setReply] = useState<string>()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setReply(undefined)

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model: 'gpt-3.5-turbo' }),
    })
    const json = await res.json()
    if (res.ok) {
      setReply(json.completion)
    } else {
      alert(json.error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#346066] relative overflow-hidden">
      {/* Background grid pattern (optional) */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 grid grid-cols-8 gap-1">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="aspect-square bg-white/10 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Glass card */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 space-y-6">
          <h2 className="text-white text-3xl font-bold text-center">AI Assistant</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              rows={4}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Type your question here…"
              className="
                w-full
                px-4 py-2
                bg-white/20 border border-white/30
                rounded-lg
                font-semibold text-white placeholder-white/50
                focus:outline-none focus:ring-2 focus:ring-white/50
                transition
              "
            />

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                px-4 py-2
                bg-white
                text-[#346066]
                rounded-lg
                font-medium
                hover:bg-white/90
                focus:outline-none focus:ring-2 focus:ring-white/30
                transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {loading ? 'Thinking…' : 'Send'}
            </button>
          </form>

          {reply && (
            <div className="mt-4 p-4 bg-white/20 rounded-lg">
              <h3 className="font-semibold text-white mb-2">AI says:</h3>
              <p className="text-white whitespace-pre-wrap">{reply}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
