// src/app/api/instances/route.ts
import { NextResponse } from 'next/server';
import { paginateDescribeInstanceTypes } from '@aws-sdk/client-ec2';
import { EC2Client } from '@aws-sdk/client-ec2';

// Cache results to avoid repeated API calls
const instanceCache: Record<string, {
  items: string[],
  details: Record<string, { vcpus: number; memoryMiB: number; network: string; }>
}> = {};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get('region') || 'us-east-1';
  const cloud = searchParams.get('cloud') || 'aws';

  // Only query the AWS API for actual data
  // For other clouds, we'll map AWS instances to their counterparts
  if (cloud.toLowerCase() === 'aws') {
    // Check if we already have the data cached
    if (!instanceCache[region]) {
      const ec2 = new EC2Client({ region });
      const paginator = paginateDescribeInstanceTypes({ client: ec2 }, {});

      const items: string[] = [];
      const details: Record<string, { vcpus: number; memoryMiB: number; network: string; }> = {};

      for await (const page of paginator) {
        page.InstanceTypes?.forEach(it => {
          if (!it.InstanceType) return;
          items.push(it.InstanceType);
          details[it.InstanceType] = {
            vcpus: it.VCpuInfo?.DefaultVCpus ?? 0,
            memoryMiB: it.MemoryInfo?.SizeInMiB ?? 0,
            network: it.NetworkInfo?.NetworkPerformance ?? '—',
          };
        });
      }

      // Sort items for better display
      items.sort();
      
      // Cache the results
      instanceCache[region] = { items, details };
    }

    return NextResponse.json(instanceCache[region]);
  } else {
    // For other clouds, return the cached AWS data
    // In a real implementation, you'd query their APIs
    if (!instanceCache[region]) {
      // Fallback to use the AWS data from us-east-1 if we don't have data for the requested region
      if (!instanceCache['us-east-1']) {
        return NextResponse.json(
          { error: 'No instance data available' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(instanceCache['us-east-1']);
    }
    
    return NextResponse.json(instanceCache[region]);
  }
}