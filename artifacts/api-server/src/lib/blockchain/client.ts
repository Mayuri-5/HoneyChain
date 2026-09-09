import { Contract, JsonRpcProvider, Wallet, isHexString } from "ethers";
import {
  loadBlockchainConfig,
  loadBlockchainVerificationConfig,
  type BlockchainConfig,
} from "./config";
import { HONEY_TRACEABILITY_ABI } from "./contract";
import type {
  BlockchainProof,
  BlockchainRecordSubmission,
  BlockchainTransactionMetadata,
  RegisterBatchInput,
  TraceabilityEventInput,
} from "./types";

export class HoneyTraceabilityClient {
  private readonly contract: Contract;
  private readonly config: BlockchainConfig;
  private readonly provider: JsonRpcProvider;

  constructor(config: BlockchainConfig) {
    this.config = config;
    this.provider = new JsonRpcProvider(config.rpcUrl, config.chainId);
    const signer = new Wallet(config.privateKey, this.provider);
    this.contract = new Contract(config.contractAddress, HONEY_TRACEABILITY_ABI, signer);
  }

  async registerBatch(input: RegisterBatchInput): Promise<BlockchainTransactionMetadata> {
    const transaction = await this.contract.registerBatch(
      input.batchId,
      input.hiveId,
      input.harvestTimestamp,
      input.canonicalDataHash,
    );
    return this.confirm(transaction.hash, transaction);
  }

  async recordTraceabilityEvent(
    input: TraceabilityEventInput,
  ): Promise<BlockchainTransactionMetadata> {
    const transaction = await this.contract.recordTraceabilityEvent(
      input.batchId,
      input.eventType,
      input.dataHash,
    );
    return this.confirm(transaction.hash, transaction);
  }

  async recordQualityVerification(
    input: Omit<TraceabilityEventInput, "eventType">,
  ): Promise<BlockchainTransactionMetadata> {
    const transaction = await this.contract.recordQualityVerification(
      input.batchId,
      input.dataHash,
    );
    return this.confirm(transaction.hash, transaction);
  }

  async recordProcessing(
    input: Omit<TraceabilityEventInput, "eventType">,
  ): Promise<BlockchainTransactionMetadata> {
    const transaction = await this.contract.recordProcessing(input.batchId, input.dataHash);
    return this.confirm(transaction.hash, transaction);
  }

  async recordCustodyEvent(
    input: TraceabilityEventInput,
  ): Promise<BlockchainTransactionMetadata> {
    const transaction = await this.contract.recordCustodyEvent(
      input.batchId,
      input.eventType,
      input.dataHash,
    );
    return this.confirm(transaction.hash, transaction);
  }

  async verifyBatchProof(
    batchId: string,
    transactionHash: string | undefined,
  ): Promise<BlockchainProof> {
    return verifyBatchProofWithProvider(this.provider, this.config.contractAddress, batchId, transactionHash);
  }

  private async confirm(
    transactionHash: string,
    transaction: { wait: () => Promise<{ blockNumber: number } | null> },
  ): Promise<BlockchainTransactionMetadata> {
    const receipt = await transaction.wait();
    const network = await this.provider.getNetwork();
    return {
      blockchainTxHash: transactionHash,
      blockchainNetwork: `${network.name}:${network.chainId.toString()}`,
      contractAddress: this.config.contractAddress,
      blockchainStatus: receipt ? "confirmed" : "submitted",
      blockNumber: receipt?.blockNumber,
    };
  }
}

export function createHoneyTraceabilityClient(): HoneyTraceabilityClient | undefined {
  const config = loadBlockchainConfig();
  return config ? new HoneyTraceabilityClient(config) : undefined;
}

export async function verifyBatchProof(
  batchId: string,
  transactionHash: string | undefined,
): Promise<BlockchainProof> {
  const config = loadBlockchainVerificationConfig();
  if (!config) {
    return { status: "NOT_CONFIGURED", message: "Blockchain verification unavailable" };
  }
  try {
    const provider = new JsonRpcProvider(config.rpcUrl, config.chainId);
    return await verifyBatchProofWithProvider(provider, config.contractAddress, batchId, transactionHash);
  } catch {
    return { status: "FAILED", message: "Blockchain verification failed" };
  }
}

async function verifyBatchProofWithProvider(
  provider: JsonRpcProvider,
  contractAddress: string,
  batchId: string,
  transactionHash: string | undefined,
): Promise<BlockchainProof> {
  if (!transactionHash) {
    return { status: "NOT_VERIFIED", blockchainContractAddress: contractAddress, message: "Batch registration is not confirmed on-chain" };
  }
  const receipt = await provider.getTransactionReceipt(transactionHash);
  if (!receipt || receipt.status !== 1) {
    return { status: "NOT_VERIFIED", blockchainTxHash: transactionHash, blockchainContractAddress: contractAddress, message: "Batch registration transaction is not confirmed" };
  }
  const network = await provider.getNetwork();
  const contract = new Contract(contractAddress, HONEY_TRACEABILITY_ABI, provider);
  const batch = await contract.getBatch(batchId);
  const events = await contract.getTraceabilityEvents(batchId);
  const networkName = network.chainId === 31337n ? "Local Hardhat" : `${network.name}:${network.chainId.toString()}`;
  if (!batch.active || batch.batchId !== batchId) {
    return {
      status: "NOT_VERIFIED",
      blockchainTxHash: transactionHash,
      blockchainBlockNumber: receipt.blockNumber,
      blockchainNetwork: networkName,
      blockchainContractAddress: contractAddress,
      traceabilityEventCount: events.length,
      message: "On-chain batch data does not match",
    };
  }
  return {
    status: "VERIFIED",
    blockchainTxHash: transactionHash,
    blockchainBlockNumber: receipt.blockNumber,
    blockchainNetwork: networkName,
    blockchainContractAddress: contractAddress,
    traceabilityEventCount: events.length,
    message: "Blockchain proof verified",
  };
}

function toBytes32(value: string): string {
  const normalized = value.startsWith("0x") ? value : `0x${value}`;
  if (!isHexString(normalized, 32)) {
    throw new Error("Local data hash is not a 32-byte hexadecimal value.");
  }
  return normalized;
}

function getObjectValue(data: unknown, key: string): unknown {
  return typeof data === "object" && data !== null
    ? (data as Record<string, unknown>)[key]
    : undefined;
}

function getRequiredString(data: unknown, key: string): string {
  const value = getObjectValue(data, key);
  if (typeof value !== "string" || !value) throw new Error(`${key} is required for blockchain submission.`);
  return value;
}

function getHarvestTimestamp(data: unknown): number {
  const harvestDate = getObjectValue(data, "harvestDate");
  const timestamp = typeof harvestDate === "number"
    ? harvestDate
    : typeof harvestDate === "string"
      ? Math.floor(Date.parse(harvestDate) / 1000)
      : Number.NaN;
  if (!Number.isFinite(timestamp) || timestamp < 0) {
    throw new Error("harvestDate is required for blockchain batch registration.");
  }
  return timestamp;
}

export async function submitBlockchainRecord(
  submission: BlockchainRecordSubmission,
): Promise<BlockchainTransactionMetadata | undefined> {
  const client = createHoneyTraceabilityClient();
  if (!client) return undefined;

  const dataHash = toBytes32(submission.dataHash);
  if (submission.eventType === "BATCH_CREATED") {
    return client.registerBatch({
      batchId: submission.batchId,
      hiveId: getRequiredString(submission.data, "hiveId"),
      harvestTimestamp: getHarvestTimestamp(submission.data),
      canonicalDataHash: dataHash,
    });
  }
  if (submission.eventType === "QUALITY_VERIFIED") {
    return client.recordQualityVerification({ batchId: submission.batchId, dataHash });
  }
  if (submission.eventType === "PROCESSED_PACKAGED") {
    return client.recordProcessing({ batchId: submission.batchId, dataHash });
  }
  if (submission.eventType === "CORRECTION_TRANSACTION") {
    return client.recordTraceabilityEvent({
      batchId: submission.batchId,
      eventType: submission.eventType,
      dataHash,
    });
  }
  if (submission.eventType !== "HARVEST_RECORDED") {
    return client.recordCustodyEvent({
      batchId: submission.batchId,
      eventType: submission.eventType,
      dataHash,
    });
  }
  return client.recordTraceabilityEvent({
    batchId: submission.batchId,
    eventType: submission.eventType,
    dataHash,
  });
}