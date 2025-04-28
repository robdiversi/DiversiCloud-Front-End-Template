// src/lib/awsPricing.ts
import { Pricing } from 'aws-sdk'

const pricing = new Pricing({ region: 'us-east-1' })

type EC2Price = {
  instanceType: string
  onDemandUSDperHour: number
}

/**
 * Fetches the On-Demand per-hour USD rate for a given EC2 instance type in a region.
 */
export async function getEC2OnDemandPrice(
  instanceType: string,
  regionCode: string
): Promise<EC2Price> {
  // AWS Pricing uses “us-east-1” endpoint but filter by the actual region
  const data = await pricing
    .getProducts({
      ServiceCode: 'AmazonEC2',
      Filters: [
        { Type: 'TERM_MATCH', Field: 'instanceType', Value: instanceType },
        { Type: 'TERM_MATCH', Field: 'location', Value: mapRegion(regionCode) },
        { Type: 'TERM_MATCH', Field: 'preInstalledSw', Value: 'NA' },
        { Type: 'TERM_MATCH', Field: 'operatingSystem', Value: 'Linux' },
        { Type: 'TERM_MATCH', Field: 'tenancy', Value: 'Shared' },
        { Type: 'TERM_MATCH', Field: 'capacitystatus', Value: 'Used' },
      ],
      MaxResults: 1,
    })
    .promise()

  if (!data.PriceList?.[0]) {
    throw new Error(`No price found for ${instanceType} in ${regionCode}`)
  }

  const priceItem = JSON.parse(data.PriceList[0] as string)
  // dive into the JSON structure to grab the on-demand USD/hour price
  const ondemand =
    priceItem.terms.OnDemand &&
    Object.values(priceItem.terms.OnDemand)[0] &&
    Object.values(
      ((Object.values(priceItem.terms.OnDemand)[0] as any).priceDimensions as any)
    )[0]

  const pricePerUnit = parseFloat(ondemand.pricePerUnit.USD)

  return { instanceType, onDemandUSDperHour: pricePerUnit }
}

/**
 * AWS uses full region names in the Pricing API, e.g. "US East (N. Virginia)"
 * so we need to map simple region codes to those long names.
 */
function mapRegion(code: string) {
  const map: Record<string, string> = {
    'us-east-1': 'US East (N. Virginia)',
    'us-east-2': 'US East (Ohio)',
    'us-west-2': 'US West (Oregon)',
    // …add more as you need them
  }
  return map[code] || code
}
