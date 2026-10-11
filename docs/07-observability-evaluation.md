# P07. Observability and evaluation

> **TL;DR** — Instrument AI traffic as a first-class production workload: traces, metrics, logs and cost signals on one side; repeatable offline and online evaluations on the other. OpenTelemetry is the foundation, Prometheus and Grafana are the default metrics path, and application evals should gate platform changes before users discover regressions.

*Snapshot: 2026-10-11 · Related: [AI gateway](./02-ai-gateway-routing.md) · [Model router](./02-ai-gateway-routing.md) · [Governance, risk and compliance](./10-governance-finops.md) · [Reliability and performance](./11-reliability-capacity.md)*

## 1. Why it matters

Classic service telemetry is necessary but not sufficient for AI systems. You need to know not only **whether** a request succeeded, but also:

- which model, prompt template, retrieval context and tool calls were involved
- how much latency came from routing, retrieval, inference and tools
- whether quality improved or regressed after a change
- which tenant, team or feature consumed the tokens and cost

This pillar matters because AI failures are often silent. A model can return HTTP 200 and still be wrong, unsafe or too expensive.

Ownership boundaries:

- **Fallback policies, retries and routing decisions** are owned by [P02](./02-ai-gateway-routing.md), but their outcomes must be observed here.
- **Caching strategies and performance tuning** are owned by [P11](./11-reliability-capacity.md), but their effect must be visible here.
- **Guardrail policy and safety controls** are owned by [P09](./09-security-safety.md), but their alerts and false positives should appear in telemetry here.

## 2. Capability map

| Capability | What it must do | Notes |
|------------|-----------------|-------|
| **Trace model requests** | Correlate gateway, router, application, retrieval, tool and model spans | One trace should survive asynchronous hops where possible |
| **Collect service metrics** | Export latency, throughput, errors, saturation and queue metrics | AI-specific metrics complement normal service SLIs; they do not replace them |
| **Record prompt and response metadata safely** | Keep enough detail to debug, while redacting secrets and sensitive data | Raw payload retention should be deliberate and limited |
| **Track cost and usage** | Attribute requests, tokens and model spend to team, tenant, feature or budget | Gateway identifiers from [P02](./02-ai-gateway-routing.md) make this much easier |
| **Run offline evaluations** | Compare prompts, retrieval settings, models and tool policies before release | Golden datasets must be versioned like code |
| **Watch online quality signals** | Monitor user feedback, citation quality, task success and drift | Use human review for high-risk paths; judge models are only helpers |
| **Support release gates** | Fail or pause rollouts when regression thresholds are crossed | This applies to prompt, parser, routing and model changes alike |

## 3. Tool comparison

Licences, stars (rounded to 0.1k), push dates and archived flags were read from upstream repositories on 2026-10-11 (**Opened**); CNCF levels come from the CNCF landscape file (**Opened**). Re-check with [Methodology §5](./00-methodology.md#5-snapshot-and-refresh). The signals that drove the picks are interoperability (OpenTelemetry first), licence (open-core and source-available boundaries called out) and adoption.

| Capability | Default pick | Licence label | Steward | Alternatives | Choose X when… |
|------------|--------------|---------------|---------|--------------|----------------|
| **Telemetry standard and SDK shape** | **OpenTelemetry** | `OSI` ✅ (Apache-2.0) | OpenTelemetry / CNCF Graduated | OpenLIT (`OSI` ✅ Apache-2.0), vendor SDKs | Choose **OpenTelemetry** when you want vendor-neutral traces, metrics and logs that survive tool changes |
| **Time-series metrics store** | **Prometheus** (66.5k★) | `OSI` ✅ (Apache-2.0) | Prometheus / CNCF Graduated | OpenTelemetry Collector export path, managed metrics backends, OpenCost for cost views | Choose **Prometheus** when Kubernetes and service-level metrics are already core platform concerns |
| **Distributed trace backend** | **Jaeger** (23.3k★) | `OSI` ✅ (Apache-2.0) | Jaeger / CNCF Graduated | Grafana Tempo (**Unverified**: licence and status not checked), Langfuse or Phoenix for LLM-specific views | Choose **Jaeger** when you need a general OTLP trace store for gateway, retrieval and tool spans next to the LLM-specific UI |
| **Dashboards and exploratory analysis** | **Grafana** (77.2k★) | `OSI` ✅ (AGPL-3.0) | Grafana Labs | Langfuse UI (`Open-core` ⚠️), Arize Phoenix (`Source-available` ⚠️ Elastic-2.0) | Choose **Grafana** when you want one shared dashboard surface across AI and non-AI services and you accept AGPL obligations |
| **LLM trace and prompt analytics** | **Langfuse** (35.6k★) | `Open-core` ⚠️ (MIT outside the `ee/`, `web/src/ee/` and `worker/src/ee/` directories, which carry a separate licence; copyright held by ClickHouse, Inc.) | Langfuse, now part of ClickHouse (search-cited acquisition; copyright line read from `LICENSE`) | OpenLIT (`OSI` ✅ Apache-2.0), Arize Phoenix (`Source-available` ⚠️ Elastic-2.0; 11.8k★), MLflow tracing (`OSI` ✅ Apache-2.0; 28.3k★) | Choose **Langfuse** when you want a purpose-built LLM observability UI with prompt management and the `ee/` boundary is acceptable; confirm which features you need are outside `ee/` |
| **Open instrumentation starter for LLM apps** | **OpenLLMetry** (7.5k★) | `OSI` ✅ (Apache-2.0) | Traceloop maintainers | OpenLIT (`OSI` ✅ Apache-2.0; 2.8k★), OpenTelemetry GenAI contrib instrumentations | Choose **OpenLLMetry** when you want OTel-based auto-instrumentation of LLM and vector-store SDKs; choose **OpenLIT** when you also want its bundled dashboards and GPU monitoring. Both emit plain OTLP |
| **Application and prompt regression testing** | **promptfoo** (25.9k★) | `OSI` ✅ (MIT) | promptfoo maintainers | DeepEval (`OSI` ✅ Apache-2.0; 18.7k★, pytest-style), Langfuse eval workflows (`Open-core` ⚠️) | Choose **promptfoo** when the release question is "did this prompt, workflow or policy still satisfy our assertions?"; choose **DeepEval** when your tests already live in pytest |
| **Model benchmark harness** | **lm-eval-harness** (14.2k★) | `OSI` ✅ (MIT) | EleutherAI maintainers | Inspect AI (`OSI` ✅ MIT; 3.0k★, UK AI Security Institute, agentic and safety evals), promptfoo (`OSI` ✅ MIT) | Choose **lm-eval-harness** when you need benchmark-style model comparison rather than application-specific workflow grading; choose **Inspect** for agent, tool-use and safety evaluations |
| **RAG and answer-quality metrics** | **Ragas** (16.0k★) | `OSI` ✅ (Apache-2.0) | Ragas maintainers (repository now `vibrantlabsai/ragas`; latest release January 2026, last push February 2026, so activity is slower than peers) | DeepEval (`OSI` ✅ Apache-2.0), promptfoo (`OSI` ✅ MIT), Arize Phoenix evals (`Source-available` ⚠️ Elastic-2.0) | Choose **Ragas** when retrieval quality, answer faithfulness and context use are the main questions; fall back to DeepEval if maintenance stalls |
| **Cost allocation** | **OpenCost** (6.8k★) | `OSI` ✅ (Apache-2.0) | OpenCost / CNCF Incubating | Prometheus recording rules, Grafana dashboards, internal chargeback models | Choose **OpenCost** when you want Kubernetes cost allocation joined to model usage and tenant views |

Notes:

- Langfuse's open-core boundary and Phoenix's Elastic-2.0 licence (no offering it as a managed service) are the two licence risks in this table; the Apache-2.0 alternatives above cover tracing and evals without them.
- Instrumentation libraries emit OTLP, so the trace UI can be swapped without re-instrumenting.

Default platform stance:

1. **OpenTelemetry first.** Everything else should either consume OTel data or complement it.
2. **Prometheus + Grafana** remain the default shared metrics path for platform teams.
3. **Use one application-eval runner and one benchmark runner.** Do not conflate prompt regression tests with base-model benchmarks.
4. **Make cost attribution a design input, not a finance afterthought.**

## 4. Reference design

A practical reference design combines production telemetry and release-time evaluation:

1. **Instrumentation in the gateway, application, retrieval service, tool runners and model-serving path** emits OTel spans and metrics.
2. **OpenTelemetry Collector** receives OTLP data, applies redaction or attribute transforms where needed, and fans out to metrics, traces and log backends.
3. **Prometheus** scrapes service and infrastructure metrics; **Grafana** overlays service SLIs with AI-specific ones such as TTFT, token throughput and cost per request.
4. **Specialised LLM observability UI** such as Langfuse or Phoenix, fed by OpenLLMetry or OpenLIT instrumentation, can sit beside the shared telemetry plane, not instead of it.
5. **Evaluation pipeline** runs from CI or a controlled release workflow against versioned datasets and expected assertions.
6. **Human review loop** samples high-risk outputs, calibrates judge-model scores and approves threshold changes.
7. **Cost view** joins tenant, feature and model labels from [P02](./02-ai-gateway-routing.md) and [P02](./02-ai-gateway-routing.md) with infrastructure signals and chargeback tags.

Design rules:

- **One request needs one stable identifier across all hops.**
- **Logs should describe payload handling policy, not become an accidental data lake of raw prompts.**
- **Evaluation datasets are production assets.** Version them, review them and retire stale ones deliberately.
- **Judge-model scores are secondary evidence.** Human review remains the calibration anchor.

## 5. Implementation guide

### 5.1 Start with span boundaries you can explain

Trace at least these steps separately:

- gateway admission
- routing decision
- retrieval request
- model invocation
- tool calls
- response assembly

If operators cannot say where latency lives, the trace model is still too coarse.

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

### 5.3 Decide what to label

Standard labels should include:

- tenant or team
- product or feature
- model name
- route or policy name
- prompt or workflow version
- retrieval index version, where applicable

Prefer the published OpenTelemetry semantic conventions, including the GenAI attributes where your SDKs support them. The GenAI conventions were still evolving at the snapshot (**Unverified**: not re-checked); pin the semantic-conventions version you emit and refresh it from [Methodology §5](./00-methodology.md#5-snapshot-and-refresh).

Without these labels, cost and regression analysis become anecdotal.

### 5.4 Separate evaluation types

Use different tracks for different questions:

- **Regression tests:** did this app still do the expected task?
- **RAG quality tests:** did retrieval improve citations and faithfulness?
- **Benchmark-style model tests:** is model A generally stronger than model B on a known suite?
- **Online review:** are real users seeing quality drift or safety issues?

### 5.5 Gate changes, not only releases

Run evaluations for prompt edits, routing policy changes, parser changes, embedding changes and model upgrades. AI regressions often come from the plumbing around the model, not the model alone.

## 6. Operations

Operate observability and evaluation as part of platform reliability:

- **Telemetry retention:** decide what stays for days, weeks or months, and why.
- **Redaction:** classify prompts, tool payloads and outputs before storing them.
- **Sampling:** keep enough high-value traces for debugging without storing every raw payload forever.
- **Threshold ownership:** assign owners for latency, cost and quality thresholds.
- **Dataset curation:** remove stale examples and add new failure cases after incidents.
- **Cost review:** compare cost per successful task, not only cost per request.
- **Alerting:** alert on user-impacting symptoms such as rising empty retrievals, tool failure rates or judge-score collapse, not only CPU and memory.

Operational heuristics:

- If a cost spike appears, break it down by tenant, model and route before cutting global limits.
- If latency looks fine but quality falls, compare retrieval index, prompt version and tool path before swapping models.
- If a judge score drifts upward while user complaints rise, recalibrate the evaluation set or reviewer process.

## 7. Pitfalls

- **Only monitoring HTTP status and latency.** AI regressions often hide behind successful responses.
- **Logging raw prompts by default.** This creates avoidable privacy and secret-handling risk.
- **Using one score for all quality questions.** Faithfulness, task success and user satisfaction are different signals.
- **Treating benchmark harnesses as application evals.** A good benchmark score does not prove your workflow works.
- **Skipping baselines after non-model changes.** Parser, chunking, routing and tool changes can all alter user outcomes.
- **No denominator for cost.** Spend per request is weaker than spend per successful task or per accepted answer.
- **Letting dashboards replace runbooks.** Operators still need clear interpretations and response steps.

## 8. Checklist

### MVP

- [ ] OpenTelemetry instrumentation added to gateway, application and model-call path
- [ ] Prometheus scraping core service metrics and AI-specific latency metrics
- [ ] Grafana dashboard for request rate, error rate, TTFT and total latency
- [ ] One small regression dataset and one repeatable eval runner in CI
- [ ] Basic usage and cost labels attached to requests

### Production

- [ ] Trace IDs cross retrieval, tool and async boundaries
- [ ] Redaction policy defined before storing prompts or tool payloads
- [ ] Quality gates cover prompt, model and routing changes
- [ ] Online feedback or human review loop calibrated against offline scores
- [ ] Cost dashboards joined with tenant, feature and model labels
- [ ] Runbooks exist for latency, quality and cost regressions

### Enterprise

- [ ] Shared OTel collector patterns and attribute conventions standardised platform-wide
- [ ] Application evals, benchmark suites and safety review loops kept separate but linked
- [ ] Threshold ownership mapped to engineering, product and risk stakeholders
- [ ] Chargeback or showback process aligned with [P10](./10-governance-finops.md)
- [ ] Long-term telemetry retention, privacy and legal review completed
- [ ] Post-incident process feeds new eval cases back into the regression datasets

## 9. Sources

Primary upstreams to re-check:

- [OpenTelemetry project](https://github.com/open-telemetry)
- [OpenTelemetry semantic conventions repository](https://github.com/open-telemetry/semantic-conventions)
- [Prometheus repository](https://github.com/prometheus/prometheus)
- [Grafana repository](https://github.com/grafana/grafana)
- [Langfuse repository](https://github.com/langfuse/langfuse)
- [Arize Phoenix repository](https://github.com/Arize-ai/phoenix)
- [OpenLIT repository](https://github.com/openlit/openlit)
- [OpenLLMetry repository](https://github.com/traceloop/openllmetry)
- [MLflow repository](https://github.com/mlflow/mlflow)
- [Jaeger repository](https://github.com/jaegertracing/jaeger)
- [DeepEval repository](https://github.com/confident-ai/deepeval)
- [Inspect AI repository](https://github.com/UKGovernmentBEIS/inspect_ai)
- [Langfuse `LICENSE`](https://github.com/langfuse/langfuse/blob/main/LICENSE) and [Phoenix `LICENSE`](https://github.com/Arize-ai/phoenix/blob/main/LICENSE)
- [promptfoo repository](https://github.com/promptfoo/promptfoo)
- [lm-evaluation-harness repository](https://github.com/EleutherAI/lm-evaluation-harness)
- [Ragas repository](https://github.com/vibrantlabsai/ragas)
- [OpenCost repository](https://github.com/opencost/opencost)
- [Cloud Native AI whitepaper](https://github.com/cncf/tag-runtime/blob/main/wgs/cnai/whitepapers/cloudnativeai.md)

Licences, stars and CNCF levels were **Opened** on 2026-10-11; the Langfuse acquisition is **Search-cited**. Refresh with [Methodology §5](./00-methodology.md#5-snapshot-and-refresh).
