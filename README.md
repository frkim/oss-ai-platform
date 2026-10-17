# Open-source AI platform blueprint

A documentation repository on how to design and build a complete, vendor-neutral, **open-source AI platform**: AI gateway and routing, model serving, model lifecycle and adaptation, knowledge and context, agents, observability, evaluation, security, governance and FinOps, reliability and capacity, the foundation and delivery layer, and the platform experience on top.

*Snapshot: 2026-10-11. Tool facts (licences, stars, releases, project status) were verified on that date and decay quickly; see the [methodology](./docs/00-methodology.md) for how, and how to refresh them.*

## What is in here

The research first defined the pillars (from the CNCF Cloud Native AI whitepaper, the Kubernetes AI Conformance checklist, the CNCF landscape and cloud well-architected guides), then chose the best and most popular open-source tools for each one on six signals: licence, adoption, maintenance health, interoperability, security posture and operability. An expert review of the original pillar list (verdict per pillar, criteria, gaps and an old-to-new mapping) is in [methodology 2.6](./docs/00-methodology.md#26-review-of-the-original-pillar-list); it produced the twelve pillars below. Every pillar document follows the same structure: why it matters, capability map, tool comparison with a default pick and alternatives, reference design, implementation guide, operations, pitfalls and a checklist with MVP, Production and Enterprise levels.

## Pillars

| Pillar | Document | Covers |
|--------|----------|--------|
| P02 | [AI gateway and routing](./docs/02-ai-gateway-routing.md) | One governed entry point for model traffic: unified API, authentication, virtual keys, quotas, metering, hooks, policy routing, fallbacks and canaries |
| P03 | [Model serving and inference](./docs/03-model-serving.md) | Inference engines, Kubernetes-native serving, GPU scheduling, inference-aware routing and KV-cache-aware scheduling |
| P04 | [Model lifecycle and adaptation](./docs/04-model-lifecycle-adaptation.md) | Model registry and catalogue, artifact provenance, selection, quantisation, fine-tuning, rollout and deprecation |
| P05 | [Knowledge and context](./docs/05-data-knowledge-rag.md) | Vector stores, embeddings, ingestion, retrieval, memory stores, prompt and context assets |
| P06 | [Agents, tools and protocols](./docs/06-agents-mcp.md) | MCP and A2A, tool gateways, agent runtimes and sandboxes, agent identity, human-in-the-loop |
| P07 | [Observability](./docs/07-observability-evaluation.md) | Traces, metrics and logs, OpenTelemetry GenAI conventions, cost and usage visibility |
| P08 | [Evaluation and quality](./docs/08-evaluation-quality.md) | Offline and online evals, LLM-as-judge, agent evals, datasets, regression gates in CI, human feedback |
| P09 | [Security and safety](./docs/09-security-safety.md) | AI threat model, guardrails, identity, secrets, red teaming, cluster and node baselines, supply chain, isolation |
| P10 | [Governance, risk, compliance and FinOps](./docs/10-governance-finops.md) | Policy as code, registries, audit, AI-BOM, showback and chargeback, GPU economics, risk frameworks and regulation |
| P11 | [Reliability, performance and capacity](./docs/11-reliability-capacity.md) | SLOs, caching, autoscaling, resilience, benchmarking, accelerator capacity planning, disaster recovery |
| P12 | [Foundation and delivery](./docs/12-foundation-infrastructure.md) | Kubernetes, networking, storage, GitOps, infrastructure as code, licence watch-list |
| P13 | [Platform experience and tenancy](./docs/13-platform-experience.md) | Developer portal and catalogue, golden paths, SDKs, onboarding, multi-tenancy model, usage dashboards, support |

Topics deliberately left out (pre-training, data and feature pipelines, edge fleets, multimodal, sustainability programmes) are listed in [methodology 2.4](./docs/00-methodology.md#24-deliberate-non-pillars), together with the topics the review promoted into pillars (fine-tuning, prompt management, multi-tenancy, FinOps, developer experience).

- [Cockpit web app](./cockpit/README.md): a control-tower UI to monitor and control the platform components, packaged to deploy with the others.

Supporting documents:

- [Methodology](./docs/00-methodology.md): how the pillars and tools were chosen, the pillar review, the evidence grades, and the limits of the research.
- [Reference architecture](./docs/01-reference-architecture.md): how the pillars fit together in five layers, request flows and deployment topologies.
- [Implementation roadmap](./docs/14-implementation-roadmap.md): a phased adoption path from MVP to enterprise, with a pillar by phase matrix.
- [Tool landscape](./docs/15-tool-landscape.md): every tool in one catalog with licence label, steward, stars and latest release.
- [Glossary](./docs/16-glossary.md) and [References](./docs/17-references.md).

## How to read it

- **Architects:** start with the [reference architecture](./docs/01-reference-architecture.md), then the [roadmap](./docs/14-implementation-roadmap.md) and the [pillar review](./docs/00-methodology.md#26-review-of-the-original-pillar-list).
- **Platform engineers building the first version:** the [AI gateway](./docs/02-ai-gateway-routing.md), [model serving](./docs/03-model-serving.md) and [observability](./docs/07-observability-evaluation.md) pillars, then the MVP items in each checklist.
- **ML and application teams:** [model lifecycle](./docs/04-model-lifecycle-adaptation.md), [knowledge and context](./docs/05-data-knowledge-rag.md), [agents](./docs/06-agents-mcp.md) and [evaluation](./docs/08-evaluation-quality.md).
- **Security and governance leads:** [Security and safety](./docs/09-security-safety.md) and [Governance and FinOps](./docs/10-governance-finops.md).
- **Platform product owners:** [platform experience and tenancy](./docs/13-platform-experience.md), then the [roadmap](./docs/14-implementation-roadmap.md) for sequencing and exit tests.
- **FinOps and capacity owners:** [Governance and FinOps](./docs/10-governance-finops.md), [reliability and capacity](./docs/11-reliability-capacity.md) and the cost views in [observability](./docs/07-observability-evaluation.md).
- **Anyone choosing tools:** the [tool landscape](./docs/15-tool-landscape.md) and the licence legend in the [methodology](./docs/00-methodology.md#32-licence-policy-and-legend).

## Ground rules

- **Open source first.** Recommended platform components are open source. The platform may still call commercial model APIs through the gateway. Licence labels are `OSI`, `Open-core`, `Source-available`, `Open weights` and `Not OSS`.
- **Dated facts.** Time-sensitive claims are as of the snapshot date and graded by how they were verified (`Opened`, `Search-cited`, `Unverified`).
- **Verify before adopting.** Projects change licences, owners and status quickly; some recommended repositories were found archived or moved (for example LLM Guard, MinIO, TGI). See the [tool landscape findings](./docs/15-tool-landscape.md#spot-check-findings-2026-10-11) and re-check with the commands in the [methodology](./docs/00-methodology.md#5-snapshot-and-refresh).
- **Not audited or legal advice.** This repository was drafted with AI assistance and then reviewed and fact-checked in separate passes. Verify before you adopt a tool, and check official texts before any compliance decision. Issues and corrections are welcome.

## Licence

[MIT](./LICENSE) © 2026 François-Xavier Kim
