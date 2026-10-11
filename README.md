# Open-source AI platform blueprint

A documentation repository on how to design and build a complete, vendor-neutral, **open-source AI platform**: AI gateway, model router, model serving, retrieval, agents, observability, security, governance, reliability and performance, and hardening.

*Snapshot: 2026-10-11. Tool facts (licences, stars, releases, project status) were verified on that date and decay quickly; see the [methodology](./docs/00-methodology.md) for how, and how to refresh them.*

## What is in here

The research first defined the pillars (from the CNCF Cloud Native AI whitepaper, the Kubernetes AI Conformance checklist, the CNCF landscape and cloud well-architected guides), then chose the best and most popular open-source tools for each one on six signals: licence, adoption, maintenance health, interoperability, security posture and operability. Every pillar document follows the same structure: why it matters, capability map, tool comparison with a default pick and alternatives, reference design, implementation guide, operations, pitfalls and a checklist with MVP, Production and Enterprise levels.

## Pillars

| Pillar | Document | Covers |
|--------|----------|--------|
| P02 | [AI gateway](./docs/02-ai-gateway.md) | One governed entry point for model traffic: unified API, authentication, virtual keys, quotas, metering, hooks |
| P03 | [Model router](./docs/03-model-router.md) | Choosing which model or endpoint serves a request: policies, fallbacks, canaries, inference-aware load balancing |
| P04 | [Model serving](./docs/04-model-serving.md) | Inference engines, Kubernetes-native serving, GPU scheduling, model artifacts |
| P05 | [Data and knowledge (RAG)](./docs/05-data-knowledge-rag.md) | Vector stores, embeddings, ingestion, retrieval |
| P06 | [Agents and MCP](./docs/06-agents-mcp.md) | MCP and A2A, tool gateways, agent runtimes and sandboxes |
| P07 | [Observability and evaluation](./docs/07-observability-evaluation.md) | Traces, metrics and logs, OpenTelemetry GenAI conventions, evals, cost visibility |
| P08 | [Security](./docs/08-security.md) | AI threat model, guardrails, identity and authorisation, secrets, red teaming |
| P09 | [Governance, risk and compliance](./docs/09-governance-risk-compliance.md) | Policy as code, registries, audit, AI-BOM, FinOps, risk frameworks and regulation |
| P10 | [Reliability and performance](./docs/10-reliability-performance.md) | SLOs, caching, autoscaling, resilience, benchmarking, disaster recovery |
| P11 | [Hardening](./docs/11-hardening.md) | Cluster and node baselines, supply chain, model-artifact safety, isolation |
| P12 | [Foundation and delivery](./docs/12-foundation-infrastructure.md) | Kubernetes, networking, storage, GitOps, infrastructure as code, licence watch-list |

Supporting documents:

- [Methodology](./docs/00-methodology.md): how the pillars and tools were chosen, the evidence grades, and the limits of the research.
- [Reference architecture](./docs/01-reference-architecture.md): how the pillars fit together, request flows and deployment topologies.
- [Implementation roadmap](./docs/13-implementation-roadmap.md): a phased adoption path from MVP to enterprise.
- [Tool landscape](./docs/14-tool-landscape.md): every tool in one catalog with licence label, steward, stars and latest release.
- [Glossary](./docs/15-glossary.md) and [References](./docs/16-references.md).

## How to read it

- **Architects:** start with the [reference architecture](./docs/01-reference-architecture.md), then the [roadmap](./docs/13-implementation-roadmap.md).
- **Platform engineers building the first version:** the [AI gateway](./docs/02-ai-gateway.md), [model serving](./docs/04-model-serving.md) and [observability](./docs/07-observability-evaluation.md) pillars, then the MVP items in each checklist.
- **Security and governance leads:** [Security](./docs/08-security.md), [Governance](./docs/09-governance-risk-compliance.md) and [Hardening](./docs/11-hardening.md).
- **Anyone choosing tools:** the [tool landscape](./docs/14-tool-landscape.md) and the licence legend in the [methodology](./docs/00-methodology.md#32-licence-policy-and-legend).

## Ground rules

- **Open source first.** Recommended platform components are open source. The platform may still call commercial model APIs through the gateway. Licence labels are `OSI`, `Open-core`, `Source-available`, `Open weights` and `Not OSS`.
- **Dated facts.** Time-sensitive claims are as of the snapshot date and graded by how they were verified.
- **Not audited or legal advice.** This repository was drafted with AI assistance and then reviewed and fact-checked in separate passes. Verify before you adopt a tool, and check official texts before any compliance decision. Issues and corrections are welcome.

## Licence

[MIT](./LICENSE) © 2026 François-Xavier Kim
