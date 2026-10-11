# P07. Observability

> **TL;DR** - Instrument AI traffic as a first-class production workload: traces, metrics, logs and usage/cost signals on one OpenTelemetry-based plane. Prometheus and Grafana stay the default metrics path, an LLM-aware trace UI sits beside them, and agent runs are traced as trees of model, tool and handoff spans. Quality measurement (offline and online evals, judges, gates) lives in [P08](./08-evaluation-quality.md); this pillar supplies the telemetry that P08 consumes.

*Snapshot: 2026-10-11 · Related: [AI gateway and routing](./02-ai-gateway-routing.md) · [Model serving](./03-model-serving.md) · [Agents, tools and protocols](./06-agents-mcp.md) · [Evaluation and quality](./08-evaluation-quality.md) · [Governance and FinOps](./10-governance-finops.md) · [Reliability and capacity](./11-reliability-capacity.md)*

## 1. Why it matters

Classic service telemetry is necessary but not sufficient for AI systems. You need to know not only **whether** a request succeeded, but also:

- which model, prompt template, retrieval context and tool calls were involved
- how much latency came from routing, retrieval, inference and tools
- which tenant, team or feature consumed the tokens and cost
- what an agent actually did: which steps, which tools, how many loops, where it failed

AI failures are often silent. A model can return HTTP 200 and still be wrong, unsafe or too expensive. Telemetry is how you find those requests; judging whether they were good is the job of [P08](./08-evaluation-quality.md).

Ownership boundaries:

- **Fallback policies, retries and routing decisions** are owned by [P02](./02-ai-gateway-routing.md); their outcomes must be observed here.
- **Inference-engine metrics** (queue depth, KV-cache use, batch size) are emitted by [P03](./03-model-serving.md); capacity decisions on them belong to [P11](./11-reliability-capacity.md).
- **Agent identity, memory and approval hooks** are owned by [P06](./06-agents-mcp.md); the spans and audit events they emit are collected here.
- **Guardrail policy** is owned by [P09](./09-security-safety.md); its alerts and false positives should appear in telemetry here.
- **Quality scoring, datasets, judges and release gates** are owned by [P08](./08-evaluation-quality.md). Traces are the raw material: sampled production traces become eval datasets, and eval scores are attached back to traces.
- **Budgets, showback and chargeback policy** are owned by [P10](./10-governance-finops.md); this pillar provides the usage data.

## 2. Capability map

| Capability | What it must do | Notes |
|------------|-----------------|-------|
| **Trace model requests** | Correlate gateway, router, application, retrieval, tool and model spans | One trace should survive asynchronous hops where possible |
| **Trace agent runs (AgentOps-style)** | Represent a run as a tree: plan, model calls, tool calls, sub-agent handoffs, retries, human approvals | Needed to debug loops, wrong-tool choices and runaway cost; feeds trajectory evals in P08 |
| **Collect service metrics** | Export latency, throughput, errors, saturation and queue metrics | AI-specific metrics (TTFT, tokens/s) complement normal service SLIs; they do not replace them |
| **Record prompt and response metadata safely** | Keep enough detail to debug, while redacting secrets and sensitive data | Raw payload capture should be opt-in, sampled and time-limited |
| **Logs and events** | Structured logs correlated by trace ID; GenAI events for prompts/completions where policy allows | Log payload-handling policy, not raw prompts by default |
| **Track usage and cost** | Attribute requests, tokens, GPU time and spend to team, tenant, feature or budget | Gateway identifiers from [P02](./02-ai-gateway-routing.md) make this much easier |
| **Attach quality signals to traces** | Accept eval scores, user feedback and review labels as span or trace annotations | Lets P08 scores be sliced by model, prompt version and tenant |
| **Alerting and SLOs** | Alert on user-impacting symptoms and burn rate | Include AI symptoms: empty retrievals, tool failure rate, refusal rate, runaway loops |

## 3. Tool comparison

Licences, stars (rounded to 0.1k), push dates and archived flags were read from upstream repositories on 2026-10-11 (**Opened**); CNCF levels come from the CNCF landscape file (**Opened**). Re-check with [Methodology §5](./00-methodology.md#5-snapshot-and-refresh). The signals that drove the picks are interoperability (OpenTelemetry first), licence (open-core and source-available boundaries called out) and adoption. Evaluation tools moved to [P08 §3](./08-evaluation-quality.md#3-tool-comparison).

| Capability | Default pick | Licence label | Steward | Alternatives | Choose X when… |
|------------|--------------|---------------|---------|--------------|----------------|
| **Telemetry standard and SDK shape** | **OpenTelemetry** | `OSI` ✅ (Apache-2.0) | OpenTelemetry / CNCF Graduated | OpenLIT (`OSI` ✅ Apache-2.0), vendor SDKs | Choose **OpenTelemetry** when you want vendor-neutral traces, metrics and logs that survive tool changes |
| **Collector / pipeline** | **OpenTelemetry Collector** (7.7k★; v0.162.0, 2026-09-28) | `OSI` ✅ (Apache-2.0) | OpenTelemetry / CNCF Graduated | Vendor agents | Choose the **Collector** to redact, sample and fan out OTLP centrally |
| **Time-series metrics store** | **Prometheus** (66.5k★) | `OSI` ✅ (Apache-2.0) | Prometheus / CNCF Graduated | Managed metrics backends, OpenCost for cost views | Choose **Prometheus** when Kubernetes and service-level metrics are already core platform concerns |
| **Distributed trace backend** | **Jaeger** (23.3k★) | `OSI` ✅ (Apache-2.0) | Jaeger / CNCF Graduated | Grafana Tempo (`OSI` ✅ AGPL-3.0; 5.5k★), Langfuse or Phoenix for LLM-specific views | Choose **Jaeger** for a general OTLP trace store next to the LLM-specific UI; choose **Tempo** if you already run the Grafana stack and accept AGPL |
| **Dashboards and exploratory analysis** | **Grafana** (77.2k★) | `OSI` ✅ (AGPL-3.0) | Grafana Labs | Langfuse UI (`Open-core` ⚠️), Arize Phoenix (`Source-available` ⚠️ Elastic-2.0) | Choose **Grafana** for one shared dashboard surface across AI and non-AI services if you accept AGPL obligations |
| **LLM trace and prompt analytics** | **Langfuse** (35.6k★; v4.56.0, 2026-10-09) | `Open-core` ⚠️ (MIT outside the `ee/`, `web/src/ee/` and `worker/src/ee/` directories, which carry a separate licence; copyright held by ClickHouse, Inc.) | Langfuse, now part of ClickHouse (search-cited acquisition; copyright line read from `LICENSE`) | Opik (`OSI` ✅ Apache-2.0; 22.5k★), OpenLIT (`OSI` ✅ Apache-2.0), Arize Phoenix (`Source-available` ⚠️ Elastic-2.0; 11.8k★), MLflow tracing (`OSI` ✅ Apache-2.0; 28.3k★) | Choose **Langfuse** for a purpose-built LLM observability UI with prompt management when the `ee/` boundary is acceptable (confirm needed features are outside `ee/`); choose **Opik** or **MLflow** for a fully Apache-2.0 option |
| **Open instrumentation for LLM apps** | **OpenLLMetry** (7.5k★; 0.62.4, 2026-09-29) | `OSI` ✅ (Apache-2.0) | Traceloop maintainers | OpenLIT (`OSI` ✅ Apache-2.0; 2.8k★), OpenTelemetry GenAI contrib instrumentations | Choose **OpenLLMetry** for OTel auto-instrumentation of LLM and vector-store SDKs; choose **OpenLIT** when you also want bundled dashboards and GPU monitoring. Both emit plain OTLP |
| **Agent run tracing (AgentOps)** | **Langfuse / Phoenix / MLflow tracing** via OTel | see rows above | see rows above | AgentOps (`OSI` ✅ MIT; 5.9k★; last release 0.4.21 in 2025-08, last push 2026-06, so slower), Laminar (`OSI` ✅ Apache-2.0; 3.4k★) | Choose a general LLM trace UI when agents are built on several frameworks; choose **AgentOps** or **Laminar** only if their agent-specific views (replay, session timeline) matter more than ecosystem breadth |
| **Cost allocation** | **OpenCost** (6.8k★) | `OSI` ✅ (Apache-2.0) | OpenCost / CNCF Incubating | Prometheus recording rules, Grafana dashboards, internal chargeback models | Choose **OpenCost** for Kubernetes cost allocation joined to model usage and tenant views |

Notes:

- Langfuse's open-core boundary and Phoenix's Elastic-2.0 licence (no offering it as a managed service) are the two licence risks in this table; the Apache-2.0 alternatives cover tracing without them.
- Instrumentation libraries emit OTLP, so the trace UI can be swapped without re-instrumenting.
- **OpenTelemetry GenAI semantic conventions** now live in a dedicated repository, [`open-telemetry/semantic-conventions-genai`](https://github.com/open-telemetry/semantic-conventions-genai) (Apache-2.0, **Opened**). The old `docs/gen-ai/` pages in the core repository are redirect stubs. The agent-span page we read is marked **Development** (not Stable); treat the whole GenAI set as unstable and pin versions.

Default platform stance:

1. **OpenTelemetry first.** Everything else should either consume OTel data or complement it.
2. **Prometheus + Grafana** remain the default shared metrics path for platform teams.
3. **One LLM trace UI** beside the shared plane, fed by OTLP, not a second instrumentation stack.
4. **Make cost attribution a design input, not a finance afterthought.**

## 4. Reference design

1. **Instrumentation in the gateway, application, retrieval service, agent runtime, tool runners and model-serving path** emits OTel spans and metrics.
2. **OpenTelemetry Collector** receives OTLP, applies redaction, tail sampling and attribute transforms, and fans out to metrics, traces and log backends.
3. **Prometheus** scrapes service and infrastructure metrics (including inference-engine metrics from [P03](./03-model-serving.md)); **Grafana** overlays service SLIs with AI-specific ones such as TTFT, token throughput and cost per request.
4. **LLM observability UI** (Langfuse, Phoenix, Opik or MLflow), fed by OpenLLMetry or OpenLIT, sits beside the shared plane, not instead of it.
5. **Agent trace model:** one root span per agent run; child spans for each model call, tool call, retrieval and sub-agent handoff; human approvals and policy denials recorded as span events. See [P06](./06-agents-mcp.md) for the hooks.
6. **Eval hand-off to [P08](./08-evaluation-quality.md):** sampled traces flow into dataset curation; eval and user-feedback scores are written back as annotations keyed by trace ID.
7. **Cost view** joins tenant, feature and model labels from [P02](./02-ai-gateway-routing.md) with infrastructure signals and chargeback tags consumed by [P10](./10-governance-finops.md).

Design rules:

- **One request needs one stable identifier across all hops.**
- **Logs should describe payload handling policy, not become an accidental data lake of raw prompts.**
- **Store prompt and completion content behind a switch** (off, hashed, sampled, full) per environment and data class.
- **Keep metric cardinality bounded.** Tenant and model are fine labels; user ID, prompt text and trace ID are not.

## 5. Implementation guide

### 5.1 Start with span boundaries you can explain

Trace at least these steps separately: gateway admission, routing decision, retrieval request, model invocation, tool calls, response assembly. For agents add: plan or reasoning step, each loop iteration, sub-agent handoff, human approval wait. If operators cannot say where latency lives, the trace model is still too coarse.

### 5.2 Keep the collector simple first

A minimal OpenTelemetry Collector config can accept OTLP and expose metrics for Prometheus:

```yaml
receivers:
  otlp:
    protocols:
      grpc: {}
      http: {}

exporters:
  prometheus:
    endpoint: 0.0.0.0:9464

service:
  pipelines:
    metrics:
      receivers: [otlp]
      exporters: [prometheus]
```

Add trace or log exporters only after you have agreed retention and redaction rules.

### 5.3 Adopt the GenAI semantic conventions deliberately

Use the OTel GenAI conventions where your SDKs support them: `gen_ai.operation.name` (for example `chat`, `create_agent`, `invoke_agent`, `execute_tool`), `gen_ai.provider.name`, `gen_ai.agent.id/name/version`, and token-usage and operation-duration client metrics (exact current names: **Unverified**, check the repository). Because they are in Development status:

- pin the convention version your SDKs emit and record it in the platform standard
- put attribute renames behind Collector transforms so dashboards do not break
- refresh from the [GenAI conventions repository](https://github.com/open-telemetry/semantic-conventions-genai) per [Methodology §5](./00-methodology.md#5-snapshot-and-refresh)

### 5.4 Decide what to label

Standard labels: tenant or team, product or feature, model name, route or policy name, prompt or workflow version, retrieval index version, agent name and version. Without these, cost and regression analysis become anecdotal.

### 5.5 Usage and cost visibility

- Record input, output and cached tokens per request; compute cost with a versioned price table, not hard-coded constants.
- Join token cost with GPU-hour cost from OpenCost for self-hosted models, so hosted and self-hosted routes are comparable.
- Report **cost per successful task** by joining usage with P08 outcome scores.
- Export the same labelled usage stream to [P10](./10-governance-finops.md) for showback and budgets.

### 5.6 Payload capture and privacy

Classify prompts, tool arguments and outputs before storing. Redact in the Collector, not only in the app. Apply shorter retention to raw content than to metadata, and honour deletion requests across the trace store.

## 6. Operations

- **Telemetry retention:** decide what stays for days, weeks or months, and why.
- **Redaction:** verify redaction with canary secrets in synthetic traffic.
- **Sampling:** tail-sample to keep errors, slow traces, agent runs with many steps and flagged outputs; keep a small random baseline.
- **Threshold ownership:** assign owners for latency, cost and error thresholds.
- **Cost review:** compare cost per successful task, not only cost per request.
- **Alerting:** alert on symptoms such as rising empty retrievals, tool failure rates, loop-count outliers and refusal spikes, not only CPU and memory.
- **Telemetry health:** monitor dropped spans, Collector queue saturation and ingestion lag.

Heuristics:

- If a cost spike appears, break it down by tenant, model and route before cutting global limits.
- If latency looks fine but quality falls, compare retrieval index, prompt version and tool path, then follow the regression workflow in [P08](./08-evaluation-quality.md).
- If an agent's token use jumps, inspect step counts and repeated tool calls in traces before changing models.

## 7. Pitfalls

- **Only monitoring HTTP status and latency.** AI regressions often hide behind successful responses.
- **Logging raw prompts by default.** This creates avoidable privacy and secret-handling risk.
- **Treating telemetry as evaluation.** Dashboards show what happened, not whether it was right; pair with [P08](./08-evaluation-quality.md).
- **High-cardinality labels** (user, prompt text) that blow up the metrics store.
- **Building on unstable conventions without pinning.** GenAI attribute names are still in Development.
- **Two instrumentation stacks.** Mixing vendor SDKs and OTel splits traces; standardise on OTLP.
- **Agent runs flattened into one span.** You lose where loops and wrong tool calls happen.
- **No denominator for cost.** Spend per request is weaker than spend per successful task.
- **Letting dashboards replace runbooks.**

## 8. Checklist

### MVP

- [ ] OpenTelemetry instrumentation added to gateway, application and model-call path
- [ ] Prometheus scraping core service metrics and AI-specific latency metrics
- [ ] Grafana dashboard for request rate, error rate, TTFT and total latency
- [ ] Basic usage and cost labels (tenant, model, feature) attached to requests
- [ ] Raw payload capture off or restricted by default

### Production

- [ ] Trace IDs cross retrieval, tool, agent-handoff and async boundaries
- [ ] Redaction in the Collector, tested with canary data
- [ ] LLM trace UI deployed on OTLP; eval and feedback scores attachable to traces ([P08](./08-evaluation-quality.md))
- [ ] GenAI semantic-convention version pinned and documented
- [ ] Cost dashboards joined with tenant, feature and model labels, with a versioned price table
- [ ] Runbooks exist for latency, cost and tool-failure regressions

### Enterprise

- [ ] Shared Collector patterns and attribute conventions standardised platform-wide
- [ ] Agent run tracing standard (root span, step spans, approval events) mandated for all agent frameworks
- [ ] Threshold ownership mapped to engineering, product and risk stakeholders
- [ ] Chargeback or showback fed from telemetry and aligned with [P10](./10-governance-finops.md)
- [ ] Long-term telemetry retention, privacy and legal review completed
- [ ] Post-incident process exports failing traces into P08 regression datasets

## 9. Sources

Primary upstreams to re-check:

- [OpenTelemetry project](https://github.com/open-telemetry)
- [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai) and [core semantic conventions repository](https://github.com/open-telemetry/semantic-conventions)
- [OpenTelemetry Collector repository](https://github.com/open-telemetry/opentelemetry-collector)
- [Prometheus repository](https://github.com/prometheus/prometheus)
- [Grafana repository](https://github.com/grafana/grafana) and [Tempo repository](https://github.com/grafana/tempo)
- [Langfuse repository](https://github.com/langfuse/langfuse) and [`LICENSE`](https://github.com/langfuse/langfuse/blob/main/LICENSE)
- [Arize Phoenix repository](https://github.com/Arize-ai/phoenix) and [`LICENSE`](https://github.com/Arize-ai/phoenix/blob/main/LICENSE)
- [Opik repository](https://github.com/comet-ml/opik)
- [OpenLIT repository](https://github.com/openlit/openlit)
- [OpenLLMetry repository](https://github.com/traceloop/openllmetry)
- [MLflow repository](https://github.com/mlflow/mlflow)
- [Jaeger repository](https://github.com/jaegertracing/jaeger)
- [AgentOps repository](https://github.com/AgentOps-AI/agentops) and [Laminar repository](https://github.com/lmnr-ai/lmnr)
- [OpenCost repository](https://github.com/opencost/opencost)
- [Cloud Native AI whitepaper](https://github.com/cncf/tag-runtime/blob/main/wgs/cnai/whitepapers/cloudnativeai.md)

Licences, stars, release dates and the GenAI-conventions move were **Opened** on 2026-10-11; the Langfuse acquisition is **Search-cited**. Refresh with [Methodology §5](./00-methodology.md#5-snapshot-and-refresh).
