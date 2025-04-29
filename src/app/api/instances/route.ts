// src/app/api/instances/route.ts
import { NextResponse } from 'next/server'
import { EC2Client, DescribeInstanceTypesCommand } from '@aws-sdk/client-ec2'

const ec2 = new EC2Client({
  region: process.env.AWS_REGION || 'us-east-1',
  // if using SSO profiles in ~/.aws/config:
  //   export AWS_SDK_LOAD_CONFIG=1
})

export async function GET(req: Request) {
  const url = new URL(req.url)
  const cloud = url.searchParams.get('cloud')

  if (cloud !== 'aws') {
    return NextResponse.json({ items: [] })
  }

  let items: string[] = []
  let nextToken: string | undefined = undefined

  // page through all instance types
  do {
    const { InstanceTypes = [], NextToken } =
      await ec2.send(
        new DescribeInstanceTypesCommand({ NextToken: nextToken })
      )

    for (const it of InstanceTypes) {
      if (it.InstanceType) items.push(it.InstanceType)
    }
    nextToken = NextToken
  } while (nextToken)

  return NextResponse.json({ items })
}
