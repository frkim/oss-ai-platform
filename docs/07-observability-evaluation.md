# P07. Observability

> **TL;DR** - Instrument AI traffic as a first-class production workload: traces, metrics, logs and usage/cost signals on one OpenTelemetry-based plane. Prometheus and Grafana stay the default metrics path, one OTLP-fed LLM-aware trace UI such as Opik sits beside them, and agent runs are traced as trees of model, tool and handoff spans. Quality measurement (offline and online evals, judges, gates) lives in [P08](./08-evaluation-quality.md); this pillar supplies the telemetry that P08 consumes.

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
| **Long-retention event analytics** | Keep high-cardinality prompt, tool and feedback events queryable for forensics, optimisation and audit | Use a warehouse or log backend for this, not Prometheus labels |
| **Track usage and cost** | Attribute requests, tokens, GPU time and spend to team, tenant, feature or budget | Gateway identifiers from [P02](./02-ai-gateway-routing.md) make this much easier |
| **Attach quality signals to traces** | Accept eval scores, user feedback and review labels as span or trace annotations | Lets P08 scores be sliced by model, prompt version and tenant |
| **Alerting and SLOs** | Alert on user-impacting symptoms and burn rate | Include AI symptoms: empty retrievals, tool failure rate, refusal rate, runaway loops |

## 3. Tool comparison

Licences, stars and current release tags were originally read on 2026-10-11; this review adds spot-checks for missing tools and status corrections opened on 2026-10-17. Evidence grades follow [Methodology §4.1](./00-methodology.md#41-evidence-grades): repository pages, `LICENSE` files and release pages read on GitHub are **Opened**; acquisitions or foundation-governance claims that still rely on secondary reporting remain **Search-cited**. Evaluation-specific runners are covered in [P08 §3](./08-evaluation-quality.md#3-tool-comparison).

Selection criteria used in this pillar:

- **OpenTelemetry fit:** the default path must emit or consume plain OTLP.
- **Separation of planes:** metrics, traces and retained prompt-event analytics have different cost and cardinality profiles.
- **Licence boundary:** where a credible `OSI` option exists, it should be the default or the open-core trade-off must be explicit.
- **Cross-pillar usefulness:** traces should feed [P08](./08-evaluation-quality.md), chargeback in [P10](./10-governance-finops.md) and incident response in [P11](./11-reliability-capacity.md).

| Capability | Default pick | Licence label | Steward | Alternatives | Decision criteria | Choose the default when… | Do not choose the default when… |
|------------|--------------|---------------|---------|--------------|-------------------|---------------------------|---------------------------------|
| **Telemetry standard and SDK shape** | **OpenTelemetry** | `OSI` ✅ (Apache-2.0) | OpenTelemetry / CNCF Graduated | OpenLIT (`OSI` ✅ Apache-2.0), vendor SDKs | Vendor neutrality, span portability, trace plus metrics plus logs | you want traces, metrics and logs that survive backend changes | a closed, single-vendor stack is an explicit strategic choice and portability is not valued |
| **Collector / pipeline** | **OpenTelemetry Collector** (7.7k★; v0.163.0, 2026-10-14) | `OSI` ✅ (Apache-2.0) | OpenTelemetry / CNCF Graduated | Vendor agents | Central redaction, sampling, enrichment and fan-out | you need one place to redact, sample and route OTLP centrally | every workload is so small that per-app exporters are truly simpler, which is rare past a pilot |
| **Time-series metrics store** | **Prometheus** (66.6k★; v3.13.4, 2026-10-02) | `OSI` ✅ (Apache-2.0) | Prometheus / CNCF Graduated | Managed metrics backends, OpenCost for cost views | Kubernetes fit, alerting, existing SRE muscle memory | Kubernetes and service-level metrics are already a core platform concern | you need only retained logs or traces and have no appetite for operating pull-based metrics |
| **Distributed trace backend** | **Jaeger** (23.3k★; v2.22.0, 2026-10-06) | `OSI` ✅ (Apache-2.0) | Jaeger / CNCF Graduated | Grafana Tempo (`OSI` ✅ AGPL-3.0; 5.5k★), Phoenix or Opik for LLM-specific views | General OTLP trace storage, integration breadth, licence posture | you want a general OTLP trace store next to an LLM-specific UI and prefer an `OSI` backend | you already run a Grafana-only stack and accept AGPL, where **Tempo** may reduce moving parts |
| **Dashboards and exploratory analysis** | **Grafana** (77.3k★; v13.2.4, 2026-10-13) | `OSI` ✅ (AGPL-3.0) | Grafana Labs | Langfuse UI (`Open-core` ⚠️), Phoenix (`Source-available` ⚠️ Elastic-2.0) | Shared dashboards across AI and non-AI services, SRE familiarity, alert annotation | you need one shared dashboard surface across platform and AI traffic and accept AGPL obligations | AGPL obligations are unacceptable, or the team only wants an LLM-specific UI and no general observability surface |
| **LLM trace and prompt analytics** | **Opik** (22.7k★; 2.2.103, 2026-10-16) | `OSI` ✅ (Apache-2.0) | Comet | Langfuse (`Open-core` ⚠️; 36.0k★), OpenLIT (`OSI` ✅ Apache-2.0), Phoenix (`Source-available` ⚠️ Elastic-2.0; 11.9k★), MLflow tracing (`OSI` ✅ Apache-2.0; 28.4k★) | OTLP or framework integrations, trace-linked eval hand-off, prompt management, licence posture | you want one pure-OSS LLM observability UI that also crosses cleanly into datasets, online evaluators and P08 score storage | your team already standardised on Langfuse and accepts the `ee/` boundary, or on MLflow for all experiment records |
| **Open instrumentation for LLM apps** | **OpenLLMetry** (7.5k★; 0.62.4, 2026-09-29) | `OSI` ✅ (Apache-2.0) | Traceloop maintainers | OpenLIT (`OSI` ✅ Apache-2.0; 2.9k★), OpenTelemetry GenAI contrib instrumentations | Auto-instrumentation breadth, low friction, OTLP purity | you want OTel auto-instrumentation for LLM, vector-store and framework SDKs without adopting a full platform | you also want bundled dashboards, guardrails or GPU monitoring in one package, where **OpenLIT** may be a better fit |
| **Prompt and event analytics warehouse** | **ClickHouse** (50.5k★; v26.3.54.6-lts, 2026-10-17) | `OSI` ✅ (Apache-2.0) | ClickHouse, Inc. and community | OpenSearch (`OSI` ✅ Apache-2.0), object storage plus query engine, backend-specific stores bundled with Opik or Langfuse | Need for long-retention, SQL-heavy, high-cardinality analysis of prompts, tool events and feedback | you need retained, queryable prompt and event data for forensics, optimisation or audit, beyond what a trace UI stores comfortably | traces and metrics already answer the questions, or the team does not want to operate another analytics store yet |
| **Agent run tracing (AgentOps)** | **OTel span model plus the LLM UI above** | see rows above | see rows above | AgentOps (`OSI` ✅ MIT; 5.9k★), Laminar (`OSI` ✅ Apache-2.0; 3.4k★), TruLens (`OSI` ✅ MIT; 3.6k★) | Multi-framework coverage, replay needs, alignment with P06 state model | you build agents on several frameworks and want one shared trace vocabulary rooted in OTel | a single agent framework's bespoke session UI is more valuable than ecosystem breadth |
| **Cost allocation** | **OpenCost** (6.8k★; v1.121.3, 2026-09-16) | `OSI` ✅ (Apache-2.0) | OpenCost / CNCF Incubating | Prometheus recording rules, Grafana dashboards, internal chargeback models | Kubernetes cost allocation, joinability with labelled AI usage | you need Kubernetes cost allocation joined to model usage and tenant views | the platform is too small for a dedicated cost model and simple dashboards already answer the finance questions |

### 3.1 Trade-offs and default reasoning

1. **OpenTelemetry remains the hard default.** Everything else should either consume OTLP or sit behind the Collector.
2. **Prometheus plus Grafana stay the shared SRE path.** They are not LLM-specific, but that is the point: AI workloads must still look like production workloads to operators.
3. **Use one OTLP-fed LLM UI, not a second instrumentation stack.** Opik is the pure-OSS default here; Langfuse stays a strong alternative when its open-core boundary is acceptable and its prompt workflows matter more than licence purity.
4. **Treat retained prompt-event analytics as a separate storage problem.** High-cardinality prompt and feedback payloads belong in a warehouse or event backend such as ClickHouse, not in metrics labels.

Notes:

- Langfuse's `ee/` boundary and Phoenix's Elastic-2.0 licence are the main licence risks in this table; the Apache-2.0 alternatives cover the core use cases.
- Instrumentation libraries emit OTLP, so the trace UI can be swapped without re-instrumenting.
- **OpenTelemetry GenAI semantic conventions** now live in a dedicated repository, [`open-telemetry/semantic-conventions-genai`](https://github.com/open-telemetry/semantic-conventions-genai) (Apache-2.0, **Opened**). The old `docs/gen-ai/` pages in the core repository are redirect stubs. The agent-span page remains **Development** (not Stable); pin versions and shield dashboards behind Collector transforms.

Default platform stance:

1. **OpenTelemetry first.** Everything else should either consume OTel data or complement it.
2. **Prometheus + Grafana** remain the default shared metrics path for platform teams.
3. **One OTLP-fed LLM trace UI** beside the shared plane, not a second instrumentation stack.
4. **Keep long-retention prompt and event analytics out of Prometheus.** Use a warehouse or log backend for that data.
5. **Make cost attribution a design input, not a finance afterthought.**

## 4. Reference design

1. **Instrumentation in the gateway, application, retrieval service, agent runtime, tool runners and model-serving path** emits OTel spans and metrics.
2. **OpenTelemetry Collector** receives OTLP, applies redaction, tail sampling and attribute transforms, and fans out to metrics, traces and log backends.
3. **Prometheus** scrapes service and infrastructure metrics (including inference-engine metrics from [P03](./03-model-serving.md)); **Grafana** overlays service SLIs with AI-specific ones such as TTFT, token throughput and cost per request.
4. **LLM observability UI** (Opik, Langfuse, Phoenix or MLflow), fed by OpenLLMetry or OpenLIT, sits beside the shared plane, not instead of it.
5. **Retained event store** (for example ClickHouse or another warehouse) keeps high-cardinality prompt, tool and feedback payloads with shorter retention and stronger deletion controls than the metric plane.
6. **Agent trace model:** one root span per agent run; child spans for each model call, tool call, retrieval and sub-agent handoff; human approvals and policy denials recorded as span events. See [P06](./06-agents-mcp.md) for the hooks.
7. **Eval hand-off to [P08](./08-evaluation-quality.md):** sampled traces flow into dataset curation; eval and user-feedback scores are written back as annotations keyed by trace ID.
8. **Cost view** joins tenant, feature and model labels from [P02](./02-ai-gateway-routing.md) with infrastructure signals and chargeback tags consumed by [P10](./10-governance-finops.md).

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

Classify prompts, tool arguments and outputs before storing. Redact in the Collector, not only in the app. Apply shorter retention to raw content than to metadata, and honour deletion requests across the trace store and any retained event warehouse. If you persist prompt or tool payloads for long-term analysis, keep that path separate from Prometheus and bound it with explicit retention, encryption and delete workflows.

## 6. Operations

- **Telemetry retention:** decide what stays for days, weeks or months, and why.
- **Redaction:** verify redaction with canary secrets in synthetic traffic.
- **Sampling:** tail-sample to keep errors, slow traces, agent runs with many steps and flagged outputs; keep a small random baseline.
- **Threshold ownership:** assign owners for latency, cost and error thresholds.
- **Cost review:** compare cost per successful task, not only cost per request.
- **Warehouse hygiene:** monitor retention, compaction and deletion latency for any prompt-event warehouse.
- **Alerting:** alert on symptoms such as rising empty retrievals, tool failure rates, loop-count outliers and refusal spikes, not only CPU and memory.
- **Telemetry health:** monitor dropped spans, Collector queue saturation and ingestion lag.

Heuristics:

- If a cost spike appears, break it down by tenant, model and route before cutting global limits.
- If latency looks fine but quality falls, compare retrieval index, prompt version and tool path, then follow the regression workflow in [P08](./08-evaluation-quality.md).
- If an agent's token use jumps, inspect step counts and repeated tool calls in traces before changing models.
- If operators start putting prompt text into labels, stop and move that data to the retained event store instead.

## 7. Pitfalls

- **Only monitoring HTTP status and latency.** AI regressions often hide behind successful responses.
- **Logging raw prompts by default.** This creates avoidable privacy and secret-handling risk.
- **Treating telemetry as evaluation.** Dashboards show what happened, not whether it was right; pair with [P08](./08-evaluation-quality.md).
- **High-cardinality labels** (user, prompt text) that blow up the metrics store.
- **Keeping long prompt payloads only in dashboards.** Forensics and deletion workflows need a deliberate retained-event path, not screenshots and ad-hoc exports.
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
- [ ] Decision made on whether any prompt or tool payloads are retained outside the trace UI

### Production

- [ ] Trace IDs cross retrieval, tool, agent-handoff and async boundaries
- [ ] Redaction in the Collector, tested with canary data
- [ ] LLM trace UI deployed on OTLP; eval and feedback scores attachable to traces ([P08](./08-evaluation-quality.md))
- [ ] GenAI semantic-convention version pinned and documented
- [ ] Retained prompt-event analytics store selected, with bounded retention and delete workflow
- [ ] Cost dashboards joined with tenant, feature and model labels, with a versioned price table
- [ ] Runbooks exist for latency, cost and tool-failure regressions

### Enterprise

- [ ] Shared Collector patterns and attribute conventions standardised platform-wide
- [ ] Agent run tracing standard (root span, step spans, approval events) mandated for all agent frameworks
- [ ] Threshold ownership mapped to engineering, product and risk stakeholders
- [ ] Chargeback or showback fed from telemetry and aligned with [P10](./10-governance-finops.md)
- [ ] Long-term telemetry retention, privacy and legal review completed
- [ ] Prompt-event warehouse retention tiers, deletion SLAs and encryption controls reviewed
- [ ] Post-incident process exports failing traces into P08 regression datasets

## 9. Sources

Primary upstreams to re-check:

- [OpenTelemetry project](https://github.com/open-telemetry)
- [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai) and [core semantic conventions repository](https://github.com/open-telemetry/semantic-conventions)
- [OpenTelemetry Collector repository](https://github.com/open-telemetry/opentelemetry-collector)
- [Prometheus repository](https://github.com/prometheus/prometheus)
- [Grafana repository](https://github.com/grafana/grafana) and [Tempo repository](https://github.com/grafana/tempo)
- [Jaeger repository](https://github.com/jaegertracing/jaeger)
- [Opik repository](https://github.com/comet-ml/opik)
- [Langfuse repository](https://github.com/langfuse/langfuse) and [`LICENSE`](https://github.com/langfuse/langfuse/blob/main/LICENSE)
- [Arize Phoenix repository](https://github.com/Arize-ai/phoenix) and [`LICENSE`](https://github.com/Arize-ai/phoenix/blob/main/LICENSE)
- [OpenLIT repository](https://github.com/openlit/openlit)
- [OpenLLMetry repository](https://github.com/traceloop/openllmetry)
- [MLflow repository](https://github.com/mlflow/mlflow)
- [ClickHouse repository](https://github.com/ClickHouse/ClickHouse)
- [OpenCost repository](https://github.com/opencost/opencost)
- [Cloud Native AI whitepaper](https://github.com/cncf/tag-runtime/blob/main/wgs/cnai/whitepapers/cloudnativeai.md)

The original table facts were read on 2026-10-11 (**Opened**). Added rows and status corrections for Opik, OpenLIT, ClickHouse and current GenAI-conventions guidance were spot-checked on 2026-10-17 (**Opened**). Any remaining governance or ownership notes remain **Search-cited** where stated. Refresh with [Methodology §5](./00-methodology.md#5-snapshot-and-refresh).
