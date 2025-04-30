'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface AIRecommendationProps {
  category?: string;
  service?: string;
  prices?: {
    aws?: { price: number; unit: string };
    azure?: { price: number; unit: string };
    gcp?: { price: number; unit: string };
  };
}

// These match the mapping in the API route.ts file
const SERVICE_MAPPING = {
  "Virtual Machines": {
    aws: "EC2",
    azure: "Virtual Machines",
    gcp: "Compute Engine"
  },
  "Object Storage": {
    aws: "S3",
    azure: "Blob Storage",
    gcp: "Cloud Storage"
  },
  "SQL Database": {
    aws: "RDS",
    azure: "SQL Database",
    gcp: "Cloud SQL"
  }
};

export function AIRecommendation({ category, service, prices }: AIRecommendationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);

  const generateRecommendation = async () => {
    if (!category || !service) return;
    
    setIsLoading(true);
    
    try {
      // This matches the API structure found in route.ts
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o', 
          prompt: generatePrompt(category, service, prices),
        }),
      });
      
      const data = await response.json();
      
      // Based on the API route file, the response field is named 'completion'
      if (data.completion) {
        setRecommendation(data.completion);
      } else if (data.text) {
        // Alternative field name as a fallback
        setRecommendation(data.text);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error generating recommendation:', error);
      setRecommendation('Sorry, I had trouble generating a recommendation. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a context-aware prompt based on the selected service and pricing data
  // Combines the systemPrompt approach from the API route file with specific pricing details
  const generatePrompt = (category: string, service: string, prices?: any) => {
    // Get the service mappings for this service if available
    const serviceNames = service in SERVICE_MAPPING 
      ? SERVICE_MAPPING[service as keyof typeof SERVICE_MAPPING]
      : { aws: service, azure: service, gcp: service };
    
    // Format the service mapping similar to the API route
    const mappingText = `${service}: AWS → ${serviceNames.aws}, Azure → ${serviceNames.azure}, GCP → ${serviceNames.gcp}`;
    
    // Format pricing information if available
    let pricingInfo = '';
    if (prices) {
      if (prices.aws) {
        pricingInfo += `\n- AWS (${serviceNames.aws}): $${prices.aws.price.toFixed(6)} per ${prices.aws.unit}`;
      }
      
      if (prices.azure) {
        pricingInfo += `\n- Azure (${serviceNames.azure}): $${prices.azure.price.toFixed(6)} per ${prices.azure.unit}`;
      }
      
      if (prices.gcp) {
        pricingInfo += `\n- GCP (${serviceNames.gcp}): $${prices.gcp.price.toFixed(6)} per ${prices.gcp.unit}`;
      }
    }
    
    // Combine the system prompt approach with specific request
    const prompt = `I need recommendations for ${category} > ${service}.

Service mapping: ${mappingText}

Current pricing:${pricingInfo}

Please provide:
• A breakdown of pros & cons per provider
• Cost estimate comparison for typical workloads
• Highlight price differences (e.g. "AWS is 10% cheaper than Azure for this workload")
• Specific cost optimization strategies for each provider
• Best value recommendation with justification

Keep your response concise, focused on actionable advice, and under 150 words.`;
    
    return prompt;
  };

  if (!category || !service) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
            <path d="M9.5 3.5L12 2L14.5 3.5L17 2L19.5 3.5V7.5L22 10L19.5 12.5V16.5L17 18L14.5 16.5L12 18L9.5 16.5L7 18L4.5 16.5V12.5L2 10L4.5 7.5V3.5L7 2L9.5 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 10L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 10L8 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 10L12 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>AI Cost Optimization</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendation ? (
          <div className="text-white/90 p-4 bg-white/5 rounded-lg border border-white/10">
            <p>{recommendation}</p>
          </div>
        ) : (
          <p className="text-white/70">
            Get personalized cost optimization recommendations based on your selected services and configuration.
          </p>
        )}
        
        <button
          onClick={generateRecommendation}
          disabled={isLoading}
          className="w-full py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg border border-white/20 transition-colors flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Generating AI recommendation...</span>
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 20V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.93 4.93L6.34 6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17.66 17.66L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.93 19.07L6.34 17.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17.66 6.34L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Get AI Recommendation</span>
            </>
          )}
        </button>
      </CardContent>
    </Card>
  );
}