# Methodology

> **TL;DR** — The twelve pillars of this blueprint (P02 to P13) were derived by cross-reading three primary sources (the CNCF Cloud Native AI whitepaper, the Kubernetes AI Conformance checklist and the CNCF landscape's AI categories) with two cloud "well-architected" guides, then giving every concern exactly one owner. An expert review of the first eleven-pillar draft ([section 2.6](#26-review-of-the-original-pillar-list)) merged overlapping pillars and added model lifecycle, evaluation, FinOps and platform experience as first-class pillars. Tools were ranked on six signals (licence, adoption, maintenance, interoperability, security posture, operability), and every time-sensitive fact is dated and graded by how it was verified. Read this page to understand how far to trust the rest.

*Snapshot: 2026-10-11 · Related: [Reference architecture](./01-reference-architecture.md) · [Tool landscape](./15-tool-landscape.md) · [References](./17-references.md)*

## 1. Research questions and scope

The research answered three questions:

1. **Which capabilities must a self-hosted, open-source AI platform provide?** This produced the pillars.
2. **For each capability, which open-source tools are the best and the most popular?** This produced the shortlists and default picks.
3. **How do the parts fit together, and in what order should a team adopt them?** This produced the [reference architecture](./01-reference-architecture.md) and the [roadmap](./14-implementation-roadmap.md).

| In scope | Out of scope |
|----------|--------------|
| Serving and applying models: gateway and routing, inference, model lifecycle and adaptation, knowledge and context, agents and tools | Pre-training, data and feature pipelines, classic MLOps beyond model adaptation (see [2.4](#24-deliberate-non-pillars) for this and other scope decisions) |
| Observability, evaluation, security and safety, governance and FinOps, reliability and capacity | Evaluating commercial SaaS platforms (named only as "Not OSS — reference only") |
| The foundation the platform runs on (Kubernetes, networking, GitOps, secrets) and the platform experience on top (portal, golden paths, tenancy) | Legal advice, including regulatory interpretation; edge fleets, multimodal and sustainability programmes |

The platform itself must be open source. It may still call commercial model APIs *through* the gateway.

## 2. How the pillars were derived

### 2.1 Sources consulted

Sources are graded by how they were read (see [section 4.1](#41-evidence-grades)).

| Source | Evidence | What it contributed | Limits |
|--------|----------|---------------------|--------|
| [CNCF Cloud Native AI whitepaper](https://github.com/cncf/tag-runtime/blob/main/wgs/cnai/whitepapers/cloudnativeai.md) (March 2024) | Opened | Lifecycle stages (data preparation, model training, model serving, user experience) and cross-cutting concerns (reference implementation, right-sizing, cost control, observability, disaster recovery and business continuity, security and compliance audits, sustainability) | Predates the LLM-gateway and agent-protocol wave: it has no content on gateways, routers, guardrails, MCP or A2A, so those pillars rest on the other sources |
| [Kubernetes AI Conformance checklist, v1.37](https://github.com/cncf/k8s-ai-conformance/blob/main/docs/AIConformance-1.37.yaml) (latest in the repository at snapshot) | Opened | 15 requirements in six areas (accelerators, networking, scheduling and orchestration, observability, security, operator): 8 `MUST`, 7 `SHOULD` | Kubernetes-level only; silent on prompt injection, RAG or governance |
| [CNCF landscape](https://github.com/cncf/landscape/blob/master/landscape.yml) | Opened | Five AI-specific top-level categories (AI Agent, Inference, Data, Training, AI Native Infra) and their subcategories; CNCF maturity levels used throughout | Entries are self-submitted, so coverage is uneven (two AI Native Infra subcategories, Storage and Network, were empty at snapshot) |
| [AWS Well-Architected Generative AI Lens](https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/generative-ai-lens.html) (published 2025-11-19) | Opened (re-read 2026-10-11) | Quality attributes (operational excellence, security, reliability, performance efficiency, cost optimization, sustainability), a lifecycle view "from scoping and model selection to deployment and continuous improvement", and generative-AI design principles: controlled autonomy, comprehensive observability, resource efficiency, distributed resilience, standardized resource management, secure interaction boundaries. Its operational-excellence area names model-output quality, traceability, lifecycle automation and "when to execute model customization" | Cloud-vendor framing; AWS services are not part of this blueprint |
| [Azure gateway guide for Foundry Models](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/azure-openai-gateway-guide) (updated 2026-09) and Azure Well-Architected AI guidance | Opened (gateway guide); Search-cited (design principles) | Evaluates direct model access against the five Well-Architected pillars and recommends a gateway in front of model endpoints for routing, resilience, governance and cost control | Cloud-vendor framing; the guide describes the pattern, not an implementation |
| Risk and threat frameworks (OWASP LLM and agentic Top 10, MITRE ATLAS, NIST AI RMF, ISO/IEC 42001, EU AI Act) | Pillar-level | They define what [Security](./09-security-safety.md) and [Governance](./10-governance-finops.md) must cover; each pillar document states how its claims were verified | Standards bodies' sites were mostly unreachable; check official texts before any compliance decision |

### 2.2 From concerns to pillars

The three primary sources were read for *concerns*, not for tools. Each concern was assigned to the pillar that owns it:

| Concern: the platform must… | Evidence in the sources | Pillar |
|-----------------------------|-------------------------|--------|
| Give all model traffic one governed entry point and decide which model or endpoint serves a request | Conformance `ai_inference` (MUST): Gateway API with weighted traffic splitting and header-based routing for OpenAI-protocol headers; landscape AI Native Infra › Gateway; Azure AI-gateway pattern. Gateways and routers overlap in practice, so one owner | [P02 AI gateway and routing](./02-ai-gateway-routing.md) |
| Run models efficiently on scarce accelerators, including inference-aware scheduling | CNAI "Model Serving"; Conformance accelerators (three SHOULD items), gang scheduling, cluster and pod autoscaling (MUST), `disaggregated_inference` and `advanced_inference_ingress` (SHOULD, Gateway API Inference Extension with KV-cache-aware routing); landscape Inference and AI Native Infra › Orchestration and Scheduling | [P03 Model serving](./03-model-serving.md) |
| Catalogue, select, optimise, adapt and retire models | CNAI "Model Training" and the lifecycle view; landscape Training and AI Native Infra › Model Asset and Registry; AWS lens "when to execute model customization" and "version artifacts" | [P04 Model lifecycle and adaptation](./04-model-lifecycle-adaptation.md) |
| Give models the right knowledge and context | CNAI "Data Preparation" and "Context - Vector Databases"; landscape AI Agent › RAG and Vector Database; AWS lens "improve data retrieval performance" | [P05 Knowledge and context](./05-data-knowledge-rag.md) |
| Let models act through tools and other agents, under their own identity | Landscape AI Agent › Agent Framework, Agent Tool, Protocol (MCP, A2A); Conformance `workload_sandboxing` (SHOULD); AWS "controlled autonomy" and "excessive agency" | [P06 Agents, tools and protocols](./06-agents-mcp.md) |
| Show what the system does | CNAI "Observability" and OpenLLMetry; Conformance `accelerator_metrics`, `ai_service_metrics` (MUST); landscape AI Native Infra › Observability; AWS "comprehensive observability" and "maintain traceability" | [P07 Observability](./07-observability-evaluation.md) |
| Show whether the system is any good, and block regressions | Landscape AI Agent › Evaluation; AWS lens "achieve consistent model output quality" and "capture and improve model performance"; Azure guidance on testing and quality gates | [P08 Evaluation and quality](./08-evaluation-quality.md) |
| Defend against AI-specific attacks and shrink the platform's own attack surface | CNAI "Security and Compliance Audits"; landscape AI Agent › Guardrail; Conformance `secure_accelerator_access` (MUST) and `workload_sandboxing` (SHOULD); AWS "secure interaction boundaries" | [P09 Security and safety](./09-security-safety.md) |
| Prove control, compliance and cost accountability | CNAI "Data Governance", "Cost Control" and "Security and Compliance Audits"; landscape AI Native Infra › Governance, Policy and Security and › Model Asset and Registry; AWS "standardized resource management" and the cost-optimization area | [P10 Governance, risk, compliance and FinOps](./10-governance-finops.md) |
| Stay fast and available under load and failure, with capacity for scarce accelerators | CNAI "Right-sizing", "Disaster Recovery and Business Continuity"; Conformance `cluster_autoscaling`, `pod_autoscaling` (MUST); AWS "distributed resilience" and "resource efficiency" | [P11 Reliability, performance and capacity](./11-reliability-capacity.md) |
| Run on dependable, reproducible infrastructure | CNAI "Reference Implementation" (calls for an OpenTofu-based starter implementation); Conformance `robust_controller` (MUST); landscape AI Native Infra › Continuous Integration and Delivery | [P12 Foundation and delivery](./12-foundation-infrastructure.md) |
| Be easy and safe to consume, for many teams | CNAI "User Experience"; Azure and AWS guidance on shared platforms and per-workload isolation; Platform Engineering and Backstage practice (CNCF) | [P13 Platform experience and tenancy](./13-platform-experience.md) |

Pillar identifiers match file numbers: `P02` is `docs/02-ai-gateway-routing.md`. There is deliberately **no P01**: file `01` is the [reference architecture](./01-reference-architecture.md) that connects the pillars, and file `00` is this methodology. Files `14` to `17` (roadmap, tool landscape, glossary, references) are supporting documents. The twelve pillars are therefore P02 to P13. P12 kept its original number; the others were renumbered after the review in [section 2.6](#26-review-of-the-original-pillar-list).

### 2.3 Why capability pillars rather than the well-architected pillars

The AWS and Azure frameworks organise guidance by *quality attribute*: how well a workload must behave. This blueprint answers a different question, *what to deploy*, so its pillars are capabilities. The quality attributes were not dropped; they were mapped onto the pillars. The mapping is an editorial choice, not something the frameworks prescribe.

| Quality attribute | Where this blueprint handles it |
|-------------------|---------------------------------|
| Operational excellence | [P07](./07-observability-evaluation.md) (telemetry), [P08](./08-evaluation-quality.md) (quality gates), [P04](./04-model-lifecycle-adaptation.md) (lifecycle) and [P12](./12-foundation-infrastructure.md) (GitOps, delivery) |
| Security | [P09](./09-security-safety.md) (AI-specific threats and platform baseline), with agent identity in [P06](./06-agents-mcp.md) |
| Reliability | [P11](./11-reliability-capacity.md), with routing fallbacks owned by [P02](./02-ai-gateway-routing.md) |
| Performance efficiency | [P02](./02-ai-gateway-routing.md), [P03](./03-model-serving.md) and [P11](./11-reliability-capacity.md) |
| Cost optimization | [P10](./10-governance-finops.md) (FinOps process), with metering in [P02](./02-ai-gateway-routing.md), cost dashboards in [P07](./07-observability-evaluation.md), model right-sizing in [P04](./04-model-lifecycle-adaptation.md) and capacity in [P11](./11-reliability-capacity.md) |
| Sustainability | Cross-cutting; see section 2.4 |

### 2.4 Deliberate non-pillars

The following topics were out of scope or only touched in the first draft. Five of them are now covered; the rest remain deliberate non-pillars.

**Now covered (promoted by the [review in 2.6](#26-review-of-the-original-pillar-list)):**

- **Model fine-tuning and adaptation.** Registry, quantisation, LoRA and preference tuning, distillation and rollout are owned by [P04](./04-model-lifecycle-adaptation.md). Pre-training is still out of scope.
- **Prompt management.** Prompts and context assets are versioned, released and rolled back as part of [P05](./05-data-knowledge-rag.md), regression-tested in [P08](./08-evaluation-quality.md) and registered as governed assets in [P10](./10-governance-finops.md).
- **Multi-tenancy.** The tenancy model (namespace, virtual cluster, dedicated cluster) is owned by [P13](./13-platform-experience.md). Per-tenant keys and quotas stay in [P02](./02-ai-gateway-routing.md), data isolation in [P05](./05-data-knowledge-rag.md), isolation controls in [P09](./09-security-safety.md).
- **FinOps.** First-class in [P10](./10-governance-finops.md) (showback, chargeback, budgets, GPU economics), fed by metering in [P02](./02-ai-gateway-routing.md), cost visibility in [P07](./07-observability-evaluation.md) and capacity in [P11](./11-reliability-capacity.md).
- **Developer experience and portals.** Portal, catalogue, golden paths, SDKs and onboarding are owned by [P13](./13-platform-experience.md).

**Still out of scope:**

- **Pre-training.** The CNAI paper and the landscape treat training as a lifecycle stage. This blueprint adapts and serves existing models; it links out for pre-training. Shared GPU scheduling, which serves both, is covered in [P03](./03-model-serving.md) and [P04](./04-model-lifecycle-adaptation.md).
- **Sustainability.** The CNAI paper and the AWS lens both give it a place of its own. Here it is a cross-cutting efficiency concern: right-sizing and utilisation live in [P11](./11-reliability-capacity.md) and [P10](./10-governance-finops.md), and energy telemetry is an optional add-on (for example Kepler, a CNCF Sandbox project listed under Observability and Analysis › Observability in the landscape) noted in the [tool landscape](./15-tool-landscape.md).
- **End-user front-ends.** Chat interfaces and IDE assistants are consumers of the gateway. They appear in the [reference architecture](./01-reference-architecture.md) as the experience layer, not as a pillar; [P13](./13-platform-experience.md) compares the self-hosted options.
- **Data and feature pipelines.** Ingestion for retrieval is covered in [P05](./05-data-knowledge-rag.md). General ETL, data-quality tooling, feature stores and training-data pipelines are out of scope.
- **Edge and offline.** Edge and on-device inference appear only as a packaging option ([Ollama and llama.cpp in P03](./03-model-serving.md)) and as an air-gapped topology ([reference architecture 4](./01-reference-architecture.md#4-deployment-topologies)). Fleet management of edge devices is out of scope.
- **Multimodal and speech models.** The blueprint is text-first. The gateway, serving and observability pillars apply to other modalities, but tool choices and guardrails were not evaluated for them.

These are scope decisions, not claims that the topics are unimportant. If one is critical for you, treat the nearest pillar as a starting point and add your own evaluation.

### 2.5 One owner per topic

Many topics span pillars. To keep the documents consistent, each topic has one owning pillar that carries the deep treatment; every other pillar gives a short mention and a link.

| Topic | Owner | Others do only this |
|-------|-------|---------------------|
| Fallbacks, retries, routing policies | [P02 AI gateway and routing](./02-ai-gateway-routing.md) | One paragraph and a link |
| Quotas, rate limits, virtual keys | [P02](./02-ai-gateway-routing.md) | Overload handling ([P11](./11-reliability-capacity.md)); budgeting process ([P10](./10-governance-finops.md)); self-service issuing ([P13](./13-platform-experience.md)) |
| Inference-aware routing, KV-cache-aware scheduling | [P03 Model serving](./03-model-serving.md) | Policy-level routing stays in [P02](./02-ai-gateway-routing.md) |
| Model registry, quantisation, fine-tuning, deprecation | [P04 Model lifecycle and adaptation](./04-model-lifecycle-adaptation.md) | Governance metadata ([P10](./10-governance-finops.md)); artifact signing ([P09](./09-security-safety.md)) |
| Caching (exact, semantic, prefix, KV) | [P11 Reliability, performance and capacity](./11-reliability-capacity.md) | Mention the hook and link |
| Telemetry, traces, cost and usage visibility | [P07 Observability](./07-observability-evaluation.md) | Emit attributes only |
| Evals, judges, datasets, regression gates | [P08 Evaluation and quality](./08-evaluation-quality.md) | Call the gate ([P04](./04-model-lifecycle-adaptation.md), [P05](./05-data-knowledge-rag.md), [P06](./06-agents-mcp.md)) |
| Guardrails, prompt-injection defence, PII, supply chain, isolation | [P09 Security and safety](./09-security-safety.md) | A hook paragraph ([P02](./02-ai-gateway-routing.md)); secret plumbing ([P12](./12-foundation-infrastructure.md)) |
| Agent identity and tool authorisation | [P06 Agents, tools and protocols](./06-agents-mcp.md) | Threat model and token plumbing ([P09](./09-security-safety.md)) |
| Budgets, showback and chargeback, GPU economics | [P10 Governance, risk, compliance and FinOps](./10-governance-finops.md) | Metering ([P02](./02-ai-gateway-routing.md)); allocation data ([P07](./07-observability-evaluation.md)) |
| Accelerator capacity and quotas | [P11](./11-reliability-capacity.md) | Scheduling mechanics ([P03](./03-model-serving.md), [P04](./04-model-lifecycle-adaptation.md)) |
| Tenancy model, portal, golden paths | [P13 Platform experience and tenancy](./13-platform-experience.md) | Enforce isolation ([P09](./09-security-safety.md), [P12](./12-foundation-infrastructure.md)) |

The complete ownership map is in the contributor brief for each pillar; the table above shows the pattern. When a tool belongs to several pillars, its licence, star count and caveats are stated identically wherever it appears.

### 2.6 Review of the original pillar list

The first draft had eleven pillars: P02 AI gateway, P03 model router, P04 model serving, P05 data and RAG, P06 agents and MCP, P07 observability and evaluation, P08 security, P09 governance, P10 reliability, P11 hardening and P12 foundation. Before finalising, an expert review tested each pillar against five criteria, then compared the list with three industry reference architectures.

**Criteria**

| Criterion | Question asked of each pillar |
|-----------|-------------------------------|
| MECE ownership | Does it own a set of topics that no other pillar owns, without leaving gaps or duplicates? |
| Independent change cadence and owner | Does it change on its own rhythm (for example weekly prompt changes versus quarterly cluster upgrades) and have a distinct accountable team? |
| Tool ecosystem distinctness | Does it have its own tool shortlist, or do the same tools appear under two pillars? |
| Enterprise adoption need | Do regulated or large organisations need it as a named capability, with its own checklist? |
| Lifecycle coverage | Across the model and application lifecycle (select, adapt, serve, apply, measure, secure, govern, operate, consume), does every stage have an owner? |

**Verdict per original pillar**

| Original pillar | Verdict | Rationale |
|-----------------|---------|-----------|
| P02 AI gateway | Merge (with router) | Gateway and router share owner, cadence and tools: LiteLLM, Envoy-based gateways and Portkey all do both, and the [Azure gateway guide](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/azure-openai-gateway-guide) treats routing, resilience and governance as gateway responsibilities. Split documents duplicated fallbacks and quotas |
| P03 Model router | Merge, and reposition part | Policy routing (aliases, fallbacks, canaries) joins the gateway. Inference-aware routing (endpoint picker, KV-cache-aware scheduling) is serving-side scheduling and moves to serving, where llm-d and the Gateway API Inference Extension live |
| P04 Model serving | Keep, broaden | Distinct owner (platform and ML engineers), distinct ecosystem (vLLM, KServe, llm-d) and a conformance anchor. Gains inference-aware routing |
| P05 Data and RAG | Broaden | Retrieval is one form of context. Agent memory and versioned prompt and context assets have the same lifecycle and owner (context engineering), so the pillar became "Knowledge and context" |
| P06 Agents and MCP | Keep, broaden | Distinct ecosystem and fast cadence. Agent identity (non-human identity, delegated tokens), agent state and memory, human-in-the-loop and AgentOps hooks were missing |
| P07 Observability and evaluation | Split | Telemetry (platform and SRE owners, OpenTelemetry, Prometheus) and evaluation (ML, product and QA owners, datasets, judges, CI gates) differ in owner, cadence and tools. The [AWS lens](https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/generative-ai-lens.html) also separates "consistent model output quality" from "monitor and manage operational health" |
| P08 Security | Merge (with hardening) | Same threat model, same owners; hardening was a deployment-level half of security. The old split forced readers to cross-reference for one risk |
| P09 Governance | Broaden | FinOps was scattered across three pillars. Showback, chargeback, budgets and GPU economics became first-class beside risk and compliance |
| P10 Reliability | Broaden | Accelerator capacity planning, quotas and cost-performance are distinct accelerator-era concerns, not a footnote to SLOs |
| P11 Hardening | Merge (into security) | See P08 |
| P12 Foundation | Keep | Distinct owner and cadence; the only pillar whose number did not change |

**Gaps found**

| Gap | Evidence | Resolution |
|-----|----------|------------|
| Model lifecycle and adaptation (registry, quantisation, fine-tuning, rollout, deprecation) | CNAI lifecycle stages; landscape Training and Model Asset and Registry; AWS lens "when to execute model customization" and "version artifacts" | New [P04](./04-model-lifecycle-adaptation.md) |
| Evaluation as a discipline | AWS lens operational-excellence area; landscape AI Agent › Evaluation | New [P08](./08-evaluation-quality.md), split from observability |
| FinOps | CNAI "Cost Control"; AWS cost-optimization area (select cost-optimised models, balance cost and performance) | First-class in [P10](./10-governance-finops.md) |
| Capacity | Conformance accelerator and autoscaling items; GPU scarcity | Explicit in [P11](./11-reliability-capacity.md) |
| Developer experience and tenancy | CNAI "User Experience"; platform-engineering practice | New [P13](./13-platform-experience.md) |
| Agent identity | AWS "excessive agency" and "controlled autonomy"; OWASP agentic Top 10 | In [P06](./06-agents-mcp.md), with plumbing in [P09](./09-security-safety.md) |
| Memory and context | Agents and RAG both need state; prompts are versioned assets | In [P05](./05-data-knowledge-rag.md) and [P06](./06-agents-mcp.md) |

**Old to new mapping**

| Old pillar | New pillar |
|------------|------------|
| P02 AI gateway | [P02 AI gateway and routing](./02-ai-gateway-routing.md) |
| P03 Model router | [P02](./02-ai-gateway-routing.md) (policy routing); [P03](./03-model-serving.md) (inference-aware routing) |
| P04 Model serving | [P03 Model serving](./03-model-serving.md) |
| (none) | [P04 Model lifecycle and adaptation](./04-model-lifecycle-adaptation.md) |
| P05 Data and RAG | [P05 Knowledge and context](./05-data-knowledge-rag.md) |
| P06 Agents and MCP | [P06 Agents, tools and protocols](./06-agents-mcp.md) |
| P07 Observability and evaluation | [P07 Observability](./07-observability-evaluation.md) and [P08 Evaluation and quality](./08-evaluation-quality.md) |
| P08 Security | [P09 Security and safety](./09-security-safety.md) |
| P09 Governance | [P10 Governance, risk, compliance and FinOps](./10-governance-finops.md) |
| P10 Reliability | [P11 Reliability, performance and capacity](./11-reliability-capacity.md) |
| P11 Hardening | [P09](./09-security-safety.md) (Layer B) |
| P12 Foundation | [P12 Foundation and delivery](./12-foundation-infrastructure.md) |
| (none) | [P13 Platform experience and tenancy](./13-platform-experience.md) |

**Industry reference architectures consulted**

| Reference | Evidence | What it confirmed |
|-----------|----------|-------------------|
| [AWS Well-Architected Generative AI Lens](https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/generative-ai-lens.html) (2025-11-19) | Opened | A lifecycle from scoping and model selection through deployment and continuous improvement; model customisation, output-quality management and cost-optimised model selection as named concerns; shared responsibility across model producers, providers and consumers |
| [Azure gateway guide for Foundry Models](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/azure-openai-gateway-guide) (updated 2026-09) and [Azure AI Landing Zones](https://github.com/Azure/AI-Landing-Zones) | Opened (guide); repository opened, not read in depth | One gateway for routing, resilience, governance and cost; a landing-zone approach that puts platform foundations, governance and per-workload isolation ahead of applications |
| [llm-d](https://github.com/llm-d/llm-d) (CNCF Sandbox; founded by Red Hat, Google Cloud, IBM Research, CoreWeave and NVIDIA; Apache-2.0 badge) | Opened | Inference orchestration above engines such as vLLM and SGLang (prefix-cache and load-aware routing, tiered KV-cache management, prefill/decode disaggregation) is a serving-side concern, which supports moving inference-aware routing into P03 |

Vendor reference architectures from Red Hat OpenShift AI and NVIDIA were also surfaced by search, but their pages were not opened, so they are not cited as evidence here (Unverified). The comparison is editorial: no source prescribes twelve pillars, and a different team could reasonably draw the boundaries elsewhere.

## 3. How tools were selected

### 3.1 Six signals

Candidates were ranked on six signals. Each pillar document says which signals drove its recommendation.

| Signal | What was checked | Where |
|--------|------------------|-------|
| **Licence** | The actual `LICENSE` file (not only GitHub's detector), the SPDX identifier, any `enterprise/` or `ee/` directory, past relicensing | Repository, package metadata |
| **Adoption** | Stars at the snapshot date, foundation membership and CNCF maturity level, named production users, package downloads where easy to get | GitHub, CNCF landscape |
| **Maintenance health** | Latest release tag and date, last push, archived flag, steward and bus factor | GitHub releases |
| **Interoperability** | OpenAI-compatible API, OpenTelemetry, Kubernetes Gateway API, MCP and A2A, open formats | Project documentation |
| **Security posture** | `SECURITY.md`, advisories and CVE history, signed releases and SBOMs, past incidents | Repository, advisories, search |
| **Operability** | Helm chart or operator, high-availability story, upgrade path, Kubernetes-native behaviour | Project documentation |

Stars are a popularity proxy, not a quality measure. They favour well-marketed, recent and Python/JavaScript projects, and they can be inflated. They are rounded to 0.1k and always read alongside the other signals.

### 3.2 Licence policy and legend

GitHub reports `NOASSERTION` or "Other" for custom licences, so the `LICENSE` file was opened for every recommended tool.

| Label | Meaning |
|-------|---------|
| `OSI` ✅ | OSI-approved licence; the SPDX identifier is given (Apache-2.0, MIT, BSD-3-Clause, MPL-2.0, AGPL-3.0, GPL-3.0 and so on). Copyleft implications of AGPL or GPL are noted |
| `Open-core` ⚠️ | An OSI-licensed core plus proprietary or enterprise directories or features; the documents state what is gated |
| `Source-available` ⚠️ | Not OSI-approved: BSL, SSPL, Elastic-2.0, FSL, custom licences or field-of-use restrictions |
| `Open weights` | Models only: weights can be downloaded but the licence is not OSI-approved. Open weights are not open source |
| `Not OSS` | Proprietary or SaaS; reference only, never recommended as a platform component |

Policy: the default pick for a capability is OSI-licensed whenever a credible OSI option exists. Open-core tools are recommended only where the open part covers the use case, and the gated features are listed. Source-available tools appear to help readers orient, with the licence called out.

### 3.3 Defaults and alternatives

Every capability gets one default pick, one to three alternatives, and "choose X when…" guidance. The shortlists are deliberately small, typically three to seven tools per capability, rather than exhaustive. Commercial offerings are mentioned only when they help readers orient.

## 4. Evidence and verification

### 4.1 Evidence grades

Time-sensitive claims (licences, star counts, releases, maintainers, acquisitions, incidents, foundation status) were verified at the snapshot date rather than recalled.

| Grade | Meaning | How it appears |
|-------|---------|----------------|
| **Opened** | The upstream artefact was read: a repository file (`LICENSE`, README, docs), GitHub repository and release data, a PyPI release index, or the CNCF landscape file | Stated plainly, with a link |
| **Search-cited** | The claim comes from search-engine summaries whose cited pages could not be opened. Accepted only when at least two independent results agree | Worded as "reported", and marked in [References](./17-references.md) |
| **Unverified** | One source only, or sources conflict | Flagged in the text, or omitted |

### 4.2 What could not be reached

During the research window many vendor, foundation and standards websites could not be opened, including the Kubernetes, OpenTelemetry, OWASP and NIST documentation sites. The AWS Generative AI Lens and the Azure gateway guide were opened in the later review pass. Where a project keeps its documentation in a GitHub repository, that copy was read directly. Otherwise the claim was graded *search-cited*. Regulatory dates and standards details are therefore mostly secondary evidence. Check the official texts before making any compliance decision.

### 4.3 Why live verification matters: two examples

- **Renames hide in plain sight.** The repository `envoyproxy/ai-gateway` now redirects to `theagentrouter/agent-router`, whose README says "Formerly Envoy AI Gateway". The licence (Apache-2.0) and code are continuous, and the machine-visible names (the `aigateway.envoyproxy.io` API group, the `AIGatewayRoute` resource, the `aigw` CLI and the container images) are unchanged. The CNCF landscape still lists the old name. This blueprint writes "Agent Router (formerly Envoy AI Gateway)".
- **A licence badge can mislead.** GitHub shows no SPDX identifier for `BerriAI/litellm`. The root `LICENSE` grants MIT for everything outside `enterprise/`, while `enterprise/LICENSE.md` requires a commercial subscription for production use of that directory. The PyPI metadata says only `MIT`. LiteLLM is therefore labelled `Open-core`, and the gated parts are named in [P02](./02-ai-gateway-routing.md).

## 5. Snapshot and refresh

All facts are as of **2026-10-11**. Stars are given in thousands, rounded to 0.1k; release dates use ISO 8601. Fast-moving facts decay at different rates:

| Fact | Suggested refresh |
|------|-------------------|
| Star counts, latest versions | Quarterly |
| Licences, ownership, project status (acquisitions, archival, renames) | Whenever a project is adopted or upgraded, and on any announcement |
| Foundation and maturity levels | Twice a year, against the CNCF landscape |
| Regulatory dates and standards versions | On each legislative or standards update |

To re-verify a tool, use the same sources the research used:

```bash
# Stars, SPDX licence, last push and archived flag (requires the GitHub CLI)
gh api repos/BerriAI/litellm \
  --jq '{stars: .stargazers_count, spdx: .license.spdx_id, pushed: .pushed_at, archived: .archived}'

# Latest published release
gh api repos/BerriAI/litellm/releases/latest --jq '{tag: .tag_name, date: .published_at}'

# Python packages: latest version and declared licence expression
curl -s https://pypi.org/pypi/litellm/json | jq '{version: .info.version, license: .info.license_expression}'
```

To check a CNCF maturity level, download the landscape file and search for the project:

```bash
curl -sO https://raw.githubusercontent.com/cncf/landscape/master/landscape.yml
grep -n -B3 -A12 "name: KServe" landscape.yml
```

Then open the `LICENSE` file itself, because the badge can differ from the file (section 4.3).

## 6. Limitations

- **Popularity is not quality.** Stars and downloads guide the shortlist; they do not replace your own evaluation.
- **Single-day snapshot.** Projects change licences, owners and names. Anything adopted should be re-verified with the commands above.
- **Mostly secondary evidence outside GitHub.** See [section 4.2](#42-what-could-not-be-reached).
- **No original benchmarks.** Performance numbers appear only with a cited source and its conditions. Measure your own workload ([P11](./11-reliability-capacity.md) describes how).
- **Fast-decaying project status.** A spot-check of the recommended repositories on the snapshot date found archived or unmaintained projects (LLM Guard, MinIO, Hugging Face TGI, `Azure/PyRIT`) and several moved repositories. They are listed in the [tool landscape](./15-tool-landscape.md#spot-check-findings-2026-10-11); a pillar document that still recommends one of them should be read with that note.
- **Opinionated shortlists.** A tool that is absent is not necessarily worse.
- **AI-assisted authoring.** This repository was drafted with AI assistance (parallel research agents) and then reviewed and fact-checked in separate passes. Treat it as a researched starting point, not audited guidance, and open an issue when something is wrong.
- **Not legal advice.** Licence and regulation summaries are orientation only.

## 7. Sources

Opened:

- [Cloud Native AI whitepaper (source)](https://github.com/cncf/tag-runtime/blob/main/wgs/cnai/whitepapers/cloudnativeai.md) — lifecycle stages and cross-cutting concerns
- [Kubernetes AI Conformance programme](https://github.com/cncf/k8s-ai-conformance) and [requirements project](https://github.com/kubernetes-sigs/ai-conformance) — programme structure
- [AI Conformance checklist v1.37](https://github.com/cncf/k8s-ai-conformance/blob/main/docs/AIConformance-1.37.yaml) — the 15 requirements and their MUST/SHOULD levels
- [CNCF landscape source](https://github.com/cncf/landscape/blob/master/landscape.yml) — AI categories and maturity levels
- [Agent Router repository](https://github.com/theagentrouter/agent-router) — rename and licence
- [LiteLLM `LICENSE`](https://github.com/BerriAI/litellm/blob/main/LICENSE) and [`enterprise/LICENSE.md`](https://github.com/BerriAI/litellm/blob/main/enterprise/LICENSE.md) — open-core boundary
- [LiteLLM on PyPI (JSON index)](https://pypi.org/pypi/litellm/json) — package licence metadata
- [Kepler repository](https://github.com/sustainable-computing-io/kepler) — energy telemetry project referenced in section 2.4
- [AWS Well-Architected Generative AI Lens](https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/generative-ai-lens.html) — lifecycle, quality attributes, design principles (opened 2026-10-11)
- [Azure gateway guide for Foundry Models](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/azure-openai-gateway-guide) — gateway pattern (opened 2026-10-11)
- [llm-d repository](https://github.com/llm-d/llm-d) — inference orchestration reference (opened 2026-10-11)
- GitHub API metadata (licence, archived flag, redirects) for the repositories in the [tool landscape](./15-tool-landscape.md), read on 2026-10-11

Search-cited (could not be opened, accessed 2026-10-11):

- [Design principles — AWS Well-Architected Generative AI Lens](https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/design-principles.html)
- [Design principles for AI workloads on Azure](https://learn.microsoft.com/en-us/azure/well-architected/ai/design-principles)
- [Azure AI Landing Zones](https://github.com/Azure/AI-Landing-Zones) — Azure's reference implementation repository (opened, not read in depth)
