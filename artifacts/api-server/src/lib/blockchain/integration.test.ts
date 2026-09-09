import assert from "node:assert/strict";
import { Contract, JsonRpcProvider } from "ethers";
import {
  addBlock,
  getPassport,
  store,
  verifyChain,
  waitForBlockchainSubmissions,
} from "../honey-store";
import { HONEY_TRACEABILITY_ABI } from "./contract";

const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
const contractAddress = process.env.HONEY_TRACEABILITY_CONTRACT_ADDRESS;

async function main() {
  if (!rpcUrl || !contractAddress) {
    const localOnly = addBlock("NO-CHAIN-BATCH", "HARVEST_RECORDED", {
      harvestDate: "2026-09-09",
    });
    await waitForBlockchainSubmissions();
    assert.equal(localOnly.transactionId, "TX-0001");
    assert.equal(localOnly.blockchainStatus, "NOT_CONFIGURED");
    assert.equal(verifyChain().valid, true);
    console.log("No blockchain configuration: local hash-chain fallback passed");
    return;
  }

  const batchId = "HC-2026-INTEGRATION-FINAL";
  const harvest = addBlock("HARVEST-INTEGRATION", "HARVEST_RECORDED", {
    hiveId: "HIVE-001",
    harvestDate: "2026-09-09",
  });
  const batch = addBlock(batchId, "BATCH_CREATED", {
    batchId,
    hiveId: "HIVE-001",
    harvestDate: "2026-09-09",
  });
  const quality = addBlock(batchId, "QUALITY_VERIFIED", {
    batchId,
    status: "Passed",
  });

  await waitForBlockchainSubmissions();

  assert.match(harvest.blockchainTxHash ?? "", /^0x[0-9a-f]{64}$/);
  assert.equal(harvest.blockchainStatus, "CONFIRMED");
  assert.match(batch.blockchainTxHash ?? "", /^0x[0-9a-f]{64}$/);
  assert.notEqual(batch.blockchainTxHash, batch.transactionId);
  assert.equal(batch.blockchainStatus, "CONFIRMED");
  assert.equal(quality.blockchainStatus, "CONFIRMED");
  assert.match(quality.blockchainTxHash ?? "", /^0x[0-9a-f]{64}$/);
  assert.equal(verifyChain().valid, true);

  store.harvests.push({
    id: "HARVEST-INTEGRATION",
    hiveId: "HIVE-001",
    hiveName: "Integration Hive",
    harvestDate: "2026-09-09",
    quantityKg: 1,
    floralSource: "Wildflower",
    weather: "Clear",
    blockchainTxId: batch.transactionId,
  });
  store.batches.push({
    id: batchId,
    harvestId: "HARVEST-INTEGRATION",
    hiveId: "HIVE-001",
    beekeeperEmail: "",
    apiaryName: "Integration Apiary",
    location: "Local Hardhat",
    beeSpecies: "Apis mellifera",
    harvestDate: "2026-09-09",
    quantityKg: 1,
    floralSource: "Wildflower",
    status: "Harvested",
    blockchainStatus: "CONFIRMED",
  });
  const passport = getPassport(batchId);
  assert.equal(passport?.batch.id, batchId);
  assert.equal(passport?.blockchainVerified, true);

  const provider = new JsonRpcProvider(rpcUrl);
  const contract = new Contract(contractAddress, HONEY_TRACEABILITY_ABI, provider);
  const onChainBatch = await contract.getBatch(batchId);
  const onChainEvents = await contract.getTraceabilityEvents(batchId);
  assert.equal(onChainBatch.batchId, batchId);
  assert.equal(onChainEvents.length, 2);
  assert.equal(onChainEvents[0].eventType, "HARVEST_RECORDED");
  assert.equal(onChainEvents[1].eventType, "QUALITY_VERIFIED");

  console.log(JSON.stringify({
    harvestTransactionHash: harvest.blockchainTxHash,
    batchTransactionHash: batch.blockchainTxHash,
    qualityTransactionHash: quality.blockchainTxHash,
    blockNumber: batch.blockchainBlockNumber,
  }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});