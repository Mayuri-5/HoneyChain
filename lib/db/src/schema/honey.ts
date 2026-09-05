import { createInsertSchema } from "drizzle-zod";
import { date, integer, jsonb, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

const id = (name: string) => text(name).primaryKey();

export const usersTable = pgTable("honey_users", {
  id: id("id"),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("beekeeper"),
  phone: text("phone"),
  location: text("location").notNull(),
  apiaryName: text("apiary_name").notNull(),
  experience: text("experience"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const apiariesTable = pgTable("honey_apiaries", {
  id: id("id"),
  userId: text("user_id").notNull().references(() => usersTable.id),
  name: text("name").notNull(),
  location: text("location").notNull(),
  latitude: numeric("latitude"),
  longitude: numeric("longitude"),
  beeSpecies: text("bee_species").notNull(),
  hiveCount: integer("hive_count").notNull().default(0),
  floralSources: text("floral_sources").array().notNull().default([]),
  notes: text("notes"),
  status: text("status").notNull().default("Active"),
});

export const hivesTable = pgTable("honey_hives", {
  id: id("id"),
  apiaryId: text("apiary_id").notNull().references(() => apiariesTable.id),
  name: text("name").notNull(),
  beeSpecies: text("bee_species").notNull(),
  frames: integer("frames").notNull(),
  queenAge: integer("queen_age").notNull(),
  strength: text("strength").notNull(),
  health: text("health").notNull(),
  dateAdded: date("date_added", { mode: "string" }).notNull(),
  lastInspection: date("last_inspection", { mode: "string" }),
});

export const harvestsTable = pgTable("honey_harvests", {
  id: id("id"),
  hiveId: text("hive_id").notNull().references(() => hivesTable.id),
  harvestDate: date("harvest_date", { mode: "string" }).notNull(),
  quantityKg: numeric("quantity_kg").notNull(),
  floralSource: text("floral_source").notNull(),
  weather: text("weather").notNull(),
  notes: text("notes"),
});

export const batchesTable = pgTable("honey_batches", {
  id: id("id"),
  harvestId: text("harvest_id").notNull().references(() => harvestsTable.id),
  hiveId: text("hive_id").notNull().references(() => hivesTable.id),
  status: text("status").notNull().default("Harvested"),
  blockchainStatus: text("blockchain_status").notNull().default("Verified"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const qualityTestsTable = pgTable("honey_quality_tests", {
  id: id("id"),
  batchId: text("batch_id").notNull().references(() => batchesTable.id),
  moisture: numeric("moisture").notNull(),
  hmf: numeric("hmf").notNull(),
  diastase: numeric("diastase").notNull(),
  ph: numeric("ph").notNull(),
  sugarContent: numeric("sugar_content").notNull(),
  purityStatus: text("purity_status").notNull(),
  laboratory: text("laboratory").notNull(),
  testDate: date("test_date", { mode: "string" }).notNull(),
  certificateUrl: text("certificate_url"),
});

export const processingTable = pgTable("honey_processing", {
  id: id("id"),
  batchId: text("batch_id").notNull().references(() => batchesTable.id),
  processingDate: date("processing_date", { mode: "string" }).notNull(),
  method: text("method").notNull(),
  packaging: text("packaging").notNull(),
  netWeightKg: numeric("net_weight_kg").notNull(),
  packageDate: date("package_date", { mode: "string" }).notNull(),
  expiryDate: date("expiry_date", { mode: "string" }).notNull(),
});

export const supplyChainEventsTable = pgTable("honey_supply_chain_events", {
  id: id("id"),
  batchId: text("batch_id").notNull().references(() => batchesTable.id),
  eventType: text("event_type").notNull(),
  from: text("from"),
  to: text("to"),
  location: text("location").notNull(),
  eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
  transportMethod: text("transport_method"),
  status: text("status").notNull(),
  notes: text("notes"),
});

export const blockchainTransactionsTable = pgTable("honey_blockchain_transactions", {
  id: id("id"),
  batchId: text("batch_id").notNull(),
  eventType: text("event_type").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  dataHash: text("data_hash").notNull(),
  previousHash: text("previous_hash").notNull(),
  currentHash: text("current_hash").notNull(),
  actor: text("actor").notNull(),
  metadata: jsonb("metadata"),
});

export const correctionsTable = pgTable("honey_corrections", {
  id: id("id"),
  originalTransactionId: text("original_transaction_id").notNull(),
  batchId: text("batch_id").notNull(),
  oldValue: text("old_value").notNull(),
  newValue: text("new_value").notNull(),
  reason: text("reason").notNull(),
  correctedBy: text("corrected_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const feedbackTable = pgTable("honey_feedback", {
  id: id("id"),
  batchId: text("batch_id").notNull().references(() => batchesTable.id),
  overallRating: integer("overall_rating").notNull(),
  tasteRating: integer("taste_rating").notNull(),
  qualityRating: integer("quality_rating").notNull(),
  packagingRating: integer("packaging_rating").notNull(),
  comment: text("comment").notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notificationsTable = pgTable("honey_notifications", {
  id: id("id"),
  userId: text("user_id").notNull().references(() => usersTable.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  time: text("time").notNull(),
  unread: text("unread").notNull().default("true"),
});

export const honeyAppStateTable = pgTable("honey_app_state", {
  id: text("id").primaryKey(),
  payload: jsonb("payload").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable);
export const insertApiarySchema = createInsertSchema(apiariesTable);
export const insertHiveSchema = createInsertSchema(hivesTable);
export const insertHarvestSchema = createInsertSchema(harvestsTable);
export const insertBatchSchema = createInsertSchema(batchesTable);
export const insertQualityTestSchema = createInsertSchema(qualityTestsTable);
export const insertProcessingSchema = createInsertSchema(processingTable);
export const insertSupplyChainEventSchema = createInsertSchema(supplyChainEventsTable);
export const insertBlockchainTransactionSchema = createInsertSchema(blockchainTransactionsTable);
export const insertCorrectionSchema = createInsertSchema(correctionsTable);
export const insertFeedbackSchema = createInsertSchema(feedbackTable);
export const insertNotificationSchema = createInsertSchema(notificationsTable);
export const insertHoneyAppStateSchema = createInsertSchema(honeyAppStateTable);

export type InsertHoneyUser = z.infer<typeof insertUserSchema>;