# P02. AI gateway

> **TL;DR** — Put one governed, OpenAI-compatible front door in front of every model call. The gateway is where teams authenticate, receive virtual keys, hit quotas and budgets, and emit consistent usage records. It is not the deep home for routing policies, caching or guardrails; those belong in sibling pillars.

*Snapshot: 2026-10-11 · Related: [Reference architecture](./01-reference-architecture.md) · [Model router](./03-model-router.md) · [Security](./08-security.md) · [Reliability and performance](./10-reliability-performance.md) · [Tool landscape](./14-tool-landscape.md)*

## 1. Why it matters

Without a gateway, every application chooses its own SDK, stores raw provider keys, implements its own retries, and reports cost in a different shape. That is workable for a demo and painful for a platform.

The AI gateway gives you one place to:

- expose a stable, OpenAI-compatible API to internal clients;
- hide upstream credentials behind tenant-scoped virtual keys;
- enforce quotas, rate limits and budget ceilings;
- record usage in a consistent schema before requests fan out to providers or self-hosted engines; and
- attach policy hooks for identity, observability and security.

This pillar owns **virtual keys, quotas and rate limits**. It only points to sibling pillars for:

- **routing policies, retries and fallbacks** → [P03 Model router](./03-model-router.md);
- **guardrails and prompt-injection controls** → [P08 Security](./08-security.md);
- **caching and tail-latency tactics** → [P10 Reliability and performance](./10-reliability-performance.md).

## 2. Capability map

| Capability | What good looks like | Owner boundary |
|------------|----------------------|----------------|
| Unified API | Clients call one OpenAI-compatible endpoint for chat, embeddings and streaming | P02 owns the north-south interface |
| Authentication | Human users and services authenticate once, then receive scoped virtual keys or tokens | P02 owns key issuance and mapping |
| Quotas and rate limits | RPM, TPM and spend ceilings can be applied per tenant, user, model or project | P02 is the deep owner |
| Usage attribution | Every request carries tenant, project and model labels into logs and cost dashboards | P02 emits the dimensions; [P07](./07-observability-evaluation.md) turns them into dashboards |
| Upstream key isolation | Provider keys stay in a secret manager or Kubernetes secret, never in application code | P02 owns the indirection; [P12](./12-foundation-infrastructure.md) owns secret plumbing |
| Request normalisation | Different backends are hidden behind one request and response shape | P02 owns protocol normalisation |
| Policy hooks | The gateway can call out to authz, audit and redaction services before forwarding | P02 exposes hooks; [P08](./08-security.md) owns the actual guardrails |
| Router hand-off | The gateway can forward route hints and tenant context to a router | P03 owns route choice itself |

A useful litmus test: if the question is "who is allowed to spend how much, using which logical key?" it belongs here. If the question is "which model should serve this request, and what is the fallback ladder?" it belongs in [P03](./03-model-router.md).

## 3. Tool comparison

Licence labels, stars (rounded) and repository status were read from GitHub on 2026-10-11 (**Opened**: repository metadata and `LICENSE` files). Rename and "choose when" notes are editorial. Re-verify with [Methodology §5](./00-methodology.md#5-snapshot-and-refresh) before adoption.

| Tool | Licence label | Steward | Default pick? | Alternatives | Choose X when… |
|------|---------------|---------|---------------|--------------|----------------|
| **LiteLLM** (~60.9k★) | Open-core ⚠️ (MIT outside `enterprise/`; `enterprise/` needs a commercial subscription) | BerriAI | **Default** | Agent Router; Portkey Gateway; Kong Gateway core | Choose LiteLLM when the gateway itself must own virtual keys, per-tenant quotas, model aliases and cost attribution across many upstream APIs or self-hosted endpoints. Keep routing policy simple here and push richer traffic policy into [P03](./03-model-router.md). Check that the gated `enterprise/` features (for example SSO and some audit and team-budget controls — **Unverified**, confirm in the enterprise `LICENSE.md`) are not on your must-have list. |
| **Agent Router** (formerly Envoy AI Gateway; ~2.2k★) | OSI ✅ Apache-2.0 | Agent Router project (`theagentrouter`; `envoyproxy/ai-gateway` redirects) | Alternative | LiteLLM; kgateway; Kong Gateway core | Choose Agent Router when you want a Kubernetes- and Gateway API-centric front door built on Envoy, especially if routing policy will become a first-class concern. The rename is **Opened** ([Methodology §4.3](./00-methodology.md#43-why-live-verification-matters-two-examples)). |
| **kgateway** (~5.7k★) | OSI ✅ Apache-2.0 | kgateway project (formerly Gloo) | Alternative | Agent Router; agentgateway | Choose kgateway when you want a Gateway API implementation on Envoy with AI-gateway extensions (prompt guards, provider routing) and may later add the Gateway API Inference Extension. Its CNCF level is sandbox (landscape file, 2026-10-11). |
| **agentgateway** (~5.3k★) | OSI ✅ Apache-2.0 | agentgateway project | Alternative | kgateway; Agent Router | Choose agentgateway when MCP and agent-to-agent (A2A) traffic must be governed alongside LLM calls; it is a Rust data plane that also serves LLM traffic. |
| **Kong Gateway core** (~44.3k★) | OSI ✅ Apache-2.0 | Kong Inc. | Alternative | LiteLLM; Agent Router; Apache APISIX | Choose Kong when your platform already standardises on Kong for north-south traffic and you only need OSS-core gateway functions plus straightforward path, header or weighted routing. Treat AI-specific extras as a separate product decision. Kong's upstream OSS binary and image publishing policy has changed — **Unverified**; confirm what you can actually deploy without a licence. |
| **Apache APISIX** (~17.2k★) | OSI ✅ Apache-2.0 | Apache Software Foundation | Alternative | Kong Gateway core; Higress | Choose APISIX when you want an ASF-governed, plugin-rich gateway with AI proxy and rate-limit plugins and no vendor-gated tier. |
| **Higress** (~9.5k★) | OSI ✅ Apache-2.0 | Alibaba / Higress community | Alternative | APISIX; Agent Router | Choose Higress when you are Istio/Envoy-based and want an AI-native gateway with a strong China-region provider catalogue; documentation is mainly Chinese-first — **Unverified**. |
| **Portkey Gateway** (~13.2k★) | OSI ✅ MIT | Portkey AI | Alternative | LiteLLM | Choose Portkey's open gateway for a lightweight, fast routing and guardrail proxy. Last push was 2026-05-25, so check maintenance; its fuller governance features are in the commercial platform — **Unverified**. |
| **Build your own thin proxy** | OSI ✅ (your code) | Your team | Last resort | LiteLLM; Agent Router | Choose a custom proxy only when your requirements are genuinely narrow: one provider, one auth method, no delegated budgets, and a strong desire to minimise moving parts. Most teams regret this by the second tenant. |

Why LiteLLM is the default here: this pillar is more about control-plane convenience than about sophisticated traffic engineering. An open-source AI platform usually needs virtual keys, spend attribution and request normalisation earlier than it needs advanced routing semantics. It is the most widely adopted candidate above and has the most direct virtual-key and budget model (editorial judgement), but it is `Open-core`, which the methodology tolerates only where the open part covers the use case. If a strict OSI-only policy applies, pick Agent Router or APISIX and accept thinner budget tooling.

Signals: **licence** and **adoption** are in the table; **maintenance** is healthy for every row except Portkey (pushed within a week of the snapshot for the rest); **interoperability** means an OpenAI-compatible API and/or Gateway API; **security posture** and **operability** (Helm chart, HA) were not compared per tool — **Unverified**, assess in your own evaluation.

## 4. Reference design

A practical reference design separates the **gateway** from the **router** even if one product can do both in small deployments.

1. **Clients** call `https://ai.example.com/v1/...` using a tenant-scoped virtual key.
2. A **Kubernetes or edge gateway** terminates TLS and forwards only `/v1/` traffic to the AI gateway service.
3. The **AI gateway** authenticates the caller, maps the virtual key to tenant metadata, checks RPM/TPM and budget state, and normalises the request.
4. The gateway either:
   - forwards directly to a chosen backend in MVP setups; or
   - passes the request plus route hints to the **model router** in [P03](./03-model-router.md).
5. The selected backend is either:
   - a commercial model API;
   - a self-hosted endpoint from [P04 Model serving](./04-model-serving.md); or
   - a private provider bridge inside another network zone.
6. Usage records flow to [P07](./07-observability-evaluation.md) and cost/governance processes in [P09](./09-governance-risk-compliance.md).

Design rules that keep the boundary clean:

- The gateway should know **who** is calling and **what** they are allowed to consume.
- The router should know **where** the request should go and **what to do next** if that destination is slow or failing.
- Guardrail systems may sit inline, but the gateway should treat them as call-outs owned by [P08](./08-security.md), not as ad hoc business logic.
- Caches may sit before or after the gateway, but cache strategy belongs in [P10](./10-reliability-performance.md).

## 5. Implementation guide

Start with the smallest arrangement that preserves the boundary above.

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

Mount or sync this from the secret system described in [P12](./12-foundation-infrastructure.md). Applications should never see these raw keys.

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

Use logical model names such as `team-default-chat` or `budget-embeddings-small`. Resolve those names centrally instead of hard-coding provider model IDs into every client.

### 5.4 Configure quotas before opening the platform

At minimum, define:

- one tenant identifier;
- one virtual key per application or team;
- RPM and TPM limits per key;
- a monthly or weekly budget ceiling per tenant; and
- audit fields that tie every request to a cost centre or project code.

If a product can do more, keep the first rollout simple. Most launch failures are caused by missing identity and spend attribution, not by missing advanced gateway features.

## 6. Operations

Operate the AI gateway like a shared platform API, not like a disposable sidecar.

| Operational concern | What to watch |
|---------------------|---------------|
| 401/403 rates | Broken virtual keys, expired identities, mis-scoped tenants |
| 429 rates | Real quota pressure, bad client retry loops, limits set too low |
| 5xx rates | Upstream outage, router loop, gateway overload |
| Streaming health | Clients receiving first token promptly, no buffering proxy in the path |
| Usage ledger drift | Token counts in gateway logs versus provider invoices or engine metrics |
| Secret rotation | Whether upstream keys can be rotated without client-visible downtime |

Good operational habits:

- log the **logical** model name and the **resolved** backend model name;
- include tenant, project and request IDs in every usage record;
- keep a manual emergency path to disable one tenant key without touching global traffic;
- rehearse what happens when a budget is exhausted mid-month; and
- make `429` responses explicit and documented so client teams do not mistake them for random failure.

## 7. Pitfalls

- **Letting apps keep raw provider keys.** Then the "gateway" is only a URL rewrite.
- **Owning too much in the gateway.** If routing policy, caching and guardrails all accrete here, the component becomes impossible to reason about.
- **Only limiting requests, not tokens.** LLM cost and saturation often track TPM more closely than RPM.
- **Using physical model IDs in client code.** Model swaps become application migrations.
- **Breaking streaming with an intermediate proxy.** Buffered responses destroy user experience and hide backpressure problems.
- **Missing per-tenant attribution.** Spend dashboards and budget controls fail if logs only know the service account, not the business owner.
- **Assuming quota equals capacity management.** Quotas protect shared spend; they do not replace autoscaling and queue management in [P10](./10-reliability-performance.md).

## 8. Checklist

### MVP

- [ ] One public OpenAI-compatible endpoint exists for all internal clients.
- [ ] Raw provider keys are stored centrally and hidden behind gateway-issued credentials.
- [ ] Every request is tagged with tenant or application identity.
- [ ] RPM and TPM limits exist for each virtual key.
- [ ] Usage logs contain enough fields to support cost attribution later.

### Production

- [ ] Virtual keys are scoped per team or workload, not shared globally.
- [ ] Monthly or weekly budget ceilings exist per tenant or cost centre.
- [ ] Gateway logs and metrics feed [P07](./07-observability-evaluation.md) dashboards.
- [ ] Logical model aliases are versioned and change-controlled.
- [ ] The router boundary is explicit: advanced fallback and retry policy lives in [P03](./03-model-router.md).

### Enterprise

- [ ] Identity integrates with corporate SSO or workload identity rather than static shared keys.
- [ ] Multiple business units can delegate quota administration safely.
- [ ] Budget breach events page humans or trigger workflow in [P09](./09-governance-risk-compliance.md).
- [ ] Key rotation and tenant suspension are tested without platform downtime.
- [ ] Audit records support legal, compliance and chargeback requirements.

## 9. Sources

Opened earlier in this repository's research process; re-check before adoption:

- [LiteLLM repository](https://github.com/BerriAI/litellm)
- [LiteLLM `LICENSE`](https://github.com/BerriAI/litellm/blob/main/LICENSE)
- [LiteLLM enterprise licence note](https://github.com/BerriAI/litellm/blob/main/enterprise/LICENSE.md)
- [Agent Router repository](https://github.com/theagentrouter/agent-router)
- [Kong Gateway repository](https://github.com/Kong/kong)
- [kgateway repository](https://github.com/kgateway-dev/kgateway)
- [agentgateway repository](https://github.com/agentgateway/agentgateway)
- [Apache APISIX repository](https://github.com/apache/apisix)
- [Higress repository](https://github.com/higress-group/higress)
- [Portkey Gateway repository](https://github.com/Portkey-AI/gateway)
- [Methodology](./00-methodology.md)
- [Glossary](./15-glossary.md)
