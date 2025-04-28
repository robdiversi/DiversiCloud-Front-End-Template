// src/app/api/pricing/route.ts
import AWS from 'aws-sdk';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const awsPricing = new AWS.Pricing({ region: 'us-east-1' });
    const awsData = await awsPricing
      .getProducts({
        ServiceCode: 'AmazonEC2',
        Filters: [{ Type: 'TERM_MATCH', Field: 'instanceType', Value: 't3.micro' }],
      })
      .promise();

    return NextResponse.json({ aws: awsData });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
