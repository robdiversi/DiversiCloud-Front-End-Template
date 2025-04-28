// src/app/api/pricing/route.ts
import { NextResponse } from 'next/server';
import AWS from 'aws-sdk';
import { serviceMapping, CloudNames } from '@/lib/serviceMapping';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category')!;
  const service = searchParams.get('service')!;

  // lookup the cloud‐specific identifiers from your mapping:
  const mapping = (serviceMapping[category] as Record<string, CloudNames>)[service];
  if (!mapping) {
    return NextResponse.json({ error: 'Unknown category/service' }, { status: 400 });
  }

  // --- AWS price fetch (uses AWS Pricing API in us-east-1) ---
  let awsPrice: number | null = null;
  try {
    const pricing = new AWS.Pricing({ region: 'us-east-1' });
    // Note: for EC2 you may need ServiceCode="AmazonEC2" + filters to pin down the SKU
    const awsResponse = await pricing.getProducts({
      ServiceCode: mapping.aws.startsWith('Amazon') ? mapping.aws : `Amazon${mapping.aws}`,
      Filters: [
        { Type: 'TERM_MATCH', Field: 'instanceType', Value: mapping.aws },
        // adjust filters as needed per service type...
      ],
    }).promise();

    // parse pricePerUnit from the JSON blob (example for EC2)
    const priceList = JSON.parse(awsResponse.PriceList?.[0] || '{}');
    const onDemand = priceList.terms.OnDemand || {};
    const firstTerm = Object.values(onDemand)[0] as any;
    awsPrice = parseFloat(firstTerm.priceDimensions[Object.keys(firstTerm.priceDimensions)[0]].pricePerUnit.USD);
  } catch (e: any) {
    console.error('AWS pricing error:', e);
  }

  // --- stub Azure & GCP for now ---
  let azurePrice: number | null = null;
  let gcpPrice:   number | null = null;
  // later: use Azure Retail Rates API + GCP Catalog API

  return NextResponse.json({
    aws:   awsPrice   !== null ? { price: awsPrice   } : null,
    azure: azurePrice !== null ? { price: azurePrice } : null,
    gcp:   gcpPrice   !== null ? { price: gcpPrice   } : null,
  });
}
