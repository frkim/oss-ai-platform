# Reference architecture

> **TL;DR** — The platform is a stack of five layers: an experience layer (the portal, tenancy model and consumers), a control layer (gateway and routing, identity, policy and FinOps), an intelligence layer (model serving, model lifecycle, knowledge and context, agents), an assurance layer (observability, evaluation, security, reliability) and a foundation (Kubernetes, networking, storage, GitOps). All model traffic — interactive, agentic or batch — enters through one AI gateway; every other pillar attaches to it or to the foundation.

*Snapshot: 2026-10-11 · Related: [Methodology](./00-methodology.md) · [Implementation roadmap](./14-implementation-roadmap.md) · [Tool landscape](./15-tool-landscape.md)*

This document is vendor-neutral. It names tool *categories*; the pillar documents choose the tools and carry the evidence for each choice. The twelve pillars (P02 to P13) and how they were derived are in the [methodology](./00-methodology.md#26-review-of-the-original-pillar-list). The same layers must serve synchronous chat, retrieval, agent/tool use, batch and model-release flows; multimodal and sovereignty-sensitive deployments reuse the same control points with different model pools, storage placement and policy.

## 1. Layers

| Layer | Contents | Owning pillars |
|-------|----------|----------------|
| Experience | Developer portal and catalogue, golden paths, SDKs, tenancy model, usage dashboards. The consumers themselves (chat front-ends, IDE assistants, applications, batch jobs, agents acting for users) are not pillars (see [methodology 2.4](./00-methodology.md#24-deliberate-non-pillars)) | [P13](./13-platform-experience.md) |
| Control | AI gateway and policy routing, identity and virtual keys, residency and egress policy, policy as code, budgets and FinOps, risk and audit | [P02](./02-ai-gateway-routing.md), [P10](./10-governance-finops.md) |
| Intelligence | Inference engines and inference-aware scheduling, batch workers and queues, model registry and adaptation, vector stores, memory and prompt assets, agent runtimes and tool servers | [P03](./03-model-serving.md), [P04](./04-model-lifecycle-adaptation.md), [P05](./05-data-knowledge-rag.md), [P06](./06-agents-mcp.md) |
| Assurance | Telemetry, evals and quality gates, guardrails and threat defence, hardening, reliability and capacity | [P07](./07-observability-evaluation.md), [P08](./08-evaluation-quality.md), [P09](./09-security-safety.md), [P11](./11-reliability-capacity.md) |
| Foundation | Kubernetes, networking, storage, GitOps, infrastructure as code, certificates | [P12](./12-foundation-infrastructure.md) |

```mermaid
flowchart TB
  subgraph X[Experience layer]
    PX[Portal, golden paths, tenancy P13]
    A[Apps and chat UIs] --- B[IDE assistants] --- C[Agents and batch jobs]
  end
  subgraph CP[Control layer]
    GW[AI gateway and routing P02]
    GV[Governance, risk and FinOps P10]
  end
  subgraph IL[Intelligence layer]
    SV[Model serving P03]
    LC[Model lifecycle and adaptation P04]
    RG[Knowledge and context P05]
    AG[Agents, tools and protocols P06]
  end
  subgraph AS[Assurance layer]
    OB[Observability P07]
    EV[Evaluation and quality P08]
    SE[Security and safety P09]
    RL[Reliability and capacity P11]
  end
  subgraph FD[Foundation]
    K8[Kubernetes, network, storage, GitOps P12]
  end
  PX -.provisions.-> GW
  X --> GW
  GW --> SV
  GW --> EXT[External model APIs]
  GW --> RG
  GW --> AG
  AG --> TOOLS[MCP tool servers]
  LC --> SV
  GV -.policy, budgets.-> GW
  GV -.registry, audit.-> LC
  AS -.attach to.-> CP
  AS -.attach to.-> IL
  EV -.gates.-> LC
  IL --> FD
  CP --> FD
```

## 2. Request flows

### 2.1 Chat completion

1. The client sends an OpenAI-compatible request with a virtual key to the gateway.
2. The gateway authenticates the key, applies quota and rate limits ([P02](./02-ai-gateway-routing.md)) and runs input guardrail hooks ([P09](./09-security-safety.md)).
3. The gateway picks a model or endpoint by policy, with fallbacks and canary weights ([P02](./02-ai-gateway-routing.md)).
4. For self-hosted models an inference-aware endpoint picker chooses the replica, for example by prefix-cache affinity and load, and the engine runs inference ([P03](./03-model-serving.md)); otherwise the gateway forwards the request to an external provider.
5. Output guardrails run, usage is metered and tagged with tenant and application, and the response streams back.
6. A trace with GenAI attributes is emitted for every step ([P07](./07-observability-evaluation.md)); sampled traffic can be scored online ([P08](./08-evaluation-quality.md)).

The same path also fits multimodal calls once the client normalises them into the gateway contract: modality-specific preprocessing and rendering sit at the application edge, while policy, metering, routing and telemetry still attach here.

### 2.2 Retrieval-augmented request

The application (or a gateway hook) embeds the query, queries the vector store, assembles the context within a budget and then follows flow 2.1. Retrieval results are untrusted input for prompt-injection purposes ([P09](./09-security-safety.md)). Ingestion runs offline and is described in [P05](./05-data-knowledge-rag.md), together with memory stores and versioned prompt assets. Where residency matters, the retriever must stay within the approved data boundary and routing rules must stop cross-region retrieval by default.

### 2.3 Agent with tools

The agent runtime calls models through the gateway like any other client. Tool calls go to MCP servers, ideally through a tool gateway that applies authorisation and audit; code execution runs in a sandbox ([P06](./06-agents-mcp.md), [P09](./09-security-safety.md)). The agent has its own non-human identity; delegation on behalf of a user is explicit and short-lived, and side effects pass approval gates ([P06](./06-agents-mcp.md)).

### 2.4 Batch and asynchronous inference

The caller submits work through the same gateway contract, but the request is persisted to a queue or job record instead of holding the client connection open. A worker pulls the job, resolves the same model alias and guardrail chain, performs inference, writes the output to object storage or a results table, and emits traces that preserve the original request identity across the asynchronous hop. Admission control keeps batch from starving live traffic ([P11](./11-reliability-capacity.md)); batch primitives such as `Job`, CronJob or Kueue-backed queues come from the foundation ([P12](./12-foundation-infrastructure.md)).

### 2.5 Fine-tune and rollout (control path)

Not a request flow, but the path that keeps the others safe. A candidate model is catalogued, selected and, where useful, quantised or adapted ([P04](./04-model-lifecycle-adaptation.md)). Fine-tuning or distillation jobs run through queued GPU capacity rather than ad hoc shells. The result is registered with owner, licence and risk metadata ([P10](./10-governance-finops.md)); its artifact is scanned, signed and pulled from an approved store ([P09](./09-security-safety.md)). It is declared in Git and applied by GitOps ([P12](./12-foundation-infrastructure.md)). An evaluation run gates the change ([P08](./08-evaluation-quality.md)). Traffic then shifts by canary weight ([P02](./02-ai-gateway-routing.md)) with a rollback path, while serving capacity follows the SLO ([P03](./03-model-serving.md), [P11](./11-reliability-capacity.md)). Old versions are deprecated on a published schedule ([P04](./04-model-lifecycle-adaptation.md)).

### 2.6 Onboarding a team (consumption path)

A team requests access from the portal ([P13](./13-platform-experience.md)). A golden-path template creates the namespace or virtual cluster, the identity, a virtual key with quota and budget at the gateway ([P02](./02-ai-gateway-routing.md)), a cost tag and a usage dashboard ([P07](./07-observability-evaluation.md), [P10](./10-governance-finops.md)). The team's first call and its first eval set are the exit tests for onboarding.

### 2.7 Pillar coverage

| Pillar | Appears in |
|--------|------------|
| P02 AI gateway and routing | 2.1, 2.2, 2.3 (every model call), 2.4 (same contract for batch), 2.5 (canary), 2.6 (keys) |
| P03 Model serving | 2.1 (endpoint picker, inference), 2.4 (batch workers), 2.5 |
| P04 Model lifecycle and adaptation | 2.5 |
| P05 Knowledge and context | 2.2 |
| P06 Agents, tools and protocols | 2.3 |
| P07 Observability | all flows (telemetry), 2.6 (usage dashboards) |
| P08 Evaluation and quality | 2.1 (online scoring), 2.5 (evaluation gate) |
| P09 Security and safety | 2.1 (guardrails), 2.2 (untrusted retrieval), 2.3 (sandbox), 2.5 (supply chain), section 4 (air-gapped) |
| P10 Governance, risk, compliance and FinOps | 2.5 (registry, policy), 2.6 (budgets), section 3 |
| P11 Reliability, performance and capacity | section 3 (caching), 2.4 (batch headroom), 2.5 (SLO, capacity) |
| P12 Foundation and delivery | 2.4 (queue and batch primitives), 2.5 (GitOps), section 3 (secrets) |
| P13 Platform experience and tenancy | 2.6, section 3 (tenancy) |

## 3. Cross-cutting attachment points

| Concern | Where it attaches |
|---------|-------------------|
| Identity and authorisation | Gateway (who calls), tool gateway (what an agent may do), workload identity between services ([P06](./06-agents-mcp.md), [P09](./09-security-safety.md)) |
| Telemetry | Every hop emits OpenTelemetry traces and metrics; the gateway adds token and cost attributes ([P07](./07-observability-evaluation.md)) |
| Policy as code | Admission control in the cluster, spend and routing policy at the gateway ([P10](./10-governance-finops.md)) |
| Caching | Gateway (exact, semantic) and engine (prefix, KV); owned by [P11](./11-reliability-capacity.md) |
| Secrets | Provider keys live only in the gateway's secret store; clients never hold them ([P12](./12-foundation-infrastructure.md)) |
| Cost and tenancy | The gateway tags every call with tenant and application; cost allocation joins those tags to cluster cost ([P07](./07-observability-evaluation.md)); budgets, showback and chargeback are a process owned by [P10](./10-governance-finops.md); the tenancy model is owned by [P13](./13-platform-experience.md) |
| Quality | Evals gate model, prompt, retrieval, routing and tool changes before release and score sampled traffic after ([P08](./08-evaluation-quality.md)) |
| Capacity | Accelerator quotas, queues and headroom are planned in [P11](./11-reliability-capacity.md) and scheduled by [P03](./03-model-serving.md) and [P04](./04-model-lifecycle-adaptation.md) |
| Residency and sovereignty | Data classes and control mappings are owned by [P10](./10-governance-finops.md); the gateway enforces region or provider policy ([P02](./02-ai-gateway-routing.md)); knowledge stores and tenancy decide placement ([P05](./05-data-knowledge-rag.md), [P13](./13-platform-experience.md)) |
| Async work | Job identity, queue metadata and result storage must preserve traceability across asynchronous hops; the same guardrails and routing policy apply as for synchronous calls ([P03](./03-model-serving.md), [P07](./07-observability-evaluation.md), [P11](./11-reliability-capacity.md)) |

## 4. Deployment topologies

| Topology | Shape | Fits when |
|----------|-------|-----------|
| Gateway-only | One gateway fronting commercial model APIs; no GPUs | First step; governance and cost visibility before any hardware |
| Single node | One host or laptop package with gateway, local inference, vector store and UI, usually via Compose | Local development, workshops and architecture demos; not for shared production |
| Single cluster | Gateway and self-hosted inference in one Kubernetes cluster, tenants as namespaces | Most teams after the MVP |
| Multi-cluster / multi-region | Per-region serving with a global gateway tier and failover; tenants as virtual or dedicated clusters where isolation demands it | Latency, residency, availability or isolation targets require it |
| Hybrid | Self-hosted models for sensitive data, external APIs for the rest, one gateway | Mixed data-sensitivity classes |
| Sovereign / regulated | Region-pinned or country-pinned control plane, storage and model endpoints; external providers allowed only where policy says so | Public-sector, defence, healthcare or cross-border constraints require demonstrable data and operator boundaries |
| Air-gapped | No internet; mirrored images, model artifacts and registries; adaptation runs inside the boundary | Regulated or classified environments ([P09](./09-security-safety.md), [P04](./04-model-lifecycle-adaptation.md)) |

Multimodal systems are not a separate topology. They add modality-specific preprocessors, vectorisation or media storage, and safety checks, but they still fit one of the shapes above.

## 5. Design principles

- **One entry point.** All model traffic passes the gateway, so metering, policy and audit have no bypass.
- **Open interfaces.** OpenAI-compatible API, OpenTelemetry, Kubernetes Gateway API, MCP and A2A keep components replaceable.
- **One owner per topic.** See [methodology 2.5](./00-methodology.md#25-one-owner-per-topic).
- **Evals gate change.** No model, prompt or route reaches production traffic without a passing evaluation.
- **Fail safe.** Every external dependency has a timeout, a fallback and a budget.
- **Async paths are first-class.** Batch, backfill and fine-tuning work use the same identity, policy, telemetry and budget controls as chat traffic.
- **Data stays where policy says.** Residency and sovereignty are enforced by routing, storage placement and tenancy, not by documentation alone.
- **Provider keys never leave the platform.** Clients get virtual keys only.
- **The platform is a product.** Self-service, a stable contract and measured adoption matter as much as the components ([P13](./13-platform-experience.md)).

## 6. Sources

See the [methodology](./00-methodology.md#7-sources) for the primary sources and industry reference architectures, and the pillar documents for tool-level evidence. The diagram and flows are this blueprint's own synthesis, not taken from a single upstream document.
