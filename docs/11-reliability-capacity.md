# P11. Reliability and performance

> **TL;DR** — Reliability for AI systems means more than uptime. It is the combination of clear SLOs, low tail latency, sensible caching, autoscaling for bursty GPU workloads, tested recovery and repeatable benchmarks. This pillar owns caching; routing fallbacks stay with [Model router](./02-ai-gateway-routing.md).

*Snapshot: 2026-10-11 · Related: [Methodology](./00-methodology.md) · [Model router](./02-ai-gateway-routing.md) · [Model serving](./03-model-serving.md) · [Observability and evaluation](./07-observability-evaluation.md)*

## 1. Why it matters

LLM traffic is volatile. A quiet system can become overloaded because of one prompt template, one popular feature launch or one tenant replaying large contexts. If you only watch average latency, you will miss the failures users actually feel.

This pillar owns:

- SLOs, SLIs and error-budget policy;
- latency decomposition such as TTFT, tokens per second and end-to-end response time;
- caching patterns: exact, semantic, prefix and KV reuse;
- pod and node autoscaling for bursty inference and agent workloads;
- recovery, backup and restore drills;
- load testing and benchmarks.

It does **not** own routing policy such as retries, hedging, fallbacks or canaries; those belong to [Model router](./02-ai-gateway-routing.md). It also does not own gateway quotas; those belong to [AI gateway](./02-ai-gateway-routing.md).

## 2. Capability map

| Capability | What good looks like | Default building block | Boundary |
|------------|----------------------|------------------------|----------|
| SLOs and error budgets | User-facing objectives exist for availability, TTFT and tail latency | Sloth or Pyrra | Telemetry collection belongs to [P07](./07-observability-evaluation.md) |
| Exact caching | Identical requests can reuse a cached answer with a clear TTL and invalidation policy | Gateway or application cache | Storage engine choice belongs to [P12](./12-foundation-infrastructure.md) |
| Semantic caching | Near-duplicate prompts can reuse an answer when staleness is acceptable | GPTCache | Use only where wrong-but-similar answers are low risk |
| Prefix and KV reuse | Shared prompt prefixes and long contexts do not recompute everything for every request | LMCache or engine-native prefix caching | Engine internals still belong to [P03](./03-model-serving.md) |
| Pod autoscaling | Worker replicas follow real load signals, not only CPU | KEDA | Queueing and scheduling still depend on [P03](./03-model-serving.md) and [P12](./12-foundation-infrastructure.md) |
| Node autoscaling | GPU and CPU node groups scale quickly enough for model mix and startup time | Karpenter or Cluster Autoscaler | Capacity planning remains an operational process |
| Backup and restore | Metadata stores, cluster objects and persistent volumes can be restored together | Velero | Object storage platform choice belongs to [P12](./12-foundation-infrastructure.md) |
| Benchmarking | Teams can compare prompt shapes, concurrency and model mixes before rollout | GuideLLM or k6 plus engine-specific benchmarks | Eval quality metrics still belong to [P07](./07-observability-evaluation.md) |
| Failure injection | Autoscaling, restore and degradation paths are exercised on purpose, not discovered in incidents | Chaos Mesh or Litmus | Run in staging first; routing fallbacks stay with [P02](./02-ai-gateway-routing.md) |

## 3. Tool comparison table

Licences, stars and archived flags were read from upstream repositories on 2026-10-11 (**Opened**); CNCF levels come from the landscape file (**Opened**); Valkey's foundation is **Unverified**. Picks were driven by licence, maintenance health and Kubernetes-native operability. Stars are rounded to 0.1k.

| Capability | Default pick | Licence label | Steward | 1-3 alternatives | Choose the default when… |
|------------|--------------|---------------|---------|------------------|--------------------------|
| SLO specification | **Sloth** | OSI (`Apache-2.0`; 2.6k★) | Sloth maintainers | Pyrra (`Apache-2.0`), hand-written Prometheus rules | you want SLO declarations rendered into alerts and recording rules from a small spec |
| SLO dashboard and alert workflow | **Pyrra** | OSI (`Apache-2.0`; 1.6k★) | Pyrra maintainers | Sloth (`Apache-2.0`), custom dashboards | you want a lightweight SLO UI and multi-window burn-rate workflows |
| Prefix and KV cache reuse | **LMCache** | OSI (`Apache-2.0`; 12.0k★) | LMCache maintainers | engine-native prefix cache, shared memory KV layers | long prompts or shared system prefixes dominate TTFT and cost |
| Semantic cache | **GPTCache** | OSI (`MIT`; 8.2k★) | GPTCache maintainers (Zilliz) | exact cache, provider-side cache features, gateway-native semantic caching | similar questions repeat often and the answer can tolerate bounded staleness; its last tagged release is August 2024, so confirm it fits your stack or prefer a gateway-native cache from [P02](./02-ai-gateway-routing.md) |
| Event-driven autoscaling | **KEDA** | OSI (`Apache-2.0`; 10.6k★) | KEDA project; CNCF Graduated | HPA with custom metrics, queue-native scalers | scale triggers come from queues, Prometheus or custom external metrics |
| Node autoscaling | **Karpenter** | OSI (`Apache-2.0`; 2.2k★) | Kubernetes SIGs (`kubernetes-sigs/karpenter`) | Cluster Autoscaler (`Apache-2.0`) | you need rapid provisioning and heterogeneous node shapes for mixed inference workloads; provider support varies, so check your cloud's provider |
| Backup and restore | **Velero** | OSI (`Apache-2.0`; 10.3k★) | Velero maintainers; CNCF Sandbox (repository now `velero-io/velero`) | storage snapshots, GitOps rebootstrap | cluster objects and persistent volumes must be restored in a coordinated way |
| End-to-end load testing | **k6** | OSI (`AGPL-3.0`; 31.9k★) | Grafana Labs | vLLM benchmark scripts (`Apache-2.0`), GuideLLM (see next row) | you want scriptable API load, streaming checks and CI-friendly performance gates |
| LLM-specific benchmarking | **GuideLLM** | OSI (`Apache-2.0`; 1.7k★) | vLLM project (`vllm-project`) | k6, vLLM benchmark scripts | you want to sweep concurrency and request rates against an OpenAI-compatible endpoint and report TTFT, inter-token latency and throughput without writing load scripts |
| Failure injection and recovery drills | **Chaos Mesh** | OSI (`Apache-2.0`; 7.9k★) | CNCF Incubating | Litmus (`Apache-2.0`; 5.7k★, CNCF Incubating), manual node and pod drain drills | you want Kubernetes-native fault experiments (pod, network, node, IO) to prove autoscaling, restore and degradation behaviour; choose Litmus when you prefer its experiment catalogue and workflow model |
| Shared exact-cache store (if the gateway needs one) | **Valkey** | OSI (`BSD-3-Clause`; 27.4k★) | Linux Foundation project | Redis 8 (RSALv2, SSPLv1 or AGPL-3.0, so not a permissive OSI default), in-process cache | a gateway or application exact cache needs a shared network store; avoid Redis 8 unless its AGPL option is acceptable |

Notes:

- GPTCache has had no tagged release since August 2024 although the repository still receives pushes; treat it as low-activity.
- GuideLLM is young (v0.8.x) and moving quickly; pin its version in CI.
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

## 6. Operations

Day-2 work should include:

- weekly error-budget review for the top user journeys;
- cache hit-rate review by endpoint and tenant;
- restore drills for cluster objects and persistent stores;
- pre-warm plans for known high-traffic launches or batch windows;
- capacity review for model startup time, image pull time and node provisioning delay;
- benchmark baselines kept with the release process, not in a forgotten notebook.

Useful reliability dashboards include:

- TTFT p50/p95/p99;
- tokens per second during decode;
- queue depth and admission wait time;
- exact, semantic and prefix-cache hit rates;
- restore success rate and recovery time objective drill results;
- autoscaler reaction time versus user-visible latency.

## 7. Pitfalls

- Chasing average latency while ignoring p95 or p99.
- Turning on semantic cache where answer freshness or precision matters more than speed.
- Scaling only on CPU or memory for GPU-heavy inference.
- Backing up data without ever testing restore.
- Using benchmark prompts that are too small, too clean or too unlike production traffic.
- Hiding overload behind retries instead of fixing admission control and capacity planning.
- Forgetting that cache invalidation must follow prompt, policy and corpus changes.

## 8. Checklist

### MVP

- [ ] Define one availability SLO and one latency SLO for the main API path.
- [ ] Measure TTFT, end-to-end latency and request volume.
- [ ] Add exact caching where responses are safely reusable.
- [ ] Use autoscaling signals tied to real request demand.
- [ ] Back up the minimum control-plane and metadata components needed to recover service.

### Production

- [ ] Track p95 or p99 latency by endpoint, tenant and model family.
- [ ] Add prefix or KV reuse for long shared prompts and contexts.
- [ ] Introduce semantic caching only on clearly low-risk flows with explicit TTLs.
- [ ] Run scheduled restore drills and performance regressions.
- [ ] Benchmark representative prompt shapes before major releases.

### Enterprise

- [ ] Operate error budgets with clear ownership and change gates.
- [ ] Model autoscaling against heterogeneous node pools and startup constraints.
- [ ] Pre-compute or pre-warm capacity for major events and batch windows.
- [ ] Keep multi-region or multi-cluster recovery plans with tested failover criteria.
- [ ] Tie performance results to release approval and cost review.

## 9. Sources

Useful upstream references for this pillar:

- [Sloth](https://github.com/slok/sloth)
- [Pyrra](https://github.com/pyrra-dev/pyrra)
- [LMCache](https://github.com/LMCache/LMCache)
- [GPTCache](https://github.com/zilliztech/GPTCache)
- [KEDA](https://keda.sh/)
- [Karpenter](https://karpenter.sh/)
- [Cluster Autoscaler](https://github.com/kubernetes/autoscaler)
- [Velero](https://velero.io/)
- [k6](https://k6.io/)
- [GuideLLM](https://github.com/vllm-project/guidellm)
- [Chaos Mesh](https://github.com/chaos-mesh/chaos-mesh) and [Litmus](https://github.com/litmuschaos/litmus)
- [Valkey](https://github.com/valkey-io/valkey)
- [vLLM benchmark code](https://github.com/vllm-project/vllm)
- [Methodology](./00-methodology.md) for evidence grades and re-verification commands
