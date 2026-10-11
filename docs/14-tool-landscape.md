# Tool landscape

> **TL;DR** — Every tool recommended in the pillar documents, in one catalog: pillar, role, licence label and steward. Star counts and latest releases are deliberately **not filled in**: they could not be verified when this catalog was assembled, and an unverified number is worse than none. Fill them in with the commands in the [methodology](./00-methodology.md#5-snapshot-and-refresh) before you shortlist.

*Snapshot: 2026-10-11 · Related: [Methodology](./00-methodology.md) · [Reference architecture](./01-reference-architecture.md) · [References](./16-references.md)*

## How to read this catalog

- **Default** marks the pillar's default pick; everything else is an alternative or a supporting tool.
- Licence labels follow the [legend](./00-methodology.md#32-licence-policy-and-legend). "Verify" means the `LICENSE` file was not confirmed in this edit, so open it before adopting the tool.
- The pillar document is the authority; this table summarises it. If they differ, the pillar document wins.
- **Stars** and **Latest release** are shown as `—` (not verified).

## Catalog

| Tool | Pillar | Role | Licence label | Steward | Default | Stars | Latest release |
|------|--------|------|---------------|---------|---------|-------|----------------|
| LiteLLM | [P02](./02-ai-gateway.md) | AI gateway; virtual keys, quotas | `Open-core` ⚠️ (MIT outside `enterprise/`) | BerriAI | Default | — | — |
| Agent Router (formerly Envoy AI Gateway) | [P02](./02-ai-gateway.md), [P03](./03-model-router.md) | Kubernetes-native gateway and router | `OSI` ✅ Apache-2.0 | Agent Router project | Default (P03) | — | — |
| Kong Gateway core | [P02](./02-ai-gateway.md), [P03](./03-model-router.md) | General API gateway with AI plugins | `OSI` ✅ Apache-2.0 | Kong Inc. | Alternative | — | — |
| Gateway API Inference Extension | [P03](./03-model-router.md) | Inference-aware endpoint selection | `OSI` ✅ Apache-2.0 | kubernetes-sigs | Alternative | — | — |
| KServe | [P04](./04-model-serving.md) | Kubernetes serving control plane | `OSI` ✅ Apache-2.0 | KServe community | Default | — | — |
| vLLM | [P04](./04-model-serving.md) | LLM inference engine | `OSI` ✅ Apache-2.0 | vLLM project | Default | — | — |
| llm-d | [P04](./04-model-serving.md) | Inference-aware, disaggregated serving | `OSI` ✅ Apache-2.0 | llm-d community | Alternative | — | — |
| Ollama | [P04](./04-model-serving.md) | Local and edge packaging | `OSI` ✅ MIT | Ollama | Alternative | — | — |
| pgvector | [P05](./05-data-knowledge-rag.md) | Vector search in PostgreSQL | `OSI` ✅ PostgreSQL licence | pgvector maintainers | Default | — | — |
| Qdrant | [P05](./05-data-knowledge-rag.md) | Dedicated vector database | `OSI` ✅ Apache-2.0 | Qdrant | Default | — | — |
| Milvus | [P05](./05-data-knowledge-rag.md) | Large-scale vector platform | `OSI` ✅ Apache-2.0 | Milvus community | Alternative | — | — |
| Weaviate | [P05](./05-data-knowledge-rag.md) | Vector database with object model | `OSI` ✅ BSD-3-Clause | Weaviate | Alternative | — | — |
| Docling | [P05](./05-data-knowledge-rag.md) | Document parsing | `OSI` ✅ MIT | Docling maintainers | Default | — | — |
| Unstructured | [P05](./05-data-knowledge-rag.md) | File-type ETL | Verify | Unstructured | Alternative | — | — |
| MCP | [P06](./06-agents-mcp.md) | Tool and resource protocol | Verify spec repository | MCP community | Default | — | — |
| A2A | [P06](./06-agents-mcp.md) | Agent-to-agent protocol | Verify spec repository | Linux Foundation (unverified) | Default | — | — |
| LangGraph | [P06](./06-agents-mcp.md) | Application-level agent runtime | `OSI` ✅ MIT | LangChain ecosystem | Default | — | — |
| kagent | [P06](./06-agents-mcp.md) | Kubernetes-native agent control plane | `OSI` ✅ Apache-2.0 | kagent maintainers | Alternative | — | — |
| gVisor | [P06](./06-agents-mcp.md), [P11](./11-hardening.md) | Sandbox, low friction | `OSI` ✅ Apache-2.0 | Google | Default (P06) | — | — |
| Kata Containers | [P06](./06-agents-mcp.md), [P11](./11-hardening.md) | VM-style isolation | `OSI` ✅ Apache-2.0 | Kata community | Default (P11) | — | — |
| OpenTelemetry | [P07](./07-observability-evaluation.md) | Telemetry standard and SDKs | `OSI` ✅ Apache-2.0 | OpenTelemetry / CNCF | Default | — | — |
| Prometheus | [P07](./07-observability-evaluation.md) | Metrics store | `OSI` ✅ Apache-2.0 | Prometheus / CNCF | Default | — | — |
| Grafana | [P07](./07-observability-evaluation.md) | Dashboards | `OSI` ✅ AGPL-3.0 | Grafana Labs | Default | — | — |
| Langfuse | [P07](./07-observability-evaluation.md) | LLM traces and prompt analytics | `Open-core` ⚠️ (verify `ee/`) | Langfuse | Default | — | — |
| Arize Phoenix | [P07](./07-observability-evaluation.md) | LLM tracing and evals | `Source-available` ⚠️ Elastic-2.0 (verify) | Arize | Alternative | — | — |
| OpenLIT | [P07](./07-observability-evaluation.md) | LLM instrumentation | `OSI` ✅ Apache-2.0 | OpenLIT | Alternative | — | — |
| promptfoo | [P07](./07-observability-evaluation.md) | Prompt regression testing | `OSI` ✅ MIT | promptfoo | Default | — | — |
| lm-eval-harness | [P07](./07-observability-evaluation.md) | Model benchmarks | `OSI` ✅ MIT | EleutherAI | Default | — | — |
| Ragas | [P07](./07-observability-evaluation.md) | RAG quality metrics | `OSI` ✅ Apache-2.0 | Ragas | Default | — | — |
| OpenCost | [P07](./07-observability-evaluation.md), [P09](./09-governance-risk-compliance.md) | Kubernetes cost allocation | `OSI` ✅ Apache-2.0 | OpenCost / CNCF | Default | — | — |
| NeMo Guardrails | [P08](./08-security.md) | Guardrail orchestration | `OSI` ✅ Apache-2.0 | NVIDIA | Default | — | — |
| LLM Guard | [P08](./08-security.md) | Prompt and response classifiers | `OSI` ✅ MIT | Protect AI | Default | — | — |
| Presidio | [P08](./08-security.md) | PII detection and redaction | `OSI` ✅ MIT | Microsoft | Default | — | — |
| Llama Guard, Prompt Guard | [P08](./08-security.md) | Safety classifier models | `Open weights` | Meta | Alternative | — | — |
| Keycloak | [P08](./08-security.md) | Human identity, SSO | `OSI` ✅ Apache-2.0 | Keycloak | Default | — | — |
| OpenFGA | [P08](./08-security.md) | Fine-grained authorisation | `OSI` ✅ Apache-2.0 | OpenFGA | Default | — | — |
| SPIFFE/SPIRE | [P08](./08-security.md) | Workload identity | `OSI` ✅ Apache-2.0 | SPIFFE community | Default | — | — |
| OpenBao + External Secrets Operator | [P08](./08-security.md) | Secrets management | `OSI` ✅ MPL-2.0 / Apache-2.0 | OpenBao, ESO | Default | — | — |
| HashiCorp Vault | [P08](./08-security.md) | Secrets management (reference) | `Source-available` ⚠️ (reported BSL) | HashiCorp | Not recommended | — | — |
| garak | [P08](./08-security.md) | LLM red teaming | `OSI` ✅ Apache-2.0 | garak maintainers | Default | — | — |
| PyRIT | [P08](./08-security.md) | Red teaming framework | `OSI` ✅ MIT | Microsoft | Alternative | — | — |
| Kyverno | [P09](./09-governance-risk-compliance.md) | Kubernetes policy | `OSI` ✅ Apache-2.0 | Kyverno / CNCF | Default | — | — |
| OPA and Gatekeeper | [P09](./09-governance-risk-compliance.md) | General policy engine; admission | `OSI` ✅ Apache-2.0 | OPA maintainers | Alternative | — | — |
| MLflow | [P09](./09-governance-risk-compliance.md) | Model registry and lineage | `OSI` ✅ Apache-2.0 | MLflow maintainers | Default | — | — |
| CycloneDX ML-BOM | [P09](./09-governance-risk-compliance.md) | AI-BOM schema | Verify | CycloneDX community | Default | — | — |
| Sloth, Pyrra | [P10](./10-reliability-performance.md) | SLO tooling | `OSI` ✅ Apache-2.0 | Respective maintainers | Default / alternative | — | — |
| LMCache | [P10](./10-reliability-performance.md) | Prefix and KV cache reuse | `OSI` ✅ Apache-2.0 | LMCache | Default | — | — |
| GPTCache | [P10](./10-reliability-performance.md) | Semantic cache | `OSI` ✅ MIT (verify maintenance) | GPTCache maintainers | Default | — | — |
| KEDA | [P10](./10-reliability-performance.md) | Event-driven autoscaling | `OSI` ✅ Apache-2.0 | KEDA / CNCF | Default | — | — |
| Karpenter | [P10](./10-reliability-performance.md) | Node autoscaling | `OSI` ✅ Apache-2.0 | Karpenter maintainers | Default | — | — |
| Velero | [P10](./10-reliability-performance.md) | Backup and restore | `OSI` ✅ Apache-2.0 | Velero maintainers | Default | — | — |
| k6 | [P10](./10-reliability-performance.md) | Load testing | `OSI` ✅ AGPL-3.0 | Grafana Labs | Default | — | — |
| Cilium | [P11](./11-hardening.md), [P12](./12-foundation-infrastructure.md) | Networking and network policy | `OSI` ✅ Apache-2.0 | Cilium / CNCF | Default | — | — |
| Falco | [P11](./11-hardening.md) | Runtime threat detection | `OSI` ✅ Apache-2.0 | Falco / CNCF | Default | — | — |
| Trivy | [P11](./11-hardening.md) | Vulnerability and misconfiguration scanning | `OSI` ✅ Apache-2.0 | Trivy maintainers | Default | — | — |
| Cosign + Sigstore | [P11](./11-hardening.md) | Signing and provenance | `OSI` ✅ Apache-2.0 | Sigstore | Default | — | — |
| Syft | [P11](./11-hardening.md) | SBOM generation | `OSI` ✅ Apache-2.0 | Anchore | Default | — | — |
| ModelScan | [P11](./11-hardening.md) | Model-artifact scanning | Verify | ModelScan maintainers | Default | — | — |
| NVIDIA GPU Operator | [P11](./11-hardening.md) | GPU software stack lifecycle | Verify | NVIDIA | Default | — | — |
| Kubernetes | [P12](./12-foundation-infrastructure.md) | Cluster substrate | `OSI` ✅ Apache-2.0 | Kubernetes / CNCF | Default | — | — |
| Rook/Ceph | [P12](./12-foundation-infrastructure.md) | Self-hosted storage | `OSI` (verify) | Rook, Ceph | Default | — | — |
| MinIO | [P12](./12-foundation-infrastructure.md) | Object storage | `OSI` AGPL-3.0 (details unverified) | MinIO | Alternative | — | — |
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
