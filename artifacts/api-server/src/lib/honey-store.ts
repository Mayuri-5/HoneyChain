import { createHash, randomUUID } from "node:crypto";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: "beekeeper" | "quality_officer" | "processor" | "distributor" | "customer" | "admin";
  phone?: string;
  location: string;
  apiaryName: string;
  experience?: string;
};

export type ApiaryRecord = {
  id: string;
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  beeSpecies: string;
  hiveCount: number;
  floralSources: string[];
  notes?: string;
  status: string;
};

export type HiveRecord = {
  id: string;
  name: string;
  apiaryId: string;
  apiaryName: string;
  beeSpecies: string;
  frames: number;
  queenAge: number;
  strength: string;
  health: string;
  dateAdded: string;
  lastInspection?: string;
  productionKg: number;
};

export type HarvestRecord = {
  id: string;
  hiveId: string;
  hiveName: string;
  harvestDate: string;
  quantityKg: number;
  floralSource: string;
  weather: string;
  notes?: string;
  blockchainTxId: string;
};

export type BatchRecord = {
  id: string;
  harvestId: string;
  hiveId: string;
  beekeeperEmail: string;
  apiaryName: string;
  location: string;
  beeSpecies: string;
  harvestDate: string;
  quantityKg: number;
  floralSource: string;
  status: string;
  blockchainStatus: string;
};

export type QualityRecord = {
  id: string;
  batchId: string;
  moisture: number;
  hmf: number;
  diastase: number;
  ph: number;
  sugarContent: number;
  purityStatus: string;
  laboratory: string;
  testDate: string;
  certificateUrl?: string;
  blockchainTxId: string;
};

export type ProcessingRecord = {
  id: string;
  batchId: string;
  processingDate: string;
  method: string;
  packaging: string;
  netWeightKg: number;
  packageDate: string;
  expiryDate: string;
  blockchainTxId: string;
};

export type SupplyRecord = {
  id: string;
  batchId: string;
  eventType: string;
  from?: string;
  to?: string;
  location: string;
  date: string;
  transportMethod?: string;
  status: string;
  notes?: string;
  blockchainTxId: string;
};

export type BlockchainRecord = {
  index: number;
  transactionId: string;
  batchId: string;
  eventType: string;
  timestamp: string;
  dataHash: string;
  previousHash: string;
  currentHash: string;
  actor: string;
  status: string;
};

export type FeedbackRecord = {
  id: string;
  batchId: string;
  overallRating: number;
  tasteRating: number;
  qualityRating: number;
  packagingRating: number;
  comment: string;
  submittedAt: string;
};

export const store = {
  user: null as UserRecord | null,
  apiaries: [] as ApiaryRecord[],
  hives: [] as HiveRecord[],
  harvests: [] as HarvestRecord[],
  batches: [] as BatchRecord[],
  quality: [] as QualityRecord[],
  processing: [] as ProcessingRecord[],
  supply: [] as SupplyRecord[],
  feedback: [] as FeedbackRecord[],
  blockchain: [] as BlockchainRecord[],
};

const STATE_ID = "honey-chain-auth-prototype";

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function addBlock(
  batchId: string,
  eventType: string,
  data: unknown,
  actor = "system",
): BlockchainRecord {
  const previousHash = store.blockchain.at(-1)?.currentHash ?? "GENESIS";
  const index = store.blockchain.length + 1;
  const timestamp = new Date().toISOString();
  const dataHash = sha256(JSON.stringify(data));
  const currentHash = sha256(
    JSON.stringify({ index, batchId, eventType, timestamp, dataHash, previousHash, actor }),
  );
  const block: BlockchainRecord = {
    index,
    transactionId: `TX-${String(index).padStart(4, "0")}`,
    batchId,
    eventType,
    timestamp,
    dataHash,
    previousHash,
    currentHash,
    actor,
    status: "Verified",
  };
  store.blockchain.push(block);
  return block;
}

export function verifyChain(): { valid: boolean; checkedBlocks: number; message: string; checkedAt: string } {
  let previousHash = "GENESIS";
  for (const block of store.blockchain) {
    const expectedHash = sha256(
      JSON.stringify({
        index: block.index,
        batchId: block.batchId,
        eventType: block.eventType,
        timestamp: block.timestamp,
        dataHash: block.dataHash,
        previousHash: block.previousHash,
        actor: block.actor,
      }),
    );
    if (block.previousHash !== previousHash || block.currentHash !== expectedHash) {
      return {
        valid: false,
        checkedBlocks: store.blockchain.length,
        message: "Blockchain Tampered ✗",
        checkedAt: new Date().toISOString(),
      };
    }
    previousHash = block.currentHash;
  }
  return {
    valid: true,
    checkedBlocks: store.blockchain.length,
    message: "Blockchain Valid ✓",
    checkedAt: new Date().toISOString(),
  };
}

function seedDemoChain(): void {
  if (store.batches.length > 0) return;
  const harvest: HarvestRecord = {
    id: "HARVEST-001",
    hiveId: "HIVE-001",
    hiveName: "Sunrise 01",
    harvestDate: "2026-08-30",
    quantityKg: 12,
    floralSource: "Sunflower",
    weather: "Warm, dry, light wind",
    notes: "Morning harvest from capped frames.",
    blockchainTxId: "",
  };
  store.harvests.push(harvest);
  const harvestTx = addBlock(harvest.id, "HARVEST_RECORDED", harvest);
  harvest.blockchainTxId = harvestTx.transactionId;
  const batch: BatchRecord = {
    id: "HC2026-000001",
    harvestId: harvest.id,
    hiveId: harvest.hiveId,
    beekeeperEmail: "",
    apiaryName: "Green Valley Apiary",
    location: "Dhule, Maharashtra",
    beeSpecies: "Apis mellifera",
    harvestDate: harvest.harvestDate,
    quantityKg: harvest.quantityKg,
    floralSource: harvest.floralSource,
    status: "Delivered",
    blockchainStatus: "Verified",
  };
  store.batches.push(batch);
  addBlock(batch.id, "BATCH_CREATED", batch);
  store.quality.push({
    id: "QUALITY-001",
    batchId: batch.id,
    moisture: 17.2,
    hmf: 8.4,
    diastase: 14.8,
    ph: 4.1,
    sugarContent: 82.6,
    purityStatus: "Passed",
    laboratory: "Demo Lab (DEMO DATA)",
    testDate: "2026-08-31",
    certificateUrl: "#",
    blockchainTxId: addBlock(batch.id, "QUALITY_VERIFIED", { batchId: batch.id, status: "Passed" }).transactionId,
  });
  store.processing.push({
    id: "PROCESSING-001",
    batchId: batch.id,
    processingDate: "2026-09-01",
    method: "Cold filtered",
    packaging: "Amber glass jar",
    netWeightKg: 11.4,
    packageDate: "2026-09-01",
    expiryDate: "2028-09-01",
    blockchainTxId: addBlock(batch.id, "PROCESSED_PACKAGED", { batchId: batch.id, method: "Cold filtered" }).transactionId,
  });
  const events = [
    ["HARVESTED", "Green Valley Apiary", "Dhule, Maharashtra", "Complete"],
    ["QUALITY_VERIFIED", "Demo Lab", "Nashik, Maharashtra", "Complete"],
    ["PROCESSED", "Honey Chain Facility", "Nashik, Maharashtra", "Complete"],
    ["PACKAGED", "Honey Chain Facility", "Nashik, Maharashtra", "Complete"],
    ["SHIPPED", "Honey Chain Facility", "Mumbai, Maharashtra", "Complete"],
    ["DELIVERED", "Honey Chain Facility", "Pune, Maharashtra", "Complete"],
  ] as const;
  for (const [eventType, from, location, status] of events) {
    const event = {
      id: `SC-${store.supply.length + 1}`,
      batchId: batch.id,
      eventType,
      from,
      to: "Customer",
      location,
      date: "2026-09-02T10:00:00.000Z",
      transportMethod: eventType === "SHIPPED" ? "Refrigerated van" : undefined,
      status,
      notes: "Demo supply-chain record.",
      blockchainTxId: "",
    } satisfies SupplyRecord;
    const tx = addBlock(batch.id, eventType, event);
    event.blockchainTxId = tx.transactionId;
    store.supply.push(event);
  }
}

export function getPassport(batchId: string) {
  const batch = store.batches.find((item) => item.id === batchId);
  if (!batch) return undefined;
  const harvest = store.harvests.find((item) => item.id === batch.harvestId);
  if (!harvest) return undefined;
  const apiary = store.apiaries.find((item) => item.name === batch.apiaryName);
  return {
    batch,
    origin: {
      apiary: batch.apiaryName,
      location: batch.location,
      beeSpecies: batch.beeSpecies,
      floralSource: batch.floralSource,
    },
    harvest,
    quality: store.quality.find((item) => item.batchId === batchId),
    processing: store.processing.find((item) => item.batchId === batchId),
    supplyChain: store.supply.filter((item) => item.batchId === batchId),
    blockchainVerified: verifyChain().valid && store.blockchain.some((item) => item.batchId === batchId),
    feedback: store.feedback.filter((item) => item.batchId === batchId),
    apiary,
  };
}

export function nextId(prefix: string): string {
  return `${prefix}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

async function persistStore(): Promise<void> {
  // Prototype mode: data is kept in memory.
  // Database persistence can be added later for production deployment.
}

export { persistStore };