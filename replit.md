# Honey Chain

Honey Chain is a traceability cockpit for beekeepers and a public Honey Passport for customers, backed by a tamper-evident SHA-256 event ledger.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/honey-chain/src/App.tsx` — Clerk setup, public routes, and product routing
- `artifacts/honey-chain/src/pages/product-pages.tsx` — landing page and product screens
- `artifacts/honey-chain/src/components/app-shell.tsx` — responsive authenticated shell and navigation
- `artifacts/api-server/src/routes/honey.ts` — Honey Chain API handlers
- `artifacts/api-server/src/lib/honey-store.ts` — seeded domain store, persistence snapshot, and SHA-256 ledger
- `lib/api-spec/openapi.yaml` — source-of-truth API contract
- `lib/db/src/schema/honey.ts` — PostgreSQL schema for traceability records
- `artifacts/honey-chain/src/index.css` — Honey Chain visual language and responsive theme

## Architecture decisions

- Clerk owns browser authentication and session cookies; the API uses Clerk middleware rather than local password storage.
- Detailed Honey Chain state is persisted in PostgreSQL as a restart-safe demo snapshot, while the domain schema remains relational for future table-backed handlers.
- Blockchain events are append-only SHA-256 records; corrections create new ledger events and never mutate prior transactions.
- Public verification exposes a Honey Passport and proof status without exposing beekeeper credentials or private profile data.
- Demo laboratory values are explicitly labeled as demo data in the seeded passport.

## Product

- Public landing page with beekeeper sign-in/sign-up and customer verification entry points
- Beekeeper dashboard with apiaries, hives, harvests, batches, quality, processing, supply chain, blockchain, analytics, and yield prediction
- Customer-facing Honey Passport at `/verify/:batchId` with quality, origin, processing, timeline, QR payload, and feedback
- Append-only blockchain explorer with whole-chain verification and correction transactions

## User preferences

 - Prioritize a complete live hackathon demo over unnecessary complexity.

## Gotchas

- Keep `info.title: Api` in the OpenAPI document or generated client import paths change.
- The generated Zod client requires Zod 4 syntax; the workspace catalog is pinned to Zod 4.
- Restart the managed API and Honey Chain workflows after backend or package changes.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
