// src/app/api/pricing/route.ts
import { NextResponse } from "next/server";
import {
  PricingClient,
  GetProductsCommand,
  GetProductsCommandOutput,
} from "@aws-sdk/client-pricing";
import { serviceMapping, CloudNames } from "@/lib/serviceMapping";

// Pricing only in us-east-1
const awsPricing = new PricingClient({
  region: "us-east-1",
  // to pick up your SSO profile from ~/.aws/config:
  // set AWS_SDK_LOAD_CONFIG=1 in your .env.local
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category      = searchParams.get("category")!;
  const service       = searchParams.get("service")!;
  const awsRegionName = searchParams.get("region") || "US East (N. Virginia)";
  const instanceTypeQ = searchParams.get("instanceType") || "";

  // 1) Validate & map
  const mapping = (serviceMapping[category] as Record<string,CloudNames>)[service];
  if (!mapping) {
    return NextResponse.json({ error: "Unknown category/service" }, { status: 400 });
  }

  // 2) Build filters
  const filters: Parameters<GetProductsCommand>[0]["Filters"] = [
    { Type: "TERM_MATCH", Field: "location",      Value: awsRegionName },
    // **On-Demand Linux / Shared tenancy / no pre-installs / used capacity**
    { Type: "TERM_MATCH", Field: "operatingSystem", Value: "Linux" },
    { Type: "TERM_MATCH", Field: "tenancy",         Value: "Shared" },
    { Type: "TERM_MATCH", Field: "preInstalledSw",  Value: "NA" },
    { Type: "TERM_MATCH", Field: "capacitystatus",  Value: "Used" },
  ];

  if (category === "Compute") {
    // if they passed ?instanceType=... we use that, else fallback to mapping.aws
    const sku = instanceTypeQ || mapping.aws;
    filters.push({ Type: "TERM_MATCH", Field: "instanceType", Value: sku });
  }

  if (category === "Storage") {
    filters.push({
      Type: "TERM_MATCH",
      Field: "storageClass",
      Value:
        mapping.aws === "EBS"
          ? "General Purpose"
          : mapping.aws,
    });
  }

  const awsServiceCode = mapping.aws.startsWith("Amazon")
    ? mapping.aws
    : `Amazon${mapping.aws}`;

  // 3) Fetch from AWS Pricing
  let awsPrice: number | null = null;
  try {
    const cmd = new GetProductsCommand({
      ServiceCode: awsServiceCode,
      Filters:     filters,
      MaxResults:  1,
    });
    const resp: GetProductsCommandOutput = await awsPricing.send(cmd);

    const raw = resp.PriceList?.[0] as string|undefined;
    if (raw) {
      const product  = JSON.parse(raw);
      const onDemand = product.terms.OnDemand || {};
      const termKey  = Object.keys(onDemand)[0];
      const dims     = onDemand[termKey].priceDimensions;
      const dimKey   = Object.keys(dims)[0];
      awsPrice = parseFloat(dims[dimKey].pricePerUnit.USD);
    }
  } catch (e: any) {
    console.error("AWS pricing error:", e);
  }

  // 4) Stub Azure/GCP for now
  const azurePrice: number | null = null;
  const gcpPrice:   number | null = null;

  return NextResponse.json({
    aws:   awsPrice   !== null ? { price: awsPrice   } : null,
    azure: azurePrice !== null ? { price: azurePrice } : null,
    gcp:   gcpPrice   !== null ? { price: gcpPrice   } : null,
  });
}
