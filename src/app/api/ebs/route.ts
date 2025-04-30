import { NextResponse } from 'next/server';
import { PricingClient, GetProductsCommand } from '@aws-sdk/client-pricing';

const client = new PricingClient({ region: 'us-east-1' });

// Define Azure and GCP equivalent volume types and relative pricing
const STORAGE_EQUIVALENTS = {
  'gp3': {
    azure: { type: 'Premium SSD', priceFactor: 1.05 },
    gcp: { type: 'SSD Persistent Disk', priceFactor: 1.08 }
  },
  'gp2': {
    azure: { type: 'Standard SSD', priceFactor: 0.98 },
    gcp: { type: 'Balanced Persistent Disk', priceFactor: 1.02 }
  },
  'io2': {
    azure: { type: 'Ultra Disk', priceFactor: 1.15 },
    gcp: { type: 'Extreme Persistent Disk', priceFactor: 1.2 }
  },
  'io1': {
    azure: { type: 'Ultra Disk', priceFactor: 1.1 },
    gcp: { type: 'Extreme Persistent Disk', priceFactor: 1.12 }
  },
  'st1': {
    azure: { type: 'Standard HDD', priceFactor: 0.92 },
    gcp: { type: 'Standard Persistent Disk', priceFactor: 0.9 }
  },
  'sc1': {
    azure: { type: 'Standard HDD', priceFactor: 0.85 },
    gcp: { type: 'Standard Persistent Disk', priceFactor: 0.82 }
  }
};

// AWS region names to Azure and GCP region mapping
const REGION_MAPPING = {
  'US East (N. Virginia)': {
    azure: 'East US',
    gcp: 'us-east4'
  },
  'US East (Ohio)': {
    azure: 'East US 2',
    gcp: 'us-east1'
  },
  'US West (N. California)': {
    azure: 'West US',
    gcp: 'us-west1'
  },
  'US West (Oregon)': {
    azure: 'West US 2',
    gcp: 'us-west1'
  },
  'EU (Ireland)': {
    azure: 'North Europe',
    gcp: 'europe-west1'
  },
  'EU (Frankfurt)': {
    azure: 'West Europe',
    gcp: 'europe-west3'
  }
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const volumeType = searchParams.get('volumeType') || 'gp3';
  const region = searchParams.get('region') || 'US East (N. Virginia)';

  try {
    const cmd = new GetProductsCommand({
      ServiceCode: 'AmazonEC2',
      Filters: [
        { Type: 'TERM_MATCH', Field: 'location', Value: region },
        { Type: 'TERM_MATCH', Field: 'volumeType', Value: volumeType },
        { Type: 'TERM_MATCH', Field: 'group', Value: 'EBS' },
        { Type: 'TERM_MATCH', Field: 'usagetype', Value: `${volumeType.toUpperCase()}-VolumeUsage` },
      ],
      MaxResults: 5,
    });
    const resp = await client.send(cmd);
    const raw = resp.PriceList?.[0] as string | undefined;
    if (!raw) throw new Error('not found');

    const product = JSON.parse(raw);
    const termKey = Object.keys(product.terms.OnDemand)[0];
    const dim = Object.values(product.terms.OnDemand[termKey].priceDimensions)[0];
    const price = parseFloat(dim.pricePerUnit.USD);

    // Get the equivalent types and pricing factors for other clouds
    const equivalents = STORAGE_EQUIVALENTS[volumeType as keyof typeof STORAGE_EQUIVALENTS] || {
      azure: { type: 'Standard SSD', priceFactor: 1.0 },
      gcp: { type: 'SSD Persistent Disk', priceFactor: 1.0 }
    };

    // Get regional mapping
    const regionMap = REGION_MAPPING[region as keyof typeof REGION_MAPPING] || {
      azure: 'East US',
      gcp: 'us-east4'
    };

    // Calculate equivalent prices
    const azurePrice = price * equivalents.azure.priceFactor;
    const gcpPrice = price * equivalents.gcp.priceFactor;

    return NextResponse.json({
      aws: {
        price,
        unit: "GB-month",
        details: {
          type: volumeType,
          region: region
        }
      },
      azure: {
        price: azurePrice,
        unit: "GB-month",
        details: {
          type: equivalents.azure.type,
          region: regionMap.azure
        }
      },
      gcp: {
        price: gcpPrice,
        unit: "GB-month",
        details: {
          type: equivalents.gcp.type,
          region: regionMap.gcp
        }
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}