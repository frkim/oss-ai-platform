# P03. Model serving and inference

> **TL;DR** — Model serving is the runtime layer that turns model artifacts and scarce accelerators into stable, observable inference endpoints. The best default for a Kubernetes-first platform is a serving control plane such as KServe paired with a proven engine such as vLLM, plus an inference-aware endpoint picker once you run several replicas. Policy routing, caching and artifact hardening stay in their owning pillars.

*Snapshot: 2026-10-11 · Related: [AI gateway and routing](./02-ai-gateway-routing.md) · [Reliability, performance and capacity](./11-reliability-capacity.md) · [Security and safety](./09-security-safety.md) · [Foundation and delivery](./12-foundation-infrastructure.md) · [Tool landscape](./15-tool-landscape.md)*

## 1. Why it matters

The model-serving layer is where platform promises meet physics. A platform may expose elegant APIs and smart routing, but users still feel cold starts, GPU fragmentation, poor batching and overloaded runtimes.

This pillar owns the parts that actually run inference:

- inference engines and model runtimes;
- Kubernetes-native serving control planes;
- GPU and accelerator placement concerns relevant to inference;
- autoscaling inputs and rollout patterns for model endpoints;
- inference-aware routing and scheduling inside the cluster (replica choice by load, cache locality and prefill/decode role); and
- the operational envelope around model artifacts, warm capacity and endpoint health.

This pillar does **not** own:

- **policy routing, retries, fallbacks and canaries across backends** → [P02 AI gateway and routing](./02-ai-gateway-routing.md);
- **caching and hedging** → [P11 Reliability, performance and capacity](./11-reliability-capacity.md);
- **artifact signing, tenant isolation and SBOM policy** → [P09 Security and safety](./09-security-safety.md).

## 2. Capability map

| Capability | What good looks like | Owner boundary |
|------------|----------------------|----------------|
| Runtime control plane | A controller can create, scale, update and retire inference endpoints declaratively | P03 owns serving control planes |
| Inference engine | The engine exposes an OpenAI-compatible or similar endpoint, batches work and uses accelerator memory efficiently | P03 owns engine choice |
| Artifact handling | Models and adapters are fetched from approved storage and mounted predictably | P03 owns delivery mechanics; [P09](./09-security-safety.md) owns trust policy |
| Accelerator placement | GPU requests, node selection and scheduling choices fit the workload shape | P03 owns the serving-side requirements; [P12](./12-foundation-infrastructure.md) owns base cluster enablement |
| Autoscaling | Scale decisions use useful signals such as concurrency, queue depth or custom metrics | P03 owns endpoint scaling inputs |
| Rollouts | New weights, engines or serving configs can be promoted and rolled back safely | P03 owns endpoint rollout mechanics |
| Inference-aware routing | An endpoint picker chooses a replica using queue depth, KV-cache locality and load | P03 owns it (section 5); P02 forwards tenant and route hints |
| Disaggregated inference | Prefill and decode can be split when that architecture is justified | P03 owns the serving architecture and its scheduler; P02 never sees the split |

## 3. Tool comparison

Licence labels, stars (rounded), archived flags and notable status notes were read from GitHub on 2026-10-11 unless a row says otherwise; Triton, BentoML, OpenLLM, Seldon Core 2, OpenVINO Model Server, MLC-LLM and TorchServe were spot-checked again on 2026-10-17 (**Opened**). CNCF levels come from the CNCF landscape file (**Opened**). "Choose when" guidance is editorial; no benchmarks are claimed. Re-verify with [Methodology §5](./00-methodology.md#5-snapshot-and-refresh).

Comparison criteria for this pillar, in order:

1. **Workload shape.** Shared-GPU LLM serving, classical model serving, Python application composition or edge packaging.
2. **Hardware fit.** NVIDIA-first, Intel-first, heterogeneous GPU fleets, or browser, mobile and CPU targets.
3. **Operational model.** CRD-based serving control planes, Python-first runtimes, model-repository style servers, or plain Deployments.
4. **Protocol and feature fit.** OpenAI-compatible APIs, KServe or Triton APIs, LoRA support, batching, streaming and multi-model composition.
5. **Project health and openness.** Licence, archived status, release cadence and community depth.

| Capability | Default pick | Strong alternatives | Criteria that matter most | Trade-offs and when not to choose the default |
|------------|--------------|---------------------|---------------------------|-----------------------------------------------|
| Kubernetes serving control plane | **KServe** (~6.1k★, Apache-2.0, CNCF incubating) | Seldon Core 2 (~4.8k★, Source-available BSL 1.1; spot-checked 2026-10-17, **Opened**); plain Kubernetes Deployments | Multi-engine coverage, declarative lifecycle, canary and autoscaling support, and an OSI licence | Choose KServe when one platform should manage LLM and non-LLM endpoints declaratively. Do not choose it if every workload is a bespoke Python service, or if you deliberately accept Seldon Core 2's BSL for its pipeline-centric serving model. |
| Python-first composition and online pipelines | **Ray Serve** (part of Ray, ~44.1k★, Apache-2.0) | KServe; BentoML | Python DAG composition, co-located online features, actor control and existing Ray adoption | Choose Ray Serve when the workload already runs on Ray or needs Python-level composition across steps. Do not choose it as the platform-wide default if most teams want simple CRDs and no Ray dependency. |
| Shared-GPU LLM engine | **vLLM** (~94.0k★, Apache-2.0) | SGLang (~37.2k★); LMDeploy (~8.1k★); Hugging Face TGI (~10.9k★, archived and in maintenance mode) | Throughput, batching, LoRA and prefix-cache features, ecosystem breadth and client compatibility | Choose vLLM for the broadest OSS ecosystem and the best balanced shared-GPU default. Do not choose it blindly: SGLang may win on structured, prefix-heavy or agentic traces you have benchmarked, and TGI should be treated as legacy for new builds. |
| General multi-framework inference server | **Triton Inference Server** (~11.1k★, BSD-3-Clause; spot-checked 2026-10-17, **Opened**) | TensorRT-LLM; KServe runtimes; BentoML | Need one server for TensorRT, ONNX, PyTorch, OpenVINO and ensemble pipelines across GPU, CPU and edge | Choose Triton when the platform must serve many model types or needs NVIDIA's model-repository and ensemble story. Do not choose it as the first shared LLM server if most teams only need OpenAI-compatible LLM endpoints and simpler engine ergonomics. |
| NVIDIA-optimised engine and datacentre-scale orchestration | **TensorRT-LLM / Dynamo** (~14.8k★ / ~8.3k★, Apache-2.0) | vLLM; SGLang; llm-d | Maximum NVIDIA-only performance, engine builds, or disaggregated inference at larger scale | Choose this stack when fleets are NVIDIA-only and teams can own engine builds and CUDA-aligned release cadence. Do not choose it for heterogeneous hardware or for teams that cannot absorb vendor-specific operations. |
| Custom AI API and LLM app packaging | **BentoML** (~8.9k★, Apache-2.0; spot-checked 2026-10-17, **Opened**) | OpenLLM (~12.6k★, Apache-2.0; spot-checked 2026-10-17, **Opened**); Ray Serve; plain FastAPI plus engine | Python business logic, queues, pipelines, multi-model APIs and a simpler app-serving workflow | Choose BentoML when the serving unit is an application or API, not only a raw model server. Choose OpenLLM when you mainly want turnkey OpenAI-compatible OSS LLM endpoints. Do not choose either as the only shared multi-tenant control plane for scarce GPU pools. |
| Intel-oriented serving | **OpenVINO Model Server** (~0.9k★, Apache-2.0; spot-checked 2026-10-17, **Opened**) | Triton; BentoML; KServe runtime wrappers | Intel CPU, GPU or NPU targets, Windows or bare-metal support, and OpenAI-compatible plus KServe APIs | Choose OpenVINO Model Server when Intel hardware is first-class or OpenVINO-format models are the platform standard. Do not choose it if model availability in OpenVINO format, or NVIDIA-fleet tooling, is the real constraint. |
| Inference-aware cluster path | **Gateway API Inference Extension** (~0.8k★, Apache-2.0) | llm-d (~4.8k★); NVIDIA Dynamo | Queue-, cache- or adapter-aware replica selection behind Gateway API | Choose it once several replicas of the same model exist and prefix or adapter locality matters. Do not choose it before you have measured replica-level pain; plain Services are simpler and easier to debug. |
| Edge and local packaging | **Ollama** (~182.7k★, MIT) | llama.cpp (~130.8k★, MIT); MLC-LLM (~23.2k★, Apache-2.0; spot-checked 2026-10-17, **Opened**) | Developer convenience versus portability versus browser, mobile and on-device targets | Choose Ollama for the quickest local packaging, llama.cpp for maximal CPU and edge portability, and MLC-LLM when compiled browser or mobile deployment is the goal. Do not treat any of them as the default shared multi-tenant production GPU layer. |

Why this stack defaults to **KServe + vLLM**: KServe gives the platform one Kubernetes-native contract for endpoint lifecycle, while vLLM has the healthiest engine ecosystem, strong adoption and a direct path to multi-LoRA and prefix-aware serving. If you are not Kubernetes-first, the default changes: BentoML, OpenLLM or Ray Serve can be simpler. If you are NVIDIA-only and chasing the last increment of performance, TensorRT-LLM and Triton deserve a separate benchmark track.

Legacy and caution notes: **TGI** is archived and its README says it is in maintenance mode (**Opened**). **TorchServe** (~4.3k★) is archived and its README says "Limited Maintenance" (**Opened**, spot-checked 2026-10-17), so it is not shortlisted for new builds.

## 4. Reference design

A solid serving design usually has five parts.

1. **Approved model storage.** Model weights, tokenizer files and adapters live in object storage or a registry-backed distribution path.
2. **Serving control plane.** KServe or a similar layer creates and updates endpoints declaratively.
3. **Inference engine pods.** vLLM, SGLang, LMDeploy, Triton, TensorRT-LLM, Dynamo, OpenVINO Model Server or an application packaging layer such as BentoML or OpenLLM loads the model and serves traffic (TGI only for existing deployments).
4. **Accelerator-aware scheduling.** Nodes, GPU classes and autoscaling policies fit the memory and throughput profile of each endpoint.
5. **Endpoint picker and feedback.** Health, queue depth and cache signals drive replica choice (section 5) and are exposed to the gateway in [P02](./02-ai-gateway-routing.md).

A common progression is:

- **MVP:** one engine on dedicated GPU nodes, exposed through one stable Service;
- **Production:** a serving controller plus horizontal scale, warm replicas and explicit rollout policy;
- **Enterprise:** multiple pools, mixed engines, disaggregated inference where justified, and route-aware telemetry back to P02.

Keep these boundaries clear:

- model artifact approval is not the same as model runtime deployment;
- replica-level routing signals come from serving, but route policy across backends (tenant, fallback, canary) belongs in [P02](./02-ai-gateway-routing.md);
- KV-cache and semantic caching are performance concerns in [P11](./11-reliability-capacity.md), even though engines expose some of the mechanics;
- isolation and provenance controls belong in [P09](./09-security-safety.md).

## 5. Inference-aware routing and scheduling

Generic load balancing (round robin, least connections) treats LLM replicas as interchangeable. They are not: each replica holds a different KV cache, a different queue and possibly a different role. Choosing the replica well is a serving concern, so it lives here; [P02](./02-ai-gateway-routing.md) decides which model class and backend pool a request may use, and this section decides which replica in that pool serves it.

| Technique | What it does | Signal it needs |
|-----------|--------------|-----------------|
| Endpoint picker | Replaces blind load balancing: the gateway asks a scheduler for the best replica per request | Queue depth, running requests, KV-cache utilisation, loaded LoRA adapters |
| KV-cache-aware (prefix-aware) routing | Sends requests that share a prompt prefix (system prompt, RAG context, chat history) to the replica already holding that cache, cutting time to first token | Prefix or cache-locality index from the engine |
| Prefill/decode disaggregation | Runs compute-bound prefill and memory-bound decode on separate pools, with KV cache transferred between them | Per-role pools, fast interconnect, a scheduler that pairs them |
| Load- and criticality-aware scheduling | Prefers less loaded replicas and protects latency-critical traffic from batch traffic | Request priority, per-replica load |

Tools (labels and stars **Opened** from GitHub on 2026-10-11; "choose when" is editorial):

| Tool | Licence label | Steward | Role | Choose X when... |
|------|---------------|---------|------|------------------|
| **Gateway API Inference Extension** (~0.8k★) | OSI ✅ Apache-2.0 | kubernetes-sigs | **Default** endpoint picker (an `InferencePool` plus endpoint-picker extension) | You run self-hosted vLLM-class replicas behind a Gateway API implementation and want queue-, cache- and adapter-aware selection. It is an extension, not a standalone router, so it needs a conformant gateway: kgateway and Agent Router are candidates (**Unverified**, check your implementation's conformance and the project's current API version before adoption). |
| **llm-d** (~4.8k★) | OSI ✅ Apache-2.0 | llm-d community | Alternative (prebuilt stack) | You want a vLLM-based reference stack that packages the Inference Extension scheduler, KV-cache-aware routing and prefill/decode disaggregation, rather than assembling them yourself. Evaluate its operational weight against your scale. |
| **NVIDIA Dynamo** (~8.3k★) | OSI ✅ Apache-2.0 | NVIDIA | Alternative | Your fleet is NVIDIA-only and you want datacentre-scale disaggregated serving with KV-aware routing (see section 3). |

Adoption order:

1. Start with a plain Service and measure TTFT and tail latency per replica.
2. Add the endpoint picker when you have several replicas of the same model and shared prefixes (long system prompts, RAG, multi-turn chat) or multiple LoRA adapters.
3. Evaluate disaggregation only when prompt lengths and concurrency are high enough that prefill interference hurts decode latency; it adds pools, interconnect needs and a transfer path to operate. Benchmark with your own traffic; no benchmark numbers are claimed here.

Interfaces with other pillars: the gateway in [P02](./02-ai-gateway-routing.md) forwards the request and tenant headers and may send a model or adapter hint; fallback to another pool or a provider API stays in P02; cache-hit and queue metrics go to [P07](./07-observability-evaluation.md); semantic and response caching remain in [P11](./11-reliability-capacity.md) (KV-cache reuse here is an engine-level optimisation, not a response cache); gang scheduling for multi-node pools is in [P12](./12-foundation-infrastructure.md).

## 6. Implementation guide

Start with a plain runtime deployment you can observe, then wrap it in more platform machinery.

### 6.1 A minimal vLLM deployment on Kubernetes

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
          image: vllm/vllm-openai:<pinned-version>
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

### 6.2 Expose the runtime internally

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

### 6.3 Verify the endpoint before adding routing layers

```bash
kubectl rollout status deploy/vllm-llama-8b -n ai-platform
kubectl get svc vllm-llama-8b -n ai-platform
```

Before adding canaries, fallbacks or burst paths, confirm the runtime is stable on its own: model load time, memory fit, first-token latency and steady-state throughput.

## 7. Operations

Serving incidents often look like routing incidents from the outside. Distinguish them quickly.

| Operational concern | What to watch |
|---------------------|---------------|
| Cold starts | Model download time, weight load time, tokenizer init time |
| GPU saturation | Memory pressure, queue depth, degraded TTFT |
| Fragmentation | Too many endpoints each reserving a little GPU and wasting the rest |
| Capability drift | An "OpenAI-compatible" endpoint no longer matches the function-calling, JSON or adapter features clients expect |
| GPU topology mismatch | Model fits in nominal VRAM but underperforms or fails because NVLink, NUMA, MIG or PCIe layout is wrong |
| Rollout regressions | New weights or engine flags changing latency or output quality |
| Artifact drift | One replica serving different weights or tokenizer assets from another |
| Autoscaling lag | Traffic rising faster than warm capacity or node scale-out |

Operational habits that pay off:

- benchmark with the prompt lengths and output lengths you actually expect;
- record the exact engine image, model artifact path and runtime flags for every deployment;
- maintain a support matrix of model family, engine, quantisation format and hardware class;
- separate development models from shared production pools;
- maintain at least one known-good rollback image or runtime spec;
- soak-test upgrades with representative prompt and output length distributions; and
- alert on queue depth, TTFT and error rate together, not on CPU alone.

## 8. Pitfalls

- **Choosing an engine by popularity alone.** The right engine depends on model family, prompt shape and hardware mix.
- **Ignoring warm capacity.** A single replica that loads slowly can make an otherwise healthy platform feel broken.
- **Autoscaling on the wrong signal.** CPU often says little about a saturated GPU-backed model server.
- **Treating all GPUs as interchangeable.** Memory size, interconnect and node topology affect what can be served efficiently.
- **Skipping artifact hygiene.** Pulling arbitrary model files may solve a demo and break your hardening story.
- **Assuming OpenAI-compatible means behaviour-compatible.** Tool calling, JSON mode, embeddings and LoRA semantics still vary by engine.
- **Running archived or limited-maintenance runtimes for new builds.** Treat TGI and TorchServe as migration inputs, not greenfield defaults.
- **Expecting the router to compensate for cold or unstable runtimes.** [P02](./02-ai-gateway-routing.md) can shift traffic; it cannot fix a bad engine rollout.
- **Letting every team pick its own runtime flags.** Shared platforms need a supported profile, not infinite per-team tuning freedom.
- **Hiding engine choice inside an app framework until performance matters.** The convenience layer should not stop you from benchmarking the actual runtime.

## 9. Checklist

### MVP

- [ ] At least one self-hosted model endpoint runs on a repeatable Kubernetes deployment.
- [ ] The engine and model fit the chosen GPU class with measured headroom.
- [ ] Endpoint health and basic runtime metrics are visible.
- [ ] Model artifacts come from an approved internal path, not from ad hoc manual copies.
- [ ] Rollback means more than "rebuild the node and hope".

### Production

- [ ] A serving control plane such as KServe standardises endpoint lifecycle.
- [ ] Runtime images, flags and artifact paths are versioned.
- [ ] A support matrix exists for model family, engine, quantisation format and GPU class.
- [ ] Autoscaling uses endpoint-relevant signals.
- [ ] Warm-capacity policy exists for latency-sensitive endpoints.
- [ ] Serving telemetry feeds routing decisions in [P02](./02-ai-gateway-routing.md) and dashboards in [P07](./07-observability-evaluation.md).

### Enterprise

- [ ] Multiple model pools or clusters exist for fault domains, isolation or hardware classes.
- [ ] Disaggregated inference and an endpoint picker (section 5) are evaluated where prefix sharing, prompt sizes and concurrency justify them.
- [ ] Artifact promotion ties into provenance and trust controls from [P09](./09-security-safety.md).
- [ ] GPU topology, interconnect and any MIG or sharing mode are explicit parts of placement policy.
- [ ] GPU scheduling policy is coordinated with cluster operations from [P12](./12-foundation-infrastructure.md).
- [ ] Engine upgrades, model swaps and rollback drills are rehearsed, not theoretical.

## 10. Sources

Opened earlier in this repository's research process; re-check before adoption:

- [KServe repository](https://github.com/kserve/kserve)
- [Triton Inference Server repository](https://github.com/triton-inference-server/server) and [`LICENSE`](https://github.com/triton-inference-server/server/blob/main/LICENSE)
- [BentoML repository](https://github.com/bentoml/BentoML)
- [OpenLLM repository](https://github.com/bentoml/OpenLLM) and [`LICENSE`](https://github.com/bentoml/OpenLLM/blob/main/LICENSE)
- [Seldon Core repository](https://github.com/SeldonIO/seldon-core) and [`LICENSE`](https://github.com/SeldonIO/seldon-core/blob/v2/LICENSE)
- [OpenVINO Model Server repository](https://github.com/openvinotoolkit/model_server) and [`LICENSE`](https://github.com/openvinotoolkit/model_server/blob/main/LICENSE)
- [MLC-LLM repository](https://github.com/mlc-ai/mlc-llm) and [`LICENSE`](https://github.com/mlc-ai/mlc-llm/blob/main/LICENSE)
- [TorchServe repository](https://github.com/pytorch/serve)
- [vLLM repository](https://github.com/vllm-project/vllm)
- [llm-d repository](https://github.com/llm-d/llm-d)
- [Gateway API Inference Extension repository](https://github.com/kubernetes-sigs/gateway-api-inference-extension)
- [SGLang repository](https://github.com/sgl-project/sglang)
- [Hugging Face TGI repository](https://github.com/huggingface/text-generation-inference)
- [NVIDIA Dynamo repository](https://github.com/ai-dynamo/dynamo)
- [NVIDIA TensorRT-LLM repository](https://github.com/NVIDIA/TensorRT-LLM)
- [LMDeploy repository](https://github.com/InternLM/lmdeploy)
- [KAITO repository](https://github.com/kaito-project/kaito)
- [Ray repository](https://github.com/ray-project/ray) and [KubeRay](https://github.com/ray-project/kuberay)
- [CNCF landscape file](https://github.com/cncf/landscape/blob/master/landscape.yml)
- [Ollama repository](https://github.com/ollama/ollama)
- [llama.cpp repository](https://github.com/ggml-org/llama.cpp)
- [Methodology](./00-methodology.md)
- [Glossary](./16-glossary.md)
