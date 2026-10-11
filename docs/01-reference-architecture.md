# Reference architecture

> **TL;DR** — The platform is a stack of five layers: an experience layer of consumers, a control plane (gateway, router, policy and identity), a data plane (model serving, retrieval and agent runtimes), a cross-cutting layer (observability, security, governance) and a foundation (Kubernetes, networking, storage, GitOps). All model traffic enters through one AI gateway; every other pillar attaches to it or to the foundation.

*Snapshot: 2026-10-11 · Related: [Methodology](./00-methodology.md) · [Implementation roadmap](./14-implementation-roadmap.md) · [Tool landscape](./15-tool-landscape.md)*

This document is vendor-neutral. It names tool *categories*; the pillar documents choose the tools and carry the evidence for each choice.

## 1. Layers

| Layer | Contents | Owning pillars |
|-------|----------|----------------|
| Experience | Chat front-ends, IDE assistants, applications, batch jobs, agents acting for users. These are consumers, not pillars (see [methodology 2.4](./00-methodology.md#24-deliberate-non-pillars)) | None |
| Control plane | AI gateway, model router, identity and policy decisions | [P02](./02-ai-gateway-routing.md), [P02](./02-ai-gateway-routing.md) |
| Data plane | Inference engines, vector stores, ingestion, agent runtimes, tool servers | [P03](./03-model-serving.md), [P05](./05-data-knowledge-rag.md), [P06](./06-agents-mcp.md) |
| Cross-cutting | Telemetry and evaluation, guardrails and threat defence, governance and cost accountability, resilience | [P07](./07-observability-evaluation.md), [P09](./09-security-safety.md), [P10](./10-governance-finops.md), [P11](./11-reliability-capacity.md) |
| Foundation | Kubernetes, networking, storage, GitOps, infrastructure as code, hardening baseline | [P09](./09-security-safety.md), [P12](./12-foundation-infrastructure.md) |

```mermaid
flowchart TB
  subgraph X[Experience layer]
    A[Apps and chat UIs] --- B[IDE assistants] --- C[Agents and batch jobs]
  end
  subgraph CP[Control plane]
    GW[AI gateway P02] --> RT[Model router P02]
  end
  subgraph DP[Data plane]
    SV[Model serving P03]
    RG[Retrieval and RAG P05]
    AG[Agent runtimes and tool servers P06]
  end
  subgraph CC[Cross-cutting]
    OB[Observability and evaluation P07]
    SE[Security and guardrails P09]
    GV[Governance P10]
    RL[Reliability P11]
  end
  subgraph FD[Foundation]
    HD[Hardening P09] --- K8[Kubernetes, network, storage, GitOps P12]
  end
  X --> GW
  RT --> SV
  RT --> EXT[External model APIs]
  GW --> RG
  GW --> AG
  AG --> TOOLS[MCP tool servers]
  CC -.attach to.-> CP
  CC -.attach to.-> DP
  DP --> FD
  CP --> FD
```

## 2. Request flows

### 2.1 Chat completion

1. The client sends an OpenAI-compatible request with a virtual key to the gateway.
2. The gateway authenticates the key, applies quota and rate limits ([P02](./02-ai-gateway-routing.md)) and runs input guardrail hooks ([P09](./09-security-safety.md)).
3. The router picks a model or endpoint by policy, with fallbacks and canary weights ([P02](./02-ai-gateway-routing.md)).
4. The serving layer runs inference ([P03](./03-model-serving.md)), or the gateway forwards the request to an external provider.
5. Output guardrails run, usage is metered, and the response streams back.
6. A trace with GenAI attributes is emitted for every step ([P07](./07-observability-evaluation.md)).

### 2.2 Retrieval-augmented request

The application (or a gateway hook) embeds the query, queries the vector store, assembles the context and then follows flow 2.1. Retrieval results are untrusted input for prompt-injection purposes ([P09](./09-security-safety.md)). Ingestion runs offline and is described in [P05](./05-data-knowledge-rag.md).

### 2.3 Agent with tools

The agent runtime calls models through the gateway like any other client. Tool calls go to MCP servers, ideally through a tool gateway that applies authorisation and audit; code execution runs in a sandbox ([P06](./06-agents-mcp.md), [P09](./09-security-safety.md)). The agent's identity, not the user's, is what the tool sees unless delegation is explicit ([P09](./09-security-safety.md)).

### 2.4 Model change and release (control path)

Not a request flow, but the path that keeps the others safe. A new model, prompt or route is registered with owner and risk metadata ([P10](./10-governance-finops.md)). Its artifact is scanned, signed and pulled from an approved store ([P09](./09-security-safety.md)). It is declared in Git and applied by GitOps ([P12](./12-foundation-infrastructure.md)). An evaluation run gates the change ([P07](./07-observability-evaluation.md)). Traffic then shifts by canary weight ([P02](./02-ai-gateway-routing.md)) with a rollback path, while serving capacity follows the SLO ([P03](./03-model-serving.md), [P11](./11-reliability-capacity.md)).

### 2.5 Pillar coverage

| Pillar | Appears in |
|--------|------------|
| P02 AI gateway | 2.1, 2.2, 2.3 (every model call) |
| P02 Model router | 2.1, 2.4 |
| P03 Model serving | 2.1, 2.4 |
| P05 Data and RAG | 2.2 |
| P06 Agents and MCP | 2.3 |
| P07 Observability and evaluation | all flows (telemetry), 2.4 (evaluation gate) |
| P09 Security | 2.1 (guardrails), 2.2 (untrusted retrieval), 2.3 (identity) |
| P10 Governance, risk and compliance | 2.4 (registry, policy), section 3 |
| P11 Reliability and performance | section 3 (caching), 2.4 (SLO) |
| P09 Hardening | 2.3 (sandbox), 2.4 (supply chain), section 4 (air-gapped) |
| P12 Foundation and delivery | 2.4 (GitOps), section 3 (secrets) |

## 3. Cross-cutting attachment points

| Concern | Where it attaches |
|---------|-------------------|
| Identity and authorisation | Gateway (who calls), tool gateway (what an agent may do), workload identity between services |
| Telemetry | Every hop emits OpenTelemetry traces and metrics; the gateway adds token and cost attributes |
| Policy as code | Admission control in the cluster, spend and routing policy at the gateway ([P10](./10-governance-finops.md)) |
| Caching | Gateway (exact, semantic) and engine (prefix, KV); owned by [P11](./11-reliability-capacity.md) |
| Secrets | Provider keys live only in the gateway's secret store; clients never hold them ([P12](./12-foundation-infrastructure.md)) |
| Cost and tenancy | The gateway tags every call with tenant and application; cost allocation joins those tags to cluster cost ([P07](./07-observability-evaluation.md)); budgets and chargeback are a process owned by [P10](./10-governance-finops.md) |

## 4. Deployment topologies

| Topology | Shape | Fits when |
|----------|-------|-----------|
| Gateway-only | One gateway fronting commercial model APIs; no GPUs | First step; governance and cost visibility before any hardware |
| Single cluster | Gateway, router and self-hosted inference in one Kubernetes cluster | Most teams after the MVP |
| Multi-cluster / multi-region | Per-region serving with a global gateway tier and failover | Latency, residency or availability targets require it |
| Hybrid | Self-hosted models for sensitive data, external APIs for the rest, one gateway | Mixed data-sensitivity classes |
| Air-gapped | No internet; mirrored images and model artifacts | Regulated or classified environments ([P09](./09-security-safety.md)) |

## 5. Design principles

- **One entry point.** All model traffic passes the gateway, so metering, policy and audit have no bypass.
- **Open interfaces.** OpenAI-compatible API, OpenTelemetry, Kubernetes Gateway API, MCP and A2A keep components replaceable.
- **One owner per topic.** See [methodology 2.5](./00-methodology.md#25-one-owner-per-topic).
- **Fail safe.** Every external dependency has a timeout, a fallback and a budget.
- **Provider keys never leave the platform.** Clients get virtual keys only.

## 6. Sources

See the [methodology](./00-methodology.md#7-sources) for the primary sources, and the pillar documents for tool-level evidence. The diagram and flows are this blueprint's own synthesis, not taken from a single upstream document.
