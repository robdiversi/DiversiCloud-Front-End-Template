export async function getPricing({ provider, service, config, region }) {
    switch (service) {
      case 'compute':
        return fetchComputePricing(provider, config.vcpus, config.ramGB, region);
      case 'storage':
        return fetchStoragePricing(provider, config.storageGB, config.tier, region);
      case 'database':
        return fetchDatabasePricing(provider, config.instanceClass, config.multiAZ, region);
      // …etc.
    }
  }
  