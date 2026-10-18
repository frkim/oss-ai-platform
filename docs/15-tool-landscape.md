# Tool landscape

> **TL;DR** — Every tool named in the pillar documents (P02-P13), in one catalog grouped by pillar: role, licence label, steward and default status. Stars are rounded GitHub figures read on 2026-10-11 and are shown only where a pillar document or the spot-check recorded them; `—` means not recorded. Latest releases are not repeated here; the pillar documents give them where they were read. Rows added or corrected by the 2026-10-17 review (marked in the [spot-check findings](#spot-check-findings-2026-10-11)) were opened on that date. Refresh both with the commands in the [methodology](./00-methodology.md#5-snapshot-and-refresh) before you shortlist.

*Snapshot: 2026-10-11 · Related: [Methodology](./00-methodology.md) · [Reference architecture](./01-reference-architecture.md) · [References](./17-references.md) · [Glossary](./16-glossary.md)*

## How to read this catalog

- Rows are grouped by the **home pillar** of the tool, in pillar order. A tool used by several pillars appears once; the **Pillar** column links the home pillar first and then the others. Tool comparison tables are section 3 of each pillar document.
- **Default** marks a pillar's default pick; everything else is an alternative, a supporting tool, or marked as avoid or reference-only.
- Licence labels follow the [legend](./00-methodology.md#32-licence-policy-and-legend). "Verify" means the repository shows no usable SPDX identifier or the pillar flags the licence as unconfirmed, so open the `LICENSE` file before adopting the tool.
- The pillar document is the authority; this table summarises it. If they differ, the pillar document wins, except where the dated [spot-check findings](#spot-check-findings-2026-10-11) below are newer.
- Model families and their licences (Llama, Gemma, Qwen, Mistral, DeepSeek, gpt-oss) are screened in [P04 section 3.4](./04-model-lifecycle-adaptation.md), not listed here.

## Catalog

### P02 AI gateway and routing

| Tool | Pillar | Role | Licence label | Steward | Default | Stars |
|------|--------|------|---------------|---------|---------|-------|
| LiteLLM | [P02](./02-ai-gateway-routing.md) | AI gateway; virtual keys, quotas, simple routing | `Open-core` ⚠️ (MIT outside `enterprise/`) | BerriAI | Default | ~60.9k |
| Agent Router (formerly Envoy AI Gateway) | [P02](./02-ai-gateway-routing.md) | Kubernetes-native gateway and router | `OSI` ✅ Apache-2.0 | Agent Router project | Alternative (Kubernetes-native) | ~2.2k |
| kgateway | [P02](./02-ai-gateway-routing.md) | Gateway API implementation on Envoy with AI extensions | `OSI` ✅ Apache-2.0 | kgateway project (formerly Gloo; CNCF sandbox) | Alternative | ~5.7k |
| agentgateway | [P02](./02-ai-gateway-routing.md), [P06](./06-agents-mcp.md) | LLM, MCP and A2A aware proxy | `OSI` ✅ Apache-2.0 | agentgateway project (foundation status Unverified) | Alternative (P02); default (P06 MCP layer) | ~5.3k |
| vLLM Semantic Router | [P02](./02-ai-gateway-routing.md) | Content-based (intent, complexity) routing | `OSI` ✅ Apache-2.0 | vLLM project | Alternative (complement) | ~6.1k |
| Kong Gateway core | [P02](./02-ai-gateway-routing.md) | General API gateway with AI plugins | `OSI` ✅ Apache-2.0 | Kong Inc. | Alternative | ~44.3k |
| Apache APISIX | [P02](./02-ai-gateway-routing.md) | Plugin-rich gateway with AI proxy | `OSI` ✅ Apache-2.0 | Apache Software Foundation | Alternative | ~17.2k |
| Higress | [P02](./02-ai-gateway-routing.md) | Istio/Envoy-based AI-native gateway | `OSI` ✅ Apache-2.0 | Alibaba / Higress community | Alternative | ~9.5k |
| Helicone AI Gateway | [P02](./02-ai-gateway-routing.md) | Lightweight Rust AI gateway | `OSI` ✅ GPL-3.0 | Helicone | Alternative (check copyleft fit) | ~0.6k |
| TensorZero | [P02](./02-ai-gateway-routing.md) | Gateway, observability and optimisation in one | `OSI` ✅ Apache-2.0 | TensorZero | Not shortlisted (repository archived) | ~11.7k |
| Portkey Gateway | [P02](./02-ai-gateway-routing.md) | Lightweight routing and guardrail proxy | `OSI` ✅ MIT | Portkey AI | Alternative (check maintenance) | ~13.2k |

### P03 Model serving and inference

| Tool | Pillar | Role | Licence label | Steward | Default | Stars |
|------|--------|------|---------------|---------|---------|-------|
| KServe | [P03](./03-model-serving.md) | Kubernetes serving control plane | `OSI` ✅ Apache-2.0 | KServe community (CNCF incubating) | Default | — |
| vLLM | [P03](./03-model-serving.md) | LLM inference engine | `OSI` ✅ Apache-2.0 | vLLM project | Default | — |
| Gateway API Inference Extension | [P03](./03-model-serving.md), [P02](./02-ai-gateway-routing.md) | Endpoint picker and `InferencePool` for inference-aware routing | `OSI` ✅ Apache-2.0 | kubernetes-sigs | Default (endpoint picker) | ~0.8k |
| llm-d | [P03](./03-model-serving.md) | Inference-aware, disaggregated serving stack | `OSI` ✅ Apache-2.0 | llm-d community | Alternative | ~4.8k |
| SGLang | [P03](./03-model-serving.md) | LLM inference engine | `OSI` ✅ Apache-2.0 | SGLang project | Alternative | — |
| LMDeploy | [P03](./03-model-serving.md) | LLM inference and quantisation (TurboMind) | `OSI` ✅ Apache-2.0 | InternLM / Shanghai AI Lab | Alternative | ~8.1k |
| NVIDIA Dynamo | [P03](./03-model-serving.md) | Distributed, disaggregated inference serving | Verify (P03 reads Apache-2.0; GitHub shows `NOASSERTION`) | NVIDIA | Alternative | ~8.3k |
| NVIDIA TensorRT-LLM | [P03](./03-model-serving.md), [P04](./04-model-lifecycle-adaptation.md) | NVIDIA-optimised engine builds | Verify (Apache-2.0 with third-party portions; GitHub shows `NOASSERTION`) | NVIDIA | Alternative | ~14.8k |
| Hugging Face TGI | [P03](./03-model-serving.md) | LLM inference engine | `OSI` ✅ Apache-2.0 | Hugging Face | Avoid for new builds (maintenance mode; repository archived) | — |
| KAITO | [P03](./03-model-serving.md) | Preset-driven GPU node provisioning and model deployment | Verify (P03 reads Apache-2.0; GitHub shows `NOASSERTION`) | KAITO project (Azure-leaning) | Alternative | ~1.0k |
| KubeRay / Ray Serve | [P03](./03-model-serving.md), [P04](./04-model-lifecycle-adaptation.md) | Ray-based serving and training on Kubernetes | `OSI` ✅ Apache-2.0 | Ray project (Anyscale-led) | Alternative | ~44.0k (Ray) |
| Ollama | [P03](./03-model-serving.md) | Local and edge packaging | `OSI` ✅ MIT | Ollama | Alternative (not for shared GPU pools) | — |
| NVIDIA Triton Inference Server | [P03](./03-model-serving.md) | Multi-framework serving (also TensorRT-LLM and vLLM backends) | `OSI` ✅ BSD-3-Clause | NVIDIA | Alternative (non-LLM and mixed model estates) | ~11.1k |
| BentoML | [P03](./03-model-serving.md) | Packaging and serving of custom AI APIs | `OSI` ✅ Apache-2.0 | BentoML | Alternative (custom Python services) | ~8.9k |
| OpenLLM | [P03](./03-model-serving.md) | Turnkey OSS LLM serving | `OSI` ✅ Apache-2.0 | BentoML | Alternative | ~12.6k |
| Seldon Core 2 | [P03](./03-model-serving.md) | Kubernetes serving control plane | `Source-available` ⚠️ BSL 1.1 | Seldon | Alternative (licence review) | ~4.8k |
| OpenVINO Model Server | [P03](./03-model-serving.md) | Intel-oriented model serving | `OSI` ✅ Apache-2.0 | OpenVINO toolkit | Alternative (Intel CPU/GPU fleets) | ~0.9k |
| MLC-LLM | [P03](./03-model-serving.md) | Browser, mobile and on-device runtime | `OSI` ✅ Apache-2.0 | MLC | Alternative (edge) | ~23.2k |
| TorchServe | [P03](./03-model-serving.md) | PyTorch model server | `OSI` (verify; repository archived, limited maintenance) | PyTorch / Amazon / Meta | Avoid for new builds | ~4.3k |
| llama.cpp | [P03](./03-model-serving.md), [P04](./04-model-lifecycle-adaptation.md) | Portable CPU and edge inference (GGUF) | `OSI` ✅ MIT | ggml-org | Alternative | — |

### P04 Model lifecycle and adaptation

| Tool | Pillar | Role | Licence label | Steward | Default | Stars |
|------|--------|------|---------------|---------|---------|-------|
| MLflow | [P04](./04-model-lifecycle-adaptation.md), [P07](./07-observability-evaluation.md), [P08](./08-evaluation-quality.md), [P10](./10-governance-finops.md) | Model registry, experiment tracking, lineage; also tracing and eval storage | `OSI` ✅ Apache-2.0 | MLflow project (Linux Foundation) | Default (registry) | ~28.3k |
| Kubeflow Model Registry | [P04](./04-model-lifecycle-adaptation.md) | Model catalogue for Kubeflow estates | `OSI` ✅ Apache-2.0 | Kubeflow community (repository now `kubeflow/hub`) | Alternative | ~0.2k |
| ModelPack spec | [P04](./04-model-lifecycle-adaptation.md) | Vendor-neutral OCI model packaging spec | `OSI` ✅ Apache-2.0 | ModelPack (CNCF sandbox) | Alternative | ~0.2k |
| KitOps | [P04](./04-model-lifecycle-adaptation.md) | Package models as OCI artifacts (ModelKits) | `OSI` ✅ Apache-2.0 | KitOps project (Jozu; repository now `kitops-ml/kitops`) | Alternative | ~1.4k |
| ORAS | [P04](./04-model-lifecycle-adaptation.md) | Push and pull OCI artifacts | `OSI` ✅ Apache-2.0 | ORAS project (CNCF) | Default (with your OCI registry) | ~2.5k |
| Harbor | [P04](./04-model-lifecycle-adaptation.md) | OCI registry for images and model artifacts | `OSI` ✅ Apache-2.0 | Harbor project (CNCF) | Default (example OCI registry) | ~29.5k |
| llm-compressor | [P04](./04-model-lifecycle-adaptation.md) | Post-training quantisation for vLLM | `OSI` ✅ Apache-2.0 | vLLM project | Default | ~3.9k |
| NVIDIA Model Optimizer | [P04](./04-model-lifecycle-adaptation.md) | Quantisation for NVIDIA-only fleets | `OSI` ✅ Apache-2.0 | NVIDIA | Alternative | ~5.3k |
| Olive | [P04](./04-model-lifecycle-adaptation.md) | ONNX and edge model optimisation | `OSI` ✅ MIT | Microsoft | Alternative (ONNX and Windows/edge targets) | ~2.4k |
| DVC | [P04](./04-model-lifecycle-adaptation.md) | Dataset and pipeline versioning and lineage | `OSI` ✅ Apache-2.0 | Treeverse / DVC | Complement | ~15.9k |
| GPTQModel | [P04](./04-model-lifecycle-adaptation.md) | GPTQ quantisation | Verify (GitHub shows `NOASSERTION`) | ModelCloud | Alternative | ~1.3k |
| AutoAWQ | [P04](./04-model-lifecycle-adaptation.md) | AWQ quantisation | `OSI` ✅ MIT | casper-hansen | Avoid (repository archived) | ~2.3k |
| AutoGPTQ | [P04](./04-model-lifecycle-adaptation.md) | GPTQ quantisation | `OSI` ✅ MIT | AutoGPTQ maintainers | Avoid (repository archived) | ~5.1k |
| TRL | [P04](./04-model-lifecycle-adaptation.md) | SFT and preference tuning (DPO and others) | `OSI` ✅ Apache-2.0 | Hugging Face | Default (with PEFT) | ~19.5k |
| PEFT | [P04](./04-model-lifecycle-adaptation.md) | LoRA and QLoRA adapters | `OSI` ✅ Apache-2.0 | Hugging Face | Default (with TRL) | ~21.8k |
| Axolotl | [P04](./04-model-lifecycle-adaptation.md) | YAML-configured tuning recipes | `OSI` ✅ Apache-2.0 | Axolotl (axolotl-ai-cloud) | Alternative | ~12.6k |
| LLaMA-Factory | [P04](./04-model-lifecycle-adaptation.md) | Tuning with web UI and broad model support | `OSI` ✅ Apache-2.0 | hiyouga / community (repository now `hiyouga/LlamaFactory`) | Alternative | ~75.4k |
| Unsloth | [P04](./04-model-lifecycle-adaptation.md) | Memory-efficient single-GPU tuning | `OSI` ✅ Apache-2.0 (check optional add-ons) | Unsloth AI | Alternative | ~77.8k |
| NeMo | [P04](./04-model-lifecycle-adaptation.md) | NVIDIA-centred training at scale | `OSI` ✅ Apache-2.0 | NVIDIA | Alternative | — |
| torchtune | [P04](./04-model-lifecycle-adaptation.md) | PyTorch tuning library | `OSI` ✅ BSD-3-Clause | PyTorch (repository now `meta-pytorch/torchtune`) | Avoid (development wound down 2025) | ~5.8k |
| Distilabel | [P04](./04-model-lifecycle-adaptation.md) | Synthetic data generation | `OSI` ✅ Apache-2.0 | Argilla | Alternative | ~3.4k |
| Kubeflow Trainer | [P04](./04-model-lifecycle-adaptation.md) | Distributed training operator (`TrainJob`) | `OSI` ✅ Apache-2.0 | Kubeflow community | Default | ~2.2k |
| LoRAX | [P04](./04-model-lifecycle-adaptation.md) | Multi-LoRA serving | `OSI` ✅ Apache-2.0 | Predibase | Avoid for new builds (repository archived; use vLLM multi-LoRA) | ~3.8k |

vLLM multi-LoRA serving, the default for adapters, is a vLLM feature (see the vLLM row). Volcano and KAI Scheduler are under P12.

### P05 Knowledge and context

| Tool | Pillar | Role | Licence label | Steward | Default | Stars |
|------|--------|------|---------------|---------|---------|-------|
| pgvector | [P05](./05-data-knowledge-rag.md) | Vector search in PostgreSQL | `OSI` ✅ PostgreSQL licence | pgvector maintainers | Default | ~23.3k |
| Qdrant | [P05](./05-data-knowledge-rag.md) | Dedicated vector database | `OSI` ✅ Apache-2.0 | Qdrant | Default | ~35.0k |
| Milvus | [P05](./05-data-knowledge-rag.md) | Large-scale vector platform | `OSI` ✅ Apache-2.0 | Milvus community (Zilliz-led; LF AI & Data) | Alternative | ~46.3k |
| Weaviate | [P05](./05-data-knowledge-rag.md) | Vector database with object model | `Open-core` ⚠️ (BSD-3-Clause outside `wl/`) | Weaviate BV | Alternative | ~16.9k |
| Chroma | [P05](./05-data-knowledge-rag.md) | Simple developer-first vector store | `OSI` ✅ Apache-2.0 | Chroma | Alternative | ~29.5k |
| LanceDB | [P05](./05-data-knowledge-rag.md) | Embedded vector store | `OSI` ✅ Apache-2.0 | LanceDB | Alternative | — |
| Vespa | [P05](./05-data-knowledge-rag.md) | Ranking and tensor workloads; hybrid search | `OSI` ✅ Apache-2.0 | Vespa.ai | Alternative | ~7.1k |
| OpenSearch | [P05](./05-data-knowledge-rag.md) | Lexical and hybrid (BM25 plus vector) search | `OSI` ✅ Apache-2.0 | OpenSearch Software Foundation (Linux Foundation; Unverified) | Default (lexical and hybrid) | ~13.8k |
| Elasticsearch | [P05](./05-data-knowledge-rag.md) | Lexical and hybrid search | `Source-available` ⚠️ (AGPL-3.0, SSPL or Elastic-2.0 at your choice) | Elastic | Alternative (legal review first) | — |
| Redis | [P05](./05-data-knowledge-rag.md), [P11](./11-reliability-capacity.md) | Cache and vector store | `Source-available` ⚠️ (Redis 8: RSALv2, SSPLv1 or AGPL-3.0) | Redis Ltd. | Avoid unless the AGPL option is acceptable | — |
| Valkey | [P11](./11-reliability-capacity.md), [P05](./05-data-knowledge-rag.md) | Shared exact-cache store | `OSI` ✅ BSD-3-Clause | Valkey (Linux Foundation) | Default (shared exact cache) | ~27.4k |
| Docling | [P05](./05-data-knowledge-rag.md) | Document parsing | `OSI` ✅ MIT | Docling maintainers (originated at IBM Research) | Default | ~68.7k |
| Unstructured | [P05](./05-data-knowledge-rag.md) | File-type ETL | `OSI` ✅ Apache-2.0 for the open-source library; hosted platform is `Not OSS` | Unstructured | Alternative | ~15.6k |
| LlamaIndex | [P05](./05-data-knowledge-rag.md) | RAG orchestration framework (optional) | `OSI` ✅ MIT | LlamaIndex | Optional | ~52.5k |
| Haystack | [P05](./05-data-knowledge-rag.md) | RAG orchestration framework (optional) | `OSI` ✅ Apache-2.0 | deepset | Optional | ~26.7k |
| Mem0 | [P05](./05-data-knowledge-rag.md) | Agent memory layer | `OSI` ✅ Apache-2.0 | Mem0 | Default (agent memory) | ~67.0k |
| Text Embeddings Inference (TEI) | [P05](./05-data-knowledge-rag.md) | Embedding and rerank model server | `OSI` ✅ Apache-2.0 | Hugging Face | Default (embedding and rerank serving) | ~5.1k |
| Infinity | [P05](./05-data-knowledge-rag.md) | Embedding and rerank model server | `OSI` ✅ MIT | Michael Feil | Alternative | ~3.0k |
| Letta | [P05](./05-data-knowledge-rag.md) | Stateful agent runtime with memory blocks | `OSI` ✅ Apache-2.0 | Letta | Alternative | ~25.1k |
| Zep Cloud | [P05](./05-data-knowledge-rag.md) | Managed agent memory (`getzep/zep` holds examples and integrations only) | `Not OSS` | Zep | Reference only (use Graphiti for open temporal memory) | n/a |
| Graphiti | [P05](./05-data-knowledge-rag.md) | Temporal knowledge graph memory | `OSI` ✅ Apache-2.0 | Zep | Default (graph memory) | ~31.6k |
| Microsoft GraphRAG | [P05](./05-data-knowledge-rag.md) | Corpus-level graph indexing | `OSI` ✅ MIT | Microsoft | Alternative | ~36.3k |

Prompt and context assets default to Git; Langfuse prompt management (`Open-core`, see the Langfuse row under P07) is the registry option.

### P06 Agents, tools and protocols

| Tool | Pillar | Role | Licence label | Steward | Default | Stars |
|------|--------|------|---------------|---------|---------|-------|
| MCP | [P06](./06-agents-mcp.md) | Tool and resource protocol | `OSI` ✅ Apache-2.0 for new contributions, legacy MIT (GitHub shows `NOASSERTION`; verify) | Agentic AI Foundation (Linux Foundation), search-cited | Default | ~9.4k |
| MCP Registry | [P06](./06-agents-mcp.md) | Official MCP server registry (preview, API freeze v0.1) | `OSI` ✅ licence-transition file (earlier GitHub showed `NOASSERTION`; read `LICENSE`) | MCP community | Alternative | ~7.4k |
| A2A | [P06](./06-agents-mcp.md) | Agent-to-agent protocol | `OSI` ✅ Apache-2.0 | Linux Foundation (search-cited) | Default | ~26.1k |
| LangGraph | [P06](./06-agents-mcp.md) | Application-level agent runtime | `OSI` ✅ MIT | LangChain | Default | ~43.0k |
| CrewAI | [P06](./06-agents-mcp.md) | Role-based agent crews | `OSI` ✅ MIT | CrewAI | Alternative | ~59.6k |
| OpenAI Agents SDK | [P06](./06-agents-mcp.md) | Agent runtime (Python) | `OSI` ✅ MIT | OpenAI | Alternative | ~30.0k |
| Google ADK | [P06](./06-agents-mcp.md) | Agent runtime | `OSI` ✅ Apache-2.0 | Google | Alternative | ~21.8k |
| Microsoft Agent Framework | [P06](./06-agents-mcp.md) | Agent runtime (.NET and Python) | `OSI` ✅ MIT | Microsoft | Alternative | ~14.1k |
| AutoGen | [P06](./06-agents-mcp.md) | Agent runtime | Verify (code licence not confirmed; docs `CC-BY-4.0`) | Microsoft | Avoid (maintenance mode; use Agent Framework) | ~61.3k |
| Pydantic AI | [P06](./06-agents-mcp.md) | Typed Python agent framework | `OSI` ✅ MIT | Pydantic | Alternative | ~20.7k |
| kagent | [P06](./06-agents-mcp.md) | Kubernetes-native agent control plane | `OSI` ✅ Apache-2.0 | kagent maintainers (CNCF sandbox) | Default (control plane) | ~4.0k |
| agentregistry | [P06](./06-agents-mcp.md) | Agent and MCP registry | `OSI` ✅ Apache-2.0 | Solo.io-led (governance Unverified) | Alternative (young project; a Git-backed catalogue is the P06 default) | ~0.5k |
| IBM ContextForge | [P06](./06-agents-mcp.md) | MCP gateway | `OSI` ✅ Apache-2.0 | IBM | Alternative | ~4.6k |
| gVisor | [P06](./06-agents-mcp.md), [P09](./09-security-safety.md) | Sandbox, low friction | `OSI` ✅ Apache-2.0 | Google / gVisor maintainers | Default (P06) | ~19.6k |
| Kata Containers | [P06](./06-agents-mcp.md), [P09](./09-security-safety.md) | VM-style isolation | `OSI` ✅ Apache-2.0 | Kata community | Default (P09 isolation); alternative (P06) | ~8.9k |
| Firecracker | [P09](./09-security-safety.md) | microVM isolation substrate | `OSI` ✅ Apache-2.0 | Firecracker project | Alternative | ~37.4k |
| agent-sandbox | [P06](./06-agents-mcp.md) | Per-agent sandbox lifecycle on Kubernetes | `OSI` ✅ Apache-2.0 | kubernetes-sigs (maturity Unverified) | Alternative | ~4.2k |
| SPIFFE/SPIRE | [P06](./06-agents-mcp.md), [P09](./09-security-safety.md) | Workload and agent identity | `OSI` ✅ Apache-2.0 | SPIFFE community (CNCF graduated) | Default | ~2.6k (SPIRE) |

### P07 Observability

| Tool | Pillar | Role | Licence label | Steward | Default | Stars |
|------|--------|------|---------------|---------|---------|-------|
| OpenTelemetry | [P07](./07-observability-evaluation.md) | Telemetry standard and SDKs; GenAI semantic conventions (now in `semantic-conventions-genai`, status Development) | `OSI` ✅ Apache-2.0 | OpenTelemetry (CNCF graduated) | Default | — |
| OpenTelemetry Collector | [P07](./07-observability-evaluation.md) | Telemetry pipeline (redact, sample, fan out) | `OSI` ✅ Apache-2.0 | OpenTelemetry (CNCF graduated) | Default | ~7.7k |
| Prometheus | [P07](./07-observability-evaluation.md) | Metrics store | `OSI` ✅ Apache-2.0 | Prometheus (CNCF graduated) | Default | ~66.5k |
| Jaeger | [P07](./07-observability-evaluation.md) | General OTLP trace backend | `OSI` ✅ Apache-2.0 | Jaeger (CNCF graduated) | Default (trace backend) | ~23.3k |
| ClickHouse | [P07](./07-observability-evaluation.md) | Long-retention prompt and event analytics warehouse | `OSI` ✅ Apache-2.0 | ClickHouse, Inc. and community | Default (analytics warehouse) | ~50.5k |
| Grafana Tempo | [P07](./07-observability-evaluation.md) | Trace backend for Grafana stacks | `OSI` ✅ AGPL-3.0 | Grafana Labs | Alternative | ~5.5k |
| Grafana | [P07](./07-observability-evaluation.md) | Dashboards | `OSI` ✅ AGPL-3.0 | Grafana Labs | Default | ~77.2k |
| Langfuse | [P07](./07-observability-evaluation.md), [P08](./08-evaluation-quality.md), [P05](./05-data-knowledge-rag.md) | LLM traces, prompt management, datasets and scores | `Open-core` ⚠️ (MIT outside `ee/`; GitHub shows `NOASSERTION`) | Langfuse (now part of ClickHouse, search-cited) | Alternative (when its open-core boundary is acceptable and prompt workflows matter) | ~35.6k |
| Opik | [P07](./07-observability-evaluation.md), [P08](./08-evaluation-quality.md) | LLM tracing, evals and score store | `OSI` ✅ Apache-2.0 | Comet | Default (OSS LLM UI and score store) | ~22.5k |
| Arize Phoenix | [P07](./07-observability-evaluation.md), [P08](./08-evaluation-quality.md) | LLM tracing and evals | `Source-available` ⚠️ Elastic-2.0 | Arize | Alternative | ~11.8k |
| OpenLIT | [P07](./07-observability-evaluation.md) | LLM instrumentation, dashboards and GPU monitoring | `OSI` ✅ Apache-2.0 | OpenLIT | Alternative | ~2.8k |
| OpenLLMetry | [P07](./07-observability-evaluation.md) | OTel auto-instrumentation of LLM SDKs | `OSI` ✅ Apache-2.0 | Traceloop | Default (instrumentation) | ~7.5k |
| AgentOps | [P07](./07-observability-evaluation.md), [P06](./06-agents-mcp.md) | Agent run tracing and replay | `OSI` ✅ MIT | AgentOps AI (slower since 2025) | Alternative | ~5.9k |
| Laminar | [P07](./07-observability-evaluation.md) | Agent tracing | `OSI` ✅ Apache-2.0 | Laminar (lmnr-ai) | Alternative | ~3.4k |
| Kepler | [P07](./07-observability-evaluation.md) (optional) | Energy telemetry (see [methodology 2.4](./00-methodology.md#24-deliberate-non-pillars)) | `OSI` ✅ Apache-2.0 | Kepler (CNCF sandbox) | Optional | — |

### P08 Evaluation and quality

| Tool | Pillar | Role | Licence label | Steward | Default | Stars |
|------|--------|------|---------------|---------|---------|-------|
| promptfoo | [P08](./08-evaluation-quality.md) | Prompt and application regression gates in CI; red-team mode | `OSI` ✅ MIT | promptfoo | Default | ~25.9k |
| DeepEval | [P08](./08-evaluation-quality.md) | pytest-style LLM metrics | `OSI` ✅ Apache-2.0 | Confident AI | Alternative | ~18.7k |
| OpenEvals | [P08](./08-evaluation-quality.md) | Evaluator library | `OSI` ✅ MIT | LangChain | Alternative | ~1.2k |
| Ragas | [P08](./08-evaluation-quality.md) | RAG quality metrics | `OSI` ✅ Apache-2.0 | Ragas (`vibrantlabsai/ragas`; slower since early 2026) | Default | ~16.0k |
| TruLens | [P08](./08-evaluation-quality.md) | RAG and agent feedback functions | `OSI` ✅ MIT | TruLens maintainers | Alternative | ~3.6k |
| Inspect AI | [P08](./08-evaluation-quality.md) | Agent, tool-use and safety evals | `OSI` ✅ MIT | UK AI Security Institute | Default | ~3.0k |
| Inspect Evals | [P08](./08-evaluation-quality.md) | Ready-made Inspect tasks | `OSI` ✅ MIT | UK AI Security Institute and community | Alternative | ~0.7k |
| lm-eval-harness | [P08](./08-evaluation-quality.md) | Model benchmarks | `OSI` ✅ MIT | EleutherAI | Default | ~14.2k |
| LightEval | [P08](./08-evaluation-quality.md) | Model benchmarks | `OSI` ✅ MIT | Hugging Face | Alternative | ~2.6k |
| HELM | [P08](./08-evaluation-quality.md) | Holistic benchmark scenarios | `OSI` ✅ Apache-2.0 | Stanford CRFM | Alternative | ~2.9k |
| OpenCompass | [P08](./08-evaluation-quality.md) | Model benchmark platform | `OSI` ✅ Apache-2.0 | OpenCompass (Shanghai AI Lab) | Alternative | ~7.5k |
| openai/evals | [P08](./08-evaluation-quality.md) | Eval registry and framework | `OSI` ✅ MIT (`LICENSE.md`) | OpenAI | Alternative (most useful when OpenAI APIs are central) | ~19.6k |
| Giskard | [P08](./08-evaluation-quality.md) | Vulnerability and quality scans | `OSI` ✅ Apache-2.0 | Giskard AI | Alternative | ~5.9k |
| DeepTeam | [P08](./08-evaluation-quality.md) | Red-team scanning | `OSI` ✅ Apache-2.0 | Confident AI | Alternative | ~3.0k |
| Evidently | [P08](./08-evaluation-quality.md) | Drift and data-quality monitoring | `OSI` ✅ Apache-2.0 | Evidently AI | Default | ~8.0k |

### P09 Security and safety

| Tool | Pillar | Role | Licence label | Steward | Default | Stars |
|------|--------|------|---------------|---------|---------|-------|
| NeMo Guardrails | [P09](./09-security-safety.md) | Guardrail orchestration | `OSI` ✅ Apache-2.0 | NVIDIA (`NVIDIA-NeMo/Guardrails`) | Default | — |
| Guardrails AI | [P09](./09-security-safety.md) | Validator-based guardrails | `OSI` ✅ Apache-2.0 | Guardrails AI | Alternative | ~7.5k |
| LLM Guard | [P09](./09-security-safety.md) | Prompt and response classifiers | `OSI` ✅ MIT | Protect AI | Avoid (repository archived 2026) | — |
| Presidio | [P09](./09-security-safety.md) | PII detection and redaction | `OSI` ✅ MIT | Microsoft (`data-privacy-stack/presidio`) | Default | — |
| Llama Guard, Prompt Guard | [P09](./09-security-safety.md) | Safety classifier models | `Open weights` (Llama community licence) | Meta | Default (classifiers) | — |
| Keycloak | [P09](./09-security-safety.md) | Human identity, SSO | `OSI` ✅ Apache-2.0 | Keycloak (CNCF incubating) | Default | — |
| Authentik | [P09](./09-security-safety.md), [P13](./13-platform-experience.md) | Identity provider and SSO | `Open-core` ⚠️ (MIT outside `enterprise/`) | Authentik project | Alternative | ~26.0k |
| Dex | [P09](./09-security-safety.md), [P13](./13-platform-experience.md) | Lightweight OIDC federation | `OSI` ✅ Apache-2.0 | Dex maintainers | Alternative | ~11.2k |
| OpenFGA | [P09](./09-security-safety.md) | Fine-grained authorisation | `OSI` ✅ Apache-2.0 | OpenFGA (CNCF incubating) | Default | — |
| Cedar | [P09](./09-security-safety.md), [P10](./10-governance-finops.md) | Application authorisation policy language | `OSI` ✅ Apache-2.0 | AWS-originated open-source project | Alternative | ~1.8k |
| OpenBao + External Secrets Operator | [P09](./09-security-safety.md), [P12](./12-foundation-infrastructure.md) | Secrets management | `OSI` ✅ MPL-2.0 / Apache-2.0 | OpenBao (Linux Foundation), ESO maintainers | Default | — |
| HashiCorp Vault | [P09](./09-security-safety.md) | Secrets management (reference) | `Source-available` ⚠️ (BSL 1.1 since 2023) | HashiCorp | Avoid | — |
| garak | [P09](./09-security-safety.md), [P08](./08-evaluation-quality.md) | LLM red teaming and vulnerability probes | `OSI` ✅ Apache-2.0 | NVIDIA | Default | ~9.5k |
| PyRIT | [P09](./09-security-safety.md) | Red teaming framework | `OSI` ✅ MIT (moved to `microsoft/PyRIT`; `Azure/PyRIT` archived) | Microsoft | Alternative | — |
| Trivy | [P09](./09-security-safety.md) | Vulnerability and misconfiguration scanning | `OSI` ✅ Apache-2.0 | Aqua Security | Default | — |
| Grype | [P09](./09-security-safety.md) | Vulnerability scanning | `OSI` ✅ Apache-2.0 | Anchore | Alternative | — |
| Syft | [P09](./09-security-safety.md) | SBOM generation | `OSI` ✅ Apache-2.0 | Anchore | Default | — |
| Cosign + Sigstore | [P09](./09-security-safety.md) | Signing and provenance | `OSI` ✅ Apache-2.0 | Sigstore | Default | — |
| OpenSSF model-signing (OMS) | [P09](./09-security-safety.md) | Model signing and provenance (`sigstore/model-transparency`) | `OSI` ✅ Apache-2.0 | OpenSSF / Sigstore | Default (model provenance) | ~0.2k |
| Notation | [P09](./09-security-safety.md) | Artifact signing | `OSI` ✅ Apache-2.0 | Notary Project (CNCF) | Alternative | — |
| Ratify | [P09](./09-security-safety.md) | Artifact verification at admission (Unverified) | Verify | Notary Project / CNCF (Unverified) | Alternative | — |
| Sigstore policy-controller | [P09](./09-security-safety.md) | Signature admission (Unverified) | Verify | Sigstore | Alternative | — |
| kube-bench | [P09](./09-security-safety.md) | CIS benchmark checks (Unverified) | Verify | Aqua Security | Alternative | — |
| Falco | [P09](./09-security-safety.md) | Runtime threat detection | `OSI` ✅ Apache-2.0 | Falco (CNCF graduated) | Default | — |
| Tetragon | [P09](./09-security-safety.md) | eBPF runtime enforcement | `OSI` ✅ Apache-2.0 | Cilium / Isovalent | Alternative | — |
| Calico | [P09](./09-security-safety.md), [P12](./12-foundation-infrastructure.md) | Networking and network policy | `OSI` ✅ Apache-2.0 | Tigera / Calico project | Alternative | — |
| safetensors | [P09](./09-security-safety.md) | Safe model-weight format | `OSI` ✅ Apache-2.0 | Hugging Face (`safetensors/safetensors`) | Default (format) | — |
| ModelScan | [P09](./09-security-safety.md) | Model-artifact scanning | Verify (Apache-2.0 per GitHub; open `LICENSE`) | Protect AI / ModelScan maintainers | Default | — |

gVisor, Kata Containers, SPIFFE/SPIRE, cert-manager, Cilium, Kyverno `verifyImages` and the NVIDIA GPU Operator are listed under their home pillars (P06, P12, P10).

### P10 Governance, risk, compliance and FinOps

| Tool | Pillar | Role | Licence label | Steward | Default | Stars |
|------|--------|------|---------------|---------|---------|-------|
| Kyverno | [P10](./10-governance-finops.md), [P09](./09-security-safety.md) | Kubernetes policy; image verification | `OSI` ✅ Apache-2.0 | Kyverno (CNCF) | Default | — |
| OPA | [P10](./10-governance-finops.md) | General policy engine | `OSI` ✅ Apache-2.0 | OPA maintainers (CNCF graduated) | Alternative (shared policy engine) | — |
| Gatekeeper | [P10](./10-governance-finops.md) | OPA admission integration | `OSI` ✅ Apache-2.0 | Gatekeeper maintainers | Alternative | — |
| CycloneDX ML-BOM | [P10](./10-governance-finops.md) | AI-BOM schema | `OSI` ✅ Apache-2.0 (specification repository; tooling Unverified) | CycloneDX community (OWASP; ECMA-424) | Default | — |
| SPDX | [P10](./10-governance-finops.md) | Licence identifiers and SBOM / AI-BOM format | `OSI` ✅ (specification; confirm per artifact) | Linux Foundation | Alternative (AI profile) | — |
| OpenLineage | [P10](./10-governance-finops.md) | Lineage events | `OSI` ✅ Apache-2.0 (Unverified in pillar) | LF AI & Data | Default | ~2.7k |
| DefectDojo | [P10](./10-governance-finops.md) | Vulnerability finding management | `OSI` ✅ BSD-3-Clause (Unverified in pillar) | OWASP / DefectDojo Inc. | Default | ~5.0k |
| OSCAL | [P10](./10-governance-finops.md) | Control catalogue format | Public-domain NIST specification (Unverified) | NIST | Default | — |
| OpenCost | [P10](./10-governance-finops.md), [P07](./07-observability-evaluation.md), [P13](./13-platform-experience.md) | Kubernetes cost allocation (showback) | `OSI` ✅ Apache-2.0 | OpenCost (CNCF incubating) | Default | ~6.8k |
| Kubecost | [P10](./10-governance-finops.md) | Commercial cost allocation | `Open-core` ⚠️ (IBM-owned; free-tier terms Unverified) | IBM | Alternative | — |
| NVIDIA DCGM Exporter | [P10](./10-governance-finops.md), [P11](./11-reliability-capacity.md) | GPU metrics for utilisation and cost | `OSI` ✅ Apache-2.0 | NVIDIA | Default (GPU metrics) | ~1.9k |
| FinOps FOCUS | [P10](./10-governance-finops.md) | Open cost and usage billing specification | Verify (GitHub shows `NOASSERTION`; spec, Unverified) | FinOps Foundation | Default (cost schema) | ~0.3k |

### P11 Reliability, performance and capacity

| Tool | Pillar | Role | Licence label | Steward | Default | Stars |
|------|--------|------|---------------|---------|---------|-------|
| Sloth | [P11](./11-reliability-capacity.md) | SLO specification to Prometheus rules | `OSI` ✅ Apache-2.0 | Sloth maintainers | Default | ~2.6k |
| Pyrra | [P11](./11-reliability-capacity.md) | SLO dashboard and burn-rate alerts | `OSI` ✅ Apache-2.0 | Pyrra maintainers | Alternative | ~1.6k |
| LMCache | [P11](./11-reliability-capacity.md) | Prefix and KV cache reuse | `OSI` ✅ Apache-2.0 | LMCache | Default | ~12.0k |
| GPTCache | [P11](./11-reliability-capacity.md) | Semantic cache | `OSI` ✅ MIT (last tagged release August 2024; verify fit) | Zilliz | Default (verify) | ~8.2k |
| KEDA | [P11](./11-reliability-capacity.md) | Event-driven autoscaling | `OSI` ✅ Apache-2.0 | KEDA (CNCF graduated) | Default | ~10.6k |
| Karpenter | [P11](./11-reliability-capacity.md), [P12](./12-foundation-infrastructure.md) | Node autoscaling | `OSI` ✅ Apache-2.0 | Kubernetes SIG Autoscaling | Default | ~2.2k |
| Cluster Autoscaler | [P11](./11-reliability-capacity.md), [P12](./12-foundation-infrastructure.md) | Node autoscaling | `OSI` ✅ Apache-2.0 | Kubernetes SIG Autoscaling | Alternative | — |
| Velero | [P11](./11-reliability-capacity.md) | Backup and restore | `OSI` ✅ Apache-2.0 | Velero (CNCF sandbox) | Default | ~10.3k |
| k6 | [P11](./11-reliability-capacity.md) | Load testing | `OSI` ✅ AGPL-3.0 | Grafana Labs | Default | ~31.9k |
| GuideLLM | [P11](./11-reliability-capacity.md) | LLM benchmarking (TTFT, throughput) | `OSI` ✅ Apache-2.0 | vLLM project | Alternative | ~1.7k |
| Chaos Mesh | [P11](./11-reliability-capacity.md) | Failure injection | `OSI` ✅ Apache-2.0 | CNCF incubating | Default | ~7.9k |
| Litmus | [P11](./11-reliability-capacity.md) | Failure injection | `OSI` ✅ Apache-2.0 | Litmus (CNCF incubating) | Alternative | ~5.7k |

Kueue, the P11 default for job queueing and GPU quota, is under P12.

### P12 Foundation and delivery

| Tool | Pillar | Role | Licence label | Steward | Default | Stars |
|------|--------|------|---------------|---------|---------|-------|
| Kubernetes | [P12](./12-foundation-infrastructure.md) | Cluster substrate | `OSI` ✅ Apache-2.0 | Kubernetes (CNCF graduated) | Default | — |
| Talos Linux | [P12](./12-foundation-infrastructure.md) | Opinionated Kubernetes OS | `OSI` ✅ MPL-2.0 | Sidero Labs | Alternative | — |
| Cilium | [P12](./12-foundation-infrastructure.md), [P09](./09-security-safety.md) | Networking and network policy | `OSI` ✅ Apache-2.0 | Cilium (CNCF graduated) | Default | — |
| Istio | [P12](./12-foundation-infrastructure.md) | Service mesh (mTLS, L7 policy) | `OSI` ✅ Apache-2.0 | Istio (CNCF graduated) | Alternative (add only if needed) | — |
| Gateway API | [P12](./12-foundation-infrastructure.md) | Kubernetes traffic routing API | `OSI` ✅ Apache-2.0 | Kubernetes SIG Network | Default (API) | — |
| Rook/Ceph | [P12](./12-foundation-infrastructure.md) | Self-hosted block and object storage | `OSI` ✅ Apache-2.0 for Rook; Ceph is LGPL (verify) | Rook (CNCF graduated), Ceph | Default | — |
| Longhorn | [P12](./12-foundation-infrastructure.md) | Simpler block-first Kubernetes storage | `OSI` ✅ Apache-2.0 | Longhorn project (CNCF) | Alternative | ~8.0k |
| SeaweedFS | [P12](./12-foundation-infrastructure.md) | S3-only object storage | `OSI` ✅ Apache-2.0 | SeaweedFS maintainers | Alternative | — |
| Garage | [P12](./12-foundation-infrastructure.md) | S3-only object storage | `OSI` ✅ AGPL-3.0 (Unverified) | Deuxfleurs | Alternative | — |
| MinIO | [P12](./12-foundation-infrastructure.md) | Object storage | `OSI` ✅ AGPL-3.0 (community repository archived) | MinIO | Avoid | — |
| Argo CD | [P12](./12-foundation-infrastructure.md) | GitOps delivery | `OSI` ✅ Apache-2.0 | Argo (CNCF graduated) | Default | — |
| Flux | [P12](./12-foundation-infrastructure.md) | GitOps delivery | `OSI` ✅ Apache-2.0 | Flux (CNCF graduated) | Alternative | — |
| OpenTofu | [P12](./12-foundation-infrastructure.md) | Infrastructure as code | `OSI` ✅ MPL-2.0 | OpenTofu (CNCF sandbox) | Default | — |
| Terraform | [P12](./12-foundation-infrastructure.md) | Infrastructure as code (reference) | `Source-available` ⚠️ (BUSL-1.1) | HashiCorp (IBM) | Avoid | — |
| Crossplane | [P12](./12-foundation-infrastructure.md), [P13](./13-platform-experience.md) | Control-plane composition | `OSI` ✅ Apache-2.0 | Crossplane (CNCF graduated) | Default | — |
| Helm | [P12](./12-foundation-infrastructure.md) | Packaging | `OSI` ✅ Apache-2.0 | Helm (CNCF) | Default | — |
| Kustomize | [P12](./12-foundation-infrastructure.md) | Manifest overlays | `OSI` ✅ Apache-2.0 | Kubernetes SIG CLI | Alternative | — |
| cert-manager | [P12](./12-foundation-infrastructure.md), [P09](./09-security-safety.md) | Certificate automation | `OSI` ✅ Apache-2.0 | cert-manager (CNCF graduated) | Default | — |
| Kueue | [P12](./12-foundation-infrastructure.md), [P11](./11-reliability-capacity.md), [P04](./04-model-lifecycle-adaptation.md) | Batch queueing, quotas, fair sharing | `OSI` ✅ Apache-2.0 | Kubernetes SIG Scheduling | Default | ~3.1k |
| Volcano | [P12](./12-foundation-infrastructure.md), [P04](./04-model-lifecycle-adaptation.md) | Gang scheduling and batch queues | `OSI` ✅ Apache-2.0 | Volcano (CNCF incubating) | Alternative | ~6.0k |
| KAI Scheduler | [P12](./12-foundation-infrastructure.md), [P04](./04-model-lifecycle-adaptation.md) | GPU sharing and fair share | `OSI` ✅ Apache-2.0 | NVIDIA (repository now `kai-scheduler/KAI-Scheduler`) | Alternative | ~1.6k |
| NVIDIA GPU Operator | [P12](./12-foundation-infrastructure.md), [P09](./09-security-safety.md) | GPU software stack lifecycle | `OSI` ✅ Apache-2.0 for the operator; verify licences of installed drivers and containers | NVIDIA | Default | — |
| External Secrets Operator | [P12](./12-foundation-infrastructure.md), [P09](./09-security-safety.md) | Sync secrets from a store (see OpenBao row in P09) | `OSI` ✅ Apache-2.0 | ESO (CNCF) | Default | — |

### P13 Platform experience and tenancy

| Tool | Pillar | Role | Licence label | Steward | Default | Stars |
|------|--------|------|---------------|---------|---------|-------|
| Backstage | [P13](./13-platform-experience.md) | Developer portal and catalogue; Software Templates and TechDocs | `OSI` ✅ Apache-2.0 | Backstage (CNCF incubating) | Default | ~34.6k |
| Red Hat Developer Hub | [P13](./13-platform-experience.md) | Supported Backstage distribution | `OSI` ✅ Apache-2.0 | Red Hat | Alternative | ~0.2k |
| Port | [P13](./13-platform-experience.md) | Developer portal (SaaS only) | `Not OSS` | Port | Reference only | — |
| Headlamp | [P13](./13-platform-experience.md) | Extensible cluster UI | `OSI` ✅ Apache-2.0 | Kubernetes SIG UI (CNCF sandbox per landscape) | Default | ~7.4k |
| Kubeflow Central Dashboard | [P13](./13-platform-experience.md) | Cluster UI for ML teams | `OSI` ✅ Apache-2.0 | Kubeflow (CNCF graduated) | Alternative | — |
| Kubernetes Dashboard | [P13](./13-platform-experience.md) | Cluster UI | `OSI` ✅ Apache-2.0 | Kubernetes (`kubernetes-retired`) | Avoid (archived) | ~15.4k |
| MkDocs Material | [P13](./13-platform-experience.md) | Docs-as-code | `OSI` ✅ MIT | Squidfunk | Default (or Backstage TechDocs) | — |
| kro | [P13](./13-platform-experience.md) | Resource composition | `OSI` ✅ Apache-2.0 | kubernetes-sigs (steward Unverified) | Alternative | ~3.1k |
| Azure Developer CLI | [P13](./13-platform-experience.md) | Project templates (`azd`) | `OSI` ✅ MIT | Microsoft | Alternative | — |
| Coder | [P13](./13-platform-experience.md) | Governed cloud dev environments | `OSI` ✅ AGPL-3.0 | Coder Inc. | Default (check AGPL fit) | ~17.0k |
| LibreChat | [P13](./13-platform-experience.md) | Chat UI with SSO and multi-provider support | `OSI` ✅ MIT | LibreChat project (`LibreChat-AI/LibreChat`) | Default | ~45.5k |
| Open WebUI | [P13](./13-platform-experience.md) | Chat UI | `Source-available` ⚠️ (BSD-3-style plus branding clause above 50 users in 30 days) | Open WebUI | Alternative (legal review) | ~154k |
| Langflow | [P13](./13-platform-experience.md) | Visual AI app and agent studio | `OSI` ✅ MIT | Langflow project | Default (builder studio) | ~155.8k |
| Dify | [P13](./13-platform-experience.md) | Visual studio and chat platform | `Source-available` ⚠️ (modified Apache-2.0) | LangGenius | Alternative (legal review) | ~158.7k |
| Flowise | [P13](./13-platform-experience.md) | Visual studio | `Open-core` ⚠️ (Apache-2.0 outside enterprise directories; repository archived) | FlowiseAI | Alternative (check maintenance) | ~55.5k |
| LobeChat | [P13](./13-platform-experience.md) | Chat UI | `Source-available` ⚠️ (Apache-2.0-based community licence with extra terms) | LobeHub | Alternative (legal review) | ~83.1k |
| Hugging Face chat-ui | [P13](./13-platform-experience.md) | Chat UI | `OSI` ✅ Apache-2.0 | Hugging Face | Alternative | — |
| Jan | [P13](./13-platform-experience.md) | Local desktop chat | Verify (GitHub shows `NOASSERTION`) | Menlo Research | Individual use only | ~44.9k |
| Continue | [P13](./13-platform-experience.md) | IDE assistant pointed at the gateway | `OSI` ✅ Apache-2.0 | Continue Dev | Default | ~36.2k |
| Capsule | [P13](./13-platform-experience.md) | Tenant abstraction over namespaces | `OSI` ✅ Apache-2.0 | Capsule (CNCF sandbox) | Default | ~2.2k |
| Kubernetes Hierarchical Namespaces | [P13](./13-platform-experience.md) | Hierarchical tenancy | `OSI` ✅ Apache-2.0 | `kubernetes-retired` | Avoid (archived) | — |
| vCluster | [P13](./13-platform-experience.md) | Virtual clusters per tenant | `OSI` ✅ Apache-2.0 | Loft Labs (not a CNCF project in the landscape file) | Default | ~11.3k |
| Kamaji | [P13](./13-platform-experience.md) | Hosted control planes | `OSI` ✅ Apache-2.0 | Clastix | Alternative | ~2.1k |
| HyperShift | [P13](./13-platform-experience.md) | Hosted control planes | `OSI` ✅ Apache-2.0 | Red Hat (OpenShift) | Alternative | ~0.5k |
| Cluster API | [P13](./13-platform-experience.md) | Dedicated clusters | `OSI` ✅ Apache-2.0 | Kubernetes SIG Cluster Lifecycle | Default (dedicated clusters) | — |
| Spectral | [P13](./13-platform-experience.md) | OpenAPI linting | `OSI` ✅ Apache-2.0 | Stoplight | Default | ~3.2k |
| oasdiff | [P13](./13-platform-experience.md) | OpenAPI breaking-change diff | `OSI` ✅ Apache-2.0 | oasdiff | Default | ~1.4k |
| OpenAPI Generator | [P13](./13-platform-experience.md) | SDK wrapper generation | `OSI` ✅ Apache-2.0 | OpenAPITools | Default | ~26.8k |
| openai-openapi | [P13](./13-platform-experience.md) | Baseline OpenAI API description | `OSI` ✅ MIT | OpenAI | Reference | — |

## Filling in the blanks

Use the commands in [methodology section 5](./00-methodology.md#5-snapshot-and-refresh). For a quick pass over many tools:

```bash
for r in BerriAI/litellm vllm-project/vllm kserve/kserve; do
  gh api repos/$r --jq '[.full_name, .stargazers_count, .license.spdx_id, .pushed_at, .archived] | @tsv'
  gh api repos/$r/releases/latest --jq '[.tag_name, .published_at] | @tsv'
done
```

Round stars to 0.1k, record the date, and open the `LICENSE` file for any tool you adopt.

## Spot-check findings (2026-10-11)

GitHub API checks of the recommended repositories found changes that older text may not reflect. Where this table and a pillar differ on these points, the dated finding here is newer.

| Tool | Finding |
|------|---------|
| LLM Guard | Repository and Hugging Face models archived by Protect AI (README: no longer maintained). Treat as legacy; prefer Presidio plus NeMo Guardrails, or Llama Guard / Prompt Guard (open weights) |
| MinIO | `minio/minio` archived, "no longer maintained"; AGPL-3.0 code remains. Prefer Rook/Ceph or a managed S3-compatible store; do not start new deployments on it |
| Hugging Face TGI | README states maintenance mode; repository archived. Avoid for new builds |
| PyRIT | `Azure/PyRIT` archived; the project continues as `microsoft/PyRIT` |
| AutoAWQ, AutoGPTQ | Both repositories archived; the AWQ and GPTQ formats still load in many engines |
| torchtune | Development wound down in 2025; repository now `meta-pytorch/torchtune` and licensed BSD-3-Clause (not Apache-2.0) |
| Kubernetes Dashboard, Hierarchical Namespaces | Archived under `kubernetes-retired`; use Headlamp and Capsule |
| Renamed or moved | MCP specification (`modelcontextprotocol/modelcontextprotocol`), NeMo Guardrails (`NVIDIA-NeMo/Guardrails`), Presidio (`data-privacy-stack/presidio`), safetensors (`safetensors/safetensors`), Ragas (`vibrantlabsai/ragas`), KitOps (`kitops-ml/kitops`), Kubeflow Model Registry (`kubeflow/hub`), KAI Scheduler (`kai-scheduler/KAI-Scheduler`), LLaMA-Factory (`hiyouga/LlamaFactory`), torchtune (`meta-pytorch/torchtune`); old URLs redirect. `NVIDIA-NeMo/NeMo` now redirects to the NeMo Speech repository, so confirm which NeMo repository P04 means |
| 2026-10-17 review corrections | LoRAX and TensorZero repositories are archived; TorchServe is archived with limited maintenance. openai/evals carries an MIT `LICENSE.md`; the MCP Registry carries a licence-transition file and is in preview (API freeze v0.1). Zep Cloud is `Not OSS` (`getzep/zep` is examples and integrations; Graphiti is the open building block). Flowise is archived. Langfuse and agentregistry are now alternatives (P07 default Opik; P06 default a Git-backed catalogue) |
| Licence badges | GitHub shows no SPDX identifier (`NOASSERTION`) for NVIDIA Dynamo, TensorRT-LLM, KAITO, GPTQModel, MCP and the MCP Registry, Langfuse (open-core), Open WebUI, LobeChat, Jan, openai/evals and FinOps FOCUS; read each `LICENSE` file. pgvector (PostgreSQL licence), Arize Phoenix (Elastic-2.0) and Vault (BSL) are also not plain Apache-2.0/MIT |
