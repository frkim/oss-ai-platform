# Model router

> **TL;DR** — The model router decides which backend should serve each request and what to do when the first choice is not the best choice. This is the home for routing policies, canaries, retries and fallbacks, whether traffic goes to provider APIs or to self-hosted engines.

*Snapshot: 2026-10-11 · Related: [AI gateway](./02-ai-gateway.md) · [Model serving](./04-model-serving.md) · [Reliability and performance](./10-reliability-performance.md) · [Tool landscape](./14-tool-landscape.md)*

## 1. Why it matters

A platform with more than one model backend needs a decision layer. The decision may be simple — "send everything to the cheapest healthy model in this class" — or subtle — "prefer the warm self-hosted endpoint, but fall back to a provider API if queue depth is too high and the tenant is allowed to burst".

This pillar owns the decisions about **where a request goes** and **what happens next if the first destination fails, slows down or is unsuitable**.

That includes:

- policy-based model selection;
- health-aware and capacity-aware endpoint choice;
- retries and fallback ladders;
- canaries and weighted traffic shifts; and
- request classification by tenant, workload, latency class or model family.

This pillar does **not** own:

- **virtual keys, quotas and budgets** → [P02 AI gateway](./02-ai-gateway.md);
- **inference engine internals and GPU placement** → [P04 Model serving](./04-model-serving.md);
- **caching and hedging** → [P10 Reliability and performance](./10-reliability-performance.md).

## 2. Capability map

| Capability | What good looks like | Owner boundary |
|------------|----------------------|----------------|
| Route classification | Requests are grouped by tenant, workload, latency class, data boundary or model family | P03 owns the policy inputs |
| Backend selection | A logical model name resolves to one backend or a backend set | P03 owns selection rules |
| Weighted rollout | A new model or endpoint can receive 1%, 10% or 50% of traffic without client changes | P03 owns canaries |
| Retry and fallback | The system knows when to retry in place, when to fail over, and when to stop | P03 is the deep owner |
| Health and saturation signals | Route choice can use health, queue depth, warm capacity or error rate | P03 consumes the signals; P04 emits many of them |
| Cross-environment routing | The router can choose between provider APIs and self-hosted inference pools | P03 owns the decision; P02 provides identity context |
| Decision telemetry | Every route choice is observable and explainable after the fact | P03 emits decision metadata to [P07](./07-observability-evaluation.md) |

A simple rule helps prevent design drift: P02 answers "may this caller spend on model class X?". P03 answers "which concrete endpoint should serve this request right now?".

## 3. Tool comparison

Licence labels, steward names and rename notes below are snapshot facts and therefore **Unverified (not re-checked in this edit; re-verify with the commands in [Methodology §5](./00-methodology.md#5-snapshot-and-refresh))**.

| Tool | Licence label | Steward | Default pick? | Alternatives | Choose X when… |
|------|---------------|---------|---------------|--------------|----------------|
| **Agent Router** | OSI ✅ Apache-2.0 | Agent Router project | **Default** | Gateway API Inference Extension; LiteLLM router; Kong Gateway core | Choose Agent Router when routing policy is a first-class platform concern and you want Kubernetes- and Gateway API-shaped control. It fits well when the gateway and the serving estate are separate layers. The project was previously called Envoy AI Gateway — **Unverified (not re-checked in this edit; re-verify with [Methodology §5](./00-methodology.md#5-snapshot-and-refresh))**. |
| **Gateway API Inference Extension** | OSI ✅ Apache-2.0 | kubernetes-sigs | Alternative | Agent Router; llm-d; LiteLLM router | Choose the Gateway API Inference Extension when you specifically need inference-aware endpoint selection inside the cluster, driven by signals such as queue depth or cache locality exposed by the serving layer. |
| **LiteLLM router** | Open-core | BerriAI | Alternative | Agent Router; Gateway API Inference Extension | Choose LiteLLM routing when a single component can reasonably own both the gateway and the router, usually in smaller or provider-heavy estates. Be strict about separating budget controls in [P02](./02-ai-gateway.md) from routing policy here. |
| **Kong Gateway core** | OSI ✅ Apache-2.0 | Kong Inc. | Alternative | Agent Router; LiteLLM router | Choose Kong when you already run Kong broadly and your routing needs are mostly classic API-gateway patterns: path, header, weighted split and failure handling. |

Why Agent Router is the default here: it is closer to the shape of the problem. This pillar is about declarative traffic policy, not only about translating SDK calls.

## 4. Reference design

A clean model-routing design has four layers.

1. **Intent from the gateway.** [P02](./02-ai-gateway.md) forwards tenant, logical model name and any route hints.
2. **Policy evaluation.** The router maps the request to a model class, latency class and allowed backend set.
3. **Concrete endpoint choice.** The router chooses a specific provider endpoint or self-hosted service using health and capacity signals.
4. **Failure handling.** If the call fails or saturates, the router follows a bounded retry or fallback ladder and records that fact.

A common production pattern is:

- primary path to a self-hosted engine from [P04](./04-model-serving.md);
- secondary path to a second cluster or region;
- tertiary burst path to a commercial API if the tenant policy allows it.

Keep the decision inputs explicit. Useful inputs usually include:

- tenant tier;
- data residency or isolation boundary;
- latency target;
- model family or capability tag;
- endpoint health and queue depth; and
- rollout status such as `stable`, `canary` or `shadow`.

Keep the outputs explicit too:

- resolved backend name;
- attempt number;
- retry reason;
- fallback reason; and
- final serving region or cluster.

That metadata is what lets an operator explain why a request hit an expensive provider endpoint when the normal path was self-hosted.

## 5. Implementation guide

Prefer boring, declarative route primitives first. Add inference-aware logic second.

### 5.1 Start with a weighted canary

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

This is enough for early rollout control even before you adopt a richer router.

### 5.2 Use header or tenant matches sparingly

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: enterprise-route
spec:
  parentRefs:
    - name: ai-router
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /v1/
          headers:
            - name: x-tenant-tier
              value: enterprise
      backendRefs:
        - name: model-premium
          port: 8080
```

Prefer a small set of route classes over hundreds of bespoke headers.

### 5.3 Make routing observable from the outside

```bash
curl -sS https://ai.example.com/v1/chat/completions \
  -H "Authorization: Bearer $VIRTUAL_KEY" \
  -H 'X-Tenant-Tier: enterprise' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "chat-default",
    "messages": [{"role": "user", "content": "ping"}]
  }'
```

Whichever router you choose, make sure you can recover the final backend choice from logs or trace attributes for a request like this.

## 6. Operations

Route control becomes operationally dangerous when policy is implicit. Make the policy inventory visible.

| Operational concern | What to watch |
|---------------------|---------------|
| Retry storms | More total attempts than total user requests, especially after a backend starts timing out |
| Silent fail-open | Traffic drifting to an expensive provider path with no alert |
| Canary blindness | A weighted rollout without quality or latency comparisons |
| Decision opacity | No way to explain which rule or signal picked the backend |
| Saturation feedback delay | Queue-depth or health data arriving too slowly to make good decisions |

Operational practices that help:

- version control route classes and fallback ladders like application code;
- cap retry count and total request time, not only per-attempt timeout;
- alert on traffic share changes between backend classes, not only on outright failure;
- log the resolved backend and fallback reason on every non-primary attempt; and
- rehearse what happens when the preferred self-hosted pool is full for an hour, not just for one minute.

## 7. Pitfalls

- **Mixing quotas with routing.** When the same ruleset controls both spend permissions and backend choice, nobody knows which system is authoritative.
- **Unlimited retries.** They amplify outages and can turn a slow model into a platform incident.
- **Routing on one metric only.** Lowest latency is not enough if quality, queue depth or data boundary matter.
- **Canarying without evals.** Weighted traffic shifting only proves availability unless paired with [P07](./07-observability-evaluation.md).
- **Treating provider fallback as free.** The burst path may violate cost assumptions if it becomes the steady path.
- **Encoding policies in client apps.** The whole point of a router is central control.
- **Expecting routing to fix bad serving.** If every candidate backend is cold or overloaded, [P04](./04-model-serving.md) must change.

## 8. Checklist

### MVP

- [ ] Logical model names exist and resolve centrally.
- [ ] A stable route and a canary route can coexist behind one client endpoint.
- [ ] Retry count and timeout are bounded for every route class.
- [ ] Fallbacks are documented, even if there is only one manual backup path.
- [ ] Route decisions can be traced in logs.

### Production

- [ ] Health-aware routing exists between at least two backend classes.
- [ ] The preferred path and the burst path have distinct alerts and cost visibility.
- [ ] Canary rollouts can be advanced and rolled back without client changes.
- [ ] Route classes are versioned through GitOps or equivalent change control.
- [ ] Queue-depth or serving-health signals from [P04](./04-model-serving.md) inform backend choice where it matters.

### Enterprise

- [ ] Routing policies encode data boundary or residency constraints.
- [ ] Multiple clusters or regions can serve as explicit fallback tiers.
- [ ] Route-decision telemetry feeds platform reviews and incident postmortems.
- [ ] Policy changes require peer review and leave an audit trail.
- [ ] Provider burst paths are budgeted and approved with [P02](./02-ai-gateway.md) and [P09](./09-governance-risk-compliance.md).

## 9. Sources

Opened earlier in this repository's research process; re-check before adoption:

- [Agent Router repository](https://github.com/theagentrouter/agent-router)
- [Gateway API Inference Extension repository](https://github.com/kubernetes-sigs/gateway-api-inference-extension)
- [LiteLLM repository](https://github.com/BerriAI/litellm)
- [Kong Gateway repository](https://github.com/Kong/kong)
- [Methodology](./00-methodology.md)
- [Glossary](./15-glossary.md)
