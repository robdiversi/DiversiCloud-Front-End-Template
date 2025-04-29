// src/components/ComparePrices.tsx
'use client'

import { useState, useEffect } from 'react'
import { ServicePicker } from './ServicePicker'

type PricingResponse = {
  aws:   { price: number } | null
  azure: { price: number } | null
  gcp:   { price: number } | null
  error?: string
}

export function ComparePrices() {
  // 1) core state
  const [category,      setCategory]      = useState<string>()
  const [service,       setService]       = useState<string>()
  const [instanceTypes, setInstanceTypes] = useState<string[]>([])
  const [groupedTypes,  setGroupedTypes]  = useState<Record<string,string[]>>({})
  const [selectedType,  setSelectedType]  = useState<string>()
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState<string>()
  const [prices,        setPrices]        = useState<{ aws?: number; azure?: number; gcp?: number }>({})

  // 2) whenever the user picks “Compute → Virtual Machines”, fetch AWS instance types
  useEffect(() => {
    if (category === 'Compute' && service === 'Virtual Machines') {
      setLoading(true)
      setError(undefined)
      fetch('/api/instances?cloud=aws')
        .then(r => r.json())
        .then(json => {
          const items: string[] = json.items || []
          setInstanceTypes(items)

          // group by the prefix before the dot, e.g. "m5d.xlarge" → "m5d"
          const groups: Record<string,string[]> = {}
          items.forEach(t => {
            const family = t.split('.')[0]
            groups[family] ||= []
            groups[family].push(t)
          })
          // sort families and their members
          Object.keys(groups)
            .sort()
            .forEach(fam => groups[fam].sort())

          setGroupedTypes(groups)
        })
        .catch(() => setError('Failed to load instance types'))
        .finally(() => setLoading(false))
    } else {
      // reset when you leave Compute/VM
      setInstanceTypes([])
      setGroupedTypes({})
      setSelectedType(undefined)
    }
  }, [category, service])

  // 3) when you click “Get Prices”
  const handleFetchPrices = async () => {
    if (!category || !service) return
    if (category === 'Compute' && service === 'Virtual Machines' && !selectedType) {
      setError('Please select an instance type')
      return
    }

    setLoading(true)
    setError(undefined)
    setPrices({})

    const params = new URLSearchParams({
      category,
      service,
      ...(category === 'Compute' ? { instanceType: selectedType! } : {}),
    })

    try {
      const res = await fetch(`/api/pricing?${params.toString()}`)
      const json: PricingResponse = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || 'Fetch failed')
      setPrices({
        aws:   json.aws?.price,
        azure: json.azure?.price,
        gcp:   json.gcp?.price,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 4) when you pick a new category/service
  const handlePick = (cat: string, svc: string) => {
    setCategory(cat)
    setService(svc)
    setPrices({})
    setSelectedType(undefined)
    setError(undefined)
  }

  // === JSX ===
  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-white text-xl font-semibold">
        Public Cloud Services Price Comparison
      </h2>

      {/* Two-pane category/service picker */}
      <ServicePicker onSelect={handlePick} />

      {/* Instance Type dropdown if Compute/VM */}
      {category === 'Compute' && service === 'Virtual Machines' && (
        <div>
          <label className="block text-white mb-1">Instance Type</label>
          <select
            value={selectedType || ''}
            onChange={e => setSelectedType(e.target.value)}
            className="w-full p-2 bg-white/10 text-white rounded"
          >
            <option value="" disabled>
              Select instance…
            </option>
            {Object.entries(groupedTypes).map(([family, types]) => (
              <optgroup key={family} label={family}>
                {types.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      )}

      {/* “Get Prices” button */}
      <button
        onClick={handleFetchPrices}
        disabled={
          loading ||
          (category === 'Compute' && service === 'Virtual Machines' && !selectedType)
        }
        className="mt-2 px-4 py-2 bg-white text-[#346066] rounded hover:bg-white/90 transition disabled:opacity-50"
      >
        {loading ? 'Loading…' : 'Get Prices'}
      </button>

      {/* Status / Error */}
      {error && <p className="text-red-400">Error: {error}</p>}
      {loading && !error && (
        <p className="text-white/80">
          Loading prices for <strong>{service}</strong> ({category})…
        </p>
      )}

      {/* Results */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {['AWS', 'Azure', 'GCP'].map(cloud => {
            const key = cloud.toLowerCase() as 'aws' | 'azure' | 'gcp'
            const val = prices[key]
            return (
              <div key={cloud} className="p-4 bg-white/10 rounded-lg">
                <h3 className="font-medium mb-1">{cloud}</h3>
                <p className="text-white">
                  {val != null
                    ? `$${val.toFixed(4)}/${category === 'Compute' ? 'hour' : 'unit'}`
                    : 'N/A'}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
