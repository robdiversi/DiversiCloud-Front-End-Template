// src/app/api/pricing-test/route.ts
import { NextResponse } from 'next/server';
import { testApiRoute } from '@/lib/awsPricingTest';

export async function GET(req: Request) {
  try {
    const result = await testApiRoute(req);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in pricing test API route:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}