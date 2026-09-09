const assert = require("node:assert/strict");
const { ethers } = require("hardhat");

describe("HoneyTraceability", function () {
  async function deployContract() {
    const [beekeeper] = await ethers.getSigners();
    const HoneyTraceability = await ethers.getContractFactory("HoneyTraceability");
    const contract = await HoneyTraceability.deploy();
    await contract.waitForDeployment();
    return { contract, beekeeper };
  }

  it("registers a batch and records traceability events", async function () {
    const { contract, beekeeper } = await deployContract();
    const batchId = "HC-2026-0001";
    const hiveId = "HIVE-001";
    const canonicalDataHash = ethers.id("batch-data");
    const eventHash = ethers.id("quality-data");

    await contract.registerBatch(batchId, hiveId, 1_757_000_000, canonicalDataHash);
    await contract.recordTraceabilityEvent(batchId, "HARVEST_RECORDED", canonicalDataHash);
    await contract.recordQualityVerification(batchId, eventHash);

    const batch = await contract.getBatch(batchId);
    assert.equal(batch.batchId, batchId);
    assert.equal(batch.hiveId, hiveId);
    assert.equal(batch.beekeeper, beekeeper.address);
    assert.equal(batch.canonicalDataHash, canonicalDataHash);
    assert.equal(batch.active, true);

    const events = await contract.getTraceabilityEvents(batchId);
    assert.equal(events.length, 2);
    assert.equal(events[0].eventType, "HARVEST_RECORDED");
    assert.equal(events[1].eventType, "QUALITY_VERIFIED");
    assert.equal(events[1].dataHash, eventHash);
  });
});