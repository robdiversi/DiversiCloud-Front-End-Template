'use client'

import { useState } from 'react'
import { ServicePicker } from './ServicePicker'

interface PricingResponse {
  aws: { price: number } | null
  azure: { price: number } | null
  gcp: { price: number } | null
  error?: string
}

export function ComparePrices() {
  const [category, setCategory] = useState<string>()
  const [service, setService]   = useState<string>()
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string>()
  const [prices, setPrices]     = useState<{
    aws?: number
    azure?: number
    gcp?: number
  }>({})

  const handlePick = async (cat: string, svc: string) => {
    setCategory(cat)
    setService(svc)
    setLoading(true)
    setError(undefined)

    try {
      const res = await fetch(
        `/api/pricing?category=${encodeURIComponent(cat)}&service=${encodeURIComponent(svc)}`
      )
      const json: PricingResponse = await res.json()

      if (!res.ok || json.error) {
        throw new Error(json.error || 'Failed to fetch prices')
      }

      setPrices({
        aws:   json.aws?.price,
        azure: json.azure?.price,
        gcp:   json.gcp?.price,
      })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Updated header */}
      <h2 className="text-white text-xl font-semibold">
        Public Cloud Services Price Comparison
      </h2>

      {/* 2. Two-pane picker */}
      <ServicePicker onSelect={handlePick} />

      {/* 3. Status messages */}
      {loading && (
        <p className="text-white/80">
          Loading prices for <strong>{service}</strong> ({category})…
        </p>
      )}
      {error && <p className="text-red-400">Error: {error}</p>}

      {/* 4. Price cards */}
      {!loading && !error && service && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white/10 rounded-lg">
            <h3 className="font-medium mb-1">AWS</h3>
            <p>
              {prices.aws != null
                ? `$${prices.aws.toFixed(4)}/unit`
                : 'N/A'}
            </p>
          </div>
          <div className="p-4 bg-white/10 rounded-lg">
            <h3 className="font-medium mb-1">Azure</h3>
            <p>
              {prices.azure != null
                ? `$${prices.azure.toFixed(4)}/unit`
                : 'N/A'}
            </p>
          </div>
          <div className="p-4 bg-white/10 rounded-lg">
            <h3 className="font-medium mb-1">GCP</h3>
            <p>
              {prices.gcp != null
                ? `$${prices.gcp.toFixed(4)}/unit`
                : 'N/A'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
