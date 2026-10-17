# Implementation roadmap

> **TL;DR** — Adopt the platform in four phases: a governed gateway with visibility and cost attribution first, then self-hosted serving, a model registry, retrieval and offline evals, then security, governance, a platform portal and resilience, and finally scale, adaptation and hardening. Each phase maps to the MVP, Production and Enterprise levels in the pillar checklists, names the key dependencies and skills, and ends with an exit test you can actually run.

*Snapshot: 2026-10-11 · Related: [Reference architecture](./01-reference-architecture.md) · [Methodology](./00-methodology.md) · [Tool landscape](./15-tool-landscape.md)*

This roadmap is a suggested order, not a schedule. It contains no duration estimates because they depend on team size and existing infrastructure. It covers the twelve pillars P02 to P13 (see [methodology 2.6](./00-methodology.md#26-review-of-the-original-pillar-list)).

## Phase 0: Prerequisites

- A Kubernetes cluster with GitOps and an observability stack ([P12](./12-foundation-infrastructure.md)).
- Baseline hardening of the cluster: restricted pod security defaults and image scanning ([P09](./09-security-safety.md)).
- A named platform owner (treat the platform as a product, [P13](./13-platform-experience.md)) and a list of first consumers.
- A decision on data classes: which data may go to external model APIs and which must stay self-hosted.
- A first tenancy decision (namespace per team is the default, [P13](./13-platform-experience.md)) and a tagging convention for cost ([P10](./10-governance-finops.md)).

**Exit test:** a sample workload deploys from Git and its metrics appear in dashboards.

## Phase 1: One governed entry point (MVP)

| Do | Pillar |
|----|--------|
| Deploy the AI gateway in front of one or two model providers | [P02](./02-ai-gateway-routing.md) |
| Issue virtual keys per team; set basic quotas | [P02](./02-ai-gateway-routing.md) |
| Emit OpenTelemetry traces with token usage; build a cost dashboard | [P07](./07-observability-evaluation.md) |
| Publish showback reports by team from gateway usage and cost tags | [P10](./10-governance-finops.md) |
| Document the OpenAI-compatible contract and a manual onboarding checklist | [P13](./13-platform-experience.md) |
| Keep provider keys in a secret store; put human sign-in behind one OIDC provider | [P12](./12-foundation-infrastructure.md), [P09](./09-security-safety.md) |

**Exit test:** every model call in the organisation can be attributed to a team and a cost, no client holds a provider key, and a new team makes its first call from the documented checklist.

## Phase 2: Self-hosted models, grounding and quality gates

| Do | Pillar |
|----|--------|
| Serve one open-weights model on GPU nodes behind the gateway | [P03](./03-model-serving.md) |
| Mirror model artifacts into an internal store and start a model registry with licence review | [P04](./04-model-lifecycle-adaptation.md) |
| Add routing with a fallback to a second backend | [P02](./02-ai-gateway-routing.md) |
| Stand up a vector store and an ingestion pipeline for one corpus; version prompts as assets | [P05](./05-data-knowledge-rag.md) |
| Add one queued batch or backfill path that uses the same model aliases, guardrails and telemetry as the online path | [P03](./03-model-serving.md), [P11](./11-reliability-capacity.md) |
| Build a golden dataset and run offline evals on every model, prompt or retrieval change, as a CI gate | [P08](./08-evaluation-quality.md) |

**Exit test:** a model swap is a configuration change, a registered model has an owner and licence record, an eval run gates the swap, and one batch job completes without bypassing the gateway.

## Phase 3: Safe, accountable and usable (Production)

| Do | Pillar |
|----|--------|
| Enable input and output guardrails; run a first red-team pass | [P09](./09-security-safety.md) |
| Define SLOs; add exact caching, a first backup, and later autoscaling, timeouts, circuit breakers and a first capacity plan | [P11](./11-reliability-capacity.md) |
| Register models and prompts with risk metadata; record audit logs; add budgets and alerts | [P10](./10-governance-finops.md) |
| Encode data classes and residency rules in routing, retrieval and egress policy | [P02](./02-ai-gateway-routing.md), [P05](./05-data-knowledge-rag.md), [P10](./10-governance-finops.md) |
| Add agent runtimes with their own identities, a tool gateway, approval gates and sandboxed execution | [P06](./06-agents-mcp.md) |
| Sample and score production traffic online; calibrate judges against human labels | [P08](./08-evaluation-quality.md) |
| Launch the developer portal and one golden-path template that mints identity, key and quota | [P13](./13-platform-experience.md) |

**Exit test:** a game-day failure of the primary backend meets the SLO, an audit query answers "who used which model with which data", a residency test proves the blocked route stays blocked, and a team onboards itself from the portal without a ticket.

## Phase 4: Scale, adapt and harden (Enterprise)

| Do | Pillar |
|----|--------|
| Apply the cluster and node baseline; sign and scan images and model artifacts | [P09](./09-security-safety.md) |
| Add multi-cluster failover, disaster-recovery drills and accelerator capacity forecasting with quotas | [P11](./11-reliability-capacity.md) |
| Chargeback by team, policy as code for spend, routing and admission; map controls to your risk framework | [P10](./10-governance-finops.md) |
| Adapt models where evals show a gap that prompting and RAG cannot close (LoRA, distillation), quantise for cost, publish deprecation schedules | [P04](./04-model-lifecycle-adaptation.md) |
| Inference-aware routing, prefix-cache-aware load balancing, disaggregated serving where measurements justify it | [P03](./03-model-serving.md) |
| Harder tenant isolation (virtual or dedicated clusters) where needed; support model and adoption metrics | [P13](./13-platform-experience.md), [P09](./09-security-safety.md) |
| Add sovereign or multimodal deployment variants only where product or policy requires them, reusing the same gateway, lineage and eval controls | [Reference architecture](./01-reference-architecture.md), [P03](./03-model-serving.md), [P10](./10-governance-finops.md) |
| Agent-to-agent protocols, break-glass access and agent trajectory evals | [P06](./06-agents-mcp.md), [P08](./08-evaluation-quality.md) |

**Exit test:** an independent review can reproduce the control evidence from Git and logs, a GPU budget forecast matches actual use within an agreed margin, and the sovereign or multi-region failover design has been drilled rather than only diagrammed.

## Checklist coverage

Each pillar's checklist has MVP, Production and Enterprise levels. This table shows the phase in which each level is meant to be reached; the phase tables above list the headline actions.

| Pillar | MVP | Production | Enterprise |
|--------|-----|------------|------------|
| [P02 AI gateway and routing](./02-ai-gateway-routing.md) | Phase 1 (gateway, keys); fallback in Phase 2 | Phase 3 (per-team budgets, versioned aliases, health-aware routing, canary rollback) | Phase 4 (SSO, delegated quotas, residency rules, regional fallback tiers) |
| [P03 Model serving](./03-model-serving.md) | Phase 2 | Phase 3 (KServe lifecycle, autoscaling signals) | Phase 4 (inference-aware routing, disaggregation if justified) |
| [P04 Model lifecycle and adaptation](./04-model-lifecycle-adaptation.md) | Phase 2 (mirrored store, registry, licence review) | Phase 3 (promotion with eval gate, rollback) | Phase 4 (adaptation pipelines, quantisation, deprecation policy) |
| [P05 Knowledge and context](./05-data-knowledge-rag.md) | Phase 2 | Phase 3 (incremental sync, ACL tests, retrieval metrics) | Phase 4 (dedicated vector service if justified, memory governance, DR) |
| [P06 Agents, tools and protocols](./06-agents-mcp.md) | Phase 3 (agents arrive after guardrails and audit exist) | Phase 3 (agent identity, tool gateway, sandbox, approval gates) | Phase 4 (A2A, break-glass, tenant isolation tests) |
| [P07 Observability](./07-observability-evaluation.md) | Phase 1 (telemetry, cost labels) | Phase 3 (redaction policy, SLO dashboards) | Phase 4 (retention review, cross-cluster tracing) |
| [P08 Evaluation and quality](./08-evaluation-quality.md) | Phase 2 (golden set, CI gate) | Phase 3 (online evals, calibrated judges) | Phase 4 (trajectory evals, red teaming in CI, human feedback loops) |
| [P09 Security and safety](./09-security-safety.md) | Phase 0 and 1 (restricted pod defaults, image scanning, one identity provider, secret store); guardrails and red-team suite in Phase 3 | Phase 3 (signing, deny-by-default network policy) | Phase 4 (artifact attestation, incident drills) |
| [P10 Governance, risk, compliance and FinOps](./10-governance-finops.md) | Phase 1 (cost tags, showback); registry metadata in Phase 3 | Phase 3 (audit, budgets) | Phase 4 (chargeback, policy as code, risk mapping) |
| [P11 Reliability, performance and capacity](./11-reliability-capacity.md) | Phase 3 (SLOs, exact cache, backups, autoscaling) | Phase 3 (first capacity plan) | Phase 4 (DR drills, capacity forecasting, quotas) |
| [P12 Foundation and delivery](./12-foundation-infrastructure.md) | Phase 0 | Phase 3 | Phase 4 |
| [P13 Platform experience and tenancy](./13-platform-experience.md) | Phase 1 (documented contract, manual onboarding) | Phase 3 (portal, golden path, namespace tenancy) | Phase 4 (hard isolation tiers, support model, adoption metrics) |

Three consequences: the platform reaches pillar-level MVP for security and governance only after the gateway and serving exist; the baseline of P09 and P12 is a prerequisite rather than a late addition; and the eval gate (P08) must exist before the first model change that matters, which is why it sits in Phase 2 rather than with the other assurance work.

## Sequencing rules

- Do not add a pillar before the one it attaches to exists: guardrails need the gateway; evals need telemetry and a dataset; adaptation needs evals.
- Measure before optimising: caching, disaggregation and custom routers wait for real traffic data.
- Cheapest adaptation first: prompting, then RAG, then fine-tuning, and only when the eval gate shows the earlier steps fall short ([P04](./04-model-lifecycle-adaptation.md)).
- Re-verify tool facts when adopting them (see [methodology 5](./00-methodology.md#5-snapshot-and-refresh)).

## Key dependencies

| Dependency | Why it matters |
|------------|----------------|
| [P02](./02-ai-gateway-routing.md) before [P09](./09-security-safety.md) guardrails | The safest place to enforce most request-time controls is the shared entry point; adding guardrails first in application code creates bypasses |
| [P07](./07-observability-evaluation.md) before online [P08](./08-evaluation-quality.md) | Online evals without traces, request IDs and cost tags produce scores you cannot explain or action |
| Offline [P08](./08-evaluation-quality.md) before [P04](./04-model-lifecycle-adaptation.md) tuning | Without a regression gate, fine-tuning and distillation become cost without evidence |
| [P10](./10-governance-finops.md) data classification before hybrid or sovereign rollout | Residency and provider policy must exist before routing can enforce them |
| [P11](./11-reliability-capacity.md) quota and headroom before heavy batch or agent rollout | Batch backfills, eval farms and tool-using agents can starve live traffic if they arrive before admission control |
| [P13](./13-platform-experience.md) portal after the contract exists | Self-service should mint known-good identity, keys, quotas and dashboards; a portal before the platform contract just scales confusion |

## Teams and skills by phase

| Phase | Minimum skills that must be explicitly staffed |
|-------|-----------------------------------------------|
| Phase 0 | Kubernetes platform engineering, GitOps/IaC, cluster security, observability |
| Phase 1 | API gateway operations, identity/OIDC, FinOps reporting, developer enablement |
| Phase 2 | GPU/Kubernetes operations, model serving, registry/package management, retrieval engineering, CI automation |
| Phase 3 | AI security, threat modelling, SRE, evaluation design, product support or platform enablement |
| Phase 4 | Capacity planning, multi-cluster networking, adaptation/fine-tuning, compliance or GRC liaison, incident response |

If one person covers several boxes, name that explicitly. The failure mode is not "too few tools"; it is "nobody owns the cross-cutting work".

## Common risks and mitigations

| Risk | Usually appears in | Mitigation |
|------|--------------------|------------|
| Gateway bypass via direct provider keys or side-channel services | Phase 1 onwards | Remove provider keys from clients, monitor egress and make the gateway the only supported contract |
| Premature fine-tuning | Phase 2 | Require a failing eval and a written reason why prompting or RAG cannot close the gap |
| Batch and eval jobs starving live traffic | Phase 2 onwards | Separate queues, quotas and headroom; test failure modes before adding bigger models |
| Sovereignty or residency treated as a documentation note only | Phase 3 onwards | Encode it in routing, storage placement, tenancy and audit tests |
| Portal-first platform engineering | Phase 3 | Launch one or two high-value golden paths only after identity, quota, dashboards and support ownership exist |
| Tool sprawl and duplicate control planes | All phases | One default per capability, published exceptions, and quarterly review of what is actually in use |

## Anti-patterns

- Pre-training, feature stores and general data pipelines (out of scope, [methodology 2.4](./00-methodology.md#24-deliberate-non-pillars)).
- Fine-tuning before an eval gate exists, or because it is fashionable.
- Adopting every tool in the [catalog](./15-tool-landscape.md); one default per capability is the point.
- Treating batch, backfill and eval traffic as "not production", so it bypasses quotas, tracing or guardrails.
- Declaring residency or sovereign requirements without proving them in routing and data-placement tests.
- Launching agents before workload identity, audit and approval paths exist.
