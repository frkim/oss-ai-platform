# P04. Model lifecycle and adaptation

> **TL;DR** — Model lifecycle is everything that happens to a model between "someone found it" and "it is retired": cataloguing, mirroring, licence review, selection, quantisation, adaptation (prompting, RAG or fine-tuning), promotion and deprecation. The best default is a mirrored internal artifact store plus MLflow as registry, adaptation by the cheapest technique that passes the eval gate (parameter-efficient LoRA via TRL or Unsloth, scheduled by Kueue), and serving of adapters through vLLM. **Pre-training is out of scope** for this blueprint.

*Snapshot: 2026-10-11 · Related: [Model serving](./03-model-serving.md) · [Knowledge and context](./05-data-knowledge-rag.md) · [Evaluation and quality](./08-evaluation-quality.md) · [Security and safety](./09-security-safety.md) · [Governance and FinOps](./10-governance-finops.md) · [Foundation and delivery](./12-foundation-infrastructure.md) · [Tool landscape](./15-tool-landscape.md)*

## 1. Why it matters

Most enterprises will never train a foundation model, but all of them will pick, host, shrink, adapt and eventually retire models. Without an owner these steps happen ad hoc: weights downloaded from the internet onto a laptop, a licence nobody read, a LoRA adapter whose training data nobody can name, and a "v2" model that quietly replaces "v1" with no eval evidence.

This pillar owns:

- the model catalogue and registry (what exists, which version, who approved it);
- artifact storage, mirroring and provenance metadata;
- the model selection process, including licence review;
- quantisation and other optimisation done before serving;
- adaptation: the decision between prompting, RAG and fine-tuning, and the fine-tuning jobs themselves;
- promotion, canary and deprecation policy for model versions; and
- reproducibility and lineage of anything the platform produces.

**Scope boundary: pre-training is out of scope.** Training a base model from scratch (data curation at trillion-token scale, multi-thousand-GPU runs, continued pre-training) needs a dedicated research-grade stack and budget. This pillar covers adaptation of existing models only: supervised fine-tuning, parameter-efficient tuning, preference tuning and distillation. Continued pre-training is treated as out of scope too.

This pillar does **not** own:

- **running endpoints, engines, autoscaling and endpoint rollout mechanics** → [P03 Model serving](./03-model-serving.md);
- **retrieval, indexes, prompt and context assets** → [P05 Knowledge and context](./05-data-knowledge-rag.md);
- **eval design, datasets and CI gates** → [P08 Evaluation and quality](./08-evaluation-quality.md) (this pillar consumes them as promotion gates);
- **signing, scanning, safe model formats and tenant isolation** → [P09 Security and safety](./09-security-safety.md);
- **risk classification, model cards as compliance records, GPU chargeback** → [P10 Governance and FinOps](./10-governance-finops.md);
- **cluster GPU enablement and baseline scheduling** → [P12 Foundation](./12-foundation-infrastructure.md).

## 2. Capability map

| Capability | What good looks like | Owner boundary |
|------------|----------------------|----------------|
| Model catalogue and registry | Every approved model and adapter has a versioned record: source, licence, hash, intended use, eval results, owner | P04 owns the registry; [P10](./10-governance-finops.md) owns policy that reads it |
| Artifact storage and mirroring | Weights are pulled once from the public hub, scanned, then served from an internal store; no pod pulls from the internet | P04 owns the mirror; [P09](./09-security-safety.md) owns scanning and signing policy |
| Model selection | A repeatable process combines licence, capability evals, hardware fit and cost | P04 owns the process; [P08](./08-evaluation-quality.md) owns the evals used |
| Quantisation and optimisation | Quantised variants are produced by a pipeline, evaluated against the full-precision baseline and registered as separate versions | P04 owns the pipeline; [P03](./03-model-serving.md) owns the engine that serves them |
| Adaptation | A decision tree picks prompting, RAG or tuning; tuning runs as scheduled, reproducible Kubernetes jobs | P04 owns tuning; [P05](./05-data-knowledge-rag.md) owns RAG and prompts |
| Tuning data preparation | Training sets are versioned, deduplicated, licence-cleared and PII-reviewed | P04 owns the pipeline; [P10](./10-governance-finops.md) owns data policy |
| Training GPU scheduling | Quota, queueing, preemption and gang scheduling for batch jobs | P04 defines requirements; [P12](./12-foundation-infrastructure.md) owns the base cluster |
| Rollout and deprecation | Versions move through stages on eval evidence and are retired on a published schedule | P04 owns policy; [P03](./03-model-serving.md) owns endpoint mechanics |
| Reproducibility and lineage | Any served model can be traced to base model, data, code, config and eval run | P04 records it; [P10](./10-governance-finops.md) audits it |

## 3. Tool comparison

Licence labels, stars (rounded), archived flags and latest releases were read on 2026-10-11 from the GitHub API (**Opened**). CNCF levels come from the CNCF landscape file (**Opened**). Stars: MLflow ~28.3k, Kubeflow Model Registry ~0.2k, KitOps ~1.4k, ModelPack spec ~0.2k, ORAS ~2.5k, llm-compressor ~3.9k, GPTQModel ~1.3k, Model Optimizer ~5.3k, llama.cpp ~130.8k, Unsloth ~77.8k, LLaMA-Factory ~75.4k, Axolotl ~12.6k, TRL ~19.5k, PEFT ~21.8k, torchtune ~5.8k, NeMo ~18.6k, Kubeflow Trainer ~2.2k, Ray ~44.0k, Kueue ~3.1k, Volcano ~6.0k, KAI Scheduler ~1.6k, LoRAX ~3.8k, vLLM ~93.6k. "Choose when" guidance is editorial; no benchmarks are claimed. Re-verify with [Methodology §5](./00-methodology.md#5-snapshot-and-refresh).

### 3.1 Registry, catalogue and artifact distribution

| Capability | Licence label | Steward | Default pick | Alternatives | Choose X when… |
|------------|---------------|---------|--------------|--------------|----------------|
| Model registry and experiment tracking | OSI ✅ Apache-2.0 | MLflow project (v3.17.0, 2026-10-07) | **MLflow** | Kubeflow Model Registry (Kubeflow Hub); Hugging Face Hub mirror as catalogue only | Choose MLflow when you want one registry for versions, aliases (champion, challenger), metrics and lineage links, usable from any training tool. Choose Kubeflow Model Registry (Apache-2.0, v0.3.17, small community, ~0.2k stars) when you already run Kubeflow and want its catalogue and KServe integration (**Unverified** depth of integration, confirm in docs). Kubeflow is listed as CNCF graduated in the landscape file; its registry sub-project is much younger than that level suggests. |
| OCI model artifacts | OSI ✅ Apache-2.0 | ModelPack spec (CNCF sandbox per the landscape file); KitOps; ORAS | **OCI registry you already run** (Harbor or cloud registry) with ORAS | KitOps (ModelKits); ModelPack spec; Hugging Face Hub downloads into S3-compatible storage | Choose OCI artifacts when you want weights to ride the same signing, replication, scanning and RBAC as container images (see [P09](./09-security-safety.md)). ModelPack is a vendor-neutral packaging spec; KitOps is a tool that packages models as OCI artifacts (**Unverified** whether KitOps implements ModelPack at this release). Choose plain S3-compatible storage when models exceed registry layer limits or teams lack OCI tooling. |
| Public hub mirror | Mixed (hub is a service; mirrored models carry their own licences) | Hugging Face and others | Internal mirror fed by an approved-import job | Pull-through cache; manual import only | Choose a mirror-and-import workflow so every model passes licence review and scanning before first use. A pull-through cache alone does not provide approval. |

The Hugging Face Hub offers private and enterprise tiers, but a self-hosted open-source hub equivalent was not verified (**Unverified**). Treat the public hub as an upstream source and your own object store or OCI registry as the system of record.

### 3.2 Quantisation and optimisation

| Capability | Licence label | Steward | Default pick | Alternatives | Choose X when… |
|------------|---------------|---------|--------------|--------------|----------------|
| Post-training quantisation for vLLM | OSI ✅ Apache-2.0 | vLLM project (llm-compressor 0.14.0, 2026-09-22) | **llm-compressor** | GPTQModel; NVIDIA Model Optimizer; AutoAWQ (archived); AutoGPTQ (archived) | Choose llm-compressor when the target engine is vLLM: it produces compressed-tensors checkpoints the engine loads directly. Choose Model Optimizer (Apache-2.0) for NVIDIA-only fleets using TensorRT-LLM. GPTQModel's GitHub licence field is unrecognised (NOASSERTION): read its LICENSE file before adopting (**Unverified**). Avoid AutoAWQ and AutoGPTQ for new work: both repositories are archived (**Opened**); the AWQ and GPTQ formats still load in many engines. |
| Edge and CPU formats | OSI ✅ MIT | ggml-org (llama.cpp) | llama.cpp (GGUF) | Ollama packaging | Choose GGUF for CPU, edge and workstation targets. Keep it out of shared GPU pools; see [P03](./03-model-serving.md). |
| NVIDIA engine builds | Apache-2.0 with third-party portions (GitHub reports NOASSERTION) | NVIDIA | Alternative | vLLM native quantisation | Choose TensorRT-LLM engine builds only when an NVIDIA-only fleet justifies per-GPU build and cache management. |

Quantisation is lossy. Always register the quantised model as its own version, evaluated against the full-precision baseline on your tasks ([P08](./08-evaluation-quality.md)), not on a public leaderboard.

### 3.3 Adaptation and training

| Capability | Licence label | Steward | Default pick | Alternatives | Choose X when… |
|------------|---------------|---------|--------------|--------------|----------------|
| SFT, preference tuning and distillation library | OSI ✅ Apache-2.0 | Hugging Face (TRL v1.15.0; PEFT v0.21.2) | **TRL with PEFT** | Axolotl; LLaMA-Factory; Unsloth; NeMo; torchtune (not maintained) | Choose TRL and PEFT for the most standard, scriptable path (SFT, DPO and other preference methods, LoRA and QLoRA). Choose Axolotl (Apache-2.0) when you want YAML-configured, reproducible recipes. Choose LLaMA-Factory (Apache-2.0) when less-technical teams need a web UI or broad model support. Choose Unsloth (Apache-2.0) when single-GPU memory efficiency and speed matter; check the licence of its optional add-ons separately (**Unverified**). Choose NeMo (Apache-2.0, NVIDIA) for NVIDIA-centred stacks at larger scale. Avoid torchtune for new work: its README states development wound down in 2025. |
| Distributed training operator | OSI ✅ Apache-2.0 | Kubeflow community (Trainer v2.3.0) | **Kubeflow Trainer** | Ray Train (KubeRay); plain PyTorchJob; Volcano jobs | Choose Kubeflow Trainer for Kubernetes-native TrainJob resources and runtimes covering multiple frameworks. Choose Ray Train when the data and tuning pipeline already runs on Ray (Ray ~44k stars, Apache-2.0). Single-GPU LoRA jobs need only a Kubernetes Job. |
| Queueing, quota and fair sharing | OSI ✅ Apache-2.0 | Kubernetes SIG Scheduling (Kueue v0.20.1) | **Kueue** | Volcano (CNCF incubating); NVIDIA KAI Scheduler | Choose Kueue for job queueing, quotas and borrowing across teams with the default Kubernetes scheduler. Choose Volcano (v1.15.3) when you need mature gang scheduling, batch queues and a separate scheduler. KAI Scheduler (Apache-2.0, NVIDIA) targets GPU sharing and fair share (**Unverified** feature depth). Kueue and Volcano overlap, so pick one per cluster. |
| Multi-adapter serving | OSI ✅ Apache-2.0 | vLLM project; Predibase (LoRAX) | **vLLM multi-LoRA** | LoRAX | Choose vLLM LoRA serving to host many adapters on one base model within the engine you already run. LoRAX (Apache-2.0) predates this; its last release was 2025-01 and last push 2026-05, so treat it as slower-moving (**Opened**). |

Why these defaults: TRL and PEFT have the broadest recipes and the shortest path to a Kubernetes Job; Kueue is a SIG project that composes with Kubeflow Trainer and Ray; vLLM serves both the base and adapters in one engine. Security posture and operability (Helm charts, HA) were not compared per tool: **Unverified**.

### 3.4 Model licences

Open weights are not open source ([Methodology §3](./00-methodology.md)). The table is a screening aid, not legal advice. It rests on secondary sources, so always read the licence text shipped with the exact model version (**Unverified** against primary texts).

| Model family | Licence as reported | Label | Screening notes |
|--------------|---------------------|-------|-----------------|
| Llama (Meta) | Llama Community Licence | Open weights | Large-service threshold (reported as 700M monthly active users), acceptable use policy, naming and attribution duties, and restrictions on using outputs to improve other models have changed between versions. Legal review required. |
| Gemma (Google) | Gemma Terms of Use for earlier generations; Apache-2.0 reported for Gemma 4 | Open weights (earlier) / OSI (Gemma 4, **Unverified**) | Earlier terms attach a prohibited-use policy that flows down to derivatives. Confirm per model card. |
| Qwen (Alibaba) | Apache-2.0 for many releases; some sizes use other terms | OSI (per model) | Licence varies by size and release. Check each card. |
| Mistral | Apache-2.0 for many releases; research-only or commercial licences for others | OSI or Not OSS (per model) | Some models forbid commercial use. Check each card. |
| DeepSeek | MIT reported for recent releases | OSI (per model) | Distilled variants inherit the base model's licence (for example Llama- or Qwen-based). |
| gpt-oss (OpenAI) | Apache-2.0 with a usage policy | OSI (**Unverified**) | Confirm whether the usage policy binds redistributors. |

Selection process, in order:

1. **Licence gate.** Record the licence, restrictions and whether derivatives (adapters, quantised copies, distilled models) must carry the same terms. Reject unclear cases.
2. **Capability gate.** Shortlist two to four candidates; run your own task evals ([P08](./08-evaluation-quality.md)). Public benchmarks only narrow the list.
3. **Fit gate.** Parameter count, quantisation options, context length and engine support against the GPU classes in [P03](./03-model-serving.md).
4. **Cost gate.** Cost per million tokens on your hardware against hosted alternatives, via [P10](./10-governance-finops.md).
5. **Safety and provenance gate.** Safe format (prefer safetensors over pickle), scanning and signature checks in [P09](./09-security-safety.md).

## 4. Reference design

```text
Public hub / vendor ──► import job ──► scan + licence review ──► internal mirror
                                                                  (S3 or OCI)
                                                                      │
                          ┌───────────────────────────────────────────┤
                          ▼                                           ▼
                 quantisation pipeline                       tuning pipeline
                 (llm-compressor)                            (TRL/PEFT on Kueue)
                          │                                           │
                          └──────────────► MLflow registry ◄──────────┘
                                     (versions, aliases, lineage)
                                                  │ eval gate (P08)
                                                  ▼
                              KServe / vLLM endpoints (P03)  ──► canary ► promote
```

Components:

1. **Mirror and registry.** Object storage or an OCI registry holds immutable artifacts addressed by digest; MLflow holds metadata, aliases and links.
2. **Import pipeline.** The only way in: records source URL, revision hash, licence, safe-format check and reviewer.
3. **Optimisation and tuning pipelines.** Containerised, queue-scheduled jobs that read a registered base model and write a new registered version.
4. **Eval gate.** Every registered candidate must pass the regression suite in [P08](./08-evaluation-quality.md) before it can take the `challenger` alias.
5. **Promotion and rollout.** [P03](./03-model-serving.md) executes canary traffic splits; this pillar decides when a version may enter and leave.

### 4.1 Adaptation decision tree

Move down the list only when the earlier option fails an eval on your task.

1. **Prompting and context engineering.** Cheapest and reversible. Try instructions, examples, structured output and tool use first ([P05](./05-data-knowledge-rag.md)).
2. **RAG.** Choose when the gap is missing or fresh knowledge, needs citations or per-user access control. Tuning is a poor way to inject facts that change.
3. **Fine-tuning.** Choose when the gap is behaviour: format, tone, domain vocabulary, tool-calling reliability, or when a smaller model must match a larger one for latency and cost.
4. **Distillation.** Choose when a large teacher already performs well and you need a cheaper student. Check the teacher's licence permits using outputs for training.
5. **Preference tuning** (DPO and related methods). Choose after SFT when ranking-style feedback exists. It needs more careful evals than SFT.

Within tuning, default to LoRA or QLoRA: adapters are small, cheap to train on one or few GPUs, versionable and swappable at serving time. Use full fine-tuning only when adapters measurably fall short and the GPU budget exists.

## 5. Implementation guide

### 5.1 Register models, not folders

Define a record schema before the first import:

| Field | Example |
|-------|---------|
| Source and revision | upstream repo plus commit hash |
| Content digest | sha256 of the artifact set |
| Licence and restrictions | text, link, reviewer, date |
| Format | safetensors, GGUF, compressed-tensors |
| Parent | base model version (for adapters, quantised and distilled models) |
| Training data version | dataset digest (tuned models) |
| Eval run | link to [P08](./08-evaluation-quality.md) results |
| Owner and deprecation date | team, date |

Use registry aliases (`champion`, `challenger`, `deprecated`) rather than mutable tags in manifests.

### 5.2 Mirror via OCI or object storage

Pin by digest, never by `latest`. With an OCI registry:

```bash
oras push registry.example.com/models/llama-8b:1.0.0 \
  ./model-dir:application/vnd.example.model.layer.v1.tar
```

Substitute your registry, tag and media type. For KServe, the storage layer can pull `oci://` or S3-compatible URIs (**Unverified** exact URI schemes for the current release, confirm in docs). Block egress from inference namespaces so pods cannot reach public hubs.

### 5.3 Quantise as a pipeline step

Run quantisation as a Kubernetes Job on the mirrored base model, write the result as a new version, then run the eval suite. Check calibration data for leakage of sensitive text, since calibration samples influence the output model.

### 5.4 A minimal LoRA job on Kubernetes

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: sft-lora-support-v1
  namespace: ai-tuning
  labels:
    kueue.x-k8s.io/queue-name: team-a-queue
spec:
  suspend: true
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: train
          image: registry.example.com/train/trl:<pinned-version>
          command: ["python", "train_sft.py", "--config", "/cfg/sft.yaml"]
          resources:
            limits:
              nvidia.com/gpu: "1"
```

Kueue unsuspends the Job when quota is available. The config should pin base model digest, dataset digest, seed and library versions, and log them to MLflow.

### 5.5 Prepare tuning data

- Version datasets as immutable snapshots and store the digest on the model record.
- Clear licence and consent for every source; do not tune on data you could not legally serve in RAG.
- Remove personal data and secrets. A tuned model can regurgitate training examples.
- Deduplicate and hold out evaluation data before training; never reuse eval items as training items.
- Synthetic data is allowed, but record which model generated it and whether its licence permits training use. Distilabel (Apache-2.0) is one generation toolkit (**Opened** licence only).
- Quality beats quantity: a few thousand reviewed examples usually beat a large noisy set for behavioural tuning (editorial guidance, not a benchmark).

### 5.6 Serve adapters

Serve one base model with several LoRA adapters through vLLM rather than one deployment per adapter. Register each adapter as a child of its base model version, and restrict which tenants may call which adapter at the gateway ([P02](./02-ai-gateway-routing.md)). Adapters are only valid against the exact base revision they were trained on.

### 5.7 Promote and roll out

| Stage | Entry condition | Exit condition |
|-------|-----------------|----------------|
| Registered | Import or training job succeeded | Licence and scan checks pass |
| Candidate | Regression eval passes against current champion | Safety evals and cost check pass |
| Canary | Endpoint exists; small traffic share or shadow traffic | Online quality, latency and error signals meet thresholds |
| Champion | Canary success; owner sign-off | Replaced by a newer champion |
| Deprecated | Successor available; notice period announced | No traffic for a set period; then archive |

Traffic splitting uses [P03](./03-model-serving.md) (for example KServe canary) or the gateway in [P02](./02-ai-gateway-routing.md). Keep the previous champion deployed until the new one passes the exit condition. Deprecation needs a published calendar, consumer inventory from usage telemetry ([P07](./07-observability-evaluation.md)) and a migration note. Never delete weights while a rollback may still be required or while audits may need them.

## 6. Operations

| Operational concern | What to watch |
|---------------------|---------------|
| Registry drift | Models serving in production that have no registry record |
| Training queue health | Queue wait time, preemptions, GPU idle time between jobs |
| Training failures | Out-of-memory errors, checkpoint recovery, node loss in multi-node jobs |
| Upstream changes | Upstream repo changes licence, deletes a model or republishes weights under the same name |
| Adapter sprawl | Many adapters with no owner, no traffic or no matching base version |
| Quality drift | Online evals degrading after a base model, quantisation or adapter change |
| Deprecation debt | Old versions still receiving traffic past their end date |
| Cost | GPU hours per tuning run, cost per accepted model version |

Operational habits that pay off:

- checkpoint training to durable storage so preemption does not lose runs;
- keep tuning and production serving in separate namespaces and quota pools;
- re-run the full eval suite on every base model or quantisation change, not only on new adapters;
- rehearse restoring a previous champion from the registry; and
- review the model inventory quarterly against [P10](./10-governance-finops.md) policy.

### 6.1 Reproducibility and lineage

For every model version, store: base model digest, dataset digest, code commit, container image digest, hyperparameters, random seeds, hardware class and eval run ID. Emit lineage to the registry and, where policy needs it, to the governance record in [P10](./10-governance-finops.md). GPU nondeterminism means bitwise reproduction is often unrealistic; aim for traceability and statistically equivalent eval results. Model cards, licence records and training-data summaries support the evidence expected by [P10](./10-governance-finops.md).

## 7. Pitfalls

- **Fine-tuning to add knowledge.** Facts go stale; use RAG ([P05](./05-data-knowledge-rag.md)) and tune for behaviour.
- **Skipping the licence step.** An open-weights model with usage restrictions can block a product later, and derivatives often inherit the terms.
- **Trusting public leaderboards.** Evaluate on your own tasks.
- **Quantising without re-evaluating.** Small average losses can hide large losses on specific languages, tools or long contexts.
- **Pulling weights at pod start.** It breaks reproducibility, mirroring and egress control, and slows cold starts.
- **Loading unsafe formats.** Pickle-based checkpoints can execute code; prefer safetensors and scan ([P09](./09-security-safety.md)).
- **Mismatched adapter and base.** An adapter on a different base revision gives silently wrong output.
- **No held-out set.** Tuning on eval data inflates results.
- **Starting pre-training.** It is out of scope; adapt existing models.
- **Per-team tuning stacks.** Three libraries, three registries and no shared queue lead to wasted GPUs and no lineage.
- **Archived or unmaintained tools.** AutoAWQ, AutoGPTQ and torchtune are archived or wound down; do not build new pipelines on them.

## 8. Checklist

### MVP

- [ ] Approved models are imported through one documented path and stored internally.
- [ ] A short registry or catalogue lists each model, version, licence and owner.
- [ ] Licence review is recorded before any model serves users.
- [ ] Prompting and RAG were tried and evaluated before any tuning.
- [ ] Model weights use a safe format and a pinned digest.

### Production

- [ ] MLflow (or equivalent) is the registry, with aliases and parent links for adapters and quantised variants.
- [ ] Tuning and quantisation run as scheduled, containerised jobs with Kueue or equivalent quotas.
- [ ] Every candidate passes the [P08](./08-evaluation-quality.md) regression gate before promotion.
- [ ] Datasets are versioned, licence-cleared and PII-reviewed.
- [ ] Canary and rollback are documented for each model version; the previous champion stays deployed until the new one is proven.
- [ ] Deprecation calendar and consumer notification exist.

### Enterprise

- [ ] Artifacts are signed and verified at admission ([P09](./09-security-safety.md)); OCI or object storage replicates across regions.
- [ ] Full lineage links base model, data, code, config, eval and deployment, and feeds [P10](./10-governance-finops.md) audit evidence.
- [ ] Multi-tenant fair sharing and GPU cost attribution cover tuning jobs.
- [ ] Multi-LoRA serving is governed: tenant-to-adapter authorisation, owner per adapter, retirement rules.
- [ ] Licence changes upstream trigger automated review of dependent models.
- [ ] Rollback and deprecation drills run regularly.

## 9. Sources

Repository and licence data were opened on 2026-10-11 via the GitHub API; model licences are secondary-sourced and flagged **Unverified**. Re-check before adoption:

- [MLflow repository](https://github.com/mlflow/mlflow)
- [Kubeflow Model Registry repository](https://github.com/kubeflow/model-registry)
- [ModelPack specification](https://github.com/modelpack/model-spec)
- [KitOps repository](https://github.com/jozu-ai/kitops)
- [ORAS repository](https://github.com/oras-project/oras)
- [llm-compressor repository](https://github.com/vllm-project/llm-compressor)
- [AutoAWQ repository (archived)](https://github.com/casper-hansen/AutoAWQ)
- [AutoGPTQ repository (archived)](https://github.com/AutoGPTQ/AutoGPTQ)
- [GPTQModel repository](https://github.com/ModelCloud/GPTQModel)
- [NVIDIA Model Optimizer repository](https://github.com/NVIDIA/Model-Optimizer)
- [llama.cpp repository](https://github.com/ggml-org/llama.cpp)
- [Unsloth repository](https://github.com/unslothai/unsloth)
- [Axolotl repository](https://github.com/axolotl-ai-cloud/axolotl)
- [LLaMA-Factory repository](https://github.com/hiyouga/LLaMA-Factory)
- [TRL repository](https://github.com/huggingface/trl) and [PEFT repository](https://github.com/huggingface/peft)
- [torchtune repository](https://github.com/pytorch/torchtune)
- [NeMo repository](https://github.com/NVIDIA-NeMo/NeMo)
- [Kubeflow Trainer repository](https://github.com/kubeflow/trainer)
- [Ray repository](https://github.com/ray-project/ray)
- [Kueue repository](https://github.com/kubernetes-sigs/kueue)
- [Volcano repository](https://github.com/volcano-sh/volcano)
- [NVIDIA KAI Scheduler repository](https://github.com/NVIDIA/KAI-Scheduler)
- [LoRAX repository](https://github.com/predibase/lorax)
- [vLLM repository](https://github.com/vllm-project/vllm)
- [KServe repository](https://github.com/kserve/kserve)
- [Distilabel repository](https://github.com/argilla-io/distilabel)
- [CNCF landscape file](https://github.com/cncf/landscape/blob/master/landscape.yml)
- [Gemma Terms of Use](https://ai.google.dev/gemma/terms) (search-cited)
- [Methodology](./00-methodology.md)
- [Glossary](./16-glossary.md)
