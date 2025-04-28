// src/lib/openaiFunctions.ts
export const openAIFunctions = [
    {
      name: "get_pricing",
      description: "Fetch per-unit costs for a specific cloud service (compute, storage, database, etc.)",
      parameters: {
        type: "object",
        properties: {
          provider: {
            type: "string",
            enum: ["AWS","AZURE","GCP"],
            description: "Which cloud to query",
          },
          service: {
            type: "string",
            enum: ["compute","storage","database","network"],
            description: "The type of service to price",
          },
          config: {
            type: "object",
            description: "Service-specific parameters",
            properties: {
              // For compute
              vcpus: { type: "integer" },
              ramGB: { type: "integer" },
  
              // For storage
              storageGB: { type: "integer" },
              tier: { type: "string", enum: ["standard","premium"] },
  
              // For database
              instanceClass: { type: "string" },
              multiAZ: { type: "boolean" },
  
              // (you can extend for other services…)
            },
          },
          region: { type: "string" },
        },
        required: ["provider","service","config","region"],
      },
    },
  ];
  