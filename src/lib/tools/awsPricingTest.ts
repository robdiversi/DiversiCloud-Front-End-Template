// src/lib/awsPricingTest.ts

import { PricingClient, GetProductsCommand, GetAttributeValuesCommand, DescribeServicesCommand } from '@aws-sdk/client-pricing';

// Initialize AWS SDK client
const client = new PricingClient({ region: 'us-east-1' });

/**
 * Test AWS pricing API connectivity and return available services
 */
export async function testPricingApiConnectivity() {
  try {
    console.log('Testing AWS Pricing API connectivity...');
    const command = new DescribeServicesCommand({});
    const response = await client.send(command);
    
    console.log(`Successfully connected to AWS Pricing API. Found ${response.Services?.length || 0} services.`);
    return response.Services;
  } catch (error) {
    console.error('Error connecting to AWS Pricing API:', error);
    throw error;
  }
}

/**
 * Get all available attributes for a service
 */
export async function getServiceAttributes(serviceCode: string) {
  try {
    console.log(`Getting attributes for service: ${serviceCode}`);
    const command = new DescribeServicesCommand({
      ServiceCode: serviceCode
    });
    
    const response = await client.send(command);
    return response.Services?.[0]?.AttributeNames;
  } catch (error) {
    console.error(`Error getting attributes for service ${serviceCode}:`, error);
    throw error;
  }
}

/**
 * Get all possible values for a specific attribute of a service
 */
export async function getAttributeValues(serviceCode: string, attributeName: string) {
  try {
    console.log(`Getting values for attribute: ${attributeName} of service: ${serviceCode}`);
    const command = new GetAttributeValuesCommand({
      ServiceCode: serviceCode,
      AttributeName: attributeName
    });
    
    const response = await client.send(command);
    return response.AttributeValues;
  } catch (error) {
    console.error(`Error getting values for attribute ${attributeName} of service ${serviceCode}:`, error);
    throw error;
  }
}

/**
 * Test fetching EC2 pricing for a specific instance type
 */
export async function testEc2Pricing(instanceType: string, region: string) {
  try {
    console.log(`Testing EC2 pricing for instance type: ${instanceType} in region: ${region}`);
    
    // Map region code to display name for AWS Pricing API
    const regionMap: Record<string, string> = {
      'us-east-1': 'US East (N. Virginia)',
      'us-east-2': 'US East (Ohio)',
      'us-west-1': 'US West (N. California)',
      'us-west-2': 'US West (Oregon)',
      'eu-west-1': 'EU (Ireland)',
      'eu-central-1': 'EU (Frankfurt)',
    };
    
    const locationName = regionMap[region] || 'US East (N. Virginia)';
    
    const command = new GetProductsCommand({
      ServiceCode: 'AmazonEC2',
      Filters: [
        { Type: 'TERM_MATCH', Field: 'instanceType', Value: instanceType },
        { Type: 'TERM_MATCH', Field: 'location', Value: locationName },
        { Type: 'TERM_MATCH', Field: 'operatingSystem', Value: 'Linux' },
        { Type: 'TERM_MATCH', Field: 'tenancy', Value: 'Shared' },
        { Type: 'TERM_MATCH', Field: 'preInstalledSw', Value: 'NA' },
        { Type: 'TERM_MATCH', Field: 'capacitystatus', Value: 'Used' },
      ],
      MaxResults: 1,
    });
    
    const response = await client.send(command);
    console.log(`Found ${response.PriceList?.length || 0} pricing items.`);
    
    if (!response.PriceList || response.PriceList.length === 0) {
      console.log('No pricing found. Trying with fewer filters...');
      
      // Try with fewer filters
      const simplifiedCommand = new GetProductsCommand({
        ServiceCode: 'AmazonEC2',
        Filters: [
          { Type: 'TERM_MATCH', Field: 'instanceType', Value: instanceType },
          { Type: 'TERM_MATCH', Field: 'location', Value: locationName },
        ],
        MaxResults: 1,
      });
      
      const simplifiedResponse = await client.send(simplifiedCommand);
      console.log(`Found ${simplifiedResponse.PriceList?.length || 0} pricing items with simplified query.`);
      
      if (simplifiedResponse.PriceList && simplifiedResponse.PriceList.length > 0) {
        console.log('Pricing found with simplified query. First item:');
        const priceData = JSON.parse(simplifiedResponse.PriceList[0] as string);
        return priceData;
      }
      
      return null;
    }
    
    const priceData = JSON.parse(response.PriceList[0] as string);
    return priceData;
  } catch (error) {
    console.error(`Error testing EC2 pricing:`, error);
    throw error;
  }
}

/**
 * Test fetching S3 pricing
 */
export async function testS3Pricing(region: string) {
  try {
    console.log(`Testing S3 pricing in region: ${region}`);
    
    // Map region code to display name for AWS Pricing API
    const regionMap: Record<string, string> = {
      'us-east-1': 'US East (N. Virginia)',
      'us-east-2': 'US East (Ohio)',
      'us-west-1': 'US West (N. California)',
      'us-west-2': 'US West (Oregon)',
      'eu-west-1': 'EU (Ireland)',
      'eu-central-1': 'EU (Frankfurt)',
    };
    
    const locationName = regionMap[region] || 'US East (N. Virginia)';
    
    const command = new GetProductsCommand({
      ServiceCode: 'AmazonS3',
      Filters: [
        { Type: 'TERM_MATCH', Field: 'location', Value: locationName },
        { Type: 'TERM_MATCH', Field: 'storageClass', Value: 'General Purpose' },
      ],
      MaxResults: 1,
    });
    
    const response = await client.send(command);
    console.log(`Found ${response.PriceList?.length || 0} S3 pricing items.`);
    
    if (!response.PriceList || response.PriceList.length === 0) {
      console.log('No S3 pricing found. Trying with fewer filters...');
      
      // Try with fewer filters
      const simplifiedCommand = new GetProductsCommand({
        ServiceCode: 'AmazonS3',
        Filters: [
          { Type: 'TERM_MATCH', Field: 'location', Value: locationName },
        ],
        MaxResults: 1,
      });
      
      const simplifiedResponse = await client.send(simplifiedCommand);
      console.log(`Found ${simplifiedResponse.PriceList?.length || 0} S3 pricing items with simplified query.`);
      
      if (simplifiedResponse.PriceList && simplifiedResponse.PriceList.length > 0) {
        console.log('S3 pricing found with simplified query. First item:');
        const priceData = JSON.parse(simplifiedResponse.PriceList[0] as string);
        return priceData;
      }
      
      return null;
    }
    
    const priceData = JSON.parse(response.PriceList[0] as string);
    return priceData;
  } catch (error) {
    console.error(`Error testing S3 pricing:`, error);
    throw error;
  }
}

/**
 * Test fetching Lambda pricing
 */
export async function testLambdaPricing(region: string) {
  try {
    console.log(`Testing Lambda pricing in region: ${region}`);
    
    // Map region code to display name for AWS Pricing API
    const regionMap: Record<string, string> = {
      'us-east-1': 'US East (N. Virginia)',
      'us-east-2': 'US East (Ohio)',
      'us-west-1': 'US West (N. California)',
      'us-west-2': 'US West (Oregon)',
      'eu-west-1': 'EU (Ireland)',
      'eu-central-1': 'EU (Frankfurt)',
    };
    
    const locationName = regionMap[region] || 'US East (N. Virginia)';
    
    const command = new GetProductsCommand({
      ServiceCode: 'AWSLambda',
      Filters: [
        { Type: 'TERM_MATCH', Field: 'location', Value: locationName },
      ],
      MaxResults: 10,
    });
    
    const response = await client.send(command);
    console.log(`Found ${response.PriceList?.length || 0} Lambda pricing items.`);
    
    if (!response.PriceList || response.PriceList.length === 0) {
      return null;
    }
    
    // Parse and return all pricing items
    const pricingItems = response.PriceList.map(item => JSON.parse(item as string));
    return pricingItems;
  } catch (error) {
    console.error(`Error testing Lambda pricing:`, error);
    throw error;
  }
}

/**
 * Create an API route for testing AWS pricing API in the browser
 */
export async function testApiRoute(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'connectivity';
  const service = searchParams.get('service') || '';
  const attribute = searchParams.get('attribute') || '';
  const value = searchParams.get('value') || '';
  const region = searchParams.get('region') || 'us-east-1';
  
  try {
    switch (action) {
      case 'connectivity':
        const services = await testPricingApiConnectivity();
        return { success: true, services };
        
      case 'attributes':
        if (!service) throw new Error('Service code is required');
        const attributes = await getServiceAttributes(service);
        return { success: true, attributes };
        
      case 'values':
        if (!service) throw new Error('Service code is required');
        if (!attribute) throw new Error('Attribute name is required');
        const values = await getAttributeValues(service, attribute);
        return { success: true, values };
        
      case 'ec2pricing':
        if (!value) throw new Error('Instance type is required');
        const ec2Pricing = await testEc2Pricing(value, region);
        return { success: true, pricing: ec2Pricing };
        
      case 's3pricing':
        const s3Pricing = await testS3Pricing(region);
        return { success: true, pricing: s3Pricing };
        
      case 'lambdapricing':
        const lambdaPricing = await testLambdaPricing(region);
        return { success: true, pricing: lambdaPricing };
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: any) {
    console.error('Error in AWS pricing test API:', error);
    return { success: false, error: error.message };
  }
}