# References

> **TL;DR** — Links cited across the blueprint, grouped by pillar. Evidence grades follow the [methodology](./00-methodology.md#41-evidence-grades). Only the sources listed under "Opened" in the methodology were read during the original research; repository links added with the pillar documents were only existence-checked through the GitHub API on 2026-10-11 (graded *Repo-checked*), and all other links are *unverified* until you check them.

*Snapshot: 2026-10-11 · Related: [Methodology](./00-methodology.md) · [Tool landscape](./15-tool-landscape.md)*

## Grades used here

| Grade | Meaning |
|-------|---------|
| Opened | Read during the original research; see [methodology section 7](./00-methodology.md#7-sources) |
| Unverified | Link supplied from general knowledge; not opened. Check the page and the `LICENSE` file before relying on it |
| Repo-checked | The GitHub repository existed on 2026-10-11 and its licence, archived flag and redirects were read through the API. The page content and `LICENSE` text were not otherwise reviewed. Noted inline where it changed a link or a recommendation |

Standards and regulatory pages (OWASP, MITRE, NIST, ISO, the EU AI Act text) are orientation only; check the official texts before any compliance decision.

## Method and primary sources (Opened)

- [Cloud Native AI whitepaper](https://github.com/cncf/tag-runtime/blob/main/wgs/cnai/whitepapers/cloudnativeai.md)
- [AI Conformance checklist v1.37](https://github.com/cncf/k8s-ai-conformance/blob/main/docs/AIConformance-1.37.yaml)
- [CNCF landscape source](https://github.com/cncf/landscape/blob/master/landscape.yml)
- [Agent Router repository](https://github.com/theagentrouter/agent-router)
- [LiteLLM `LICENSE`](https://github.com/BerriAI/litellm/blob/main/LICENSE) and [`enterprise/LICENSE.md`](https://github.com/BerriAI/litellm/blob/main/enterprise/LICENSE.md)
- [PyPI JSON index for LiteLLM](https://pypi.org/pypi/litellm/json) and [Kepler repository](https://github.com/sustainable-computing-io/kepler), both used in the [methodology](./00-methodology.md#7-sources)
- Cloud guidance cited by the methodology (search-cited, not opened): [AWS Well-Architected Generative AI Lens](https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/generative-ai-lens.html), [Azure design principles for AI workloads](https://learn.microsoft.com/en-us/azure/well-architected/ai/design-principles), [Azure gateway guide](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/azure-openai-gateway-guide) and [Azure AI Landing Zones](https://github.com/Azure/AI-Landing-Zones)

## P02 AI gateway and P02 Model router (Repo-checked)

- [Agent Router (formerly Envoy AI Gateway)](https://github.com/theagentrouter/agent-router)
- [LiteLLM](https://github.com/BerriAI/litellm)
- [Kong Gateway](https://github.com/Kong/kong)
- [Gateway API Inference Extension](https://github.com/kubernetes-sigs/gateway-api-inference-extension)

## P03 Model serving (Repo-checked)

- [KServe](https://github.com/kserve/kserve) · [vLLM](https://github.com/vllm-project/vllm) · [llm-d](https://github.com/llm-d/llm-d) · [SGLang](https://github.com/sgl-project/sglang)
- [Text Generation Inference](https://github.com/huggingface/text-generation-inference) (maintenance mode, repository archived) · [NVIDIA Dynamo](https://github.com/ai-dynamo/dynamo)
- [Ollama](https://github.com/ollama/ollama) · [llama.cpp](https://github.com/ggml-org/llama.cpp)

## P05 Data and RAG (Repo-checked)

- [pgvector](https://github.com/pgvector/pgvector) · [Qdrant](https://github.com/qdrant/qdrant) · [Milvus](https://github.com/milvus-io/milvus) · [Weaviate](https://github.com/weaviate/weaviate)
- [Docling](https://github.com/docling-project/docling) · [Unstructured](https://github.com/Unstructured-IO/unstructured)

## P06 Agents and MCP (Repo-checked)

- [Model Context Protocol](https://modelcontextprotocol.io/) and its [specification repository](https://github.com/modelcontextprotocol/modelcontextprotocol) (the old `modelcontextprotocol/specification` URL redirects)
- [A2A](https://github.com/a2aproject/A2A) · [LangGraph](https://github.com/langchain-ai/langgraph) · [kagent](https://github.com/kagent-dev/kagent)
- [gVisor](https://github.com/google/gvisor) · [Kata Containers](https://github.com/kata-containers/kata-containers) · [agent-sandbox](https://github.com/kubernetes-sigs/agent-sandbox)

## P07 Observability and evaluation (Repo-checked)

- [OpenTelemetry](https://github.com/open-telemetry), [Collector](https://github.com/open-telemetry/opentelemetry-collector) and [semantic conventions](https://github.com/open-telemetry/semantic-conventions)
- [Prometheus](https://github.com/prometheus/prometheus) · [Grafana](https://github.com/grafana/grafana)
- [Langfuse](https://github.com/langfuse/langfuse) · [Arize Phoenix](https://github.com/Arize-ai/phoenix) · [OpenLIT](https://github.com/openlit/openlit)
- [promptfoo](https://github.com/promptfoo/promptfoo) · [lm-evaluation-harness](https://github.com/EleutherAI/lm-evaluation-harness) · [Ragas](https://github.com/vibrantlabsai/ragas) · [OpenCost](https://github.com/opencost/opencost) · [Kepler](https://github.com/sustainable-computing-io/kepler) (optional energy telemetry)

## P09 Security (Repo-checked for repositories; standards pages unverified)

- [OWASP Top 10 for LLM applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/) · [OWASP agentic security initiative](https://genai.owasp.org/initiatives/agentic-security-initiative/) (the old `owasp.org/www-project-agentic-ai-security-initiative/` URL returns 404; the new site blocks scripted access, so open it in a browser) · [MITRE ATLAS](https://atlas.mitre.org/)
- [NeMo Guardrails](https://github.com/NVIDIA-NeMo/Guardrails) · [LLM Guard](https://github.com/protectai/llm-guard) (archived) · [Presidio](https://github.com/data-privacy-stack/presidio)
- [Keycloak](https://www.keycloak.org/) · [OpenFGA](https://github.com/openfga/openfga) · [SPIFFE](https://spiffe.io/)
- [OpenBao](https://github.com/openbao/openbao) · [External Secrets Operator](https://external-secrets.io/)
- [garak](https://github.com/NVIDIA/garak) · [PyRIT](https://github.com/microsoft/PyRIT) (`Azure/PyRIT` is archived)

## P10 Governance, risk and compliance (Repo-checked for repositories; standards pages unverified)

- [Open Policy Agent](https://www.openpolicyagent.org/) · [Gatekeeper](https://github.com/open-policy-agent/gatekeeper) · [Kyverno](https://kyverno.io/)
- [MLflow](https://github.com/mlflow/mlflow) · [CycloneDX](https://cyclonedx.org/) · [SPDX](https://spdx.dev/) · [OpenCost](https://opencost.io/)
- [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework) · [ISO/IEC 42001](https://www.iso.org/standard/81230.html) · [EU AI Act explorer](https://artificialintelligenceact.eu/)

## P11 Reliability and performance (Repo-checked)

- [Sloth](https://github.com/slok/sloth) · [Pyrra](https://github.com/pyrra-dev/pyrra)
- [LMCache](https://github.com/LMCache/LMCache) · [GPTCache](https://github.com/zilliztech/GPTCache)
- [KEDA](https://keda.sh/) · [Karpenter](https://karpenter.sh/) · [Cluster Autoscaler](https://github.com/kubernetes/autoscaler) · [Velero](https://velero.io/) · [k6](https://k6.io/) · [GuideLLM](https://github.com/vllm-project/guidellm)

## P09 Hardening (Repo-checked for repositories; standards pages unverified)

- [Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/) · [CIS Kubernetes benchmark](https://www.cisecurity.org/benchmark/kubernetes)
- [Cilium](https://github.com/cilium/cilium) · [Falco](https://falco.org/) · [Trivy](https://github.com/aquasecurity/trivy)
- [Cosign](https://github.com/sigstore/cosign) · [Sigstore](https://www.sigstore.dev/) · [SLSA](https://slsa.dev/) · [Syft](https://github.com/anchore/syft) · [Grype](https://github.com/anchore/grype) · [Notation](https://github.com/notaryproject/notation) · [Tetragon](https://github.com/cilium/tetragon) · [Calico](https://github.com/projectcalico/calico)
- [Kata Containers](https://katacontainers.io/) · [gVisor](https://gvisor.dev/)
- [safetensors](https://github.com/safetensors/safetensors) · [ModelScan](https://github.com/protectai/modelscan) · [NVIDIA GPU Operator](https://github.com/NVIDIA/gpu-operator)

## P12 Foundation and delivery (Repo-checked)

- [Kubernetes](https://kubernetes.io/) · [Gateway API](https://gateway-api.sigs.k8s.io/) · [Cilium](https://github.com/cilium/cilium)
- [Rook](https://github.com/rook/rook) · [Ceph](https://ceph.io/) · [MinIO](https://github.com/minio/minio) (archived, no longer maintained)
- [Argo CD](https://argo-cd.readthedocs.io/) · [Flux](https://fluxcd.io/) · [OpenTofu](https://opentofu.org/) · [Crossplane](https://crossplane.io/) · [Helm](https://helm.sh/) · [cert-manager](https://cert-manager.io/) · [Kueue](https://github.com/kubernetes-sigs/kueue) · [Kustomize](https://github.com/kubernetes-sigs/kustomize)
