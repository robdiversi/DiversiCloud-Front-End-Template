'use client'

import * as Tabs from '@radix-ui/react-tabs'
import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useRouter } from 'next/navigation'
import { LoadingScreen } from '@/components/LoadingScreen'
import { OpenAIChat } from '@/components/OpenAIChat'
import { ComparePrices } from '@/components/ComparePrices'

export default function DashboardPage() {
  const { isLoading, isAuthenticated } = useAuth0()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('pricing')

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
      <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-8">
        {/* Page heading */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            DiversiCloud MultiCloud Pricing Tool
          </h1>
          <div className="text-white/70 text-sm">
            Cloud pricing data updated: April 2025
          </div>
        </header>

        <Tabs.Root 
          defaultValue="pricing" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          {/* Tab triggers */}
          <Tabs.List className="flex space-x-2 mb-6">
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
              value="resources"
              className="
                px-5 py-3 
                bg-white/20 text-white 
                rounded-lg 
                data-[state=active]:bg-white 
                data-[state=active]:text-[#346066] 
                transition-all
              "
            >
              My Resources
            </Tabs.Trigger>
          </Tabs.List>

          {/* Tab panels */}
          <Tabs.Content value="pricing" className="mt-4 animate-fadeIn">
            <div className="bg-white/5 rounded-lg border border-white/10 p-1">
              <ComparePrices />
            </div>
            
            {/* Additional pricing insights */}
            <div className="mt-6 bg-white/5 rounded-lg border border-white/10 p-4">
              <h3 className="text-white text-lg font-medium mb-2">Pricing Insights</h3>
              <p className="text-white/80">
                Compare pricing across different cloud providers to optimize your infrastructure costs.
                Consider reserving instances for predictable workloads or using spot instances for
                non-critical, fault-tolerant applications to save up to 90% on compute costs.
              </p>
            </div>
          </Tabs.Content>
          
          <Tabs.Content value="ai" className="mt-4 animate-fadeIn">
            <OpenAIChat />
          </Tabs.Content>
          
          <Tabs.Content value="resources" className="mt-4 animate-fadeIn">
            <div className="bg-white/5 rounded-lg border border-white/10 p-6">
              <h2 className="text-white text-xl font-medium mb-4">My Cloud Resources</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2">Running Instances</h3>
                  <div className="text-white/70">
                    <p>AWS: 3 instances</p>
                    <p>Azure: 1 instance</p>
                    <p>GCP: 0 instances</p>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2">Storage Usage</h3>
                  <div className="text-white/70">
                    <p>AWS S3: 250 GB</p>
                    <p>Azure Blob: 120 GB</p>
                    <p>GCP Storage: 50 GB</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center py-6">
                <button
                  className="px-4 py-2 bg-white text-[#346066] rounded hover:bg-white/90 transition"
                >
                  Connect Cloud Accounts
                </button>
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </main>
  )
}