---
name: Honey Chain environment decisions
description: Durable implementation decisions for the Honey Chain monorepo.
---

Honey Chain uses the workspace's PostgreSQL database and Clerk-managed browser sessions even though the original product brief named MySQL and local passwords. The API keeps a restart-safe persisted snapshot for the hackathon MVP while relational tables are ready for further normalization.

**Why:** The workspace provides PostgreSQL and managed Clerk as its supported path; using them avoids introducing an unsupported database or insecure local authentication flow.

**How to apply:** Preserve the Clerk cookie transport for web routes, keep public passport routes unauthenticated, and treat blockchain records as append-only proofs rather than editable business data.