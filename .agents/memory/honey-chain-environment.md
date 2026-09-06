---
name: Honey Chain environment decisions
description: Durable implementation decisions for the Honey Chain monorepo.
---

Honey Chain uses the workspace's PostgreSQL database and a local browser registration/session flow for the current prototype. The API keeps a restart-safe persisted snapshot for the hackathon MVP while relational tables are ready for further normalization.

**Why:** The requested prototype flow requires registration, login, logout, and refresh persistence without a hard-coded beekeeper; keeping one local auth source avoids contradictory Clerk and prototype sessions.

**How to apply:** Do not mix the local prototype session with Clerk UI auth unless a deliberate production-auth migration is requested. Keep public passport routes unauthenticated, start new local state without demo identity/data, and treat blockchain records as append-only proofs rather than editable business data.