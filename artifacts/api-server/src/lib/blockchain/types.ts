export type BlockchainTransactionMetadata = {
  blockchainTxHash: string;
  blockchainNetwork: string;
  contractAddress: string;
  blockchainStatus: "submitted" | "confirmed";
  blockNumber?: number;
};

export type BlockchainSubmissionStatus =
  | "NOT_CONFIGURED"
  | "PENDING"
  | "CONFIRMED"
  | "FAILED";

export type RegisterBatchInput = {
  batchId: string;
  hiveId: string;
  harvestTimestamp: number;
  canonicalDataHash: string;
};

export type TraceabilityEventInput = {
  batchId: string;
  eventType: string;
  dataHash: string;
};

export type BlockchainRecordSubmission = TraceabilityEventInput & {
  actor: string;
  data: unknown;
};

export type BlockchainProofStatus = "VERIFIED" | "NOT_VERIFIED" | "NOT_CONFIGURED" | "FAILED";

export type BlockchainProof = {
  status: BlockchainProofStatus;
  blockchainTxHash?: string;
  blockchainBlockNumber?: number;
  blockchainNetwork?: string;
  blockchainContractAddress?: string;
  traceabilityEventCount?: number;
  message: string;
};