# P11. Reliability, performance and capacity

> **TL;DR** — Reliability for AI systems means more than uptime. It is the combination of clear SLOs, low tail latency, sensible caching, autoscaling for bursty GPU workloads, accelerator capacity planning, tested recovery and repeatable benchmarks. This pillar owns caching and capacity; routing fallbacks stay with [P02](./02-ai-gateway-routing.md).

*Snapshot: 2026-10-11 · Related: [Methodology](./00-methodology.md) · [AI gateway and routing](./02-ai-gateway-routing.md) · [Model serving](./03-model-serving.md) · [Observability](./07-observability-evaluation.md) · [Governance and FinOps](./10-governance-finops.md)*

## 1. Why it matters

LLM traffic is volatile. A quiet system can become overloaded because of one prompt template, one popular feature launch or one tenant replaying large contexts. If you only watch average latency, you will miss the failures users actually feel.

This pillar owns:

- SLOs, SLIs and error-budget policy;
- latency decomposition such as TTFT, tokens per second and end-to-end response time;
- caching patterns: exact, semantic, prefix and KV reuse;
- pod and node autoscaling for bursty inference and agent workloads;
- recovery, backup and restore drills;
- accelerator capacity planning: GPU demand forecasting, reservations versus on-demand and spot, quotas, queueing and headroom, and bursting to API providers;
- cost-performance trade-offs (tokens per GPU-hour at an SLO);
- load testing and benchmarks.

It does **not** own routing policy such as retries, hedging, fallbacks or canaries; those belong to [P02](./02-ai-gateway-routing.md), which also owns gateway quotas. Cost budgets and showback belong to [P10](./10-governance-finops.md); this pillar supplies the capacity and cost-performance data they use.

## 2. Capability map

| Capability | What good looks like | Default building block | Boundary |
|------------|----------------------|------------------------|----------|
| SLOs and error budgets | User-facing objectives exist for availability, TTFT and tail latency | Sloth or Pyrra | Telemetry collection belongs to [P07](./07-observability-evaluation.md) |
| Exact caching | Identical requests can reuse a cached answer with a clear TTL and invalidation policy | Gateway or application cache | Storage engine choice belongs to [P12](./12-foundation-infrastructure.md) |
| Semantic caching | Near-duplicate prompts can reuse an answer when staleness is acceptable | GPTCache | Use only where wrong-but-similar answers are low risk |
| Prefix and KV reuse | Shared prompt prefixes and long contexts do not recompute everything for every request | LMCache or engine-native prefix caching | Engine internals still belong to [P03](./03-model-serving.md) |
| Pod autoscaling | Worker replicas follow real load signals, not only CPU | KEDA | Queueing and scheduling still depend on [P03](./03-model-serving.md) and [P12](./12-foundation-infrastructure.md) |
| Node autoscaling | GPU and CPU node groups scale quickly enough for model mix and startup time | Karpenter or Cluster Autoscaler | Forecasting and reservations are covered in the next rows |
| GPU demand forecasting | Peak and average accelerator demand per model, tenant and batch job is forecast from tokens per second and growth | Prometheus and DCGM data, plus a capacity model (spreadsheet or notebook) | Telemetry in [P07](./07-observability-evaluation.md); budgets in [P10](./10-governance-finops.md) |
| Capacity mix | Baseline load runs on reservations or commitments; spikes on on-demand or spot; interruptible jobs on spot | Cloud commitments plus node pools by price class | Commercial terms are a FinOps decision in [P10](./10-governance-finops.md) |
| Quota and queueing | Teams share GPUs fairly; batch and fine-tuning jobs queue instead of starving serving | Kueue | Fine-tuning workloads are defined in [P04](./04-model-lifecycle-adaptation.md) |
| Headroom and burst | A defined buffer absorbs spikes; overflow goes to API providers when local capacity is exhausted | Warm replicas plus a gateway overflow route | Routing and fallback rules live in [P02](./02-ai-gateway-routing.md) |
| Backup and restore | Metadata stores, cluster objects and persistent volumes can be restored together | Velero | Object storage platform choice belongs to [P12](./12-foundation-infrastructure.md) |
| Benchmarking | Teams can compare prompt shapes, concurrency and model mixes before rollout | GuideLLM or k6 plus engine-specific benchmarks | Eval quality metrics belong to [P08](./08-evaluation-quality.md) |
| Failure injection | Autoscaling, restore and degradation paths are exercised on purpose, not discovered in incidents | Chaos Mesh or Litmus | Run in staging first; routing fallbacks stay with [P02](./02-ai-gateway-routing.md) |

## 3. Tool comparison table

Licences, stars and archived flags were read from upstream repositories on 2026-10-11 and re-checked selectively in this review (**Opened**); CNCF levels come from the landscape file (**Opened**). Picks were driven by licence, maintenance health, operability and how directly a tool maps to measurable AI SLOs. Stars are rounded to 0.1k.

| Capability | Default pick | Licence label | Steward | 1-3 alternatives | Key trade-off | Choose the default when… | Do not choose the default when… |
|------------|--------------|---------------|---------|------------------|---------------|--------------------------|---------------------------------|
| SLO specification | **Sloth** | OSI (`Apache-2.0`; 2.6k★) | Sloth maintainers | Pyrra (`Apache-2.0`), hand-written Prometheus rules | compact SLO spec with generated rules, but no full workflow UI by itself | you want SLO declarations rendered into alerts and recording rules from a small spec | the team wants a visual SLO workflow first and will not own another spec layer |
| SLO dashboard and alert workflow | **Pyrra** | OSI (`Apache-2.0`; 1.6k★) | Pyrra maintainers | Sloth (`Apache-2.0`), custom dashboards | best lightweight burn-rate UI, but less focused on spec generation than Sloth | you want a lightweight SLO UI and multi-window burn-rate workflows | the SLO process already lives in Prometheus rules and Grafana and another UI adds no value |
| Prefix and KV cache reuse | **LMCache** | OSI (`Apache-2.0`; 12.0k★) | LMCache maintainers | engine-native prefix cache, shared memory KV layers | biggest gain on long prompts, but another cache layer to tune and invalidate | long prompts or shared system prefixes dominate TTFT and cost | request diversity is high enough that cache hit rates stay low |
| Semantic cache | **GPTCache** | OSI (`MIT`; 8.2k★) | GPTCache maintainers (Zilliz) | exact cache, provider-side cache features, gateway-native semantic caching | can cut repeated work fast, but stale or cross-tenant answers become a correctness and isolation risk | similar questions repeat often and the answer can tolerate bounded staleness; its last tagged release is August 2024, so confirm it fits your stack or prefer a gateway-native cache from [P02](./02-ai-gateway-routing.md) | precision, freshness or tenant isolation matter more than a semantic hit rate |
| Job queueing and GPU quota | **Kueue** | OSI (`Apache-2.0`; 3.1k★) | Kubernetes SIGs (`kubernetes-sigs/kueue`; SIG Scheduling and WG Batch) | Volcano (`Apache-2.0`, see [P12](./12-foundation-infrastructure.md)), native `ResourceQuota` only | fair sharing and borrowing are strong, but it is quota-oriented rather than a full HPC scheduler | several teams share a GPU pool and need quotas, borrowing between queues, fair sharing and preemption for batch, fine-tuning and eval jobs; online serving still scales through KEDA or HPA | you need deep gang scheduling, topology-aware batch semantics or GPU-sharing features closer to HPC practice |
| Event-driven autoscaling | **KEDA** | OSI (`Apache-2.0`; 10.6k★) | KEDA project; CNCF Graduated | HPA with custom metrics, queue-native scalers | easiest path to queue- and metric-driven scaling, but one more controller and scaler estate to own | scale triggers come from queues, Prometheus or custom external metrics | plain HPA on well-understood custom metrics already covers the load pattern |
| Node autoscaling | **Karpenter** | OSI (`Apache-2.0`; 2.2k★) | Kubernetes SIGs (`kubernetes-sigs/karpenter`) | Cluster Autoscaler (`Apache-2.0`) | faster heterogeneous node provisioning, but provider support is narrower than Cluster Autoscaler | you need rapid provisioning and heterogeneous node shapes for mixed inference workloads; provider support varies, so check your cloud's provider | you run on bare metal, unsupported clouds or fixed pools where Cluster Autoscaler or static capacity is simpler |
| Backup and restore | **Velero** | OSI (`Apache-2.0`; 10.3k★) | Velero maintainers; CNCF Sandbox (repository now `velero-io/velero`) | storage snapshots, GitOps rebootstrap | covers cluster objects plus volumes, but restore drills still require storage-specific validation | cluster objects and persistent volumes must be restored in a coordinated way | all critical state already lives in managed services with stronger provider-native restore workflows |
| End-to-end load testing | **k6** | OSI (`AGPL-3.0`; 31.9k★) | Grafana Labs | vLLM benchmark scripts (`Apache-2.0`), GuideLLM (see next row) | richest HTTP and CI scripting, but AGPL and custom scripting are heavier than purpose-built LLM runners | you want scriptable API load, streaming checks and CI-friendly performance gates | a focused LLM endpoint benchmark with little custom scripting is the real need |
| LLM-specific benchmarking | **GuideLLM** | OSI (`Apache-2.0`; 1.7k★) | vLLM project (`vllm-project`) | k6, vLLM benchmark scripts, LLMPerf (`Apache-2.0`, archived) | fastest route to TTFT and throughput sweeps, but narrower than general load tools | you want to sweep concurrency and request rates against an OpenAI-compatible endpoint and report TTFT, inter-token latency and throughput without writing load scripts | you need full business-flow scripting, browser/API mixes or benchmark coverage beyond LLM endpoints |
| Failure injection and recovery drills | **Chaos Mesh** | OSI (`Apache-2.0`; 7.9k★) | CNCF Incubating | Litmus (`Apache-2.0`; 5.7k★, CNCF Incubating), manual node and pod drain drills | rich Kubernetes fault injection, but another controller with real blast-radius risk if misused | you want Kubernetes-native fault experiments (pod, network, node, IO) to prove autoscaling, restore and degradation behaviour; choose Litmus when you prefer its experiment catalogue and workflow model | a small team can prove its key failure paths with disciplined manual drills instead of running a chaos platform |
| Shared exact-cache store (if the gateway needs one) | **Valkey** | OSI (`BSD-3-Clause`; 27.4k★) | Linux Foundation project | Redis 8 (RSALv2, SSPLv1 or AGPL-3.0, so not a permissive OSI default), in-process cache | strong shared-cache default with a clean licence story, but one more network hop and stateful service | a gateway or application exact cache needs a shared network store; avoid Redis 8 unless its AGPL option is acceptable | the cache is single-process or ephemeral and a remote store adds more latency than it saves |

Notes:

- GPTCache has had no tagged release since August 2024 although the repository still receives pushes; treat it as low-activity.
- GuideLLM is young (v0.8.x) and moving quickly; pin its version in CI.
- LLMPerf (`ray-project/llmperf`) is now **archived**; it is still useful as a historical benchmark reference, but not a default for new work.
- AGPL is OSI-approved, but it has stronger copyleft implications than Apache-2.0 or MIT. Make sure that is acceptable in your environment.

## 4. Reference design

A strong default design uses layered controls:

1. Define a small set of user-facing SLOs: availability, TTFT and end-to-end latency for the main API paths.
2. Split latency into gateway time, retrieval time, queue time, prefill time, decode time and tool time.
3. Apply the cheapest cache first: exact cache, then semantic cache where safe, then prefix or KV reuse close to the inference engine.
4. Scale pods from meaningful demand signals such as queue depth, in-flight requests and token throughput.
5. Scale nodes from pending capacity, startup times and model-placement constraints.
6. Backup metadata stores and cluster state, then run restore drills often enough that the runbook stays real.
7. Benchmark representative prompt shapes before and after major model, prompt or routing changes.
8. Plan accelerator capacity: forecast demand per model and tenant, cover the baseline with reservations, serve spikes from on-demand or spot, queue interruptible jobs through Kueue and keep explicit headroom.
9. Define the overflow path: when local GPUs are saturated, the gateway ([P02](./02-ai-gateway-routing.md)) sends eligible traffic to an API provider, subject to data-class policy ([P09](./09-security-safety.md)) and a budget cap ([P10](./10-governance-finops.md)).

The outcome you want is simple: predictable latency under normal load, graceful degradation under burst and a known recovery path after failure.

## 5. Implementation guide

A minimal Sloth declaration can make the reliability target explicit:

```yaml
version: prometheus/v1
service: ai-gateway
slos:
  - name: request-availability
    objective: 99.9
    sli:
      events:
        error_query: sum(rate(http_requests_total{job="ai-gateway",code=~"5.."}[{{.window}}]))
        total_query: sum(rate(http_requests_total{job="ai-gateway"}[{{.window}}]))
```

Implementation advice:

- Track **TTFT** and **stream completion time** separately; streaming hides bad tail latency if you only watch first token.
- Start semantic cache rollout on narrow, low-risk endpoints such as FAQ-style assistants, not on high-stakes workflows.
- Tie cache keys to the system prompt, retrieval corpus version and model family so you do not serve stale answers after a major change.
- Scale from queue and concurrency signals before CPU. GPU inference often saturates long before CPU metrics show stress.
- Run load tests with realistic prompt lengths and streaming behaviour; synthetic short prompts can produce dangerously optimistic numbers.

### Capacity planning

- **Forecast** demand in tokens per second (input and output separately) per model and tenant. Convert to GPUs with a measured tokens-per-GPU figure at your SLO from GuideLLM runs, not vendor peak numbers.
- **Mix:** commit (reservation or savings plan) only to the steady baseline, for example the p50 of the last 4 to 8 weeks; use on-demand for diurnal peaks; use spot only for interruptible work such as batch eval, embedding backfills and fine-tuning, with checkpointing.
- **Quota:** request cloud GPU quota well ahead of launches, since approval and delivery can take weeks; track quota as a risk item per region and SKU.
- **Headroom:** keep a stated buffer (for example 20 to 30 percent of peak, tuned from your startup time and burst shape) and warm replicas for models with slow start.
- **Queues:** give each team a Kueue `ClusterQueue` with a nominal GPU quota, allow borrowing, and let batch yield to serving.
- **Burst to providers:** pre-approve overflow routes in the gateway for non-sensitive data classes, with a spend cap; test them in game days.
- **Cost-performance:** report tokens per GPU-hour at the SLO per model and engine configuration; feed it to [P10](./10-governance-finops.md) unit economics and to model-selection decisions in [P04](./04-model-lifecycle-adaptation.md).

## 6. Operations

Day-2 work should include:

- weekly error-budget review for the top user journeys;
- cache hit-rate review by endpoint and tenant;
- restore drills for cluster objects and persistent stores;
- pre-warm plans for known high-traffic launches or batch windows;
- capacity review for model startup time, image pull time and node provisioning delay;
- monthly capacity review: forecast versus actual, quota status, reservation coverage and utilisation, spot interruption rate;
- benchmark baselines kept with the release process, not in a forgotten notebook.

Useful reliability dashboards include:

- TTFT p50/p95/p99;
- tokens per second during decode;
- queue depth and admission wait time;
- exact, semantic and prefix-cache hit rates;
- restore success rate and recovery time objective drill results;
- autoscaler reaction time versus user-visible latency;
- GPU utilisation, queue wait per team and reserved versus used capacity;
- share of traffic served by overflow providers.

## 7. Pitfalls

- Chasing average latency while ignoring p95 or p99.
- Turning on semantic cache where answer freshness or precision matters more than speed.
- Sharing one semantic cache across tenants or policy domains without isolation-aware keys.
- Scaling only on CPU or memory for GPU-heavy inference.
- Backing up data without ever testing restore.
- Using benchmark prompts that are too small, too clean or too unlike production traffic.
- Hiding overload behind retries instead of fixing admission control and capacity planning.
- Buying reservations for peak demand and paying for idle GPUs the rest of the day.
- Planning capacity from vendor peak throughput instead of measured tokens per GPU at your SLO.
- Leaving quota requests until launch week.
- An overflow route that was never tested or that ignores data-class policy.
- Forgetting that cache invalidation must follow prompt, policy and corpus changes.

## 8. Checklist

### MVP

- [ ] Define one availability SLO and one latency SLO for the main API path.
- [ ] Measure TTFT, end-to-end latency and request volume.
- [ ] Add exact caching where responses are safely reusable.
- [ ] Use autoscaling signals tied to real request demand.
- [ ] Back up the minimum control-plane and metadata components needed to recover service.
- [ ] Record current GPU count, utilisation and a headroom target.

### Production

- [ ] Track p95 or p99 latency by endpoint, tenant and model family.
- [ ] Add prefix or KV reuse for long shared prompts and contexts.
- [ ] Introduce semantic caching only on clearly low-risk flows with explicit TTLs.
- [ ] Isolate semantic and exact cache keys by tenant, model alias and prompt or corpus version.
- [ ] Run scheduled restore drills and performance regressions.
- [ ] Benchmark representative prompt shapes before major releases.
- [ ] GPU demand forecast refreshed monthly; quota requested ahead of launches.
- [ ] Kueue or equivalent quotas separate serving from batch and fine-tuning.

### Enterprise

- [ ] Operate error budgets with clear ownership and change gates.
- [ ] Model autoscaling against heterogeneous node pools and startup constraints.
- [ ] Pre-compute or pre-warm capacity for major events and batch windows.
- [ ] Keep multi-region or multi-cluster recovery plans with tested failover criteria.
- [ ] Tie performance results to release approval and cost review.
- [ ] Reservation and spot mix reviewed with FinOps ([P10](./10-governance-finops.md)); coverage and utilisation targets set.
- [ ] Tested overflow route to API providers with data-class and budget limits.

## 9. Sources

Useful upstream references for this pillar:

- [Sloth](https://github.com/slok/sloth)
- [Pyrra](https://github.com/pyrra-dev/pyrra)
- [LMCache](https://github.com/LMCache/LMCache)
- [GPTCache](https://github.com/zilliztech/GPTCache)
- [KEDA](https://keda.sh/)
- [Karpenter](https://karpenter.sh/)
- [Kueue](https://github.com/kubernetes-sigs/kueue)
- [Cluster Autoscaler](https://github.com/kubernetes/autoscaler)
- [Velero](https://velero.io/)
- [k6](https://k6.io/)
- [GuideLLM](https://github.com/vllm-project/guidellm)
- [LLMPerf](https://github.com/ray-project/llmperf) (archived)
- [Chaos Mesh](https://github.com/chaos-mesh/chaos-mesh) and [Litmus](https://github.com/litmuschaos/litmus)
- [Valkey](https://github.com/valkey-io/valkey)
- [vLLM benchmark code](https://github.com/vllm-project/vllm)
- [Methodology](./00-methodology.md) for evidence grades and re-verification commands
