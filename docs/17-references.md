# References

> **TL;DR** — Links cited across the blueprint, grouped by pillar in pillar order. Evidence grades follow the [methodology](./00-methodology.md#41-evidence-grades). Only the sources listed under "Opened" in the methodology were read during the original research; repository links added with the pillar documents were checked through the GitHub API on 2026-10-11 (graded *Repo-checked*), and later cloud-architecture and standards links added in the review pass are marked *Search-cited* where the pages could be searched but not opened directly from this environment.

*Snapshot: 2026-10-11 · Related: [Methodology](./00-methodology.md) · [Tool landscape](./15-tool-landscape.md) · [Glossary](./16-glossary.md)*

## Grades used here

| Grade | Meaning |
|-------|---------|
| Opened | Read during the original research; see [methodology section 7](./00-methodology.md#7-sources) |
| Unverified | Link supplied from general knowledge; not opened. Check the page and the `LICENSE` file before relying on it |
| Repo-checked | The GitHub repository existed on 2026-10-11 and its licence, archived flag and redirects were read through the API. The page content and `LICENSE` text were not otherwise reviewed. Noted inline where it changed a link or a recommendation |

Standards and regulatory pages (OWASP, MITRE, NIST, ISO, the EU AI Act text, SLSA, RFCs) are orientation only; check the official texts before any compliance decision.

## Method and primary sources

- [Cloud Native AI whitepaper](https://github.com/cncf/tag-runtime/blob/main/wgs/cnai/whitepapers/cloudnativeai.md)
- [Kubernetes AI Conformance programme](https://github.com/cncf/k8s-ai-conformance) and the [requirements project](https://github.com/kubernetes-sigs/ai-conformance)
- [AI Conformance checklist v1.37](https://github.com/cncf/k8s-ai-conformance/blob/main/docs/AIConformance-1.37.yaml)
- [CNCF landscape source](https://github.com/cncf/landscape/blob/master/landscape.yml) (CNCF maturity levels in the pillar documents come from this file)
- [Raw CNCF landscape source](https://raw.githubusercontent.com/cncf/landscape/master/landscape.yml) (download URL used in the methodology refresh commands)
- [Agent Router repository](https://github.com/theagentrouter/agent-router)
- [LiteLLM `LICENSE`](https://github.com/BerriAI/litellm/blob/main/LICENSE) and [`enterprise/LICENSE.md`](https://github.com/BerriAI/litellm/blob/main/enterprise/LICENSE.md)
- [PyPI JSON index for LiteLLM](https://pypi.org/pypi/litellm/json) and [Kepler repository](https://github.com/sustainable-computing-io/kepler), both used in the [methodology](./00-methodology.md#7-sources)
- Cloud guidance cited by the methodology (search-cited, not opened): [AWS Well-Architected Generative AI Lens](https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/generative-ai-lens.html), [Azure design principles for AI workloads](https://learn.microsoft.com/en-us/azure/well-architected/ai/design-principles), [Azure gateway guide](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/azure-openai-gateway-guide), [Azure AI Landing Zones](https://github.com/Azure/AI-Landing-Zones), [Google Cloud generative AI architecture guides](https://docs.cloud.google.com/architecture/genai-overview), [Google Cloud architecture framework](https://docs.cloud.google.com/architecture/) and the [LF AI & Data landscape](https://landscapeapp.cncf.io/lfai/)

## Cross-cutting standards and governance sources

- [OWASP GenAI Security Project](https://genai.owasp.org/) and the [OWASP Top 10 for LLM applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/) (standards pages; Search-cited)
- [MITRE ATLAS](https://atlas.mitre.org/) (standards page; Search-cited)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) and [OSCAL](https://pages.nist.gov/OSCAL/) (standards pages; Search-cited)
- [ISO/IEC 42001 overview](https://www.iso.org/standard/81230.html) (standards page; Search-cited)
- [EU AI Act explorer](https://artificialintelligenceact.eu/) (orientation only; Search-cited)
- [AWS Generative AI Lens design principles](https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/design-principles.html) (Search-cited)

## P02 AI gateway and routing (Repo-checked)

- [Agent Router (formerly Envoy AI Gateway)](https://github.com/theagentrouter/agent-router) · [LiteLLM](https://github.com/BerriAI/litellm) · [kgateway](https://github.com/kgateway-dev/kgateway) · [agentgateway](https://github.com/agentgateway/agentgateway)
- [vLLM Semantic Router](https://github.com/vllm-project/semantic-router) · [Kong Gateway](https://github.com/Kong/kong) · [Apache APISIX](https://github.com/apache/apisix) · [Higress](https://github.com/higress-group/higress) · [Portkey Gateway](https://github.com/Portkey-AI/gateway)
- Additional repositories cited in P02: [Helicone AI Gateway](https://github.com/Helicone/ai-gateway) and its [`LICENSE`](https://github.com/Helicone/ai-gateway/blob/main/LICENSE) · [TensorZero](https://github.com/tensorzero/tensorzero)
- [Gateway API Inference Extension](https://github.com/kubernetes-sigs/gateway-api-inference-extension) (home pillar P03)

## P03 Model serving and inference (Repo-checked)

- [KServe](https://github.com/kserve/kserve) · [vLLM](https://github.com/vllm-project/vllm) · [llm-d](https://github.com/llm-d/llm-d) · [SGLang](https://github.com/sgl-project/sglang) · [LMDeploy](https://github.com/InternLM/lmdeploy)
- [Gateway API Inference Extension](https://github.com/kubernetes-sigs/gateway-api-inference-extension)
- [NVIDIA Dynamo](https://github.com/ai-dynamo/dynamo) · [TensorRT-LLM](https://github.com/NVIDIA/TensorRT-LLM) · [Text Generation Inference](https://github.com/huggingface/text-generation-inference) (maintenance mode, repository archived)
- [KAITO](https://github.com/kaito-project/kaito) · [KubeRay](https://github.com/ray-project/kuberay) · [Ray](https://github.com/ray-project/ray)
- [Ollama](https://github.com/ollama/ollama) · [llama.cpp](https://github.com/ggml-org/llama.cpp)
- Additional repositories cited in P03: [Seldon Core](https://github.com/SeldonIO/seldon-core) and its [`LICENSE`](https://github.com/SeldonIO/seldon-core/blob/v2/LICENSE) · [BentoML](https://github.com/bentoml/BentoML) · [OpenLLM](https://github.com/bentoml/OpenLLM) and its [`LICENSE`](https://github.com/bentoml/OpenLLM/blob/main/LICENSE) · [MLC LLM](https://github.com/mlc-ai/mlc-llm) and its [`LICENSE`](https://github.com/mlc-ai/mlc-llm/blob/main/LICENSE) · [OpenVINO Model Server](https://github.com/openvinotoolkit/model_server) and its [`LICENSE`](https://github.com/openvinotoolkit/model_server/blob/main/LICENSE) · [PyTorch Serve](https://github.com/pytorch/serve) · [Triton Inference Server](https://github.com/triton-inference-server/server) and its [`LICENSE`](https://github.com/triton-inference-server/server/blob/main/LICENSE)

## P04 Model lifecycle and adaptation (Repo-checked; licence terms unverified)

- Registry and artifacts: [MLflow](https://github.com/mlflow/mlflow) · [Kubeflow Model Registry](https://github.com/kubeflow/model-registry) (now `kubeflow/hub`) · [ModelPack spec](https://github.com/modelpack/model-spec) · [KitOps](https://github.com/jozu-ai/kitops) (now `kitops-ml/kitops`) · [ORAS](https://github.com/oras-project/oras)
- Quantisation: [llm-compressor](https://github.com/vllm-project/llm-compressor) · [GPTQModel](https://github.com/ModelCloud/GPTQModel) · [NVIDIA Model Optimizer](https://github.com/NVIDIA/Model-Optimizer) · [AutoAWQ](https://github.com/casper-hansen/AutoAWQ) (archived) · [AutoGPTQ](https://github.com/AutoGPTQ/AutoGPTQ) (archived)
- Tuning: [TRL](https://github.com/huggingface/trl) · [PEFT](https://github.com/huggingface/peft) · [Axolotl](https://github.com/axolotl-ai-cloud/axolotl) · [LLaMA-Factory](https://github.com/hiyouga/LlamaFactory) · [Unsloth](https://github.com/unslothai/unsloth) · [NeMo](https://github.com/NVIDIA-NeMo/NeMo) (redirects to the NeMo Speech repository; confirm the intended repository) · [torchtune](https://github.com/pytorch/torchtune) (development wound down; now `meta-pytorch/torchtune`) · [Distilabel](https://github.com/argilla-io/distilabel)
- Scheduling and serving adapters: [Kubeflow Trainer](https://github.com/kubeflow/trainer) · [Kueue](https://github.com/kubernetes-sigs/kueue) · [Volcano](https://github.com/volcano-sh/volcano) · [KAI Scheduler](https://github.com/kai-scheduler/KAI-Scheduler) (now `kai-scheduler/KAI-Scheduler`) · [LoRAX](https://github.com/predibase/lorax)
- Model licence terms: [Gemma Terms of Use](https://ai.google.dev/gemma/terms) (check each model card; terms change between generations)
- Additional repositories cited in P04: [KitOps](https://github.com/kitops-ml/kitops) · [Microsoft Olive](https://github.com/microsoft/Olive) and its [`LICENSE`](https://github.com/microsoft/Olive/blob/main/LICENSE) · [DVC](https://github.com/treeverse/dvc) and its [`LICENSE`](https://github.com/treeverse/dvc/blob/main/LICENSE)

## P05 Knowledge and context (Repo-checked)

- Vector and hybrid search: [pgvector](https://github.com/pgvector/pgvector) · [Qdrant](https://github.com/qdrant/qdrant) · [Milvus](https://github.com/milvus-io/milvus) · [Weaviate](https://github.com/weaviate/weaviate) · [Chroma](https://github.com/chroma-core/chroma) · [LanceDB](https://github.com/lancedb/lancedb) · [Vespa](https://github.com/vespa-engine/vespa) · [OpenSearch](https://github.com/opensearch-project/OpenSearch) · [Elasticsearch `LICENSE.txt`](https://github.com/elastic/elasticsearch/blob/main/LICENSE.txt) · [Redis `LICENSE.txt`](https://github.com/redis/redis/blob/unstable/LICENSE.txt) · [Valkey](https://github.com/valkey-io/valkey)
- Parsing and orchestration: [Docling](https://github.com/docling-project/docling) · [Unstructured](https://github.com/Unstructured-IO/unstructured) · [LlamaIndex](https://github.com/run-llama/llama_index) · [Haystack](https://github.com/deepset-ai/haystack)
- Memory and graphs: [Mem0](https://github.com/mem0ai/mem0) · [Letta](https://github.com/letta-ai/letta) · [Graphiti](https://github.com/getzep/graphiti) · [Microsoft GraphRAG](https://github.com/microsoft/graphrag) · [Langfuse](https://github.com/langfuse/langfuse) (prompt management)
- Additional repositories cited in P05: [Zep](https://github.com/getzep/zep) · [Text Embeddings Inference](https://github.com/huggingface/text-embeddings-inference) · [Infinity](https://github.com/michaelfeil/infinity)

## P06 Agents, tools and protocols (Repo-checked)

- [Model Context Protocol](https://modelcontextprotocol.io/) and its [specification repository](https://github.com/modelcontextprotocol/modelcontextprotocol) (the old `modelcontextprotocol/specification` URL redirects) · [MCP Registry](https://github.com/modelcontextprotocol/registry)
- [A2A](https://github.com/a2aproject/A2A) · [LangGraph](https://github.com/langchain-ai/langgraph) · [CrewAI](https://github.com/crewAIInc/crewAI) · [OpenAI Agents SDK](https://github.com/openai/openai-agents-python) · [Google ADK](https://github.com/google/adk-python) · [Microsoft Agent Framework](https://github.com/microsoft/agent-framework) · [AutoGen](https://github.com/microsoft/autogen) (maintenance mode) · [kagent](https://github.com/kagent-dev/kagent)
- [agentregistry](https://github.com/agentregistry-dev/agentregistry) · [agentgateway](https://github.com/agentgateway/agentgateway) · [IBM ContextForge](https://github.com/IBM/mcp-context-forge)
- [gVisor](https://github.com/google/gvisor) · [Kata Containers](https://github.com/kata-containers/kata-containers) · [agent-sandbox](https://github.com/kubernetes-sigs/agent-sandbox)
- Identity: [SPIFFE](https://spiffe.io/) · [SPIRE](https://github.com/spiffe/spire) · [RFC 8693, OAuth 2.0 Token Exchange](https://www.rfc-editor.org/rfc/rfc8693) (standards page, unverified)
- Additional repositories cited in P06: [PydanticAI](https://github.com/pydantic/pydantic-ai) · [AutoGen code licence](https://github.com/microsoft/autogen/blob/main/LICENSE-CODE)

## P07 Observability (Repo-checked)

- [OpenTelemetry](https://github.com/open-telemetry), [Collector](https://github.com/open-telemetry/opentelemetry-collector), [semantic conventions](https://github.com/open-telemetry/semantic-conventions) and the [GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai) (the GenAI conventions moved here; status Development)
- [Prometheus](https://github.com/prometheus/prometheus) · [Jaeger](https://github.com/jaegertracing/jaeger) · [Grafana Tempo](https://github.com/grafana/tempo) · [Grafana](https://github.com/grafana/grafana)
- [Langfuse](https://github.com/langfuse/langfuse) and its [`LICENSE`](https://github.com/langfuse/langfuse/blob/main/LICENSE) · [Arize Phoenix](https://github.com/Arize-ai/phoenix) and its [`LICENSE`](https://github.com/Arize-ai/phoenix/blob/main/LICENSE) · [Opik](https://github.com/comet-ml/opik) · [OpenLIT](https://github.com/openlit/openlit) · [OpenLLMetry](https://github.com/traceloop/openllmetry) · [AgentOps](https://github.com/AgentOps-AI/agentops) · [Laminar](https://github.com/lmnr-ai/lmnr) · [MLflow](https://github.com/mlflow/mlflow) (tracing)
- [OpenCost](https://github.com/opencost/opencost) · [Kepler](https://github.com/sustainable-computing-io/kepler) (optional energy telemetry)
- Additional repositories cited in P07: [ClickHouse](https://github.com/ClickHouse/ClickHouse)

## P08 Evaluation and quality (Repo-checked)

- [promptfoo](https://github.com/promptfoo/promptfoo) · [DeepEval](https://github.com/confident-ai/deepeval) · [OpenEvals](https://github.com/langchain-ai/openevals) · [Opik](https://github.com/comet-ml/opik) · [Ragas](https://github.com/vibrantlabsai/ragas) · [TruLens](https://github.com/truera/trulens)
- [Inspect AI](https://github.com/UKGovernmentBEIS/inspect_ai) · [Inspect Evals](https://github.com/UKGovernmentBEIS/inspect_evals) · [Giskard](https://github.com/Giskard-AI/giskard-oss)
- [lm-evaluation-harness](https://github.com/EleutherAI/lm-evaluation-harness) · [LightEval](https://github.com/huggingface/lighteval) · [HELM](https://github.com/stanford-crfm/helm) · [OpenCompass](https://github.com/open-compass/opencompass) · [openai/evals](https://github.com/openai/evals) (maintenance status unverified)
- [garak](https://github.com/NVIDIA/garak) · [DeepTeam](https://github.com/confident-ai/deepteam) · [Evidently](https://github.com/evidentlyai/evidently) · [Langfuse](https://github.com/langfuse/langfuse) · [Arize Phoenix](https://github.com/Arize-ai/phoenix) · [MLflow](https://github.com/mlflow/mlflow)
- Additional repositories cited in P08: [PydanticAI](https://github.com/pydantic/pydantic-ai) · [PydanticAI evals documentation](https://pydantic.dev/docs/ai/evals/evals/) · [openai/evals `LICENSE.md`](https://github.com/openai/evals/blob/main/LICENSE.md)

## P09 Security and safety (Repo-checked for repositories; standards pages unverified)

- Standards: [OWASP Top 10 for LLM applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/) · [OWASP agentic security initiative](https://genai.owasp.org/initiatives/agentic-security-initiative/) (the old `owasp.org/www-project-agentic-ai-security-initiative/` URL returns 404; the new site blocks scripted access, so open it in a browser) · [MITRE ATLAS](https://atlas.mitre.org/) · [SLSA](https://slsa.dev/) · [CIS Kubernetes benchmark](https://www.cisecurity.org/benchmark/kubernetes) · [Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/)
- AI safety: [NeMo Guardrails](https://github.com/NVIDIA-NeMo/Guardrails) ([old cited URL](https://github.com/NVIDIA/NeMo-Guardrails), which redirects) · [Guardrails AI](https://github.com/guardrails-ai/guardrails) · [LLM Guard](https://github.com/protectai/llm-guard) (archived) · [Presidio](https://github.com/data-privacy-stack/presidio) ([old cited URL](https://github.com/microsoft/presidio), which redirects) · [garak](https://github.com/NVIDIA/garak) · [PyRIT](https://github.com/microsoft/PyRIT) ([old `Azure/PyRIT` URL](https://github.com/Azure/PyRIT) is archived) · [promptfoo](https://github.com/promptfoo/promptfoo)
- Identity and secrets: [Keycloak](https://www.keycloak.org/) · [OpenFGA](https://github.com/openfga/openfga) · [SPIFFE](https://spiffe.io/) · [OpenBao](https://github.com/openbao/openbao) · [External Secrets Operator](https://external-secrets.io/) · [cert-manager](https://cert-manager.io/)
- Platform and supply chain: [Cilium](https://github.com/cilium/cilium) · [Falco](https://falco.org/) · [Tetragon](https://github.com/cilium/tetragon) · [Kata Containers](https://katacontainers.io/) · [gVisor](https://gvisor.dev/) · [Trivy](https://github.com/aquasecurity/trivy) · [Syft](https://github.com/anchore/syft) · [Grype](https://github.com/anchore/grype) · [Cosign](https://github.com/sigstore/cosign) · [Sigstore](https://www.sigstore.dev/) · [OpenSSF model-signing](https://github.com/sigstore/model-transparency) · [Kyverno image verification](https://kyverno.io/docs/policy-types/cluster-policy/verify-images/)
- Models and GPUs: [safetensors](https://github.com/huggingface/safetensors) (now `safetensors/safetensors`) · [ModelScan](https://github.com/protectai/modelscan) · [NVIDIA GPU Operator](https://github.com/NVIDIA/gpu-operator)

## P10 Governance, risk, compliance and FinOps (Repo-checked for repositories; standards pages unverified)

- Policy: [Open Policy Agent](https://www.openpolicyagent.org/) · [Gatekeeper](https://github.com/open-policy-agent/gatekeeper) · [Kyverno](https://kyverno.io/) · [Cedar](https://www.cedarpolicy.com/)
- Registry, BOM and lineage: [MLflow](https://github.com/mlflow/mlflow) · [CycloneDX](https://cyclonedx.org/) · [SPDX](https://spdx.dev/) · [OpenLineage](https://openlineage.io/) · [DefectDojo](https://github.com/DefectDojo/django-DefectDojo) · [OSCAL](https://pages.nist.gov/OSCAL/)
- FinOps: [OpenCost](https://opencost.io/) · [Kubecost](https://www.ibm.com/products/kubecost) · [FOCUS specification](https://github.com/FinOps-Open-Cost-and-Usage-Spec/FOCUS_Spec) · [DCGM Exporter](https://github.com/NVIDIA/dcgm-exporter)
- Frameworks: [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework) · [ISO/IEC 42001](https://www.iso.org/standard/81230.html) · [EU AI Act explorer](https://artificialintelligenceact.eu/) · [LF AI & Data foundation](https://lfaidata.foundation/)

## P11 Reliability, performance and capacity (Repo-checked)

- [Sloth](https://github.com/slok/sloth) · [Pyrra](https://github.com/pyrra-dev/pyrra)
- [LMCache](https://github.com/LMCache/LMCache) · [GPTCache](https://github.com/zilliztech/GPTCache) · [Valkey](https://github.com/valkey-io/valkey)
- [Kueue](https://github.com/kubernetes-sigs/kueue) · [KEDA](https://keda.sh/) · [Karpenter](https://karpenter.sh/) · [Cluster Autoscaler](https://github.com/kubernetes/autoscaler) · [Velero](https://velero.io/)
- [k6](https://k6.io/) · [GuideLLM](https://github.com/vllm-project/guidellm) · [vLLM](https://github.com/vllm-project/vllm) (benchmark scripts) · [Chaos Mesh](https://github.com/chaos-mesh/chaos-mesh) · [Litmus](https://github.com/litmuschaos/litmus)

## P12 Foundation and delivery (Repo-checked)

- [Kubernetes](https://kubernetes.io/) · [Gateway API](https://gateway-api.sigs.k8s.io/) · [Cilium](https://github.com/cilium/cilium) · [Istio](https://github.com/istio/istio) · [Talos](https://github.com/siderolabs/talos)
- [Rook](https://github.com/rook/rook) · [Ceph](https://ceph.io/) · [MinIO](https://github.com/minio/minio) (archived, no longer maintained)
- [Argo CD](https://argo-cd.readthedocs.io/) · [Flux](https://fluxcd.io/) · [OpenTofu](https://opentofu.org/) · [Crossplane](https://crossplane.io/) · [Helm](https://helm.sh/) · [cert-manager](https://cert-manager.io/)
- [Kyverno](https://github.com/kyverno/kyverno) · [External Secrets Operator](https://github.com/external-secrets/external-secrets) · [OpenBao](https://github.com/openbao/openbao)
- [Kueue](https://github.com/kubernetes-sigs/kueue) · [Volcano](https://github.com/volcano-sh/volcano) · [KAI Scheduler](https://github.com/kai-scheduler/KAI-Scheduler) · [Karpenter](https://github.com/kubernetes-sigs/karpenter) · [NVIDIA GPU Operator](https://github.com/NVIDIA/gpu-operator)

## P13 Platform experience and tenancy (Repo-checked; web pages unverified)

- Portal and catalogue: [Backstage](https://github.com/backstage/backstage) · [Backstage Software Templates](https://backstage.io/docs/features/software-templates/) · [Red Hat Developer Hub](https://github.com/redhat-developer/rhdh) · [Headlamp](https://github.com/kubernetes-sigs/headlamp) · [Kubernetes Dashboard (archived)](https://github.com/kubernetes-retired/dashboard) · [Kubeflow](https://github.com/kubeflow/kubeflow) · [MkDocs Material](https://github.com/squidfunk/mkdocs-material)
- Self-service: [Crossplane](https://crossplane.io/) · [kro](https://github.com/kubernetes-sigs/kro) · [Azure Developer CLI](https://github.com/Azure/azure-dev) · [Coder](https://github.com/coder/coder)
- Front-ends: [Open WebUI](https://github.com/open-webui/open-webui) and its [`LICENSE`](https://github.com/open-webui/open-webui/blob/main/LICENSE) · [LibreChat](https://github.com/LibreChat-AI/LibreChat) · [LobeChat](https://github.com/lobehub/lobehub) · [Hugging Face chat-ui](https://github.com/huggingface/chat-ui) · [Jan](https://github.com/janhq/jan) · [Continue](https://github.com/continuedev/continue)
- Tenancy: [Kubernetes multi-tenancy documentation](https://kubernetes.io/docs/concepts/security/multi-tenancy/) · [Capsule](https://github.com/projectcapsule/capsule) · [vCluster](https://github.com/loft-sh/vcluster) · [Kamaji](https://github.com/clastix/kamaji) · [HyperShift](https://github.com/openshift/hypershift) · [Cluster API](https://github.com/kubernetes-sigs/cluster-api) · [Hierarchical Namespaces (archived)](https://github.com/kubernetes-retired/hierarchical-namespaces)
- API contract: [openai-openapi](https://github.com/openai/openai-openapi) · [Spectral](https://github.com/stoplightio/spectral) · [oasdiff](https://github.com/oasdiff/oasdiff) · [OpenAPI Generator](https://github.com/OpenAPITools/openapi-generator)
- Adoption metrics: [DORA](https://dora.dev/) (unverified)
- [OpenCost](https://github.com/opencost/opencost) (showback)
