// src/components/ServicePicker.tsx
'use client'

import { useState } from 'react'
import { serviceMapping, ServiceCategory } from '@/lib/serviceMapping'

export function ServicePicker({
  onSelect,
}: {
  onSelect: (category: string, generic: string) => void
}) {
  const categories = Object.keys(serviceMapping)
  const [activeCat, setActiveCat] = useState(categories[0])

  return (
    <div className="flex h-72 border border-white/20 rounded-lg overflow-hidden">
      {/* LEFT PANE */}
      <nav className="w-40 bg-white/10 p-2 overflow-y-auto">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={
              'block w-full text-left px-3 py-2 rounded ' +
              (cat === activeCat
                ? 'bg-white text-[#346066] font-semibold'
                : 'text-white hover:bg-white/20')
            }
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* RIGHT PANE */}
      <div className="flex-1 bg-white/10 p-4 overflow-y-auto">
        <h3 className="text-white mb-2 font-medium">{activeCat}</h3>
        <ul className="space-y-1">
          {(serviceMapping[activeCat] as ServiceCategory) &&
            Object.entries(serviceMapping[activeCat]).map(
              ([generic, { aws, azure, gcp }]) => (
                <li key={generic}>
                  <button
                    onClick={() => onSelect(activeCat, generic)}
                    className="w-full text-white text-left px-3 py-2 rounded hover:bg-white/20"
                  >
                    <div className="flex justify-between">
                      <span>{generic}</span>
                      <small className="text-xs opacity-75">
                        {aws} / {azure} / {gcp}
                      </small>
                    </div>
                  </button>
                </li>
              )
            )}
        </ul>
      </div>
    </div>
  )
}
