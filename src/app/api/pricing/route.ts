// src/app/api/pricing/route.ts
import { NextResponse } from 'next/server';

interface Catalog {
  products: Record<string, {
    sku: string;
    attributes: { instanceType:string; location:string; [k:string]:string };
  }>;
  terms: {
    OnDemand: Record<string, {
      sku: string;
      priceDimensions: Record<string, { pricePerUnit:{ USD:string } }>;
    }>;
  };
}

const cache: Record<string, Promise<Catalog>> = {};

function fetchRegion(region: string) {
  cache[region] ??= (async () => {
    const url = `https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/${region}/index.json`;
    const r   = await fetch(url, { next:{ cache:'no-store' } });
    if (!r.ok) throw new Error(`Catalog fetch ${r.status}`);
    return r.json() as Promise<Catalog>;
  })();
  return cache[region];
}

/** region code -> catalog "location" label */
const REGION_LABEL: Record<string,string> = {
  'us-east-1'  : 'US East (N. Virginia)',
  'us-east-2'  : 'US East (Ohio)',
  'us-west-1'  : 'US West (N. California)',
  'us-west-2'  : 'US West (Oregon)',
  'eu-west-1'  : 'EU (Ireland)',
  'eu-central-1': 'EU (Frankfurt)',
  // add more if you expose them in the RegionSelector
};

// Rough estimates for Azure pricing compared to AWS (multiplier)
const AZURE_PRICE_FACTOR: Record<string, number> = {
  't2': 1.05,
  't3': 1.08,
  't4': 1.06,
  'm5': 0.95,
  'm6': 0.97,
  'c5': 1.02,
  'c6': 1.03,
  'r5': 0.99,
  'r6': 1.01,
  'default': 1.0
};

// Rough estimates for GCP pricing compared to AWS (multiplier)
const GCP_PRICE_FACTOR: Record<string, number> = {
  't2': 0.98,
  't3': 0.97,
  't4': 0.99,
  'm5': 0.96,
  'm6': 0.98,
  'c5': 0.95,
  'c6': 0.97,
  'r5': 1.02,
  'r6': 1.03,
  'default': 1.0
};

// Maps AWS instance types to equivalent Azure/GCP names
function getCloudEquivalents(instance: string) {
  const size = instance.split('.')[1];
  
  // Map of AWS instance families to Azure/GCP equivalents
  const familyMap: Record<string, { azure: string, gcp: string }> = {
    't2': { azure: 'B', gcp: 'e2-standard' },
    't3': { azure: 'B', gcp: 'e2-standard' },
    't4': { azure: 'B', gcp: 'e2-standard' },
    'm5': { azure: 'D', gcp: 'n2-standard' },
    'm6': { azure: 'D', gcp: 'n2-standard' },
    'c5': { azure: 'F', gcp: 'c2-standard' },
    'c6': { azure: 'F', gcp: 'c2-standard' },
    'r5': { azure: 'E', gcp: 'm1-megamem' },
    'r6': { azure: 'E', gcp: 'm1-megamem' },
    'default': { azure: 'D', gcp: 'n2' }
  };

  // Extract the AWS family (e.g., 't3', 'm5', etc.)
  const family = instance.match(/^([a-z]+\d+)/)?.[0] || 'default';
  const cloudFamilies = family in familyMap ? familyMap[family] : familyMap.default;
  
  return {
    azure: `${cloudFamilies.azure}${size}`,
    gcp: `${cloudFamilies.gcp}-${size}`
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const region   = searchParams.get('region')       || 'us-east-1';
  const inst     = searchParams.get('instanceType');
  const category = searchParams.get('category');
  const service  = searchParams.get('service');

  if (category !== 'Compute' || service !== 'Virtual Machines' || !inst) {
    return NextResponse.json({ error: 'bad params' }, { status: 400 });
  }

  try {
    const cat   = await fetchRegion(region);
    const label = REGION_LABEL[region] ?? REGION_LABEL['us-east-1'];

    const prod = Object.values(cat.products).find(p =>
      p.attributes.instanceType === inst &&
      p.attributes.location     === label);

    if (!prod) return NextResponse.json({ error: 'instance not found' }, { status: 404 });

    const term = Object.values(cat.terms.OnDemand).find(t => t.sku === prod.sku);
    const price = term ? parseFloat(Object.values(term.priceDimensions)[0].pricePerUnit.USD) : null;

    // Get equivalent instance types and estimated prices for Azure and GCP
    const cloudEquivalents = getCloudEquivalents(inst);
    
    // Determine price factors based on instance family
    const family = inst.match(/^([a-z]+\d+)/)?.[0] || 'default';
    const azureFactor = family in AZURE_PRICE_FACTOR ? AZURE_PRICE_FACTOR[family] : AZURE_PRICE_FACTOR.default;
    const gcpFactor = family in GCP_PRICE_FACTOR ? GCP_PRICE_FACTOR[family] : GCP_PRICE_FACTOR.default;
    
    // Estimate prices for Azure and GCP based on AWS price
    const azurePrice = price ? price * azureFactor : null;
    const gcpPrice = price ? price * gcpFactor : null;

    return NextResponse.json({
      aws: price != null ? { 
        price, 
        unit: "hour",
        details: {
          vcpu: prod.attributes.vcpu,
          memory: prod.attributes.memory,
          network: prod.attributes.networkPerformance,
          instanceType: inst
        }
      } : null,
      azure: azurePrice != null ? { 
        price: azurePrice, 
        unit: "hour",
        details: {
          instanceType: cloudEquivalents.azure,
          vcpu: prod.attributes.vcpu,
          memory: prod.attributes.memory
        }
      } : null,
      gcp: gcpPrice != null ? { 
        price: gcpPrice, 
        unit: "hour",
        details: {
          instanceType: cloudEquivalents.gcp,
          vcpu: prod.attributes.vcpu,
          memory: prod.attributes.memory
        }
      } : null,
    });
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}