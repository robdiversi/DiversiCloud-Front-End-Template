// src/app/api/chat/route.ts
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Service mappings with expanded information including pricing estimates
const SERVICE_MAPPING = {
  "Virtual Machines": {
    aws: { 
      name: "EC2", 
      pricing: "t3.medium: ~$0.0416/hour, m5.large: ~$0.096/hour",
      features: "Elastic compute, auto-scaling, spot instances available"
    },
    azure: { 
      name: "Virtual Machines", 
      pricing: "B2s: ~$0.0416/hour, D2s v3: ~$0.096/hour",
      features: "Azure Hybrid Benefit, reserved instances, availability sets"
    },
    gcp: { 
      name: "Compute Engine", 
      pricing: "e2-medium: ~$0.03351/hour, n2-standard-2: ~$0.0971/hour",
      features: "Sustained use discounts, preemptible VMs, custom machine types"
    }
  },
  "Virtual Desktop": {
    aws: { 
      name: "WorkSpaces", 
      pricing: "Standard bundle: ~$35/month or ~$9.75/month + $0.26/hour",
      features: "AD integration, Windows/Linux options, regional availability"
    },
    azure: { 
      name: "Azure Virtual Desktop", 
      pricing: "Base compute: ~$0.09/hour per user + storage (~$0.05/GB/month)",
      features: "Multi-session Windows 10/11, Microsoft 365 integration, pay-as-you-go model"
    },
    gcp: { 
      name: "Through partners (Citrix/VMware)", 
      pricing: "VM costs (~$0.095/hour) + partner licensing fees",
      features: "Partner ecosystem, custom configurations, GCP infrastructure"
    }
  },
  "Object Storage": {
    aws: { 
      name: "S3", 
      pricing: "Standard: ~$0.023/GB/month, Infrequent Access: ~$0.0125/GB/month",
      features: "Lifecycle policies, versioning, cross-region replication"
    },
    azure: { 
      name: "Blob Storage", 
      pricing: "Hot: ~$0.0184/GB/month, Cool: ~$0.01/GB/month",
      features: "Access tiers, soft delete, immutable storage"
    },
    gcp: { 
      name: "Cloud Storage", 
      pricing: "Standard: ~$0.02/GB/month, Nearline: ~$0.01/GB/month",
      features: "Object lifecycle management, retention policies"
    }
  },
  "SQL Database": {
    aws: { 
      name: "RDS", 
      pricing: "db.t3.medium: ~$0.082/hour, + storage at $0.115/GB/month",
      features: "Multi-AZ deployments, read replicas, automated backups"
    },
    azure: { 
      name: "SQL Database", 
      pricing: "General Purpose: ~$0.086/hour, + storage at $0.115/GB/month",
      features: "Geo-replication, automatic tuning, elastic pools"
    },
    gcp: { 
      name: "Cloud SQL", 
      pricing: "db-n1-standard-1: ~$0.0745/hour, + storage at $0.17/GB/month",
      features: "Automated backups, high availability configuration"
    }
  },
  "NoSQL Database": {
    aws: { 
      name: "DynamoDB", 
      pricing: "On-demand: $1.25 per million write requests, $0.25 per million read requests",
      features: "Auto-scaling, global tables, point-in-time recovery"
    },
    azure: { 
      name: "Cosmos DB", 
      pricing: "Serverless: $0.12 per million RUs for writes, $0.012 per million RUs for reads",
      features: "Multiple consistency levels, global distribution"
    },
    gcp: { 
      name: "Firestore/Bigtable", 
      pricing: "Firestore: $0.18 per GB/month, $0.06 per 100K reads",
      features: "Real-time synchronization, automatic multi-region replication"
    }
  },
  "Serverless Functions": {
    aws: { 
      name: "Lambda", 
      pricing: "$0.20 per million requests, $0.0000166667 per GB-second",
      features: "Up to 15min execution, 10GB memory, concurrency controls"
    },
    azure: { 
      name: "Functions", 
      pricing: "$0.20 per million executions, $0.000016 per GB-second",
      features: "Durable functions, integrated security model"
    },
    gcp: { 
      name: "Cloud Functions", 
      pricing: "$0.40 per million invocations, $0.0000025 per GB-second",
      features: "Background functions, direct triggering from HTTP"
    }
  },
  "Container Orchestration": {
    aws: { 
      name: "EKS/ECS", 
      pricing: "EKS: $0.10 per hour per cluster, + EC2/Fargate costs",
      features: "Managed control plane, Fargate integration"
    },
    azure: { 
      name: "AKS", 
      pricing: "Control plane: Free, + VM costs",
      features: "Dev Spaces, Azure Policy integration"
    },
    gcp: { 
      name: "GKE", 
      pricing: "Standard: $0.10 per hour per cluster, Autopilot: ~ $0.035/hour/pod",
      features: "Autopilot mode, auto-scaling, node auto-provisioning"
    }
  },
  "Content Delivery": {
    aws: { 
      name: "CloudFront", 
      pricing: "Data transfer out: $0.085/GB for first 10TB",
      features: "Global edge network, field-level encryption"
    },
    azure: { 
      name: "CDN", 
      pricing: "Data transfer: $0.081/GB for first 10TB",
      features: "Rules engine, analytics, dynamic site acceleration"
    },
    gcp: { 
      name: "Cloud CDN", 
      pricing: "Data transfer: $0.08/GB for first 10TB",
      features: "Connected to Cloud Load Balancing, cache invalidation"
    }
  }
}

export async function POST(req: Request) {
  try {
    const { prompt, model = 'gpt-4o', conversation = [] } = await req.json()

    // Enhanced system prompt with more comprehensive guidance and clearer terminology
    const system = {
      role: 'system' as const,
      content: `
You are a senior cloud architect specializing in multi-cloud environments and cost optimization. Your expertise covers AWS, Azure, and GCP with deep knowledge of service capabilities, pricing models, and architectural trade-offs.

When discussing cloud services, integrate these specific pricing details and features:
${Object.entries(SERVICE_MAPPING).map(([service, providers]) => `
• ${service}:
  - AWS ${providers.aws.name}: ${providers.aws.pricing}
    Features: ${providers.aws.features}
  - Azure ${providers.azure.name}: ${providers.azure.pricing}
    Features: ${providers.azure.features}
  - GCP ${providers.gcp.name}: ${providers.gcp.pricing}
    Features: ${providers.gcp.features}
`).join('\n')}

When responding to comparison requests:

• Format your response using Markdown with clear headers (## for main sections, ### for subsections)
• Use bullet points and tables when comparing features or prices
• Include specific pricing examples with dollar amounts
• Create proper comparisons between equivalent tiers across providers

Your response should include these clearly labeled sections:

## PERFORMANCE ANALYSIS
Analyze performance characteristics of each implementation and when each is optimal.

## PRICING BREAKDOWN
Provide detailed per-provider cost comparisons with actual numbers for equivalent services.

## COST OPTIMIZATION
Suggest specific strategies for each provider (reserved instances, spot pricing, etc.)

## ARCHITECTURAL CONSIDERATIONS
Highlight service limitations or advantages affecting system design.

## TOTAL COST OF OWNERSHIP COMPARISON
Explain total cost of ownership beyond hourly rates, including hidden costs, operational overhead, and long-term financial implications.

## RECOMMENDATION
Provide a clear, justified recommendation based on the workload needs.

Remember that lowest price isn't always best choice - explain when paying more provides better value.

Always use plain language and explain technical terms when they first appear.
`
    }

    // Create messages array with conversation history
    const messages = [
      system,
      ...conversation.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user' as const, content: prompt }
    ]
    
    const chat = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.2,
      max_tokens: 1500 // Allow for detailed responses
    })

    const reply = chat.choices[0].message?.content ?? ''
    return NextResponse.json({ completion: reply })
  } catch (error: any) {
    console.error('Error in OpenAI API call:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate recommendation' },
      { status: 500 }
    )
  }
}