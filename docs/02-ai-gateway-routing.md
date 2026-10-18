# P02. AI gateway and routing

> **TL;DR** - Put one governed, OpenAI-compatible front door in front of every model call. That front door authenticates callers, issues virtual keys, enforces quotas and budgets, decides which backend serves each request, and handles retries, fallbacks and canaries. Default to LiteLLM for the first rollout because virtual keys, budgets and aliases are needed earlier than advanced traffic policy; move to an Envoy-based, Gateway API-native gateway when declarative traffic policy becomes the main concern. Inference-aware endpoint selection inside the cluster belongs to [P03](./03-model-serving.md#5-inference-aware-routing-and-scheduling).

*Snapshot: 2026-10-11 · Related: [Reference architecture](./01-reference-architecture.md) · [Model serving and inference](./03-model-serving.md) · [Security and safety](./09-security-safety.md) · [Reliability and capacity](./11-reliability-capacity.md) · [Tool landscape](./15-tool-landscape.md)*

## 1. Why it matters

Without a gateway, every application picks its own SDK, stores raw provider keys, implements its own retries and reports cost in a different shape. With more than one backend you also need a decision layer: "send everything to the cheapest healthy model in this class" or "prefer the warm self-hosted endpoint, but fall back to a provider API if the tenant may burst".

Gateway and router are one pillar because in practice the same component does both (LiteLLM, Envoy-based gateways and Portkey all combine identity, quota and routing), and splitting policy across two products makes it unclear which one is authoritative.

This pillar gives you one place to:

- expose a stable, OpenAI-compatible API to internal clients;
- hide upstream credentials behind tenant-scoped virtual keys;
- enforce quotas, rate limits and budget ceilings;
- resolve logical model names to concrete backends with policy, canaries, retries and fallbacks;
- optionally route on request content (semantic or complexity routing); and
- record usage and route decisions in a consistent schema, with hooks for identity, observability and security.

**One owner per topic.** This pillar owns **virtual keys, quotas, rate limits, route policy, retries, fallbacks and canaries**. It only points to sibling pillars for:

- **endpoint selection by queue depth, KV-cache locality or prefill/decode role inside the cluster** -> [P03 Inference-aware routing and scheduling](./03-model-serving.md#5-inference-aware-routing-and-scheduling);
- **guardrails and prompt-injection controls** -> [P09 Security and safety](./09-security-safety.md);
- **caching, hedging and tail-latency tactics** -> [P11 Reliability and capacity](./11-reliability-capacity.md);
- **dashboards and cost reporting** -> [P07 Observability](./07-observability-evaluation.md) and [P10 Governance and FinOps](./10-governance-finops.md).

## 2. Capability map

| Capability | What good looks like | Owner boundary |
|------------|----------------------|----------------|
| Unified API | Clients call one OpenAI-compatible endpoint for chat, embeddings and streaming | P02 owns the north-south interface |
| Authentication and virtual keys | Users and services authenticate once, then receive scoped virtual keys or tokens | P02 owns issuance and mapping |
| Quotas and rate limits | RPM, TPM and spend ceilings per tenant, user, model or project | P02 is the deep owner |
| Usage attribution | Every request carries tenant, project and model labels into logs | P02 emits the dimensions; [P07](./07-observability-evaluation.md) and [P10](./10-governance-finops.md) consume them |
| Upstream key isolation | Provider keys stay in a secret manager, never in application code | P02 owns the indirection; [P12](./12-foundation-infrastructure.md) owns secret plumbing |
| Request normalisation | Different backends hide behind one request and response shape | P02 |
| Policy routing | A logical model name resolves to a backend set by tenant, workload, latency class or data boundary | P02 |
| Weighted rollout (canary, shadow) | A new model or endpoint gets 1%, 10% or 50% of traffic without client changes | P02 |
| Retry and fallback | Known rules for retry in place, fail over, or stop, with bounded attempts and total time | P02 is the deep owner |
| Semantic or complexity routing | Route depends on request content, for example simple prompts to a small model | P02 owns the policy; classifier quality is evaluated in [P08](./08-evaluation-quality.md) |
| Policy hooks | Call-outs to authz, audit and redaction before forwarding | P02 exposes hooks; [P09](./09-security-safety.md) owns the guardrails |
| Inference-aware endpoint choice | Pick a replica by queue depth, KV-cache hit or prefill/decode role | [P03](./03-model-serving.md#5-inference-aware-routing-and-scheduling) owns it; P02 forwards tenant and route hints |
| Decision telemetry | Every route choice, attempt and fallback reason is explainable afterwards | P02 emits metadata to [P07](./07-observability-evaluation.md) |

Litmus tests: "who may spend how much, with which logical key?" and "which model class serves this request, and what is the fallback ladder?" are both P02. "Which replica of that model serves it right now?" is P03.

## 3. Tool comparison

Licence labels, stars (rounded) and repository status were read from GitHub on 2026-10-11 unless stated otherwise; Helicone AI Gateway and TensorZero were spot-checked again on 2026-10-17 (**Opened**). Rename and "choose when" notes are editorial. Re-verify with [Methodology §5](./00-methodology.md#5-snapshot-and-refresh) before adoption.

Comparison criteria for this pillar, in order:

1. **Tenant governance depth.** Virtual keys, per-tenant budgets, RPM and TPM limits, model aliases and spend attribution.
2. **Policy model.** Whether routing, fallbacks, allow-lists and rollout weights are easy to review, test and version.
3. **Interoperability.** OpenAI-compatible northbound API, streaming behaviour, and where relevant Gateway API, Envoy, MCP or A2A support.
4. **Operational fit.** HA story, dependency footprint, and whether the gateway becomes the team's only policy choke point.
5. **Licence boundary.** This repository prefers OSI defaults when the feature gap is acceptable.

| Tool | Licence label | Steward | Best at | Key trade-offs | Choose X when... | Do not choose X when... |
|------|---------------|---------|---------|----------------|------------------|-------------------------|
| **LiteLLM** (~61.4k★) | Open-core ⚠️ (MIT outside `enterprise/`; `enterprise/` requires a commercial subscription for production use) | BerriAI | **Default** for virtual keys, aliases, per-tenant budgets and broad provider abstraction | Strong application-level governance surface, but the open-core boundary matters and policy is less Gateway API-native than Envoy-based options | one component should own virtual keys, spend ceilings, model aliases, basic retries and fallbacks, and cost attribution from day one | you have a strict OSI-only policy, or Gateway API and Envoy CRDs must be the source of truth for routing |
| **Agent Router** (formerly Envoy AI Gateway; ~2.2k★) | OSI ✅ Apache-2.0 | Agent Router project (`theagentrouter`; `envoyproxy/ai-gateway` redirects) | Gateway API- and Envoy-centric AI ingress | Clean OSS boundary and strong Envoy fit, but thinner tenant-budget and virtual-key administration than LiteLLM | platform teams already operate Envoy Gateway and want declarative traffic policy, GitOps and a clean path to the Gateway API Inference Extension | the first pain point is delegated quota and budget governance rather than ingress policy |
| **kgateway** (~5.7k★) | OSI ✅ Apache-2.0 | kgateway project (formerly Gloo) | Gateway API implementation with AI extensions on Envoy | Good fit for Gateway API users, but spend tooling is thin and AI-specific ergonomics are younger than classic API gateways | you already standardise on kgateway or want Gateway API plus AI policy extensions in one control plane | you would be adopting it only to issue keys, budgets and model aliases |
| **agentgateway** (~5.3k★) | OSI ✅ Apache-2.0 | agentgateway project | Governing MCP, A2A and LLM traffic with one data plane | Stronger agent-protocol story than most gateways, but extra concepts if you only need plain LLM proxying | MCP or A2A traffic must be governed alongside OpenAI-style calls; see [P06](./06-agents-mcp.md) | agent protocols are out of scope and you want the simplest possible LLM gateway |
| **vLLM Semantic Router** (~6.1k★) | OSI ✅ Apache-2.0 | vLLM project | Semantic or complexity routing across backends | Classifier quality becomes part of system correctness; it complements rather than replaces the gateway | route choice depends on prompt class, complexity or policy labels inferred from content | you need deterministic, easily auditable routing based only on tenant, header or route class |
| **Apache APISIX** (~17.2k★) | OSI ✅ Apache-2.0 | Apache Software Foundation | Classic API-gateway controls with OSS licensing and AI plugins | Mature gateway core, but AI-specific tenancy and budget features are less opinionated than LiteLLM | you already trust APISIX for north-south traffic and want AI proxying without vendor-gated tiers | you need AI-native virtual-key, alias and budget workflows out of the box |
| **Kong Gateway core** (~44.3k★) | OSI ✅ Apache-2.0 | Kong Inc. | Classic API-gateway estate reuse | Operationally familiar in Kong shops, but AI-specific extras are a separate product decision and the OSS binary and image policy should be re-checked | the platform already standardises on Kong and wants weighted, header or path routing for AI endpoints too | you are choosing a gateway mainly for OSS AI governance features |
| **Higress** (~9.5k★) | OSI ✅ Apache-2.0 | Alibaba / Higress community | Istio- and Envoy-heavy estates with AI gateway features | Good regional provider coverage, but docs are still China-first and evaluation outside that ecosystem takes more effort | you are already Istio and Envoy based and want AI-native plugins close to that stack | your team needs English-first docs and a globally familiar operator community |
| **Portkey Gateway** (~13.2k★) | OSI ✅ MIT | Portkey AI | Lightweight routing proxy with a commercial upgrade path | Easy to start, but OSS governance depth is lighter than LiteLLM and long-term feature direction follows the commercial platform | you mainly need provider abstraction, simple routing and guardrail hooks, not deep delegated governance | the open-source gateway must stand alone for budgets, audit and tenant administration |
| **Helicone AI Gateway** (~0.6k★; spot-checked 2026-10-17, **Opened**) | OSI ✅ GPL-3.0 | Helicone | Lightweight Rust gateway with built-in caching and observability hooks | Young project, copyleft licence, and the operating model leans towards Helicone's wider platform | you want a fast self-hostable proxy, accept GPL-3.0 obligations and value close coupling to observability and caching | corporate licence policy excludes GPL, or you need mature delegated budgets and tenancy controls |
| **Build your own thin proxy** | OSI ✅ (your code) | Your team | Extremely narrow cases | Lowest feature depth and highest long-term ownership cost | you truly have one provider, one auth path and no delegated budgets or rollout policy | you expect multiple tenants, burst paths, quotas, audits or fallbacks within the next year |

Not shortlisted despite conceptual fit: **TensorZero** (~11.7k★) combines gateway, observability, evaluation and optimisation, but its repository was archived on 2026-10-17 (**Opened**), so it is not a recommended default or alternative at this snapshot.

The inference-aware components (Gateway API Inference Extension, llm-d) are compared in [P03](./03-model-serving.md#5-inference-aware-routing-and-scheduling), not here.

### 3.1 Why one default, and why LiteLLM

The realistic families are LiteLLM-style application gateways, Envoy-based Gateway API gateways (Agent Router, kgateway) and protocol-aware data planes such as agentgateway.

- LiteLLM wins the **first-rollout default** on criterion 1: an open-source AI platform usually needs virtual keys, spend attribution, aliases and bounded fallback ladders before it needs sophisticated traffic engineering.
- Envoy-based gateways express routing as Kubernetes objects (`HTTPRoute`, policies), which suits GitOps and the Inference Extension, but their per-tenant budget tooling is still thinner (**Unverified**, confirm during evaluation).
- agentgateway is the pick when agent and MCP governance, not LLM-only routing, drives the decision.

Trade-off: LiteLLM is `Open-core`, which the methodology tolerates only where the open part covers the use case. Do not choose LiteLLM if a strict OSI-only policy, or a Gateway API-native control plane, is non-negotiable. In that case pick Agent Router, kgateway or APISIX and accept thinner budget tooling.

Default here means **first platform gateway default**, not **the only edge pattern forever**. A common production end state is Envoy-based ingress at the edge with LiteLLM or similar behind it for keys and budgets, with the boundary written down so only one system owns each topic.

Signals: **licence** and **adoption** are in the table; **maintenance** is healthy for every shortlisted row except Portkey and Helicone, which need re-checking closer to adoption; **interoperability** means an OpenAI-compatible API and, where relevant, Gateway API or agent-protocol support; **security posture** and **operability** (Helm chart, HA, audit depth) were not compared per tool - **Unverified**.

## 4. Reference design

One product may do everything in small deployments, but keep the **logical layers** distinct so you can split them later.

1. **Clients** call `https://ai.example.com/v1/...` with a tenant-scoped virtual key.
2. A **Kubernetes or edge gateway** terminates TLS and forwards only `/v1/` traffic to the AI gateway.
3. **Identity and limits.** The AI gateway authenticates the caller, maps the key to tenant metadata, checks RPM/TPM and budget, and normalises the request.
4. **Policy evaluation.** It maps the logical model name to a model class, latency class and allowed backend set, using tenant tier, data boundary, latency target, capability tag and rollout status (`stable`, `canary`, `shadow`). Optional content-based classification adds a semantic or complexity signal.
5. **Concrete backend choice.** It picks a provider endpoint or a self-hosted service from [P03](./03-model-serving.md), using health and capacity signals. For self-hosted pools it can hand replica selection to the inference-aware endpoint picker described in [P03](./03-model-serving.md#5-inference-aware-routing-and-scheduling).
6. **Failure handling.** If the call fails or saturates, it follows a bounded retry and fallback ladder and records that fact.
7. **Usage and decision records** flow to [P07](./07-observability-evaluation.md) and [P10](./10-governance-finops.md).
8. **Route-control safety.** Policy changes go through pull requests, replay tests and a kill switch that can disable one provider, one model class or one tenant key in seconds.

A common production pattern: primary path to a self-hosted engine, secondary path to a second cluster or region, tertiary burst path to a commercial API if tenant policy allows it.

Record these outputs for every request: policy revision, logical and resolved backend name, attempt number, retry reason, fallback reason, and final region or cluster. That metadata explains why a request hit an expensive provider when the normal path was self-hosted.

Design rules:

- Gateway logic knows **who** is calling and **what** they may consume; routing logic knows **where** it goes and **what next** if that fails. Keep them as separate config sections even in one product.
- Guardrails may sit inline, but the gateway treats them as call-outs owned by [P09](./09-security-safety.md).
- Caches may sit before or after the gateway; strategy belongs in [P11](./11-reliability-capacity.md).
- Provider burst paths are budgeted and approved with [P10](./10-governance-finops.md).

## 5. Implementation guide

Start with the smallest arrangement that preserves the boundaries above. Add boring, declarative primitives first; add content-aware routing last.

### 5.1 Expose only one public route

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: ai-gateway
spec:
  parentRefs:
    - name: public-gw
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /v1/
      backendRefs:
        - name: ai-gateway
          port: 4000
```

### 5.2 Keep upstream provider keys out of applications

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: provider-keys
  namespace: ai-platform
type: Opaque
stringData:
  OPENAI_API_KEY: replace-me
  ANTHROPIC_API_KEY: replace-me
```

Mount or sync this from the secret system described in [P12](./12-foundation-infrastructure.md). Applications never see these keys.

### 5.3 Make the client contract boring

```bash
curl -sS https://ai.example.com/v1/chat/completions \
  -H "Authorization: Bearer $VIRTUAL_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "team-default-chat",
    "messages": [{"role": "user", "content": "hello"}]
  }'
```

Use logical names such as `team-default-chat` or `budget-embeddings-small` and resolve them centrally instead of hard-coding provider model IDs in clients.

### 5.4 Configure quotas before opening the platform

At minimum define: one tenant identifier; one virtual key per application or team; RPM and TPM limits per key; a monthly or weekly budget per tenant; and audit fields tying every request to a cost centre or project code. Most launch failures come from missing identity and spend attribution, not missing advanced features.

### 5.5 Start routing with a weighted canary

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: chat-router
spec:
  parentRefs:
    - name: ai-router
  hostnames:
    - ai.example.com
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /v1/chat/completions
      backendRefs:
        - name: model-stable
          port: 8080
          weight: 90
        - name: model-canary
          port: 8080
          weight: 10
```

This gives early rollout control before you adopt a richer router. Use header or tenant matches sparingly (for example `x-tenant-tier: enterprise` to a premium backend); prefer a small set of route classes over hundreds of bespoke headers.

### 5.6 Bound retries and define the fallback ladder

Cap attempts (for example two) and the total request deadline, not only the per-attempt timeout. Retry only on idempotent, transient failures (connection errors, 429/503 with backoff). Fall back only to targets the tenant is allowed to use. Version the ladder in Git like application code.

### 5.7 Make routing observable

Whichever product you choose, recover the final backend from logs or trace attributes for a request like 5.3. Log the logical model, resolved model, attempt count, policy revision and fallback reason.

### 5.8 Rehearse streaming and policy changes

Keep a small replay set of redacted requests that covers chat, embeddings, streaming, tool calls and JSON or structured-output modes. Run it against route changes in dry-run or staging before promotion; plain chat success often hides regressions in SSE framing, timeout policy or retry eligibility.

## 6. Operations

Operate the gateway like a shared platform API, not a disposable sidecar. Make the policy inventory visible.

| Operational concern | What to watch |
|---------------------|---------------|
| 401/403 rates | Broken virtual keys, expired identities, mis-scoped tenants |
| 429 rates | Real quota pressure, bad client retry loops, limits too low |
| 5xx rates | Upstream outage, routing loop, gateway overload |
| Policy drift | Live route config differs from Git, or UI-only edits bypass review |
| Retry storms | More attempts than user requests after a backend starts timing out |
| Silent fail-open | Traffic drifting to an expensive provider path with no alert |
| Canary blindness | Weighted rollout with no quality or latency comparison |
| Classifier drift | Semantic router sends the wrong prompt class to an expensive or low-quality backend |
| Streaming health | Prompt first token, no buffering proxy in the path |
| Usage ledger drift | Gateway token counts versus provider invoices or engine metrics |
| Secret rotation | Rotating upstream keys without client-visible downtime |

Good habits:

- log the **logical** and the **resolved** model name; include tenant, project and request IDs in every usage record;
- alert on traffic share between backend classes, not only on outright failure;
- replay a small golden request set after every policy change, including streaming and tool-calling examples;
- keep a manual path to disable one tenant key or one provider without touching global traffic;
- rehearse budget exhaustion mid-month and a full preferred pool for an hour, not one minute; and
- make `429` responses explicit and documented so client teams do not mistake them for random failure.

## 7. Pitfalls

- **Letting apps keep raw provider keys.** Then the gateway is only a URL rewrite.
- **Owning too much.** If caching, guardrails and every business rule accrete here, the component becomes impossible to reason about. Keep them in their pillars.
- **Two authorities for the same decision.** If a gateway and a separate router both enforce budgets or both pick backends, nobody knows which is authoritative.
- **Only limiting requests, not tokens.** Cost and saturation track TPM more closely than RPM.
- **Using physical model IDs in client code.** Model swaps become application migrations.
- **Unlimited retries.** They amplify outages and turn a slow model into a platform incident.
- **Routing on one metric only.** Lowest latency is not enough if quality, queue depth or data boundary matter.
- **Letting route policy live only in a UI.** If you cannot diff and review it, you cannot audit it.
- **Treating semantic routing as ground truth.** Misclassification can quietly increase cost or lower quality; keep a deterministic escape hatch.
- **Canarying without evals.** Weighted shifting proves availability only; pair it with [P08](./08-evaluation-quality.md).
- **Treating provider fallback as free.** The burst path may become the steady path and break cost assumptions.
- **Breaking streaming with an intermediate proxy.** Buffered responses hide backpressure.
- **Retrying non-idempotent or long-lived operations blindly.** Tool-calling, batch APIs and long streams need tighter retry rules than plain chat.
- **Assuming quota equals capacity management.** Quotas protect spend; autoscaling and queues live in [P11](./11-reliability-capacity.md).
- **Expecting routing to fix bad serving.** If every candidate is cold or overloaded, [P03](./03-model-serving.md) must change.

## 8. Checklist

### MVP

- [ ] One public OpenAI-compatible endpoint exists for all internal clients.
- [ ] Raw provider keys are stored centrally and hidden behind gateway-issued credentials.
- [ ] Every request is tagged with tenant or application identity.
- [ ] RPM and TPM limits exist per virtual key.
- [ ] Logical model names resolve centrally; a stable and a canary route can coexist.
- [ ] Retry count and timeout are bounded; fallbacks are documented.

### Production

- [ ] Virtual keys are scoped per team or workload, not shared globally.
- [ ] Monthly or weekly budget ceilings exist per tenant or cost centre.
- [ ] Gateway logs, metrics and route decisions feed [P07](./07-observability-evaluation.md) dashboards.
- [ ] Logical model aliases and route classes are versioned and change-controlled (GitOps).
- [ ] Policy changes are tested against a replay set that includes streaming and tool-calling requests.
- [ ] Health-aware routing exists between at least two backend classes, with distinct alerts and cost visibility for the burst path.
- [ ] Serving-health signals from [P03](./03-model-serving.md) inform backend choice where it matters.

### Enterprise

- [ ] Identity integrates with corporate SSO or workload identity, not static shared keys.
- [ ] Business units can delegate quota administration safely.
- [ ] Routing policies encode data boundary or residency constraints; multiple clusters or regions act as explicit fallback tiers.
- [ ] Budget breach events page humans or trigger workflow in [P10](./10-governance-finops.md); provider burst paths are budgeted and approved.
- [ ] Global kill switches can disable one provider, one model class or one tenant without full gateway downtime.
- [ ] Key rotation and tenant suspension are tested without platform downtime.
- [ ] Policy changes need peer review and leave an audit trail supporting compliance and chargeback.

## 9. Sources

Opened earlier in this repository's research process; re-check before adoption:

- [LiteLLM repository](https://github.com/BerriAI/litellm)
- [LiteLLM `LICENSE`](https://github.com/BerriAI/litellm/blob/main/LICENSE)
- [LiteLLM enterprise licence note](https://github.com/BerriAI/litellm/blob/main/enterprise/LICENSE.md)
- [Agent Router repository](https://github.com/theagentrouter/agent-router)
- [kgateway repository](https://github.com/kgateway-dev/kgateway)
- [agentgateway repository](https://github.com/agentgateway/agentgateway)
- [vLLM Semantic Router repository](https://github.com/vllm-project/semantic-router)
- [Kong Gateway repository](https://github.com/Kong/kong)
- [Apache APISIX repository](https://github.com/apache/apisix)
- [Higress repository](https://github.com/higress-group/higress)
- [Portkey Gateway repository](https://github.com/Portkey-AI/gateway)
- [Helicone AI Gateway repository](https://github.com/Helicone/ai-gateway) and [`LICENSE`](https://github.com/Helicone/ai-gateway/blob/main/LICENSE)
- [TensorZero repository](https://github.com/tensorzero/tensorzero)
- [Methodology](./00-methodology.md)
- [Glossary](./16-glossary.md)
