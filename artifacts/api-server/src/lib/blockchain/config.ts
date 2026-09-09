export type BlockchainConfig = {
  rpcUrl: string;
  privateKey: string;
  contractAddress: string;
  chainId?: number;
};

export function loadBlockchainConfig(
  env: NodeJS.ProcessEnv = process.env,
): BlockchainConfig | undefined {
  const values = {
    rpcUrl: env.BLOCKCHAIN_RPC_URL,
    privateKey: env.BLOCKCHAIN_PRIVATE_KEY,
    contractAddress: env.HONEY_TRACEABILITY_CONTRACT_ADDRESS,
  };

  if (!values.rpcUrl && !values.privateKey && !values.contractAddress) {
    return undefined;
  }

  if (!values.rpcUrl || !values.privateKey || !values.contractAddress) return undefined;

  const chainId = env.BLOCKCHAIN_CHAIN_ID
    ? Number(env.BLOCKCHAIN_CHAIN_ID)
    : undefined;
  if (chainId !== undefined && (!Number.isInteger(chainId) || chainId <= 0)) return undefined;

  return {
    rpcUrl: values.rpcUrl,
    privateKey: values.privateKey,
    contractAddress: values.contractAddress,
    chainId,
  };
}

export type BlockchainVerificationConfig = {
  rpcUrl: string;
  contractAddress: string;
  chainId?: number;
};

export function loadBlockchainVerificationConfig(
  env: NodeJS.ProcessEnv = process.env,
): BlockchainVerificationConfig | undefined {
  const rpcUrl = env.BLOCKCHAIN_RPC_URL;
  const contractAddress = env.HONEY_TRACEABILITY_CONTRACT_ADDRESS;
  if (!rpcUrl || !contractAddress) return undefined;

  const chainId = env.BLOCKCHAIN_CHAIN_ID
    ? Number(env.BLOCKCHAIN_CHAIN_ID)
    : undefined;
  if (chainId !== undefined && (!Number.isInteger(chainId) || chainId <= 0)) {
    return undefined;
  }

  return { rpcUrl, contractAddress, chainId };
}