'use client'

import { useState } from 'react'

export function OpenAIChat() {
  const [prompt, setPrompt]   = useState('')
  const [reply, setReply]     = useState<string>()
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
    setReply(json.completion)
    setLoading(false)
  }

  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8 space-y-6">
      <h2 className="text-white text-2xl font-bold">AI Assistant</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          rows={4}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Type your question here…"
          className="
            w-full 
            px-4 py-3 
            bg-white/10 
            border border-white/30 
            rounded-lg 
            text-black 
            placeholder-[#346066]/50 
            focus:outline-none focus:ring-2 focus:ring-[#346066]/30
          "
        />
        <button
          type="submit"
          disabled={loading}
          className="
            w-full 
            py-2 
            bg-white 
            rounded-lg 
            text-[#346066] 
            font-medium 
            hover:bg-white/90 
            focus:outline-none focus:ring-2 focus:ring-[#346066]/30
            transition
            animate-pulse-subtle
          "
        >
          {loading ? 'Thinking…' : 'Send'}
        </button>
      </form>

      {reply && (
        <div className="mt-4 p-4 bg-white/30 rounded-lg text-black">
          <h3 className="font-semibold mb-2">AI says:</h3>
          <p>{reply}</p>
        </div>
      )}
    </div>
  )
}
