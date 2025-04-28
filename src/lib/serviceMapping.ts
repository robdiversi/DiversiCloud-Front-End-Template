
export interface CloudNames { aws: string; azure: string; gcp: string }
export const serviceMapping: Record<string, Record<string, CloudNames>> = {
  "Compute": {
    "Virtual Machines":       { aws: "EC2",               azure: "Virtual Machines",    gcp: "Compute Engine" },
    "Serverless Functions":   { aws: "Lambda",            azure: "Functions",           gcp: "Cloud Functions" },
    "Containers (K8s)":       { aws: "EKS",               azure: "AKS",                 gcp: "GKE" },
    "Serverless Containers":  { aws: "Fargate",           azure: "Container Instances", gcp: "Cloud Run" },
    "Batch Processing":       { aws: "Batch",             azure: "Batch",               gcp: "Batch" },
  },

  "Storage": {
    "Object Storage":         { aws: "S3",                azure: "Blob Storage",        gcp: "Cloud Storage" },
    "Block Storage":          { aws: "EBS",               azure: "Managed Disks",       gcp: "Persistent Disk" },
    "File Storage":           { aws: "EFS",               azure: "File Storage",        gcp: "Filestore" },
    "Cold Archive Storage":   { aws: "Glacier",           azure: "Archive Storage",     gcp: "Coldline" },
    "Content Delivery (CDN)": { aws: "CloudFront",        azure: "CDN",                 gcp: "Cloud CDN" },
  },

  "Databases": {
    "Relational SQL DB":      { aws: "RDS",               azure: "SQL Database",        gcp: "Cloud SQL" },
    "NoSQL Document DB":      { aws: "DynamoDB",          azure: "Cosmos DB",           gcp: "Firestore" },
    "Managed MySQL/Postgres": { aws: "Aurora",            azure: "Azure Database for MySQL/PostgreSQL", gcp: "Cloud SQL MySQL/PostgreSQL" },
    "Data Warehouse":         { aws: "Redshift",          azure: "Synapse Analytics",   gcp: "BigQuery" },
    "In-Memory Cache":        { aws: "ElastiCache",       azure: "Cache for Redis",     gcp: "MemoryStore" },
  },

  "Networking": {
    "Domain & DNS":           { aws: "Route 53",          azure: "DNS Zone",            gcp: "Cloud DNS" },
    "Load Balancer":          { aws: "ELB",               azure: "Load Balancer",       gcp: "Cloud Load Balancing" },
    "API Gateway":            { aws: "API Gateway",       azure: "API Management",      gcp: "API Gateway" },
    "Message Queue":          { aws: "SQS",               azure: "Service Bus",         gcp: "Pub/Sub" },
    "VPN & Connectivity":     { aws: "VPN Gateway",       azure: "VPN Gateway",         gcp: "Cloud VPN" },
  },

  "Security & Identity": {
    "Identity & Access":      { aws: "IAM",               azure: "Azure AD",            gcp: "Cloud IAM" },
    "Key Management":         { aws: "KMS",               azure: "Key Vault",          gcp: "Cloud KMS" },
    "Web Application FW":     { aws: "WAF",               azure: "WAF",                gcp: "Cloud Armor" },
    "Secrets Management":     { aws: "Secrets Manager",   azure: "Key Vault Secrets",   gcp: "Secret Manager" },
    "DDoS Protection":        { aws: "Shield",            azure: "DDoS Protection",     gcp: "Cloud Armor" },
  },

  "Analytics & Big Data": {
    "Log & Event Analytics":  { aws: "CloudWatch Logs",   azure: "Monitor Logs",        gcp: "Cloud Logging" },
    "Metrics & Monitoring":   { aws: "CloudWatch Metrics",azure: "Monitor Metrics",     gcp: "Cloud Monitoring" },
    "Data Pipeline":          { aws: "Data Pipeline",     azure: "Data Factory",        gcp: "Dataflow" },
    "Stream Processing":      { aws: "Kinesis",           azure: "Event Hubs",          gcp: "Dataflow / Pub/Sub" },
    "Search Service":         { aws: "OpenSearch",        azure: "Cognitive Search",    gcp: "Elasticsearch on GCP" },
  },

  "AI & Machine Learning": {
    "Prebuilt AI APIs":       { aws: "SageMaker API",     azure: "Cognitive Services",  gcp: "AI Platform" },
    "Custom ML Training":     { aws: "SageMaker",         azure: "ML Studio",           gcp: "Vertex AI" },
    "Chat & Containers":      { aws: "Bedrock",           azure: "OpenAI Service",      gcp: "Vertex AI Matching Engine" },
    "Speech to Text":         { aws: "Transcribe",        azure: "Speech Service",      gcp: "Speech-to-Text" },
    "Text to Speech":         { aws: "Polly",             azure: "Speech Service",      gcp: "Text-to-Speech" },
  },

  "DevOps & CI/CD": {
    "Source Control":         { aws: "CodeCommit",        azure: "DevOps Repos",        gcp: "Cloud Source Repositories" },
    "CI/CD Pipelines":        { aws: "CodePipeline",      azure: "DevOps Pipelines",     gcp: "Cloud Build" },
    "Artifact Registry":      { aws: "CodeArtifact",      azure: "Artifacts",           gcp: "Artifact Registry" },
    "Infrastructure as Code": { aws: "CloudFormation",    azure: "ARM/Bicep",           gcp: "Deployment Manager" },
  },

  "Management & Governance": {
    "Cost Management":        { aws: "Cost Explorer",     azure: "Cost Management",     gcp: "Cloud Billing Reports" },
    "Resource Management":    { aws: "Resource Groups",    azure: "Resource Groups",     gcp: "Resource Manager" },
    "Policy & Compliance":    { aws: "Config & GuardDuty",azure: "Policy Insights",     gcp: "Organization Policy" },
    "Tagging & Metadata":     { aws: "Tag Editor",        azure: "Tags",                gcp: "Labels" },
  },

  "IoT & Edge": {
    "Device Management":      { aws: "IoT Core",          azure: "IoT Hub",             gcp: "IoT Core" },
    "Edge Compute":           { aws: "Greengrass",        azure: "IoT Edge",           gcp: "Edge TPU" },
  },
} as const
