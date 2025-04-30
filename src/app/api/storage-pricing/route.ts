// src/app/api/storage-pricing/route.ts
import { NextResponse } from 'next/server';
import { PricingClient, GetProductsCommand } from '@aws-sdk/client-pricing';

const client = new PricingClient({ region: 'us-east-1' });

// Map AWS region codes to region display names for API
const REGION_DISPLAY_NAMES: Record<string, string> = {
  'us-east-1': 'US East (N. Virginia)',
  'us-east-2': 'US East (Ohio)',
  'us-west-1': 'US West (N. California)',
  'us-west-2': 'US West (Oregon)',
  'eu-west-1': 'EU (Ireland)',
  'eu-central-1': 'EU (Frankfurt)',
  // Add more mappings as needed
};

// Equivalent services in Azure and GCP
const STORAGE_SERVICES = {
  'Object Storage': {
    aws: 'S3 Standard',
    azure: 'Blob Storage (Hot)',
    gcp: 'Cloud Storage Standard'
  },
  'Block Storage': {
    aws: 'EBS',
    azure: 'Managed Disks',
    gcp: 'Persistent Disk'
  },
  'File Storage': {
    aws: 'EFS',
    azure: 'Files Storage',
    gcp: 'Filestore'
  },
  'Cold Archive Storage': {
    aws: 'S3 Glacier Deep Archive',
    azure: 'Archive Storage',
    gcp: 'Archive Storage'
  },
  'Content Delivery (CDN)': {
    aws: 'CloudFront',
    azure: 'CDN',
    gcp: 'Cloud CDN'
  }
};

// Azure and GCP pricing factors relative to AWS
const PRICE_FACTORS = {
  'Object Storage': {
    azure: 0.85, // Azure is typically ~15% cheaper for blob storage
    gcp: 0.90    // GCP is typically ~10% cheaper for object storage
  },
  'File Storage': {
    azure: 0.90, // Azure is typically ~10% cheaper for file storage
    gcp: 0.75    // GCP is typically ~25% cheaper for file storage
  },
  'Cold Archive Storage': {
    azure: 0.25, // Azure archive is significantly cheaper
    gcp: 1.0     // GCP archive is similar to AWS
  },
  'Content Delivery (CDN)': {
    azure: 0.95, // Azure is typically ~5% cheaper for CDN
    gcp: 0.94    // GCP is typically ~6% cheaper for CDN
  }
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const service = searchParams.get('service') || 'Object Storage';
  const storageAmount = parseInt(searchParams.get('storageAmount') || '100');
  const region = searchParams.get('region') || 'us-east-1';
  const regionName = REGION_DISPLAY_NAMES[region] || 'US East (N. Virginia)';
  
  try {
    if (service === 'Object Storage') {
      // Fetch S3 pricing
      const storagePriceCmd = new GetProductsCommand({
        ServiceCode: 'AmazonS3',
        Filters: [
          { Type: 'TERM_MATCH', Field: 'location', Value: regionName },
          { Type: 'TERM_MATCH', Field: 'storageClass', Value: 'General Purpose' },
          { Type: 'TERM_MATCH', Field: 'volumeType', Value: 'Standard' }
        ],
        MaxResults: 1
      });
      
      const storagePriceResp = await client.send(storagePriceCmd);
      
      // Parse storage price
      let storageGBMonthPrice = 0.023; // Default
      if (storagePriceResp.PriceList && storagePriceResp.PriceList.length > 0) {
        const priceData = JSON.parse(storagePriceResp.PriceList[0] as string);
        const onDemandTerms = priceData.terms.OnDemand;
        const termKey = Object.keys(onDemandTerms)[0];
        const priceDimensions = onDemandTerms[termKey].priceDimensions;
        const dimensionKey = Object.keys(priceDimensions)[0];
        storageGBMonthPrice = parseFloat(priceDimensions[dimensionKey].pricePerUnit.USD);
      }
      
      // Calculate monthly cost
      const awsMonthly = storageAmount * storageGBMonthPrice;
      
      // Calculate Azure and GCP prices using factors
      const azureRate = storageGBMonthPrice * PRICE_FACTORS['Object Storage'].azure;
      const azureMonthly = storageAmount * azureRate;
      
      const gcpRate = storageGBMonthPrice * PRICE_FACTORS['Object Storage'].gcp;
      const gcpMonthly = storageAmount * gcpRate;
      
      return NextResponse.json({
        aws: {
          price: storageGBMonthPrice,
          unit: "GB-month",
          details: {
            "Service": STORAGE_SERVICES[service].aws,
            "Total Monthly": `$${awsMonthly.toFixed(2)}`,
            "Effective Rate": `$${storageGBMonthPrice.toFixed(4)}/GB-month`,
            "Storage": `${storageAmount} GB`
          }
        },
        azure: {
          price: azureRate,
          unit: "GB-month",
          details: {
            "Service": STORAGE_SERVICES[service].azure,
            "Total Monthly": `$${azureMonthly.toFixed(2)}`,
            "Effective Rate": `$${azureRate.toFixed(4)}/GB-month`,
            "Storage": `${storageAmount} GB`
          }
        },
        gcp: {
          price: gcpRate,
          unit: "GB-month",
          details: {
            "Service": STORAGE_SERVICES[service].gcp,
            "Total Monthly": `$${gcpMonthly.toFixed(2)}`,
            "Effective Rate": `$${gcpRate.toFixed(4)}/GB-month`,
            "Storage": `${storageAmount} GB`
          }
        }
      });
    } else if (service === 'File Storage') {
      // Fetch EFS pricing
      const storagePriceCmd = new GetProductsCommand({
        ServiceCode: 'AmazonEFS',
        Filters: [
          { Type: 'TERM_MATCH', Field: 'location', Value: regionName },
          { Type: 'TERM_MATCH', Field: 'storageClass', Value: 'Standard' }
        ],
        MaxResults: 1
      });
      
      const storagePriceResp = await client.send(storagePriceCmd);
      
      // Parse storage price
      let storageGBMonthPrice = 0.30; // Default
      if (storagePriceResp.PriceList && storagePriceResp.PriceList.length > 0) {
        const priceData = JSON.parse(storagePriceResp.PriceList[0] as string);
        const onDemandTerms = priceData.terms.OnDemand;
        const termKey = Object.keys(onDemandTerms)[0];
        const priceDimensions = onDemandTerms[termKey].priceDimensions;
        const dimensionKey = Object.keys(priceDimensions)[0];
        storageGBMonthPrice = parseFloat(priceDimensions[dimensionKey].pricePerUnit.USD);
      }
      
      // Calculate monthly costs
      const awsMonthly = storageAmount * storageGBMonthPrice;
      
      // Calculate Azure and GCP prices using factors
      const azureRate = storageGBMonthPrice * PRICE_FACTORS['File Storage'].azure;
      const azureMonthly = storageAmount * azureRate;
      
      const gcpRate = storageGBMonthPrice * PRICE_FACTORS['File Storage'].gcp;
      const gcpMonthly = storageAmount * gcpRate;
      
      return NextResponse.json({
        aws: {
          price: storageGBMonthPrice,
          unit: "GB-month",
          details: {
            "Service": STORAGE_SERVICES[service].aws,
            "Total Monthly": `$${awsMonthly.toFixed(2)}`,
            "Storage": `${storageAmount} GB`,
            "Note": "Throughput charged separately"
          }
        },
        azure: {
          price: azureRate,
          unit: "GB-month",
          details: {
            "Service": STORAGE_SERVICES[service].azure,
            "Total Monthly": `$${azureMonthly.toFixed(2)}`,
            "Storage": `${storageAmount} GB`,
            "Note": "Transaction costs apply"
          }
        },
        gcp: {
          price: gcpRate,
          unit: "GB-month",
          details: {
            "Service": STORAGE_SERVICES[service].gcp,
            "Total Monthly": `$${gcpMonthly.toFixed(2)}`,
            "Storage": `${storageAmount} GB`,
            "Note": "Egress charges apply"
          }
        }
      });
    } else if (service === 'Cold Archive Storage') {
      // Fetch Glacier pricing
      const storagePriceCmd = new GetProductsCommand({
        ServiceCode: 'AmazonS3',
        Filters: [
          { Type: 'TERM_MATCH', Field: 'location', Value: regionName },
          { Type: 'TERM_MATCH', Field: 'storageClass', Value: 'Archive' }
        ],
        MaxResults: 1
      });
      
      const storagePriceResp = await client.send(storagePriceCmd);
      
      // Parse storage price
      let storageGBMonthPrice = 0.004; // Default
      if (storagePriceResp.PriceList && storagePriceResp.PriceList.length > 0) {
        const priceData = JSON.parse(storagePriceResp.PriceList[0] as string);
        const onDemandTerms = priceData.terms.OnDemand;
        const termKey = Object.keys(onDemandTerms)[0];
        const priceDimensions = onDemandTerms[termKey].priceDimensions;
        const dimensionKey = Object.keys(priceDimensions)[0];
        storageGBMonthPrice = parseFloat(priceDimensions[dimensionKey].pricePerUnit.USD);
      }
      
      // Calculate monthly costs
      const awsMonthly = storageAmount * storageGBMonthPrice;
      
      // Calculate Azure and GCP prices using factors
      const azureRate = storageGBMonthPrice * PRICE_FACTORS['Cold Archive Storage'].azure;
      const azureMonthly = storageAmount * azureRate;
      
      const gcpRate = storageGBMonthPrice * PRICE_FACTORS['Cold Archive Storage'].gcp;
      const gcpMonthly = storageAmount * gcpRate;
      
      return NextResponse.json({
        aws: {
          price: storageGBMonthPrice,
          unit: "GB-month",
          details: {
            "Service": STORAGE_SERVICES[service].aws,
            "Total Monthly": `$${awsMonthly.toFixed(2)}`,
            "Storage": `${storageAmount} GB`,
            "Note": "Retrieval fees apply"
          }
        },
        azure: {
          price: azureRate,
          unit: "GB-month",
          details: {
            "Service": STORAGE_SERVICES[service].azure,
            "Total Monthly": `$${azureMonthly.toFixed(2)}`,
            "Storage": `${storageAmount} GB`,
            "Note": "Retrieval fees apply"
          }
        },
        gcp: {
          price: gcpRate,
          unit: "GB-month",
          details: {
            "Service": STORAGE_SERVICES[service].gcp,
            "Total Monthly": `$${gcpMonthly.toFixed(2)}`,
            "Storage": `${storageAmount} GB`,
            "Note": "Retrieval fees apply"
          }
        }
      });
    } else if (service === 'Content Delivery (CDN)') {
      // Fetch CloudFront pricing
      const cdnPriceCmd = new GetProductsCommand({
        ServiceCode: 'AmazonCloudFront',
        Filters: [
          { Type: 'TERM_MATCH', Field: 'location', Value: 'Global' },
          { Type: 'TERM_MATCH', Field: 'group', Value: 'CDN-DataTransfer-Out-Bytes' }
        ],
        MaxResults: 1
      });
      
      const cdnPriceResp = await client.send(cdnPriceCmd);
      
      // Parse CDN price
      let cdnGBPrice = 0.085; // Default
      if (cdnPriceResp.PriceList && cdnPriceResp.PriceList.length > 0) {
        const priceData = JSON.parse(cdnPriceResp.PriceList[0] as string);
        const onDemandTerms = priceData.terms.OnDemand;
        const termKey = Object.keys(onDemandTerms)[0];
        const priceDimensions = onDemandTerms[termKey].priceDimensions;
        const dimensionKey = Object.keys(priceDimensions)[0];
        cdnGBPrice = parseFloat(priceDimensions[dimensionKey].pricePerUnit.USD);
      }
      
      // Calculate Azure and GCP prices using factors
      const azurePrice = cdnGBPrice * PRICE_FACTORS['Content Delivery (CDN)'].azure;
      const gcpPrice = cdnGBPrice * PRICE_FACTORS['Content Delivery (CDN)'].gcp;
      
      return NextResponse.json({
        aws: {
          price: cdnGBPrice,
          unit: "GB transferred",
          details: {
            "Service": STORAGE_SERVICES[service].aws,
            "First 10TB/month": `$${cdnGBPrice.toFixed(3)}/GB`,
            "Note": "Price decreases with volume"
          }
        },
        azure: {
          price: azurePrice,
          unit: "GB transferred",
          details: {
            "Service": STORAGE_SERVICES[service].azure,
            "First 10TB/month": `$${azurePrice.toFixed(3)}/GB`,
            "Note": "Price decreases with volume"
          }
        },
        gcp: {
          price: gcpPrice,
          unit: "GB transferred",
          details: {
            "Service": STORAGE_SERVICES[service].gcp,
            "First 10TB/month": `$${gcpPrice.toFixed(3)}/GB`,
            "Note": "Price decreases with volume"
          }
        }
      });
    } else {
      // Default response for other storage services
      return NextResponse.json({
        aws: { 
          price: 0.05, 
          unit: "GB-month", 
          details: { 
            "Service": STORAGE_SERVICES[service]?.aws || "S3",
            "Note": "Estimated price" 
          } 
        },
        azure: { 
          price: 0.048, 
          unit: "GB-month", 
          details: { 
            "Service": STORAGE_SERVICES[service]?.azure || "Blob Storage",
            "Note": "Estimated price" 
          } 
        },
        gcp: { 
          price: 0.052, 
          unit: "GB-month", 
          details: { 
            "Service": STORAGE_SERVICES[service]?.gcp || "Cloud Storage",
            "Note": "Estimated price" 
          } 
        }
      });
    }
  } catch (e: any) {
    console.error('Error fetching storage pricing:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}