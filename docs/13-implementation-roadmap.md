# Implementation roadmap

> **TL;DR** — Adopt the platform in four phases: gateway and visibility first, then serving and retrieval, then security, governance and resilience, and finally scale and hardening. Each phase maps to the MVP, Production and Enterprise levels in the pillar checklists, and each ends with an exit test you can actually run.

*Snapshot: 2026-10-11 · Related: [Reference architecture](./01-reference-architecture.md) · [Methodology](./00-methodology.md) · [Tool landscape](./14-tool-landscape.md)*

This roadmap is a suggested order, not a schedule. It contains no duration estimates because they depend on team size and existing infrastructure.

## Phase 0: Prerequisites

- A Kubernetes cluster with GitOps and an observability stack ([P12](./12-foundation-infrastructure.md)).
- A named platform owner and a list of first consumers.
- A decision on data classes: which data may go to external model APIs and which must stay self-hosted.

**Exit test:** a sample workload deploys from Git and its metrics appear in dashboards.

## Phase 1: One governed entry point (MVP)

| Do | Pillar |
|----|--------|
| Deploy the AI gateway in front of one or two model providers | [P02](./02-ai-gateway.md) |
| Issue virtual keys per team; set basic quotas | [P02](./02-ai-gateway.md) |
| Emit OpenTelemetry traces with token usage; build a cost dashboard | [P07](./07-observability-evaluation.md) |
| Keep provider keys in a secret store | [P12](./12-foundation-infrastructure.md) |

**Exit test:** every model call in the organisation can be attributed to a team and a cost, and no client holds a provider key.

## Phase 2: Self-hosted models and grounding

| Do | Pillar |
|----|--------|
| Serve one open-weights model on GPU nodes behind the gateway | [P04](./04-model-serving.md) |
| Add routing with a fallback to a second backend | [P03](./03-model-router.md) |
| Stand up a vector store and an ingestion pipeline for one corpus | [P05](./05-data-knowledge-rag.md) |
| Add an evaluation set and run it on every model or prompt change | [P07](./07-observability-evaluation.md) |

**Exit test:** a model swap is a configuration change, and an eval run gates it.

## Phase 3: Safe and accountable (Production)

| Do | Pillar |
|----|--------|
| Enable input and output guardrails; run a first red-team pass | [P08](./08-security.md) |
| Define SLOs; add autoscaling, timeouts and circuit breakers | [P10](./10-reliability-performance.md) |
| Register models and prompts; record audit logs | [P09](./09-governance-risk-compliance.md) |
| Add agent runtimes with a tool gateway and sandboxed execution | [P06](./06-agents-mcp.md) |

**Exit test:** a game-day failure of the primary backend meets the SLO, and an audit query answers "who used which model with which data".

## Phase 4: Scale and harden (Enterprise)

| Do | Pillar |
|----|--------|
| Apply the cluster and node baseline; sign and scan images and model artifacts | [P11](./11-hardening.md) |
| Add tenant isolation, multi-cluster failover and disaster-recovery drills | [P10](./10-reliability-performance.md), [P11](./11-hardening.md) |
| Policy as code for spend, routing and admission; map controls to your risk framework | [P09](./09-governance-risk-compliance.md) |
| Inference-aware routing, prefix-cache-aware load balancing, disaggregated serving where measurements justify it | [P03](./03-model-router.md), [P04](./04-model-serving.md) |

**Exit test:** an independent review can reproduce the control evidence from Git and logs.

## Sequencing rules

- Do not add a pillar before the one it attaches to exists: guardrails need the gateway; evals need telemetry.
- Measure before optimising: caching, disaggregation and custom routers wait for real traffic data.
- Re-verify tool facts when adopting them (see [methodology 5](./00-methodology.md#5-snapshot-and-refresh)).

## Anti-goals

- Training and fine-tuning pipelines (out of scope, [methodology 1](./00-methodology.md#1-research-questions-and-scope)).
- Adopting every tool in the [catalog](./14-tool-landscape.md); one default per capability is the point.
