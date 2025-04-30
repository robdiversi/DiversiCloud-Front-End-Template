'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowUpCircle, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function OpenAIChat() {
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [prompt])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: prompt,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setPrompt('')
    setLoading(true)

    try {
      // Create conversation history for context
      const conversation = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          model: 'gpt-4o',
          conversation // Send conversation history for context
        }),
      })

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }

      const json = await res.json()
      
      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: json.completion || 'Sorry, I couldn\'t generate a response.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error fetching response:', error)
      
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (but allow Shift+Enter for new lines)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 md:p-6 flex flex-col h-full">
      <h2 className="text-white text-2xl font-bold mb-4">MultiCloud AI Assistant</h2>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 max-h-[500px] min-h-[300px] custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white/70 text-center max-w-md">
              <h3 className="text-xl font-medium mb-2">Welcome to MultiCloud AI Assistant!</h3>
              <p>Ask me detailed questions about cloud pricing, architecture decisions, cost optimization strategies, or comparative analysis between AWS, Azure, and GCP.</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`
                  max-w-[80%] rounded-lg p-4
                  ${message.role === 'user' 
                    ? 'bg-white/30 text-black' 
                    : 'bg-white/10 text-white'
                  }
                `}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                  </span>
                  <span className="text-xs opacity-70">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                
                {/* Render markdown content */}
                <div className="prose prose-sm dark:prose-invert">
                  <ReactMarkdown>
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          ref={textareaRef}
          rows={1}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about cloud services, pricing comparisons, architecture decisions..."
          className="
            w-full 
            px-4 py-3 
            bg-white/10 
            border border-white/30 
            rounded-lg 
            text-white
            placeholder-white/50 
            focus:outline-none focus:ring-2 focus:ring-white/30
            resize-none
            pr-12
            min-h-[3rem]
            max-h-[12rem]
            custom-scrollbar
          "
          disabled={loading}
        />
        
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="
            absolute 
            right-3 
            bottom-3
            text-white
            disabled:text-white/30
            focus:outline-none
            transition-colors
          "
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <ArrowUpCircle className="w-6 h-6" />
          )}
        </button>
      </form>
      
      {/* Small disclaimer */}
      <div className="mt-2 text-xs text-white/50 text-center">
        AI responses are based on our pricing database and general cloud knowledge updated April 2025.
      </div>
    </div>
  )
}