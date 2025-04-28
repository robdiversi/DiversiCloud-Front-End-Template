import { OpenAIChat } from '@/components/OpenAIChat'
export default function Dashboard() {
  return (
    <main className="p-8">
      <h1 className="text-2xl mb-4">🧠 AI Playground</h1>
      <OpenAIChat />
    </main>
  )
}
