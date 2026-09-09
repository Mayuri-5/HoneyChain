export const HONEY_TRACEABILITY_ABI = [
  "function registerBatch(string batchId, string hiveId, uint64 harvestTimestamp, bytes32 canonicalDataHash)",
  "function recordTraceabilityEvent(string batchId, string eventType, bytes32 dataHash)",
  "function recordQualityVerification(string batchId, bytes32 dataHash)",
  "function recordProcessing(string batchId, bytes32 dataHash)",
  "function recordCustodyEvent(string batchId, string eventType, bytes32 dataHash)",
  "function getBatch(string batchId) view returns (tuple(string batchId, string hiveId, address beekeeper, uint64 harvestTimestamp, bytes32 canonicalDataHash, bool active))",
  "function getTraceabilityEvents(string batchId) view returns (tuple(string eventType, bytes32 dataHash, address actor, uint64 timestamp)[])",
  "event BatchRegistered(string indexed batchId, string hiveId, address indexed beekeeper, uint256 harvestTimestamp, bytes32 canonicalDataHash)",
  "event TraceabilityEventRecorded(string indexed batchId, string eventType, bytes32 dataHash, address indexed actor, uint256 timestamp)",
] as const;