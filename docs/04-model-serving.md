# Model serving

> **TL;DR** — Model serving is the runtime layer that turns model artifacts and scarce accelerators into stable, observable inference endpoints. The best default for a Kubernetes-first platform is a serving control plane such as KServe paired with a proven engine such as vLLM, while keeping routing, caching and artifact hardening in their owning pillars.

*Snapshot: 2026-10-11 · Related: [Model router](./03-model-router.md) · [Reliability and performance](./10-reliability-performance.md) · [Hardening](./11-hardening.md) · [Foundation and delivery](./12-foundation-infrastructure.md) · [Tool landscape](./14-tool-landscape.md)*

## 1. Why it matters

The model-serving layer is where platform promises meet physics. A platform may expose elegant APIs and smart routing, but users still feel cold starts, GPU fragmentation, poor batching and overloaded runtimes.

This pillar owns the parts that actually run inference:

- inference engines and model runtimes;
- Kubernetes-native serving control planes;
- GPU and accelerator placement concerns relevant to inference;
- autoscaling inputs and rollout patterns for model endpoints; and
- the operational envelope around model artifacts, warm capacity and endpoint health.

This pillar does **not** own:

- **route selection, retries and fallbacks** → [P03 Model router](./03-model-router.md);
- **caching and hedging** → [P10 Reliability and performance](./10-reliability-performance.md);
- **artifact signing, tenant isolation and SBOM policy** → [P11 Hardening](./11-hardening.md).

## 2. Capability map

| Capability | What good looks like | Owner boundary |
|------------|----------------------|----------------|
| Runtime control plane | A controller can create, scale, update and retire inference endpoints declaratively | P04 owns serving control planes |
| Inference engine | The engine exposes an OpenAI-compatible or similar endpoint, batches work and uses accelerator memory efficiently | P04 owns engine choice |
| Artifact handling | Models and adapters are fetched from approved storage and mounted predictably | P04 owns delivery mechanics; [P11](./11-hardening.md) owns trust policy |
| Accelerator placement | GPU requests, node selection and scheduling choices fit the workload shape | P04 owns the serving-side requirements; [P12](./12-foundation-infrastructure.md) owns base cluster enablement |
| Autoscaling | Scale decisions use useful signals such as concurrency, queue depth or custom metrics | P04 owns endpoint scaling inputs |
| Rollouts | New weights, engines or serving configs can be promoted and rolled back safely | P04 owns endpoint rollout mechanics |
| Disaggregated inference | Prefill and decode can be split when that architecture is justified | P04 owns the serving architecture; P03 consumes the exposed routing signals |

## 3. Tool comparison

Licence labels and steward names below are snapshot facts and therefore **Unverified (not re-checked in this edit; re-verify with the commands in [Methodology §5](./00-methodology.md#5-snapshot-and-refresh))**.

| Capability | Licence label | Steward | Default pick | Alternatives | Choose X when… |
|------------|---------------|---------|--------------|--------------|----------------|
| Kubernetes serving control plane | OSI ✅ Apache-2.0 | KServe community | **KServe** | llm-d; plain Kubernetes Deployments | Choose KServe when you want a general, Kubernetes-native serving layer that can standardise rollout, autoscaling and endpoint lifecycle across more than one engine. KServe's CNCF maturity level is time-sensitive — **Unverified (not re-checked in this edit; re-verify with [Methodology §5](./00-methodology.md#5-snapshot-and-refresh))**. |
| High-throughput LLM engine | OSI ✅ Apache-2.0 | vLLM project | **vLLM** | SGLang; Hugging Face TGI; NVIDIA Dynamo | Choose vLLM when throughput, batching and broad ecosystem support matter more than specialised runtime semantics. It is the most balanced default for shared GPU clusters. |
| Inference-aware cluster path | OSI ✅ Apache-2.0 | llm-d community | llm-d | KServe; Gateway API Inference Extension | Choose llm-d when disaggregated inference, scheduler-aware routing signals and tighter coordination between serving and routing are primary design goals rather than later optimisations. |
| Edge and local packaging | OSI ✅ MIT | Ollama | Ollama | llama.cpp | Choose Ollama when developers need a simple local or small-node packaging layer. Choose llama.cpp when you need maximal portability and direct control over GGUF-style CPU or edge inference. |

The "maintenance mode" caveat sometimes attached to Hugging Face TGI is **Unverified (not re-checked in this edit; re-verify with [Methodology §5](./00-methodology.md#5-snapshot-and-refresh))** and should not be repeated blindly.

## 4. Reference design

A solid serving design usually has five parts.

1. **Approved model storage.** Model weights, tokenizer files and adapters live in object storage or a registry-backed distribution path.
2. **Serving control plane.** KServe or a similar layer creates and updates endpoints declaratively.
3. **Inference engine pods.** vLLM, SGLang, TGI, Dynamo or another engine loads the model and serves traffic.
4. **Accelerator-aware scheduling.** Nodes, GPU classes and autoscaling policies fit the memory and throughput profile of each endpoint.
5. **Feedback to the router.** Health, queue depth and warm-capacity signals flow to [P03](./03-model-router.md).

A common progression is:

- **MVP:** one engine on dedicated GPU nodes, exposed through one stable Service;
- **Production:** a serving controller plus horizontal scale, warm replicas and explicit rollout policy;
- **Enterprise:** multiple pools, mixed engines, disaggregated inference where justified, and route-aware telemetry back to P03.

Keep these boundaries clear:

- model artifact approval is not the same as model runtime deployment;
- routing signals may come from serving, but routing policy still belongs in [P03](./03-model-router.md);
- KV-cache and semantic caching are performance concerns in [P10](./10-reliability-performance.md), even though engines expose some of the mechanics;
- isolation and provenance controls belong in [P11](./11-hardening.md).

## 5. Implementation guide

Start with a plain runtime deployment you can observe, then wrap it in more platform machinery.

### 5.1 A minimal vLLM deployment on Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vllm-llama-8b
  namespace: ai-platform
spec:
  replicas: 1
  selector:
    matchLabels:
      app: vllm-llama-8b
  template:
    metadata:
      labels:
        app: vllm-llama-8b
    spec:
      containers:
        - name: vllm
          image: vllm/vllm-openai:latest
          args:
            - --model=/models/llama-8b
            - --served-model-name=llama-8b
          ports:
            - containerPort: 8000
          resources:
            limits:
              nvidia.com/gpu: "1"
```

This is intentionally plain Kubernetes. If you later adopt KServe, point its endpoint lifecycle at the same style of runtime container.

### 5.2 Expose the runtime internally

```yaml
apiVersion: v1
kind: Service
metadata:
  name: vllm-llama-8b
  namespace: ai-platform
spec:
  selector:
    app: vllm-llama-8b
  ports:
    - port: 80
      targetPort: 8000
```

### 5.3 Verify the endpoint before adding routing layers

```bash
kubectl rollout status deploy/vllm-llama-8b -n ai-platform
kubectl get svc vllm-llama-8b -n ai-platform
```

Before adding canaries, fallbacks or burst paths, confirm the runtime is stable on its own: model load time, memory fit, first-token latency and steady-state throughput.

## 6. Operations

Serving incidents often look like routing incidents from the outside. Distinguish them quickly.

| Operational concern | What to watch |
|---------------------|---------------|
| Cold starts | Model download time, weight load time, tokenizer init time |
| GPU saturation | Memory pressure, queue depth, degraded TTFT |
| Fragmentation | Too many endpoints each reserving a little GPU and wasting the rest |
| Rollout regressions | New weights or engine flags changing latency or output quality |
| Artifact drift | One replica serving different weights or tokenizer assets from another |
| Autoscaling lag | Traffic rising faster than warm capacity or node scale-out |

Operational habits that pay off:

- benchmark with the prompt lengths and output lengths you actually expect;
- record the exact engine image, model artifact path and runtime flags for every deployment;
- separate development models from shared production pools;
- maintain at least one known-good rollback image or runtime spec; and
- alert on queue depth, TTFT and error rate together, not on CPU alone.

## 7. Pitfalls

- **Choosing an engine by popularity alone.** The right engine depends on model family, prompt shape and hardware mix.
- **Ignoring warm capacity.** A single replica that loads slowly can make an otherwise healthy platform feel broken.
- **Autoscaling on the wrong signal.** CPU often says little about a saturated GPU-backed model server.
- **Treating all GPUs as interchangeable.** Memory size, interconnect and node topology affect what can be served efficiently.
- **Skipping artifact hygiene.** Pulling arbitrary model files may solve a demo and break your hardening story.
- **Expecting the router to compensate for cold or unstable runtimes.** [P03](./03-model-router.md) can shift traffic; it cannot fix a bad engine rollout.
- **Letting every team pick its own runtime flags.** Shared platforms need a supported profile, not infinite per-team tuning freedom.

## 8. Checklist

### MVP

- [ ] At least one self-hosted model endpoint runs on a repeatable Kubernetes deployment.
- [ ] The engine and model fit the chosen GPU class with measured headroom.
- [ ] Endpoint health and basic runtime metrics are visible.
- [ ] Model artifacts come from an approved internal path, not from ad hoc manual copies.
- [ ] Rollback means more than "rebuild the node and hope".

### Production

- [ ] A serving control plane such as KServe standardises endpoint lifecycle.
- [ ] Runtime images, flags and artifact paths are versioned.
- [ ] Autoscaling uses endpoint-relevant signals.
- [ ] Warm-capacity policy exists for latency-sensitive endpoints.
- [ ] Serving telemetry feeds routing decisions in [P03](./03-model-router.md) and dashboards in [P07](./07-observability-evaluation.md).

### Enterprise

- [ ] Multiple model pools or clusters exist for fault domains, isolation or hardware classes.
- [ ] Disaggregated inference is evaluated where prompt sizes and concurrency justify it.
- [ ] Artifact promotion ties into provenance and trust controls from [P11](./11-hardening.md).
- [ ] GPU scheduling policy is coordinated with cluster operations from [P12](./12-foundation-infrastructure.md).
- [ ] Engine upgrades, model swaps and rollback drills are rehearsed, not theoretical.

## 9. Sources

Opened earlier in this repository's research process; re-check before adoption:

- [KServe repository](https://github.com/kserve/kserve)
- [vLLM repository](https://github.com/vllm-project/vllm)
- [llm-d repository](https://github.com/llm-d/llm-d)
- [SGLang repository](https://github.com/sgl-project/sglang)
- [Hugging Face TGI repository](https://github.com/huggingface/text-generation-inference)
- [NVIDIA Dynamo repository](https://github.com/ai-dynamo/dynamo)
- [Ollama repository](https://github.com/ollama/ollama)
- [llama.cpp repository](https://github.com/ggml-org/llama.cpp)
- [Methodology](./00-methodology.md)
- [Glossary](./15-glossary.md)
