// src/app/api/serverless-pricing/route.ts
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
const SERVERLESS_SERVICES = {
  aws: 'Lambda',
  azure: 'Functions',
  gcp: 'Cloud Functions'
};

// Relative pricing factors for Azure and GCP compared to AWS
const PRICE_FACTORS = {
  requestPrice: {
    aws: 1.0,    // $0.20 per million (reference)
    azure: 0.8,  // $0.16 per million
    gcp: 1.5     // $0.30 per million
  },
  computePrice: {
    aws: 1.0,    // $0.0000166667 per GB-second (reference)
    azure: 0.9,  // 10% less than AWS
    gcp: 0.85    // 15% less than AWS
  }
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const memorySize = parseInt(searchParams.get('memorySize') || '128');
  const executionTime = parseInt(searchParams.get('executionTime') || '100');
  const region = searchParams.get('region') || 'us-east-1';
  const regionName = REGION_DISPLAY_NAMES[region] || 'US East (N. Virginia)';
  
  try {
    // Fetch AWS Lambda pricing
    const requestPriceCmd = new GetProductsCommand({
      ServiceCode: 'AWSLambda',
      Filters: [
        { Type: 'TERM_MATCH', Field: 'location', Value: regionName },
        { Type: 'TERM_MATCH', Field: 'group', Value: 'AWS-Lambda-Requests' }
      ],
      MaxResults: 1
    });
    
    const computePriceCmd = new GetProductsCommand({
      ServiceCode: 'AWSLambda',
      Filters: [
        { Type: 'TERM_MATCH', Field: 'location', Value: regionName },
        { Type: 'TERM_MATCH', Field: 'group', Value: 'AWS-Lambda-Duration' }
      ],
      MaxResults: 1
    });
    
    // Execute both queries in parallel
    const [requestPriceResp, computePriceResp] = await Promise.all([
      client.send(requestPriceCmd),
      client.send(computePriceCmd)
    ]);
    
    // Parse the price data
    let requestPrice = 0.20 / 1000000; // Default: $0.20 per million requests
    let computePrice = 0.0000166667; // Default: $0.0000166667 per GB-second
    
    // Extract request price
    if (requestPriceResp.PriceList && requestPriceResp.PriceList.length > 0) {
      const priceData = JSON.parse(requestPriceResp.PriceList[0] as string);
      const onDemandTerms = priceData.terms.OnDemand;
      const termKey = Object.keys(onDemandTerms)[0];
      const priceDimensions = onDemandTerms[termKey].priceDimensions;
      const dimensionKey = Object.keys(priceDimensions)[0];
      requestPrice = parseFloat(priceDimensions[dimensionKey].pricePerUnit.USD) / 1000000;
    }
    
    // Extract compute price
    if (computePriceResp.PriceList && computePriceResp.PriceList.length > 0) {
      const priceData = JSON.parse(computePriceResp.PriceList[0] as string);
      const onDemandTerms = priceData.terms.OnDemand;
      const termKey = Object.keys(onDemandTerms)[0];
      const priceDimensions = onDemandTerms[termKey].priceDimensions;
      const dimensionKey = Object.keys(priceDimensions)[0];
      computePrice = parseFloat(priceDimensions[dimensionKey].pricePerUnit.USD) / 1000;
    }
    
    // Calculate AWS Lambda cost
    const gbSize = memorySize / 1024;
    const executionTimeSec = executionTime / 1000;
    const gbSeconds = gbSize * executionTimeSec;
    
    // Cost per execution
    const awsComputeCost = gbSeconds * computePrice;
    
    // Monthly cost assuming 1 million executions
    const awsMonthlyCost = (awsComputeCost + requestPrice) * 1000000;
    
    // Calculate Azure and GCP costs using the relative price factors
    const azureRequestPrice = requestPrice * PRICE_FACTORS.requestPrice.azure;
    const azureComputePrice = computePrice * PRICE_FACTORS.computePrice.azure;
    const azureComputeCost = gbSeconds * azureComputePrice;
    const azureMonthlyCost = (azureComputeCost + azureRequestPrice) * 1000000;
    
    const gcpRequestPrice = requestPrice * PRICE_FACTORS.requestPrice.gcp;
    const gcpComputePrice = computePrice * PRICE_FACTORS.computePrice.gcp;
    const gcpComputeCost = gbSeconds * gcpComputePrice;
    const gcpMonthlyCost = (gcpComputeCost + gcpRequestPrice) * 1000000;
    
    return NextResponse.json({
      aws: {
        price: awsMonthlyCost,
        unit: "million invocations",
        details: {
          "Service": SERVERLESS_SERVICES.aws,
          "Memory": `${memorySize} MB`,
          "Duration": `${executionTime} ms`,
          "Compute Cost": `$${(awsComputeCost * 1000000).toFixed(2)} per million`,
          "Request Cost": `$${(requestPrice * 1000000).toFixed(2)} per million`,
          "Free Tier": "1M requests/month, 400,000 GB-seconds"
        }
      },
      azure: {
        price: azureMonthlyCost,
        unit: "million invocations",
        details: {
          "Service": SERVERLESS_SERVICES.azure,
          "Memory": `${memorySize} MB`,
          "Duration": `${executionTime} ms`,
          "Compute Cost": `$${(azureComputeCost * 1000000).toFixed(2)} per million`,
          "Request Cost": `$${(azureRequestPrice * 1000000).toFixed(2)} per million`,
          "Free Tier": "1M executions/month, 400,000 GB-seconds"
        }
      },
      gcp: {
        price: gcpMonthlyCost,
        unit: "million invocations",
        details: {
          "Service": SERVERLESS_SERVICES.gcp,
          "Memory": `${memorySize} MB`,
          "Duration": `${executionTime} ms`,
          "Compute Cost": `$${(gcpComputeCost * 1000000).toFixed(2)} per million`,
          "Request Cost": `$${(gcpRequestPrice * 1000000).toFixed(2)} per million`,
          "Free Tier": "2M invocations/month, 400,000 GB-seconds"
        }
      }
    });
  } catch (e: any) {
    console.error('Error fetching serverless pricing:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}