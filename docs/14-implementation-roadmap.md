# Implementation roadmap

> **TL;DR** — Adopt the platform in four phases: gateway and visibility first, then serving and retrieval, then security, governance and resilience, and finally scale and hardening. Each phase maps to the MVP, Production and Enterprise levels in the pillar checklists, and each ends with an exit test you can actually run.

*Snapshot: 2026-10-11 · Related: [Reference architecture](./01-reference-architecture.md) · [Methodology](./00-methodology.md) · [Tool landscape](./15-tool-landscape.md)*

This roadmap is a suggested order, not a schedule. It contains no duration estimates because they depend on team size and existing infrastructure.

## Phase 0: Prerequisites

- A Kubernetes cluster with GitOps and an observability stack ([P12](./12-foundation-infrastructure.md)).
- Baseline hardening of the cluster: restricted pod security defaults and image scanning ([P09](./09-security-safety.md)).
- A named platform owner and a list of first consumers.
- A decision on data classes: which data may go to external model APIs and which must stay self-hosted.

**Exit test:** a sample workload deploys from Git and its metrics appear in dashboards.

## Phase 1: One governed entry point (MVP)

| Do | Pillar |
|----|--------|
| Deploy the AI gateway in front of one or two model providers | [P02](./02-ai-gateway-routing.md) |
| Issue virtual keys per team; set basic quotas | [P02](./02-ai-gateway-routing.md) |
| Emit OpenTelemetry traces with token usage; build a cost dashboard | [P07](./07-observability-evaluation.md) |
| Keep provider keys in a secret store; put human sign-in behind one OIDC provider | [P12](./12-foundation-infrastructure.md), [P09](./09-security-safety.md) |

**Exit test:** every model call in the organisation can be attributed to a team and a cost, and no client holds a provider key.

## Phase 2: Self-hosted models and grounding

| Do | Pillar |
|----|--------|
| Serve one open-weights model on GPU nodes behind the gateway | [P03](./03-model-serving.md) |
| Add routing with a fallback to a second backend | [P02](./02-ai-gateway-routing.md) |
| Stand up a vector store and an ingestion pipeline for one corpus | [P05](./05-data-knowledge-rag.md) |
| Add an evaluation set and run it on every model or prompt change | [P07](./07-observability-evaluation.md) |

**Exit test:** a model swap is a configuration change, and an eval run gates it.

## Phase 3: Safe and accountable (Production)

| Do | Pillar |
|----|--------|
| Enable input and output guardrails; run a first red-team pass | [P09](./09-security-safety.md) |
| Define SLOs; add exact caching, a first backup, and later autoscaling, timeouts and circuit breakers | [P11](./11-reliability-capacity.md) |
| Register models and prompts; record audit logs | [P10](./10-governance-finops.md) |
| Add agent runtimes with a tool gateway and sandboxed execution | [P06](./06-agents-mcp.md) |

**Exit test:** a game-day failure of the primary backend meets the SLO, and an audit query answers "who used which model with which data".

## Phase 4: Scale and harden (Enterprise)

| Do | Pillar |
|----|--------|
| Apply the cluster and node baseline; sign and scan images and model artifacts | [P09](./09-security-safety.md) |
| Add tenant isolation, multi-cluster failover and disaster-recovery drills | [P11](./11-reliability-capacity.md), [P09](./09-security-safety.md) |
| Policy as code for spend, routing and admission; map controls to your risk framework | [P10](./10-governance-finops.md) |
| Inference-aware routing, prefix-cache-aware load balancing, disaggregated serving where measurements justify it | [P02](./02-ai-gateway-routing.md), [P03](./03-model-serving.md) |

**Exit test:** an independent review can reproduce the control evidence from Git and logs.

## Checklist coverage

Each pillar's checklist has MVP, Production and Enterprise levels. This table shows the phase in which each level is meant to be reached; the phase tables above list the headline actions.

| Pillar | MVP | Production | Enterprise |
|--------|-----|------------|------------|
| [P02 AI gateway](./02-ai-gateway-routing.md) | Phase 1 | Phase 3 (per-team keys, budgets, versioned aliases) | Phase 4 (SSO, delegated quotas, key-rotation tests) |
| [P02 Model router](./02-ai-gateway-routing.md) | Phase 2 | Phase 3 (health-aware routing, canary rollback) | Phase 4 (residency rules, regional fallback tiers) |
| [P03 Model serving](./03-model-serving.md) | Phase 2 | Phase 3 (KServe lifecycle, autoscaling signals) | Phase 4 |
| [P05 Data and RAG](./05-data-knowledge-rag.md) | Phase 2 | Phase 3 (incremental sync, ACL tests, retrieval metrics) | Phase 4 (dedicated vector service if justified, DR) |
| [P06 Agents and MCP](./06-agents-mcp.md) | Phase 3 (agents arrive after guardrails and audit exist) | Phase 3 (tool gateway, sandbox) | Phase 4 (A2A, break-glass, tenant isolation tests) |
| [P07 Observability and evaluation](./07-observability-evaluation.md) | Phase 1 (telemetry, cost labels); eval runner in Phase 2 | Phase 3 (quality gates, redaction policy) | Phase 4 (chargeback, retention review) |
| [P09 Security](./09-security-safety.md) | Phase 1 (one identity provider, secret store); guardrails and red-team suite in Phase 3 | Phase 3 | Phase 4 (red teaming in CI, incident drills) |
| [P10 Governance, risk and compliance](./10-governance-finops.md) | Phase 3 (registry and metadata); cost tags from Phase 1 | Phase 3 | Phase 4 |
| [P11 Reliability and performance](./11-reliability-capacity.md) | Phase 3 (SLOs, exact cache, backups, autoscaling) | Phase 3 | Phase 4 |
| [P09 Hardening](./09-security-safety.md) | Phase 0 and 1 (restricted pod defaults, image scanning) | Phase 3 (signing, deny-by-default network policy) | Phase 4 |
| [P12 Foundation and delivery](./12-foundation-infrastructure.md) | Phase 0 | Phase 3 | Phase 4 |

Two consequences: the platform reaches pillar-level MVP for security and governance only after the gateway and serving exist, and the baseline of P09 and P12 is a prerequisite rather than a late addition.

## Sequencing rules

- Do not add a pillar before the one it attaches to exists: guardrails need the gateway; evals need telemetry.
- Measure before optimising: caching, disaggregation and custom routers wait for real traffic data.
- Re-verify tool facts when adopting them (see [methodology 5](./00-methodology.md#5-snapshot-and-refresh)).

## Anti-goals

- Training and fine-tuning pipelines (out of scope, [methodology 1](./00-methodology.md#1-research-questions-and-scope)).
- Adopting every tool in the [catalog](./15-tool-landscape.md); one default per capability is the point.
