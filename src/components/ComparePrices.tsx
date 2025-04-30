// src/components/ComparePrices.tsx
'use client';

import { useState, useEffect } from 'react';
import { ServicePicker } from './ServicePicker';
import { RegionSelector } from './RegionSelector';
import { serviceMapping } from '@/lib/serviceMapping';

// Define types for our pricing results
type CloudPriceInfo = {
  price: number;
  unit: string;
  details?: Record<string, any>;
};

type CloudPrices = { 
  aws?: CloudPriceInfo;
  azure?: CloudPriceInfo;
  gcp?: CloudPriceInfo;
};

// Simple map to display family group headers
const FAMILY_LABEL: Record<string, string> = {
  t: 'Burstable',
  m: 'General purpose',
  c: 'Compute optimised',
  r: 'Memory optimised',
  x: 'Memory optimised',
  i: 'Storage optimised',
  d: 'Dense storage',
  g: 'GPU',
  p: 'ML / accelerated',
  inf: 'Inference',
  other: 'Other',
};

// Define service-specific unit labels
const SERVICE_UNIT_LABELS: Record<string, Record<string, string>> = {
  "Compute": {
    "Virtual Machines": "hour",
    "Serverless Functions": "million invocations",
    "Containers (K8s)": "hour",
    "Serverless Containers": "minute",
    "Batch Processing": "compute hour",
  },
  "Storage": {
    "Object Storage": "GB-month",
    "Block Storage": "GB-month",
    "File Storage": "GB-month",
    "Cold Archive Storage": "GB-month",
    "Content Delivery (CDN)": "GB transferred",
  },
  "Databases": {
    "Relational SQL DB": "hour",
    "NoSQL Document DB": "GB-month",
    "Managed MySQL/Postgres": "hour",
    "Data Warehouse": "TB scanned",
    "In-Memory Cache": "GB-hour",
  },
  "Networking": {
    "Domain & DNS": "hosted zone/month",
    "Load Balancer": "hour",
    "API Gateway": "million calls",
    "Message Queue": "million requests",
    "VPN & Connectivity": "hour",
  },
  "Security & Identity": {
    "Identity & Access": "MAU",
    "Key Management": "key/month",
    "Web Application FW": "month",
    "Secrets Management": "secret/month",
    "DDoS Protection": "month",
  },
  "Analytics & Big Data": {
    "Log & Event Analytics": "GB ingested",
    "Metrics & Monitoring": "metric/month",
    "Data Pipeline": "hour",
    "Stream Processing": "GB processed",
    "Search Service": "GB/month",
  },
};

export function ComparePrices() {
  /* ─────────────── state ─────────────── */
  const [region, setRegion] = useState('us-east-1');
  const [category, setCategory] = useState<string>();
  const [service, setService] = useState<string>();

  // VM
  const [instGroups, setInstGroups] = useState<Record<string, string[]>>({});
  const [instDetails, setInstDetails] = useState<Record<string, { vcpus: number; memoryMiB: number; network: string; }>>({});
  const [instance, setInstance] = useState<string>();

  // EBS
  const EBS_TYPES = ['gp3', 'gp2', 'io2', 'io1', 'st1', 'sc1'] as const;
  const [volume, setVolume] = useState<typeof EBS_TYPES[number]>('gp3');

  // Serverless
  const [memorySize, setMemorySize] = useState<number>(2048);
  const [executionTime, setExecutionTime] = useState<number>(100);

  // Database
  const [dbInstanceClass, setDbInstanceClass] = useState<string>('db.t3.micro');
  const [dbStorageGB, setDbStorageGB] = useState<number>(20);
  
  // Object storage
  const [storageAmount, setStorageAmount] = useState<number>(100);
  
  // Networking
  const [requestsPerMonth, setRequestsPerMonth] = useState<number>(1000000);
  const [dataTransferGB, setDataTransferGB] = useState<number>(100);

  // pricing
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [apiResponse, setApiResponse] = useState<any>(null); // Store raw API response for debugging
  const [prices, setPrices] = useState<CloudPrices>({});
  const [unitLabel, setUnitLabel] = useState<string>('hour');

  /* ────── load EC2 list when needed ────── */
  useEffect(() => {
    if (category === 'Compute' && service === 'Virtual Machines') {
      (async () => {
        setLoading(true);
        setError(undefined);
        try {
          const r = await fetch(`/api/instances?cloud=aws&region=${region}`, { cache: 'no-store' });
          
          // Debug API response
          if (!r.ok) {
            console.error(`API error: ${r.status} ${r.statusText}`);
            setError(`API error: ${r.status} ${r.statusText}`);
            return;
          }
          
          const j: { items: string[]; details: typeof instDetails } = await r.json();
          console.log('EC2 instances API response:', j);
          
          if (!j.items || !Array.isArray(j.items)) {
            setError('Invalid API response format');
            return;
          }
          
          const groups: Record<string, string[]> = {};
          j.items.forEach(t => {
            const fam = t.split('.')[0];
            const pre = fam.match(/^[a-z]+/)?.[0] || 'other';
            const grp = FAMILY_LABEL[pre] ?? FAMILY_LABEL.other;
            (groups[grp] ||= []).push(t);
          });
          Object.values(groups).forEach(a => a.sort());
          setInstGroups(groups);
          setInstDetails(j.details);
        } catch (err: any) {
          console.error('Error loading EC2 list:', err);
          setError(`Failed to load EC2 list: ${err.message}`);
        } finally { 
          setLoading(false); 
        }
      })();
    } else {
      setInstGroups({}); setInstDetails({}); setInstance(undefined);
    }
  }, [category, service, region]);

  /* ────── update unit label when service changes ────── */
  useEffect(() => {
    if (category && service && SERVICE_UNIT_LABELS[category]?.[service]) {
      setUnitLabel(SERVICE_UNIT_LABELS[category][service]);
    } else {
      setUnitLabel('hour'); // Default
    }
  }, [category, service]);

  /* ────── fetch prices ────── */
  const fetchPrices = async () => {
    setLoading(true);
    setError(undefined);
    setPrices({});
    setApiResponse(null);
    
    try {
      let path = '';
      const qs = new URLSearchParams({ region });

      // Handle different service types 
      if (category === 'Compute' && service === 'Virtual Machines') {
        if (!instance) {
          setError('Choose an instance type');
          setLoading(false);
          return;
        }
        qs.set('category', category);
        qs.set('service', service);
        qs.set('instanceType', instance);
        path = '/api/pricing';
      } else if (category === 'Storage' && service === 'Block Storage') {
        qs.set('volumeType', volume);
        path = '/api/ebs';
      } else if (category === 'Compute' && service === 'Serverless Functions') {
        qs.set('category', category);
        qs.set('service', service);
        qs.set('memorySize', memorySize.toString());
        qs.set('executionTime', executionTime.toString());
        path = '/api/serverless-pricing';
      } else if (category === 'Storage' && service === 'Object Storage') {
        qs.set('category', category);
        qs.set('service', service);
        qs.set('storageAmount', storageAmount.toString());
        path = '/api/storage-pricing';
      } else if (category === 'Databases') {
        qs.set('category', category);
        qs.set('service', service!);
        qs.set('instanceClass', dbInstanceClass);
        qs.set('storageGB', dbStorageGB.toString());
        path = '/api/database-pricing';
      } else if (category === 'Networking') {
        qs.set('category', category);
        qs.set('service', service!);
        qs.set('requestsPerMonth', requestsPerMonth.toString());
        qs.set('dataTransferGB', dataTransferGB.toString());
        path = '/api/networking-pricing';
      } else if (category === 'Security & Identity') {
        qs.set('category', category);
        qs.set('service', service!);
        path = '/api/security-pricing';
      } else if (category === 'Analytics & Big Data') {
        qs.set('category', category);
        qs.set('service', service!);
        path = '/api/analytics-pricing';
      } else {
        setError(`Pricing API not implemented for ${category}/${service}`);
        setLoading(false);
        return;
      }

      // Debug the API URL being fetched
      console.log(`Fetching pricing from: ${path}?${qs}`);

      const r = await fetch(`${path}?${qs}`, { cache: 'no-store' });
      
      // Debug API response
      if (!r.ok) {
        console.error(`API error: ${r.status} ${r.statusText}`);
        setError(`API error: ${r.status} ${r.statusText}`);
        setLoading(false);
        return;
      }
      
      const j = await r.json();
      console.log('API response:', j);
      setApiResponse(j); // Store raw response for debugging
      
      if (j.error) {
        setError(j.error);
        setLoading(false);
        return;
      }

      // Check if expected response format
      if (!j.aws && !j.azure && !j.gcp) {
        setError('Invalid API response format');
        setLoading(false);
        return;
      }

      setPrices({
        aws: j.aws ? { 
          price: j.aws.price, 
          unit: j.aws.unit || unitLabel, 
          details: j.aws.details 
        } : undefined,
        azure: j.azure ? { 
          price: j.azure.price, 
          unit: j.azure.unit || unitLabel, 
          details: j.azure.details 
        } : undefined,
        gcp: j.gcp ? { 
          price: j.gcp.price, 
          unit: j.gcp.unit || unitLabel, 
          details: j.gcp.details 
        } : undefined,
      });
    } catch (e: any) { 
      console.error('Error fetching prices:', e);
      setError(`Error fetching prices: ${e.message}`);
    } finally { 
      setLoading(false); 
    }
  };

  // Get the cloud service names based on selected category and service
  const getCloudServiceNames = () => {
    if (!category || !service) return null;
    return serviceMapping[category]?.[service];
  };

  const cloudServices = getCloudServiceNames();

  // Format price value with appropriate decimal places
  const formatPrice = (price: number): string => {
    if (price < 0.0001) return price.toFixed(8);
    if (price < 0.001) return price.toFixed(6);
    if (price < 0.01) return price.toFixed(5);
    if (price < 0.1) return price.toFixed(4);
    if (price < 1) return price.toFixed(3);
    return price.toFixed(2);
  };

  // Calculate percentage difference between prices
  const calculatePriceDifference = (basePrice: number, comparePrice: number): string => {
    return ((comparePrice - basePrice) / basePrice * 100).toFixed(1);
  };

  /* ────── Service-specific configuration UI ────── */
  const renderServiceConfig = () => {
    if (!category || !service) return null;

    // Compute - Virtual Machines
    if (category === 'Compute' && service === 'Virtual Machines') {
      return (
        <>
          <label className="block text-white mt-2">Instance Type</label>
          {loading && !instance && <p className="text-white/70">Loading list…</p>}
          {!loading && (
            <select
              className="w-full p-2 bg-white/10 text-white rounded"
              value={instance || ''}
              onChange={e => setInstance(e.target.value)}
            >
              <option value="" disabled>select…</option>
              {Object.entries(instGroups).map(([grp, arr]) => (
                <optgroup key={grp} label={grp}>
                  {arr.map(i => <option key={i}>{i}</option>)}
                </optgroup>
              ))}
            </select>
          )}
          {instance && instDetails[instance] && (
            <p className="text-white/70 text-sm mt-1">
              {instDetails[instance].vcpus} vCPU · {(instDetails[instance].memoryMiB / 1024).toFixed(1)} GiB · {instDetails[instance].network}
            </p>
          )}
        </>
      );
    }

    // Storage - Block Storage
    if (category === 'Storage' && service === 'Block Storage') {
      return (
        <>
          <label className="block text-white mt-2">EBS volume type</label>
          <select
            className="w-full p-2 bg-white/10 text-white rounded"
            value={volume}
            onChange={e => setVolume(e.target.value as any)}
          >
            {EBS_TYPES.map(v => <option key={v}>{v}</option>)}
          </select>
        </>
      );
    }

    // Compute - Serverless Functions (Lambda)
    if (category === 'Compute' && service === 'Serverless Functions') {
      return (
        <>
          <label className="block text-white mt-2">Memory Size (MB)</label>
          <select
            className="w-full p-2 bg-white/10 text-white rounded"
            value={memorySize}
            onChange={e => setMemorySize(parseInt(e.target.value))}
          >
            {[128, 256, 512, 1024, 2048, 4096, 8192, 10240].map(size => (
              <option key={size} value={size}>{size} MB</option>
            ))}
          </select>

          <label className="block text-white mt-2">Avg. Execution Time (ms)</label>
          <input
            type="number"
            className="w-full p-2 bg-white/10 text-white rounded"
            value={executionTime}
            onChange={e => setExecutionTime(parseInt(e.target.value))}
            min={1}
            max={900000} // 15 minutes in ms
          />
        </>
      );
    }

    // Storage - Object Storage
    if (category === 'Storage' && service === 'Object Storage') {
      return (
        <>
          <label className="block text-white mt-2">Storage (GB)</label>
          <input
            type="number"
            className="w-full p-2 bg-white/10 text-white rounded"
            value={storageAmount}
            onChange={e => setStorageAmount(parseInt(e.target.value))}
            min={1}
          />
        </>
      );
    }

    // Databases
    if (category === 'Databases') {
      return (
        <>
          <label className="block text-white mt-2">Instance Class</label>
          <select
            className="w-full p-2 bg-white/10 text-white rounded"
            value={dbInstanceClass}
            onChange={e => setDbInstanceClass(e.target.value)}
          >
            {['db.t3.micro', 'db.t3.small', 'db.t3.medium', 'db.t3.large', 'db.r5.large', 'db.r5.xlarge'].map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>

          <label className="block text-white mt-2">Storage (GB)</label>
          <input
            type="number"
            className="w-full p-2 bg-white/10 text-white rounded"
            value={dbStorageGB}
            onChange={e => setDbStorageGB(parseInt(e.target.value))}
            min={20}
            max={64000}
          />
        </>
      );
    }

    // Networking
    if (category === 'Networking') {
      return (
        <>
          <label className="block text-white mt-2">Requests per month</label>
          <input
            type="number"
            className="w-full p-2 bg-white/10 text-white rounded"
            value={requestsPerMonth}
            onChange={e => setRequestsPerMonth(parseInt(e.target.value))}
            min={1}
            step={10000}
          />

          <label className="block text-white mt-2">Data Transfer (GB)</label>
          <input
            type="number"
            className="w-full p-2 bg-white/10 text-white rounded"
            value={dataTransferGB}
            onChange={e => setDataTransferGB(parseInt(e.target.value))}
            min={0}
          />
        </>
      );
    }

    // For services that don't have specific configs yet
    return (
      <p className="text-white/70 mt-2">
        Click "Get Prices" to see pricing for {service} across providers.
      </p>
    );
  };

  /* ────── render ────── */
  return (
    <div className="space-y-6">
      <h2 className="text-white text-xl font-semibold">
        Public Cloud Services Price Comparison
      </h2>

      <RegionSelector value={region} onChange={setRegion} />

      <ServicePicker onSelect={(c, s) => { setCategory(c); setService(s); setPrices({}); setError(undefined); }} />

      {/* Service-specific config */}
      {category && service && (
        <div className="p-4 bg-white/5 rounded-lg border border-white/10 mt-4">
          <h3 className="text-white font-medium mb-3">Configure {service}</h3>
          {renderServiceConfig()}
        </div>
      )}

      <button
        className="mt-3 px-4 py-2 bg-white text-[#346066] rounded hover:bg-white/90 transition disabled:opacity-50 disabled:hover:bg-white"
        onClick={fetchPrices}
        disabled={loading || (category === 'Compute' && service === 'Virtual Machines' && !instance)}
      >
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#346066]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading prices...
          </span>
        ) : 'Get Prices'}
      </button>

      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-white">
          <p className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      )}

      {/* Debug panel for API response */}
      {apiResponse && (
        <div className="p-3 bg-gray-500/20 border border-gray-500/30 rounded-lg text-white mt-4">
          <details>
            <summary className="cursor-pointer font-medium">Debug: API Response</summary>
            <pre className="mt-2 text-xs overflow-auto max-h-60 p-2 bg-black/30 rounded">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Display prices when available */}
      {!loading && !error && Object.values(prices).some(p => p != null) && (
        <div className="space-y-6">
          {/* Provider selection tabs */}
          <div className="relative border-b border-white/20">
            <div className="flex overflow-x-auto py-1 space-x-4">
              {(['AWS', 'Azure', 'GCP'] as const).map(cloud => {
                const key = cloud.toLowerCase() as keyof CloudPrices;
                const p = prices[key];
                if (!p) return null;
                const serviceName = cloudServices ? cloudServices[key as keyof typeof cloudServices] : service;
                
                return (
                  <div key={cloud} className="px-3 py-2 rounded-t-lg bg-white/15 border-t border-x border-white/15">
                    <div className="flex items-center">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2 text-white/70">
                        <path 
                          d={cloud === 'AWS' ? 'M8 3L6 15l3-2v5l2-7h3l1-3h3l1-5H8z' : 
                             cloud === 'Azure' ? 'M5 5h7v7H5V5zm0 7h7v7H5v-7zm7 0h7v7h-7v-7zm0-7h7v7h-7V5z' : 
                             'M12 8c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm-9 4c0-4.97 4.03-9 9-9V1L23 3 12 5v2c-4.97 0-9 4.03-9 9'}
                          fill="currentColor"
                        />
                      </svg>
                      <div>
                        <div className="text-white font-medium">{cloud}</div>
                        <div className="text-white/70 text-xs">{serviceName}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Price cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {(['AWS', 'Azure', 'GCP'] as const).map(cloud => {
              const key = cloud.toLowerCase() as keyof CloudPrices;
              const p = prices[key];
              const serviceName = cloudServices ? cloudServices[key as keyof typeof cloudServices] : service;
              
              if (!p) return (
                <div key={cloud} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h3 className="text-white font-medium mb-1">{cloud}: {serviceName}</h3>
                  <p className="text-white/50 text-lg">Pricing not available</p>
                </div>
              );
              
              return (
                <div key={cloud} className="p-4 bg-white/10 rounded-lg border border-white/20 transition hover:bg-white/15">
                  <h3 className="text-white font-medium mb-1">{cloud}: {serviceName}</h3>
                  <p className="text-white text-2xl font-bold">
                    ${formatPrice(p.price)}
                    <span className="text-white/70 text-sm font-normal">/{p.unit}</span>
                  </p>
                  {p.details && (
                    <div className="mt-4 space-y-1 text-white/80 text-sm border-t border-white/10 pt-3">
                      {Object.entries(p.details).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-white/60">{k}:</span> <span>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pricing comparison */}
          {Object.values(prices).filter(p => p?.price != null).length > 1 && (
            <div className="p-4 bg-white/10 rounded-lg border border-white/20 mt-8">
              <h3 className="text-white font-medium mb-4 pb-2 border-b border-white/10">Cost Comparison</h3>
              <div className="text-white/90">
                {(() => {
                  const validPrices = Object.entries(prices)
                    .filter(([_, p]) => p?.price != null)
                    .map(([key, p]) => ({ 
                      provider: key.toUpperCase(), 
                      price: p!.price, 
                      unit: p!.unit 
                    }));
                  
                  if (validPrices.length < 2) return "Not enough data for comparison";
                  
                  validPrices.sort((a, b) => a.price - b.price);
                  const cheapest = validPrices[0];
                  const others = validPrices.slice(1);
                  
                  // Create comparative price bars
                  const maxWidth = 100; // percentage
                  const bars = validPrices.map(p => ({
                    ...p,
                    width: (p.price / validPrices[validPrices.length - 1].price) * maxWidth
                  }));
                  
                  return (
                    <div>
                      <p className="font-medium text-white mb-4">
                        <span className="text-green-300">{cheapest.provider}</span> is the most cost-effective option
                      </p>
                      
                      {/* Price comparison bars */}
                      <div className="space-y-3 mb-4">
                        {bars.map(bar => (
                          <div key={bar.provider} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{bar.provider}</span>
                              <span>${formatPrice(bar.price)}/{bar.unit}</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  bar.provider === cheapest.provider 
                                    ? 'bg-green-400' 
                                    : 'bg-yellow-400'
                                }`}
                                style={{ width: `${bar.width}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {others.map(other => {
                        const pctDiff = calculatePriceDifference(cheapest.price, other.price);
                        return (
                          <p key={other.provider} className="text-sm">
                            <span className="text-yellow-300">{other.provider}</span> is <span className="font-bold">{pctDiff}%</span> more expensive than {cheapest.provider}
                          </p>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
          
          {/* Usage examples or recommendations */}
          <div className="p-4 bg-white/5 rounded-lg border border-white/10 mt-4">
            <h3 className="text-white font-medium mb-2">Usage Recommendation</h3>
            <p className="text-white/70 text-sm">
              {category === 'Compute' && service === 'Virtual Machines' && 
                'For consistent workloads with predictable usage patterns, reserved instances can provide significant discounts (up to 72% compared to on-demand pricing). Consider spot instances for fault-tolerant, flexible workloads to save up to 90%.'
              }
              {category === 'Compute' && service === 'Serverless Functions' && 
                'Optimize your function code to reduce execution time and memory usage. Package only the dependencies you need and use environment variables for configuration.'
              }
              {category === 'Storage' && 
                'Consider lifecycle policies to automatically transition data to lower-cost storage tiers. For infrequently accessed data, choose cold/archive storage to significantly reduce costs.'
              }
              {category === 'Databases' && 
                'Choose the right instance size based on your workload. Overprovision memory for read-heavy workloads and CPU for write-heavy workloads. Consider using managed database services to reduce operational overhead.'
              }
              {category === 'Networking' && 
                'Use content delivery networks (CDNs) to reduce data transfer costs. Consider optimizing your API calls to reduce requests and consolidate data transfers where possible.'
              }

              {category === 'Security & Identity' && 
                              'Balance security requirements with cost. Consider using managed services for core security functions and implement appropriate access policies to minimize operational overhead.'
                            }
                            {category === 'Analytics & Big Data' && 
                              'Process and filter data before ingestion to reduce storage and processing costs. Consider using serverless options for intermittent workloads and reserved instances for consistent usage.'
                            }
                            {!(category === 'Compute' || category === 'Storage' || category === 'Databases' || category === 'Networking' || category === 'Security & Identity' || category === 'Analytics & Big Data') && 
                              'Compare each provider\'s pricing model and feature set to determine the best option for your specific use case. Consider factors beyond price such as global availability, integration with existing systems, and compliance requirements.'
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }