# Tool landscape

> **TL;DR** — Every tool recommended in the pillar documents, in one catalog: pillar, role, licence label and steward. Star counts and latest releases are deliberately **not filled in**: they could not be verified when this catalog was assembled, and an unverified number is worse than none. Fill them in with the commands in the [methodology](./00-methodology.md#5-snapshot-and-refresh) before you shortlist.

*Snapshot: 2026-10-11 · Related: [Methodology](./00-methodology.md) · [Reference architecture](./01-reference-architecture.md) · [References](./17-references.md)*

## How to read this catalog

- **Default** marks the pillar's default pick; everything else is an alternative or a supporting tool.
- Licence labels follow the [legend](./00-methodology.md#32-licence-policy-and-legend). "Verify" means the `LICENSE` file was not confirmed in this edit, so open it before adopting the tool.
- The pillar document is the authority; this table summarises it. If they differ, the pillar document wins.
- **Stars** and **Latest release** are shown as `—` (not verified).

## Catalog

| Tool | Pillar | Role | Licence label | Steward | Default | Stars | Latest release |
|------|--------|------|---------------|---------|---------|-------|----------------|
| LiteLLM | [P02](./02-ai-gateway-routing.md) | AI gateway; virtual keys, quotas | `Open-core` ⚠️ (MIT outside `enterprise/`) | BerriAI | Default | — | — |
| Agent Router (formerly Envoy AI Gateway) | [P02](./02-ai-gateway-routing.md), [P02](./02-ai-gateway-routing.md) | Kubernetes-native gateway and router | `OSI` ✅ Apache-2.0 | Agent Router project | Default (P02) | — | — |
| Kong Gateway core | [P02](./02-ai-gateway-routing.md), [P02](./02-ai-gateway-routing.md) | General API gateway with AI plugins | `OSI` ✅ Apache-2.0 | Kong Inc. | Alternative | — | — |
| Gateway API Inference Extension | [P02](./02-ai-gateway-routing.md) | Inference-aware endpoint selection | `OSI` ✅ Apache-2.0 | kubernetes-sigs | Alternative | — | — |
| KServe | [P03](./03-model-serving.md) | Kubernetes serving control plane | `OSI` ✅ Apache-2.0 | KServe community | Default | — | — |
| vLLM | [P03](./03-model-serving.md) | LLM inference engine | `OSI` ✅ Apache-2.0 | vLLM project | Default | — | — |
| llm-d | [P03](./03-model-serving.md) | Inference-aware, disaggregated serving | `OSI` ✅ Apache-2.0 | llm-d community | Alternative | — | — |
| Ollama | [P03](./03-model-serving.md) | Local and edge packaging | `OSI` ✅ MIT | Ollama | Alternative | — | — |
| llama.cpp | [P03](./03-model-serving.md) | Portable CPU and edge inference (GGUF) | `OSI` ✅ MIT | ggml-org | Alternative | — | — |
| SGLang | [P03](./03-model-serving.md) | LLM inference engine | `OSI` ✅ Apache-2.0 | SGLang project | Alternative | — | — |
| Hugging Face TGI | [P03](./03-model-serving.md) | LLM inference engine | `OSI` ✅ Apache-2.0 | Hugging Face | Alternative (maintenance mode; repository archived) | — | — |
| NVIDIA Dynamo | [P03](./03-model-serving.md) | Distributed inference serving | Verify (GitHub shows no SPDX identifier) | NVIDIA | Alternative | — | — |
| pgvector | [P05](./05-data-knowledge-rag.md) | Vector search in PostgreSQL | `OSI` ✅ PostgreSQL licence | pgvector maintainers | Default | — | — |
| Qdrant | [P05](./05-data-knowledge-rag.md) | Dedicated vector database | `OSI` ✅ Apache-2.0 | Qdrant | Default | — | — |
| Milvus | [P05](./05-data-knowledge-rag.md) | Large-scale vector platform | `OSI` ✅ Apache-2.0 | Milvus community | Alternative | — | — |
| Weaviate | [P05](./05-data-knowledge-rag.md) | Vector database with object model | `OSI` ✅ BSD-3-Clause | Weaviate | Alternative | — | — |
| Docling | [P05](./05-data-knowledge-rag.md) | Document parsing | `OSI` ✅ MIT | Docling maintainers | Default | — | — |
| Unstructured | [P05](./05-data-knowledge-rag.md) | File-type ETL | `OSI` ✅ Apache-2.0 for the open-source library (per GitHub); hosted platform is commercial | Unstructured | Alternative | — | — |
| MCP | [P06](./06-agents-mcp.md) | Tool and resource protocol | Verify (GitHub shows no SPDX identifier; repository now `modelcontextprotocol/modelcontextprotocol`) | MCP community | Default | — | — |
| A2A | [P06](./06-agents-mcp.md) | Agent-to-agent protocol | `OSI` ✅ Apache-2.0 (per GitHub) | Linux Foundation (unverified) | Default | — | — |
| LangGraph | [P06](./06-agents-mcp.md) | Application-level agent runtime | `OSI` ✅ MIT | LangChain ecosystem | Default | — | — |
| kagent | [P06](./06-agents-mcp.md) | Kubernetes-native agent control plane | `OSI` ✅ Apache-2.0 | kagent maintainers | Alternative | — | — |
| gVisor | [P06](./06-agents-mcp.md), [P09](./09-security-safety.md) | Sandbox, low friction | `OSI` ✅ Apache-2.0 | Google | Default (P06) | — | — |
| Kata Containers | [P06](./06-agents-mcp.md), [P09](./09-security-safety.md) | VM-style isolation | `OSI` ✅ Apache-2.0 | Kata community | Default (P09) | — | — |
| OpenTelemetry | [P07](./07-observability-evaluation.md) | Telemetry standard and SDKs | `OSI` ✅ Apache-2.0 | OpenTelemetry / CNCF | Default | — | — |
| OpenTelemetry Collector | [P07](./07-observability-evaluation.md) | Telemetry pipeline | `OSI` ✅ Apache-2.0 | OpenTelemetry / CNCF | Default | — | — |
| Kepler | [P07](./07-observability-evaluation.md) (optional) | Energy telemetry (see [methodology 2.4](./00-methodology.md#24-deliberate-non-pillars)) | `OSI` ✅ Apache-2.0 | Kepler / CNCF Sandbox | Optional | — | — |
| Prometheus | [P07](./07-observability-evaluation.md) | Metrics store | `OSI` ✅ Apache-2.0 | Prometheus / CNCF | Default | — | — |
| Grafana | [P07](./07-observability-evaluation.md) | Dashboards | `OSI` ✅ AGPL-3.0 | Grafana Labs | Default | — | — |
| Langfuse | [P07](./07-observability-evaluation.md) | LLM traces and prompt analytics | `Open-core` ⚠️ (verify `ee/`) | Langfuse | Default | — | — |
| Arize Phoenix | [P07](./07-observability-evaluation.md) | LLM tracing and evals | `Source-available` ⚠️ Elastic-2.0 (verify) | Arize | Alternative | — | — |
| OpenLIT | [P07](./07-observability-evaluation.md) | LLM instrumentation | `OSI` ✅ Apache-2.0 | OpenLIT | Alternative | — | — |
| promptfoo | [P07](./07-observability-evaluation.md) | Prompt regression testing | `OSI` ✅ MIT | promptfoo | Default | — | — |
| lm-eval-harness | [P07](./07-observability-evaluation.md) | Model benchmarks | `OSI` ✅ MIT | EleutherAI | Default | — | — |
| Ragas | [P07](./07-observability-evaluation.md) | RAG quality metrics | `OSI` ✅ Apache-2.0 | Ragas | Default | — | — |
| OpenCost | [P07](./07-observability-evaluation.md), [P10](./10-governance-finops.md) | Kubernetes cost allocation | `OSI` ✅ Apache-2.0 | OpenCost / CNCF | Default | — | — |
| NeMo Guardrails | [P09](./09-security-safety.md) | Guardrail orchestration | `OSI` ✅ Apache-2.0 | NVIDIA | Default | — | — |
| LLM Guard | [P09](./09-security-safety.md) | Prompt and response classifiers | `OSI` ✅ MIT (**repository archived 2026**) | Protect AI | Default (see note) | — | — |
| Presidio | [P09](./09-security-safety.md) | PII detection and redaction | `OSI` ✅ MIT | Microsoft | Default | — | — |
| Llama Guard, Prompt Guard | [P09](./09-security-safety.md) | Safety classifier models | `Open weights` | Meta | Alternative | — | — |
| Keycloak | [P09](./09-security-safety.md) | Human identity, SSO | `OSI` ✅ Apache-2.0 | Keycloak | Default | — | — |
| OpenFGA | [P09](./09-security-safety.md) | Fine-grained authorisation | `OSI` ✅ Apache-2.0 | OpenFGA | Default | — | — |
| SPIFFE/SPIRE | [P09](./09-security-safety.md) | Workload identity | `OSI` ✅ Apache-2.0 | SPIFFE community | Default | — | — |
| OpenBao + External Secrets Operator | [P09](./09-security-safety.md) | Secrets management | `OSI` ✅ MPL-2.0 / Apache-2.0 | OpenBao, ESO | Default | — | — |
| HashiCorp Vault | [P09](./09-security-safety.md) | Secrets management (reference) | `Source-available` ⚠️ (reported BSL) | HashiCorp | Not recommended | — | — |
| garak | [P09](./09-security-safety.md) | LLM red teaming | `OSI` ✅ Apache-2.0 | garak maintainers | Default | — | — |
| PyRIT | [P09](./09-security-safety.md) | Red teaming framework | `OSI` ✅ MIT (moved to `microsoft/PyRIT`; `Azure/PyRIT` archived) | Microsoft | Alternative | — | — |
| Kyverno | [P10](./10-governance-finops.md) | Kubernetes policy | `OSI` ✅ Apache-2.0 | Kyverno / CNCF | Default | — | — |
| OPA and Gatekeeper | [P10](./10-governance-finops.md) | General policy engine; admission | `OSI` ✅ Apache-2.0 | OPA maintainers | Alternative | — | — |
| MLflow | [P10](./10-governance-finops.md) | Model registry and lineage | `OSI` ✅ Apache-2.0 | MLflow maintainers | Default | — | — |
| CycloneDX ML-BOM | [P10](./10-governance-finops.md) | AI-BOM schema | `OSI` ✅ Apache-2.0 (specification repository, per GitHub) | CycloneDX community | Default | — | — |
| Cluster Autoscaler | [P11](./11-reliability-capacity.md) | Node autoscaling | `OSI` ✅ Apache-2.0 | Kubernetes SIG Autoscaling | Alternative | — | — |
| GuideLLM | [P11](./11-reliability-capacity.md) | LLM benchmarking | `OSI` ✅ Apache-2.0 | vLLM project | Alternative | — | — |
| Sloth, Pyrra | [P11](./11-reliability-capacity.md) | SLO tooling | `OSI` ✅ Apache-2.0 | Respective maintainers | Default / alternative | — | — |
| LMCache | [P11](./11-reliability-capacity.md) | Prefix and KV cache reuse | `OSI` ✅ Apache-2.0 | LMCache | Default | — | — |
| GPTCache | [P11](./11-reliability-capacity.md) | Semantic cache | `OSI` ✅ MIT (verify maintenance) | GPTCache maintainers | Default | — | — |
| KEDA | [P11](./11-reliability-capacity.md) | Event-driven autoscaling | `OSI` ✅ Apache-2.0 | KEDA / CNCF | Default | — | — |
| Karpenter | [P11](./11-reliability-capacity.md) | Node autoscaling | `OSI` ✅ Apache-2.0 | Karpenter maintainers | Default | — | — |
| Velero | [P11](./11-reliability-capacity.md) | Backup and restore | `OSI` ✅ Apache-2.0 | Velero maintainers | Default | — | — |
| k6 | [P11](./11-reliability-capacity.md) | Load testing | `OSI` ✅ AGPL-3.0 | Grafana Labs | Default | — | — |
| Calico | [P09](./09-security-safety.md), [P12](./12-foundation-infrastructure.md) | Networking and network policy | `OSI` ✅ Apache-2.0 | Tigera / Calico project | Alternative | — | — |
| Cilium | [P09](./09-security-safety.md), [P12](./12-foundation-infrastructure.md) | Networking and network policy | `OSI` ✅ Apache-2.0 | Cilium / CNCF | Default | — | — |
| Falco | [P09](./09-security-safety.md) | Runtime threat detection | `OSI` ✅ Apache-2.0 | Falco / CNCF | Default | — | — |
| Tetragon | [P09](./09-security-safety.md) | eBPF runtime enforcement | `OSI` ✅ Apache-2.0 | Cilium / Isovalent | Alternative | — | — |
| Trivy | [P09](./09-security-safety.md) | Vulnerability and misconfiguration scanning | `OSI` ✅ Apache-2.0 | Trivy maintainers | Default | — | — |
| Cosign + Sigstore | [P09](./09-security-safety.md) | Signing and provenance | `OSI` ✅ Apache-2.0 | Sigstore | Default | — | — |
| Grype | [P09](./09-security-safety.md) | Vulnerability scanning | `OSI` ✅ Apache-2.0 | Anchore | Alternative | — | — |
| Notation | [P09](./09-security-safety.md) | Artifact signing | `OSI` ✅ Apache-2.0 | Notary Project / CNCF | Alternative | — | — |
| safetensors | [P09](./09-security-safety.md) | Safe model-weight format | `OSI` ✅ Apache-2.0 | Hugging Face | Default (format) | — | — |
| Syft | [P09](./09-security-safety.md) | SBOM generation | `OSI` ✅ Apache-2.0 | Anchore | Default | — | — |
| ModelScan | [P09](./09-security-safety.md) | Model-artifact scanning | `OSI` ✅ Apache-2.0 (per GitHub; open `LICENSE` to confirm) | ModelScan maintainers | Default | — | — |
| NVIDIA GPU Operator | [P09](./09-security-safety.md) | GPU software stack lifecycle | `OSI` ✅ Apache-2.0 for the operator; verify licences of the drivers and containers it installs | NVIDIA | Default | — | — |
| Kubernetes | [P12](./12-foundation-infrastructure.md) | Cluster substrate | `OSI` ✅ Apache-2.0 | Kubernetes / CNCF | Default | — | — |
| Rook/Ceph | [P12](./12-foundation-infrastructure.md) | Self-hosted storage | `OSI` (verify; Rook is Apache-2.0, Ceph is LGPL) | Rook, Ceph | Default | — | — |
| MinIO | [P12](./12-foundation-infrastructure.md) | Object storage | `OSI` ✅ AGPL-3.0 (community repository archived; README says no longer maintained, with commercial AIStor offered instead) | MinIO | Not recommended | — | — |
| Kustomize | [P12](./12-foundation-infrastructure.md) | Manifest overlays | `OSI` ✅ Apache-2.0 | Kubernetes SIG CLI | Alternative | — | — |
| Argo CD | [P12](./12-foundation-infrastructure.md) | GitOps delivery | `OSI` ✅ Apache-2.0 | Argo / CNCF | Default | — | — |
| Flux | [P12](./12-foundation-infrastructure.md) | GitOps delivery | `OSI` ✅ Apache-2.0 | Flux / CNCF | Alternative | — | — |
| OpenTofu | [P12](./12-foundation-infrastructure.md) | Infrastructure as code | `OSI` ✅ MPL-2.0 | OpenTofu | Default | — | — |
| Terraform | [P12](./12-foundation-infrastructure.md) | Infrastructure as code (reference) | `Source-available` ⚠️ (BUSL) | HashiCorp | Not recommended | — | — |
| Crossplane | [P12](./12-foundation-infrastructure.md) | Control-plane composition | `OSI` ✅ Apache-2.0 | Crossplane / CNCF | Default | — | — |
| Helm | [P12](./12-foundation-infrastructure.md) | Packaging | `OSI` ✅ Apache-2.0 | Helm / CNCF | Default | — | — |
| cert-manager | [P12](./12-foundation-infrastructure.md) | Certificate automation | `OSI` ✅ Apache-2.0 | cert-manager / CNCF | Default | — | — |
| Kueue | [P12](./12-foundation-infrastructure.md) | Batch queueing | `OSI` ✅ Apache-2.0 | Kubernetes SIG Scheduling | Default | — | — |

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

GitHub API checks of the recommended repositories found changes that the pillar documents may not yet reflect. Where this table and a pillar differ on these points, the dated finding here is newer.

| Tool | Finding |
|------|---------|
| LLM Guard | Repository and Hugging Face models archived by Protect AI (README: no longer maintained). Treat as legacy; prefer Presidio plus NeMo Guardrails, or Llama Guard / Prompt Guard (open weights) |
| MinIO | `minio/minio` archived, "no longer maintained"; AGPL-3.0 code remains. Prefer Rook/Ceph or a managed S3-compatible store; do not start new deployments on it |
| Hugging Face TGI | README states maintenance mode; repository archived. The caveat is real |
| PyRIT | `Azure/PyRIT` archived; the project continues as `microsoft/PyRIT` |
| Renamed or moved | MCP specification (`modelcontextprotocol/modelcontextprotocol`), NeMo Guardrails (`NVIDIA-NeMo/Guardrails`), Presidio (`data-privacy-stack/presidio`), safetensors (`safetensors/safetensors`), Ragas (`vibrantlabsai/ragas`); old URLs redirect |
| Licence badges | GitHub shows no SPDX identifier for pgvector (PostgreSQL licence), Langfuse (open-core), Arize Phoenix (Elastic-2.0), Vault (BSL), MCP and NVIDIA Dynamo; read the `LICENSE` file for each |
