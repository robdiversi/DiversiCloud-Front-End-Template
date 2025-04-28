'use client'

import * as Tabs from '@radix-ui/react-tabs'
import { useAuth0 } from '@auth0/auth0-react'
import { useRouter } from 'next/navigation'
import { LoadingScreen } from '@/components/LoadingScreen'
import { OpenAIChat }    from '@/components/OpenAIChat'
import { ComparePrices } from '@/components/ComparePrices'

export default function DashboardPage() {
  const { isLoading, isAuthenticated } = useAuth0()
  const router = useRouter()

  // show spinner while Auth0 is initializing
  if (isLoading) {
    return <LoadingScreen />
  }

  // redirect to login if not signed in
  if (!isAuthenticated) {
    router.replace('/')
    return null
  }

  return (
    <main className="min-h-screen bg-[#346066] py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-8">
        {/* Page heading */}
        <h1 className="text-3xl font-bold text-white mb-6">
          DiversiCloud Dashboard
        </h1>

        <Tabs.Root defaultValue="ai" className="space-y-4">
          {/* Tab triggers */}
          <Tabs.List className="flex space-x-2">
            <Tabs.Trigger
              value="ai"
              className="
                px-5 py-3 
                bg-white/20 text-white 
                rounded-lg 
                data-[state=active]:bg-white 
                data-[state=active]:text-[#346066] 
                transition-all
              "
            >
              AI Assistant
            </Tabs.Trigger>
            <Tabs.Trigger
              value="pricing"
              className="
                px-5 py-3 
                bg-white/20 text-white 
                rounded-lg 
                data-[state=active]:bg-white 
                data-[state=active]:text-[#346066] 
                transition-all
              "
            >
              Service Comparison Tool
            </Tabs.Trigger>
          </Tabs.List>

          {/* Tab panels */}
          <Tabs.Content value="ai" className="mt-4">
            <OpenAIChat />
          </Tabs.Content>
          <Tabs.Content value="pricing" className="mt-4">
            <ComparePrices />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </main>
  )
}
