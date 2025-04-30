// src/components/RegionSelector.tsx
'use client';

type RegionSelectorProps = {
  value: string;
  onChange: (v: string) => void;
};

const REGIONS = [
  { id: 'us-east-1', name: 'US-East-1 (N. Virginia)' },
  { id: 'us-east-2', name: 'US-East-2 (Ohio)' },
  { id: 'us-west-1', name: 'US-West-1 (N. California)' },
  { id: 'us-west-2', name: 'US-West-2 (Oregon)' },
  { id: 'eu-west-1', name: 'EU-West-1 (Ireland)' },
  { id: 'eu-central-1', name: 'EU-Central-1 (Frankfurt)' },
  // …add as many as you like
];

export function RegionSelector({ value, onChange }: RegionSelectorProps) {
  return (
    <div>
      <label className="block text-white mt-2">AWS Region</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full p-2 bg-white/10 text-white rounded"
      >
        {REGIONS.map(r => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </select>
    </div>
  );
}
