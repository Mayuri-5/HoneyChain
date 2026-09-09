import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import {
  Analytics,
  Apiary,
  AuthResponse,
  ChainVerification,
  CreateApiaryBody,
  CreateApiaryResponse,
  CreateBatchBody,
  CreateBatchResponse,
  CreateCorrectionBody,
  CreateCorrectionResponse,
  CreateFeedbackBody,
  CreateFeedbackResponse,
  CreateHarvestBody,
  CreateHarvestResponse,
  CreateHiveBody,
  CreateHiveResponse,
  CreateInspectionBody,
  CreateInspectionResponse,
  CreateProcessingBody,
  CreateProcessingResponse,
  CreateQualityTestBody,
  CreateQualityTestResponse,
  CreateSupplyChainEventBody,
  CreateSupplyChainEventResponse,
  GetAnalyticsResponse,
  GetApiaryParams,
  GetApiaryResponse,
  GetBatchParams,
  GetBatchQrParams,
  GetBatchQrResponse,
  GetBatchResponse,
  GetDashboardResponse,
  GetHiveParams,
  GetHiveResponse,
  GetMeResponse,
  GetDashboardResponse as DashboardResponse,
  ListApiariesResponse,
  ListBatchesResponse,
  ListBlockchainTransactionsResponse,
  ListHarvestsResponse,
  ListHivesResponse,
  ListSupplyChainEventsQueryParams,
  ListSupplyChainEventsResponse,
  LoginBeekeeperBody,
  LoginBeekeeperResponse,
  PredictYieldBody,
  PredictYieldResponse,
  RegisterBeekeeperBody,
  RegisterBeekeeperResponse,
  UpdateApiaryBody,
  UpdateApiaryParams,
  UpdateApiaryResponse,
  UpdateHiveBody,
  UpdateHiveParams,
  UpdateHiveResponse,
  VerifyBatchParams,
  VerifyBatchResponse,
  VerifyBlockchainResponse,
} from "@workspace/api-zod";
import {
  addBlock,
  getPassport,
  nextId,
  persistStore,
  store,
  verifyChain,
  type BlockchainRecord,
  type ApiaryRecord,
  type HarvestRecord,
  type HiveRecord,
} from "../lib/honey-store";
import { verifyBatchProof } from "../lib/blockchain/client";

const router: IRouter = Router();

function currentActor(req: Parameters<typeof router.get>[1] extends never ? never : any): string {
  try {
    return getAuth(req).userId ?? "system";
  } catch {
    return "system";
  }
}

router.post("/auth/register", (req, res): void => {
  const parsed = RegisterBeekeeperBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const response = {
    user: {
      id: nextId("USER"),
      role: "beekeeper" as const,
      ...parsed.data,
    },
    message: "Account created",
  };
  res.status(201).json(RegisterBeekeeperResponse.parse(response));
});

router.post("/auth/login", (req, res): void => {
  const parsed = LoginBeekeeperBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  res.status(401).json({ error: "Prototype login is handled by the browser session." });
});

router.post("/auth/logout", (_req, res): void => {
  res.sendStatus(204);
});

router.get("/me", (req, res): void => {
  let userId: string | null = null;
  try {
    userId = getAuth(req).userId;
  } catch {
    userId = null;
  }
  if (!userId || !store.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json(GetMeResponse.parse(store.user));
});

router.get("/dashboard", (_req, res): void => {
  const stats = {
    apiaries: store.apiaries.length,
    hives: store.hives.length,
    activeHives: store.hives.filter((hive) => hive.health === "Healthy").length,
    batches: store.batches.length,
    harvestKg: store.harvests.reduce((total, harvest) => total + harvest.quantityKg, 0),
    qualityTests: store.quality.length,
    verifiedEvents: store.blockchain.length,
  };
  res.json(
    GetDashboardResponse.parse({
      stats,
      recentActivity: [],
      notifications: [{ id: "ALERT-001", title: "Hive H-01 needs attention", message: "Temperature is above the recommended range. Check hive ventilation and colony condition.", time: "Just now", unread: true }],
    }),
  );
});

router.get("/apiaries", (_req, res): void => {
  res.json(ListApiariesResponse.parse(store.apiaries));
});

router.post("/apiaries", (req, res): void => {
  const parsed = CreateApiaryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const apiary: ApiaryRecord = { ...parsed.data, id: nextId("APIARY"), status: "Active" };
  store.apiaries.push(apiary);
  void persistStore();
  res.status(201).json(CreateApiaryResponse.parse(apiary));
});

router.get("/apiaries/:apiaryId", (req, res): void => {
  const params = GetApiaryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const apiary = store.apiaries.find((item) => item.id === params.data.apiaryId);
  if (!apiary) {
    res.status(404).json({ error: "Apiary not found" });
    return;
  }
  res.json(GetApiaryResponse.parse(apiary));
});

router.patch("/apiaries/:apiaryId", (req, res): void => {
  const params = UpdateApiaryParams.safeParse(req.params);
  const parsed = UpdateApiaryBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid apiary details" });
    return;
  }
  const index = store.apiaries.findIndex((item) => item.id === params.data.apiaryId);
  if (index < 0) {
    res.status(404).json({ error: "Apiary not found" });
    return;
  }
  store.apiaries[index] = { ...store.apiaries[index], ...parsed.data };
  void persistStore();
  res.json(UpdateApiaryResponse.parse(store.apiaries[index]));
});

router.get("/hives", (_req, res): void => {
  res.json(ListHivesResponse.parse(store.hives));
});

router.post("/hives", (req, res): void => {
  const parsed = CreateHiveBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const apiary = store.apiaries.find((item) => item.id === parsed.data.apiaryId);
  if (!apiary) {
    res.status(404).json({ error: "Apiary not found" });
    return;
  }
  const hive: HiveRecord = {
    ...parsed.data,
    id: nextId("HIVE"),
    apiaryName: apiary.name,
    productionKg: 0,
  };
  store.hives.push(hive);
  apiary.hiveCount += 1;
  void persistStore();
  res.status(201).json(CreateHiveResponse.parse(hive));
});

router.get("/hives/:hiveId", (req, res): void => {
  const params = GetHiveParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const hive = store.hives.find((item) => item.id === params.data.hiveId);
  if (!hive) {
    res.status(404).json({ error: "Hive not found" });
    return;
  }
  res.json(GetHiveResponse.parse(hive));
});

router.patch("/hives/:hiveId", (req, res): void => {
  const params = UpdateHiveParams.safeParse(req.params);
  const parsed = UpdateHiveBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid hive details" });
    return;
  }
  const index = store.hives.findIndex((item) => item.id === params.data.hiveId);
  if (index < 0) {
    res.status(404).json({ error: "Hive not found" });
    return;
  }
  store.hives[index] = { ...store.hives[index], ...parsed.data };
  void persistStore();
  res.json(UpdateHiveResponse.parse(store.hives[index]));
});

router.post("/inspections", (req, res): void => {
  const parsed = CreateInspectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const hive = store.hives.find((item) => item.id === parsed.data.hiveId);
  if (hive) hive.lastInspection = parsed.data.inspectionDate;
  void persistStore();
  const inspection = { id: nextId("INSPECTION"), ...parsed.data };
  res.status(201).json(CreateInspectionResponse.parse(inspection));
});

router.get("/harvests", (_req, res): void => {
  res.json(ListHarvestsResponse.parse(store.harvests));
});

router.post("/harvests", (req, res): void => {
  const parsed = CreateHarvestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const hive = store.hives.find((item) => item.id === parsed.data.hiveId);
  if (!hive) {
    res.status(404).json({ error: "Hive not found" });
    return;
  }
  const harvest = {
    id: nextId("HARVEST"),
    ...parsed.data,
    hiveName: hive.name,
    blockchainTxId: "",
  };
  const tx = addBlock(harvest.id, "HARVEST_RECORDED", harvest, currentActor(req));
  harvest.blockchainTxId = tx.transactionId;
  hive.productionKg += harvest.quantityKg;
  store.harvests.push(harvest);
  void persistStore();
  res.status(201).json(CreateHarvestResponse.parse(harvest));
});

router.get("/batches", (_req, res): void => {
  res.json(ListBatchesResponse.parse(store.batches));
});

router.post("/batches", (req, res): void => {
  const parsed = CreateBatchBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const hive = store.hives.find((item) => item.id === parsed.data.hiveId);
  const apiary = hive ? store.apiaries.find((item) => item.id === hive.apiaryId) : undefined;
  if (!hive || !apiary) {
    res.status(404).json({ error: "Hive or apiary not found" });
    return;
  }
  const nextBatchNumber = store.batches.reduce((highest, item) => {
    const match = item.id.match(/^HC-\d{4}-(\d{4})$/);
    return Math.max(highest, match ? Number(match[1]) : 0);
  }, 0) + 1;
  const harvest: HarvestRecord = {
    id: nextId("HARVEST"),
    hiveId: hive.id,
    hiveName: hive.name,
    harvestDate: parsed.data.harvestDate,
    quantityKg: parsed.data.quantityKg,
    floralSource: parsed.data.floralSource,
    weather: "Not recorded",
    notes: "Harvest recorded during batch registration.",
    blockchainTxId: "",
  };
  const harvestTx = addBlock(harvest.id, "HARVEST_RECORDED", harvest, currentActor(req));
  harvest.blockchainTxId = harvestTx.transactionId;
  store.harvests.push(harvest);
  const batch = {
    id: `HC-${new Date().getFullYear()}-${String(nextBatchNumber).padStart(4, "0")}`,
    harvestId: harvest.id,
    hiveId: hive.id,
    beekeeperEmail: parsed.data.beekeeperEmail,
    apiaryName: apiary.name,
    location: parsed.data.location,
    beeSpecies: hive.beeSpecies,
    harvestDate: harvest.harvestDate,
    quantityKg: harvest.quantityKg,
    floralSource: harvest.floralSource,
    status: "Harvested",
    blockchainStatus: "Verified",
  };
  addBlock(batch.id, "BATCH_CREATED", batch, currentActor(req));
  store.batches.push(batch);
  void persistStore();
  res.status(201).json(CreateBatchResponse.parse(batch));
});

router.post("/batches/:batchId/cancel", (req, res): void => {
  const params = GetBatchParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const batch = store.batches.find((item) => item.id === params.data.batchId);
  if (!batch) {
    res.status(404).json({ error: "Batch not found" });
    return;
  }

  if (batch.status === "Cancelled") {
    res.status(400).json({ error: "Batch is already cancelled" });
    return;
  }

  const reason =
    typeof req.body?.reason === "string" && req.body.reason.trim()
      ? req.body.reason.trim()
      : "Batch cancelled by authorized user.";

  const previousStatus = batch.status;
  batch.status = "Cancelled";

  addBlock(
    batch.id,
    "CORRECTION_TRANSACTION",
    {
      batchId: batch.id,
      field: "status",
      oldValue: previousStatus,
      newValue: "Cancelled",
      reason,
    },
    currentActor(req),
  );

  void persistStore();
  res.json(batch);
});

router.get("/batches/:batchId", (req, res): void => {
  const params = GetBatchParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const passport = getPassport(params.data.batchId);
  if (!passport) {
    res.status(404).json({ error: "Batch not found" });
    return;
  }
  res.json(GetBatchResponse.parse(passport));
});

router.get("/batches/:batchId/qr", (req, res): void => {
  const params = GetBatchQrParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!store.batches.some((batch) => batch.id === params.data.batchId)) {
    res.status(404).json({ error: "Batch not found" });
    return;
  }
  const verificationPath = `/verify/${params.data.batchId}`;
  res.json(GetBatchQrResponse.parse({ batchId: params.data.batchId, verificationPath, qrData: verificationPath }));
});

router.post("/quality-tests", (req, res): void => {
  const parsed = CreateQualityTestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const quality = { id: nextId("QUALITY"), ...parsed.data, blockchainTxId: "" };
  const tx = addBlock(quality.batchId, "QUALITY_VERIFIED", quality, currentActor(req));
  quality.blockchainTxId = tx.transactionId;
  store.quality.push(quality);
  const batch = store.batches.find((item) => item.id === quality.batchId);
  if (batch) batch.status = "Quality verified";
  void persistStore();
  res.status(201).json(CreateQualityTestResponse.parse(quality));
});

router.post("/processing", (req, res): void => {
  const parsed = CreateProcessingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const processing = { id: nextId("PROCESSING"), ...parsed.data, blockchainTxId: "" };
  const tx = addBlock(processing.batchId, "PROCESSED_PACKAGED", processing, currentActor(req));
  processing.blockchainTxId = tx.transactionId;
  store.processing.push(processing);
  const batch = store.batches.find((item) => item.id === processing.batchId);
  if (batch) batch.status = "Packaged";
  void persistStore();
  res.status(201).json(CreateProcessingResponse.parse(processing));
});

router.get("/supply-chain/events", (req, res): void => {
  const parsed = ListSupplyChainEventsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const events = parsed.data.batchId ? store.supply.filter((item) => item.batchId === parsed.data.batchId) : store.supply;
  res.json(ListSupplyChainEventsResponse.parse(events));
});

router.post("/supply-chain/events", (req, res): void => {
  const parsed = CreateSupplyChainEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const event = { id: nextId("SC"), ...parsed.data, blockchainTxId: "" };
  const tx = addBlock(event.batchId, event.eventType, event, currentActor(req));
  event.blockchainTxId = tx.transactionId;
  store.supply.push(event);
  const batch = store.batches.find((item) => item.id === event.batchId);
  if (batch) batch.status = event.status;
  void persistStore();
  res.status(201).json(CreateSupplyChainEventResponse.parse(event));
});

router.get("/blockchain", (_req, res): void => {
  res.json(ListBlockchainTransactionsResponse.parse(store.blockchain));
});

router.get("/blockchain/verify", (_req, res): void => {
  res.json(VerifyBlockchainResponse.parse(verifyChain()));
});

router.post("/blockchain/corrections", (req, res): void => {
  const parsed = CreateCorrectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const tx = addBlock(parsed.data.batchId, "CORRECTION_TRANSACTION", parsed.data, currentActor(req));
  void persistStore();
  res.status(201).json(CreateCorrectionResponse.parse(tx));
});

router.get("/verify/:batchId", (req, res): void => {
  const params = VerifyBatchParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const passport = getPassport(params.data.batchId);
  if (!passport) {
    res.status(404).json({ error: "Batch not found" });
    return;
  }
  res.json(VerifyBatchResponse.parse(passport));
});

router.get("/verify/:batchId/blockchain", async (req, res): Promise<void> => {
  const params = VerifyBatchParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const passport = getPassport(params.data.batchId);
  if (!passport) {
    res.status(404).json({ error: "Batch not found" });
    return;
  }
  const registration = store.blockchain.find(
    (record: BlockchainRecord) => record.batchId === params.data.batchId && record.eventType === "BATCH_CREATED",
  );
  const proof = await verifyBatchProof(params.data.batchId, registration?.blockchainTxHash);
  res.json(proof);
});

router.post("/feedback", (req, res): void => {
  const parsed = CreateFeedbackBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const feedback = { id: nextId("FEEDBACK"), ...parsed.data, submittedAt: new Date().toISOString() };
  store.feedback.push(feedback);
  void persistStore();
  res.status(201).json(CreateFeedbackResponse.parse(feedback));
});

router.get("/analytics", (_req, res): void => {
  const response = {
    monthlyProduction: [
      { month: "Apr", quantityKg: 26 },
      { month: "May", quantityKg: 31 },
      { month: "Jun", quantityKg: 42 },
      { month: "Jul", quantityKg: 36 },
      { month: "Aug", quantityKg: 48 },
      { month: "Sep", quantityKg: 12 },
    ],
    hiveProduction: store.hives.map((hive) => ({ hive: hive.id, quantityKg: hive.productionKg })),
    floralProduction: [
      { source: "Sunflower", quantityKg: 36 },
      { source: "Mustard", quantityKg: 22 },
      { source: "Wildflower", quantityKg: 18 },
    ],
    batchStatus: [
      { status: "Delivered", count: 1 },
      { status: "In progress", count: 0 },
    ],
    qualityStatus: [
      { status: "Passed", count: store.quality.filter((test) => test.purityStatus === "Passed").length },
      { status: "Pending", count: 0 },
    ],
  };
  res.json(GetAnalyticsResponse.parse(response));
});

router.post("/predict-yield", (req, res): void => {
  const parsed = PredictYieldBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const input = parsed.data;
  const prediction = Math.max(
    0,
    input.previousYield * 0.56 +
      input.colonyStrength * 0.22 +
      input.temperature * 0.08 -
      input.humidity * 0.02 -
      input.rainfall * 0.03 +
      (input.season === "Monsoon" ? -1.2 : 1.6),
  );
  res.json(
    PredictYieldResponse.parse({
      predictedYieldKg: Number(prediction.toFixed(1)),
      confidence: 0.82,
      label: "AI/ML Predicted Yield",
    }),
  );
});

export default router;