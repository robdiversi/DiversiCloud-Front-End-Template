// src/app/api/database-pricing/route.ts
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
const DATABASE_SERVICES = {
  'Relational SQL DB': {
    aws: 'RDS',
    azure: 'SQL Database',
    gcp: 'Cloud SQL'
  },
  'NoSQL Document DB': {
    aws: 'DynamoDB',
    azure: 'Cosmos DB',
    gcp: 'Firestore'
  },
  'Managed MySQL/Postgres': {
    aws: 'Aurora',
    azure: 'Azure Database for MySQL/PostgreSQL',
    gcp: 'Cloud SQL MySQL/PostgreSQL'
  },
  'Data Warehouse': {
    aws: 'Redshift',
    azure: 'Synapse Analytics',
    gcp: 'BigQuery'
  },
  'In-Memory Cache': {
    aws: 'ElastiCache',
    azure: 'Cache for Redis',
    gcp: 'MemoryStore'
  }
};

// Map RDS instance classes to DB engine and size
const parseInstanceClass = (instanceClass: string) => {
  const parts = instanceClass.split('.');
  return {
    family: parts[1] || 't3',
    size: parts[2] || 'micro'
  };
};

// Azure and GCP relative pricing factors
const PRICE_FACTORS = {
  instancePrice: {
    azure: 0.95,  // Azure is typically ~5% cheaper for database instances
    gcp: 0.90     // GCP is typically ~10% cheaper for database instances
  },
  storagePrice: {
    azure: 1.05,  // Azure storage is typically ~5% more expensive
    gcp: 1.10     // GCP storage is typically ~10% more expensive
  }
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const instanceClass = searchParams.get('instanceClass') || 'db.t3.micro';
  const storageGB = parseInt(searchParams.get('storageGB') || '20');
  const service = searchParams.get('service') || 'Relational SQL DB';
  const region = searchParams.get('region') || 'us-east-1';
  const regionName = REGION_DISPLAY_NAMES[region] || 'US East (N. Virginia)';
  
  try {
    if (service === 'Relational SQL DB') {
      // Fetch RDS instance pricing
      const { family, size } = parseInstanceClass(instanceClass);
      
      const instancePriceCmd = new GetProductsCommand({
        ServiceCode: 'AmazonRDS',
        Filters: [
          { Type: 'TERM_MATCH', Field: 'location', Value: regionName },
          { Type: 'TERM_MATCH', Field: 'instanceType', Value: `db.${family}.${size}` },
          { Type: 'TERM_MATCH', Field: 'deploymentOption', Value: 'Single-AZ' },
          { Type: 'TERM_MATCH', Field: 'databaseEngine', Value: 'MySQL' }
        ],
        MaxResults: 1
      });
      
      const storagePriceCmd = new GetProductsCommand({
        ServiceCode: 'AmazonRDS',
        Filters: [
          { Type: 'TERM_MATCH', Field: 'location', Value: regionName },
          { Type: 'TERM_MATCH', Field: 'volumeType', Value: 'General Purpose' },
          { Type: 'TERM_MATCH', Field: 'deploymentOption', Value: 'Single-AZ' }
        ],
        MaxResults: 1
      });
      
      // Execute both queries in parallel
      const [instancePriceResp, storagePriceResp] = await Promise.all([
        client.send(instancePriceCmd),
        client.send(storagePriceCmd)
      ]);
      
      // Parse instance price
      let instanceHourlyPrice = 0.018; // Default
      if (instancePriceResp.PriceList && instancePriceResp.PriceList.length > 0) {
        const priceData = JSON.parse(instancePriceResp.PriceList[0] as string);
        const onDemandTerms = priceData.terms.OnDemand;
        const termKey = Object.keys(onDemandTerms)[0];
        const priceDimensions = onDemandTerms[termKey].priceDimensions;
        const dimensionKey = Object.keys(priceDimensions)[0];
        instanceHourlyPrice = parseFloat(priceDimensions[dimensionKey].pricePerUnit.USD);
      }
      
      // Parse storage price
      let storageGBMonthPrice = 0.115; // Default
      if (storagePriceResp.PriceList && storagePriceResp.PriceList.length > 0) {
        const priceData = JSON.parse(storagePriceResp.PriceList[0] as string);
        const onDemandTerms = priceData.terms.OnDemand;
        const termKey = Object.keys(onDemandTerms)[0];
        const priceDimensions = onDemandTerms[termKey].priceDimensions;
        const dimensionKey = Object.keys(priceDimensions)[0];
        storageGBMonthPrice = parseFloat(priceDimensions[dimensionKey].pricePerUnit.USD);
      }
      
      // Calculate monthly costs
      const hoursPerMonth = 730; // 365 * 24 / 12
      const instanceMonthly = instanceHourlyPrice * hoursPerMonth;
      const storageMonthly = storageGB * storageGBMonthPrice;
      const totalMonthly = instanceMonthly + storageMonthly;
      
      // Calculate Azure and GCP prices using the relative price factors
      const azureInstanceMonthly = instanceMonthly * PRICE_FACTORS.instancePrice.azure;
      const azureStorageMonthly = storageMonthly * PRICE_FACTORS.storagePrice.azure;
      const azureTotalMonthly = azureInstanceMonthly + azureStorageMonthly;
      
      const gcpInstanceMonthly = instanceMonthly * PRICE_FACTORS.instancePrice.gcp;
      const gcpStorageMonthly = storageMonthly * PRICE_FACTORS.storagePrice.gcp;
      const gcpTotalMonthly = gcpInstanceMonthly + gcpStorageMonthly;
      
      return NextResponse.json({
        aws: {
          price: totalMonthly / hoursPerMonth, // Hourly price
          unit: "hour",
          details: {
            "Service": DATABASE_SERVICES[service].aws,
            "Instance": instanceClass,
            "Storage": `${storageGB} GB (${storageGBMonthPrice.toFixed(3)}/GB-month)`,
            "Monthly Cost": `$${totalMonthly.toFixed(2)}`,
            "Instance Cost": `$${instanceMonthly.toFixed(2)}/month`,
            "Storage Cost": `$${storageMonthly.toFixed(2)}/month`
          }
        },
        azure: {
          price: azureTotalMonthly / hoursPerMonth,
          unit: "hour",
          details: {
            "Service": DATABASE_SERVICES[service].azure,
            "Instance": instanceClass.replace('db.', ''),
            "Storage": `${storageGB} GB (${(storageGBMonthPrice * PRICE_FACTORS.storagePrice.azure).toFixed(3)}/GB-month)`,
            "Monthly Cost": `$${azureTotalMonthly.toFixed(2)}`,
            "Instance Cost": `$${azureInstanceMonthly.toFixed(2)}/month`,
            "Storage Cost": `$${azureStorageMonthly.toFixed(2)}/month`
          }
        },
        gcp: {
          price: gcpTotalMonthly / hoursPerMonth,
          unit: "hour",
          details: {
            "Service": DATABASE_SERVICES[service].gcp,
            "Instance": instanceClass.replace('db.', ''),
            "Storage": `${storageGB} GB (${(storageGBMonthPrice * PRICE_FACTORS.storagePrice.gcp).toFixed(3)}/GB-month)`,
            "Monthly Cost": `$${gcpTotalMonthly.toFixed(2)}`,
            "Instance Cost": `$${gcpInstanceMonthly.toFixed(2)}/month`,
            "Storage Cost": `$${gcpStorageMonthly.toFixed(2)}/month`
          }
        }
      });
      
    } else if (service === 'NoSQL Document DB') {
      // For NoSQL, pricing is typically per GB of storage and throughput
      // Fetch DynamoDB pricing for AWS
      const storagePriceCmd = new GetProductsCommand({
        ServiceCode: 'AmazonDynamoDB',
        Filters: [
          { Type: 'TERM_MATCH', Field: 'location', Value: regionName },
          { Type: 'TERM_MATCH', Field: 'group', Value: 'DDB-Storage' }
        ],
        MaxResults: 1
      });
      
      const readPriceCmd = new GetProductsCommand({
        ServiceCode: 'AmazonDynamoDB',
        Filters: [
          { Type: 'TERM_MATCH', Field: 'location', Value: regionName },
          { Type: 'TERM_MATCH', Field: 'group', Value: 'DDB-ReadUnits' }
        ],
        MaxResults: 1
      });
      
      // Execute both queries in parallel
      const [storagePriceResp, readPriceResp] = await Promise.all([
        client.send(storagePriceCmd),
        client.send(readPriceCmd)
      ]);
      
      // Parse storage price
      let storageGBMonthPrice = 0.25; // Default
      if (storagePriceResp.PriceList && storagePriceResp.PriceList.length > 0) {
        const priceData = JSON.parse(storagePriceResp.PriceList[0] as string);
        const onDemandTerms = priceData.terms.OnDemand;
        const termKey = Object.keys(onDemandTerms)[0];
        const priceDimensions = onDemandTerms[termKey].priceDimensions;
        const dimensionKey = Object.keys(priceDimensions)[0];
        storageGBMonthPrice = parseFloat(priceDimensions[dimensionKey].pricePerUnit.USD);
      }
      
      // Calculate monthly costs
      const storageMonthly = storageGB * storageGBMonthPrice;
      
      // Azure and GCP NoSQL pricing (approximated based on relative factors)
      const azureStoragePrice = 0.30; // Cosmos DB per GB-month
      const gcpStoragePrice = 0.18; // Firestore per GB-month
      
      const azureStorageMonthly = storageGB * azureStoragePrice;
      const gcpStorageMonthly = storageGB * gcpStoragePrice;
      
      return NextResponse.json({
        aws: {
          price: storageGBMonthPrice,
          unit: "GB-month",
          details: {
            "Service": DATABASE_SERVICES[service].aws,
            "Storage": `${storageGB} GB (${storageGBMonthPrice.toFixed(2)}/GB-month)`,
            "Monthly Cost": `${storageMonthly.toFixed(2)}`,
            "Note": "Additional costs for read/write capacity units"
          }
        },
        azure: {
          price: azureStoragePrice,
          unit: "GB-month",
          details: {
            "Service": DATABASE_SERVICES[service].azure,
            "Storage": `${storageGB} GB (${azureStoragePrice.toFixed(2)}/GB-month)`,
            "Monthly Cost": `${azureStorageMonthly.toFixed(2)}`,
            "Note": "Additional costs for request units (RUs)"
          }
        },
        gcp: {
          price: gcpStoragePrice,
          unit: "GB-month",
          details: {
            "Service": DATABASE_SERVICES[service].gcp,
            "Storage": `${storageGB} GB (${gcpStoragePrice.toFixed(2)}/GB-month)`,
            "Monthly Cost": `${gcpStorageMonthly.toFixed(2)}`,
            "Note": "Additional costs for read/write operations"
          }
        }
      });
    } else {
      // For other database services, try to fetch AWS pricing if available
      try {
        const serviceCode = service === 'Managed MySQL/Postgres' ? 'AmazonRDS' : 
                          service === 'Data Warehouse' ? 'AmazonRedshift' :
                          service === 'In-Memory Cache' ? 'AmazonElastiCache' : 'AmazonRDS';
        
        const priceCmd = new GetProductsCommand({
          ServiceCode: serviceCode,
          Filters: [
            { Type: 'TERM_MATCH', Field: 'location', Value: regionName }
          ],
          MaxResults: 1
        });
        
        const priceResp = await client.send(priceCmd);
        
        if (priceResp.PriceList && priceResp.PriceList.length > 0) {
          const priceData = JSON.parse(priceResp.PriceList[0] as string);
          const serviceDetails = priceData.product.attributes || {};
          
          // Use mock data but include real service details
          const mockPrices = {
            "Data Warehouse": {
              aws: { price: 5.0, unit: "TB scanned", details: { "Service": DATABASE_SERVICES[service].aws, ...serviceDetails } },
              azure: { price: 5.5, unit: "TB processed", details: { "Service": DATABASE_SERVICES[service].azure } },
              gcp: { price: 6.0, unit: "TB processed", details: { "Service": DATABASE_SERVICES[service].gcp } }
            },
            "In-Memory Cache": {
              aws: { price: 0.068, unit: "GB-hour", details: { "Service": DATABASE_SERVICES[service].aws, ...serviceDetails } },
              azure: { price: 0.055, unit: "GB-hour", details: { "Service": DATABASE_SERVICES[service].azure } },
              gcp: { price: 0.06, unit: "GB-hour", details: { "Service": DATABASE_SERVICES[service].gcp } }
            },
            "Managed MySQL/Postgres": {
              aws: { price: 0.078, unit: "hour", details: { "Service": DATABASE_SERVICES[service].aws, ...serviceDetails } },
              azure: { price: 0.075, unit: "hour", details: { "Service": DATABASE_SERVICES[service].azure } },
              gcp: { price: 0.073, unit: "hour", details: { "Service": DATABASE_SERVICES[service].gcp } }
            }
          };
          
          if (service in mockPrices) {
            return NextResponse.json(mockPrices[service as keyof typeof mockPrices]);
          }
        }
      } catch (error) {
        console.error("Error fetching specific database service pricing:", error);
      }
      
      // Fallback to mock data if specific service pricing fetch fails
      const mockPrices = {
        "Data Warehouse": {
          aws: { price: 5.0, unit: "TB scanned", details: { "Service": DATABASE_SERVICES[service].aws } },
          azure: { price: 5.5, unit: "TB processed", details: { "Service": DATABASE_SERVICES[service].azure } },
          gcp: { price: 6.0, unit: "TB processed", details: { "Service": DATABASE_SERVICES[service].gcp } }
        },
        "In-Memory Cache": {
          aws: { price: 0.068, unit: "GB-hour", details: { "Service": DATABASE_SERVICES[service].aws } },
          azure: { price: 0.055, unit: "GB-hour", details: { "Service": DATABASE_SERVICES[service].azure } },
          gcp: { price: 0.06, unit: "GB-hour", details: { "Service": DATABASE_SERVICES[service].gcp } }
        },
        "Managed MySQL/Postgres": {
          aws: { price: 0.078, unit: "hour", details: { "Service": DATABASE_SERVICES[service].aws } },
          azure: { price: 0.075, unit: "hour", details: { "Service": DATABASE_SERVICES[service].azure } },
          gcp: { price: 0.073, unit: "hour", details: { "Service": DATABASE_SERVICES[service].gcp } }
        }
      };
      
      if (service in mockPrices) {
        return NextResponse.json(mockPrices[service as keyof typeof mockPrices]);
      } else {
        // Default mock response
        return NextResponse.json({
          aws: { price: 0.05, unit: "hour", details: { "Service": DATABASE_SERVICES[service]?.aws || "RDS", "Note": "Estimated price" } },
          azure: { price: 0.048, unit: "hour", details: { "Service": DATABASE_SERVICES[service]?.azure || "SQL Database", "Note": "Estimated price" } },
          gcp: { price: 0.052, unit: "hour", details: { "Service": DATABASE_SERVICES[service]?.gcp || "Cloud SQL", "Note": "Estimated price" } }
        });
      }
    }
  } catch (e: any) {
    console.error('Error fetching database pricing:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}