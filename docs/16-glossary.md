# Glossary

> **TL;DR** — Short definitions of the terms used across this blueprint, in alphabetical order. Tool names are not defined here; look them up in the [tool landscape](./15-tool-landscape.md).

*Snapshot: 2026-10-11 · Related: [Methodology](./00-methodology.md) · [Reference architecture](./01-reference-architecture.md) · [References](./17-references.md)*

## A–F

| Term | Definition |
|------|------------|
| **A2A** | Agent2Agent: an open protocol for communication between AI agents built on different frameworks. See [Agents, tools and protocols](./06-agents-mcp.md). |
| **AAIF** | The Agentic AI Foundation, a Linux Foundation-hosted home for agent-related open-source projects. Agent Router (formerly Envoy AI Gateway) describes itself as an AAIF project. See [AI gateway and routing](./02-ai-gateway-routing.md). |
| **ACL** | Access control list: per-document or per-resource permissions stored with data so retrieval and tools can filter by who may see it. See [Knowledge and context](./05-data-knowledge-rag.md). |
| **Adapter** | A small set of trained weights (for example a LoRA) loaded on top of a base model to specialise it. See [Model lifecycle and adaptation](./04-model-lifecycle-adaptation.md). |
| **Agent** | A program that uses a model to decide which actions or tool calls to take in a loop, rather than answering once. See [Agents, tools and protocols](./06-agents-mcp.md). |
| **Agent memory** | State an agent keeps across turns or sessions, such as user facts or past outcomes, held in a store outside the prompt. See [Knowledge and context](./05-data-knowledge-rag.md). |
| **AgentOps** | The operational practice and tooling for running agents: run tracing and replay, cost per run, approvals, and registry hooks. See [Agents, tools and protocols](./06-agents-mcp.md) and [Observability](./07-observability-evaluation.md). |
| **AGPL** | GNU Affero General Public License: an OSI-approved copyleft licence that also applies to software offered over a network. See the [licence legend](./00-methodology.md#32-licence-policy-and-legend). |
| **AI-BOM** | An AI bill of materials: an inventory of the models, datasets, prompts and software that make up an AI system, extending the idea of an SBOM. See [Governance, risk, compliance and FinOps](./10-governance-finops.md). |
| **AI gateway** | A single governed entry point for model traffic that provides a unified API, authentication, quotas, metering and policy hooks. See [AI gateway and routing](./02-ai-gateway-routing.md). |
| **Air-gapped** | Running without any connection to the public internet. It affects how images, models and updates are delivered. See [Security and safety](./09-security-safety.md). |
| **Autoscaling** | Automatically adding or removing replicas (pod autoscaling) or nodes (cluster autoscaling) in response to load. See [Reliability, performance and capacity](./11-reliability-capacity.md). |
| **Canary release** | Sending a small share of traffic to a new model or version before a full rollout. See [AI gateway and routing](./02-ai-gateway-routing.md). |
| **Champion / challenger** | The model version currently serving production traffic (champion) and the candidate being compared against it (challenger). See [Model lifecycle and adaptation](./04-model-lifecycle-adaptation.md). |
| **Chargeback / showback** | Charging teams for the cost they cause (chargeback) or only reporting it to them (showback). See [Governance, risk, compliance and FinOps](./10-governance-finops.md). |
| **Chat completions API** | The request and response format popularised by OpenAI for conversational models; the de facto interface that gateways and inference engines implement. See *OpenAI-compatible API*. |
| **Chunk** | A piece of a document sized for embedding and retrieval. See [Knowledge and context](./05-data-knowledge-rag.md). |
| **Circuit breaker** | A resilience pattern that stops sending requests to a failing backend for a while so that it can recover. See [Reliability, performance and capacity](./11-reliability-capacity.md). |
| **CNCF** | Cloud Native Computing Foundation: the Linux Foundation body that hosts Kubernetes, Prometheus and other projects, with Sandbox, Incubating and Graduated maturity levels. |
| **Context budget** | A per-request token allowance split across instructions, history, memory, retrieved chunks and tool output (context-window budgeting), enforced when the prompt is assembled. See [Knowledge and context](./05-data-knowledge-rag.md). |
| **Context engineering** | Deliberately selecting, ordering and compressing what goes into the model's context: retrieval, memory, prompts and tool results. See [Knowledge and context](./05-data-knowledge-rag.md). |
| **CRD** | CustomResourceDefinition: a Kubernetes extension point that lets an operator add its own resource types. |
| **Disaggregated inference** | Running the prefill and decode phases of generation on separately scaled workers. See *Prefill* and [Model serving and inference](./03-model-serving.md). |
| **Distillation** | Training a smaller student model to reproduce the outputs of a larger teacher model. Check the teacher's licence for restrictions on using its outputs. See [Model lifecycle and adaptation](./04-model-lifecycle-adaptation.md). |
| **DPO / preference tuning** | Direct Preference Optimization and related methods that tune a model on pairs of preferred and rejected answers instead of a reward model. See [Model lifecycle and adaptation](./04-model-lifecycle-adaptation.md). |
| **DRA** | Dynamic Resource Allocation: the Kubernetes mechanism for requesting and sharing devices such as GPUs. See [Model serving and inference](./03-model-serving.md). |
| **Drift** | A gradual change in inputs, outputs or quality over time, for example after a model, quantisation or data change. See [Evaluation and quality](./08-evaluation-quality.md). |
| **Egress** | Outbound network traffic from a workload. Egress control limits what agents and tools can reach. See [Security and safety](./09-security-safety.md). |
| **Embedding** | A numeric vector that represents the meaning of a piece of text or other data, used for similarity search. See [Knowledge and context](./05-data-knowledge-rag.md). |
| **Endpoint picker** | The component of the Gateway API Inference Extension that chooses which model-server replica receives each request, using signals such as queue depth, KV-cache use and loaded adapters. See [Model serving and inference](./03-model-serving.md). |
| **Error budget / burn rate** | The amount of unreliability an SLO allows over a period, and how fast it is being used up. See [Reliability, performance and capacity](./11-reliability-capacity.md). |
| **Evaluation (eval)** | A repeatable test of model or application quality using datasets, metrics or a judge model. See [Evaluation and quality](./08-evaluation-quality.md). |
| **Fallback** | Automatically retrying a request on another model or endpoint when the first one fails or is overloaded. See [AI gateway and routing](./02-ai-gateway-routing.md). |
| **Fine-tuning** | Further training of a model on a smaller dataset to specialise it. See [Model lifecycle and adaptation](./04-model-lifecycle-adaptation.md). |
| **FinOps** | The practice of managing cloud and GPU spend through shared accountability between engineering and finance. See [Governance, risk, compliance and FinOps](./10-governance-finops.md). |
| **FOCUS** | FinOps Open Cost and Usage Specification: an open schema for billing and usage data that lets cost reports from different sources be joined. See [Governance, risk, compliance and FinOps](./10-governance-finops.md). |

## G–O

| Term | Definition |
|------|------------|
| **Gang scheduling** | All-or-nothing scheduling of a group of pods, so a distributed job starts only when all its workers can run. See [Model lifecycle and adaptation](./04-model-lifecycle-adaptation.md) and [Foundation and delivery](./12-foundation-infrastructure.md). |
| **Gateway API** | The Kubernetes API for describing traffic routing (`Gateway`, `HTTPRoute` and related resources), implemented by many proxies. See [Foundation and delivery](./12-foundation-infrastructure.md). |
| **Gateway API Inference Extension (GAIE)** | An extension to the Gateway API that lets a gateway pick an inference endpoint using model-server metrics such as queue depth or KV-cache use. See [Model serving and inference](./03-model-serving.md). |
| **GGUF** | A single-file model format used by llama.cpp and Ollama, often quantised for CPU and edge inference. See [Model serving and inference](./03-model-serving.md). |
| **GitOps** | Operating infrastructure and applications by declaring the desired state in Git and letting a controller apply it. See [Foundation and delivery](./12-foundation-infrastructure.md). |
| **Golden path** | A supported, pre-wired way to do a common task (for example "create an AI project") that gives teams guardrails and defaults without a ticket. See [Platform experience and tenancy](./13-platform-experience.md). |
| **Golden set** | A curated, versioned set of inputs with expected outcomes or grading criteria, used to evaluate changes and gate releases. See [Evaluation and quality](./08-evaluation-quality.md). |
| **GraphRAG** | Retrieval that builds a knowledge graph and community summaries from a corpus so questions about the whole corpus can be answered, at higher indexing cost. See [Knowledge and context](./05-data-knowledge-rag.md). |
| **Guardrail** | A control that checks or constrains model inputs and outputs: content filters, prompt-injection detection, PII masking and similar. See [Security and safety](./09-security-safety.md). |
| **Hallucination** | Model output that is fluent but unsupported by facts or the supplied context. |
| **Headroom** | Spare capacity kept above current demand (GPUs, quota or rate limit) so that spikes, failover and rollouts do not cause errors. See [Reliability, performance and capacity](./11-reliability-capacity.md). |
| **Hedging** | Sending the same request to more than one backend and using the first response, to cut tail latency. See [Reliability, performance and capacity](./11-reliability-capacity.md). |
| **Human-in-the-loop** | A control point where a person approves or rejects an agent action before it takes effect. See [Agents, tools and protocols](./06-agents-mcp.md). |
| **IaC** | Infrastructure as code: infrastructure defined in versioned, reviewable files. See [Foundation and delivery](./12-foundation-infrastructure.md). |
| **Inference** | Running a trained model to produce outputs. Contrast with training. |
| **Inference engine** | The server software that loads model weights and runs inference efficiently, for example with batching. See [Model serving and inference](./03-model-serving.md). |
| **InferencePool** | A Gateway API Inference Extension resource that groups the model-server pods an endpoint picker may choose from. See [Model serving and inference](./03-model-serving.md). |
| **KV cache** | The attention key and value tensors an engine keeps for tokens it has already processed, so it does not recompute them for each new token. See [Reliability, performance and capacity](./11-reliability-capacity.md). |
| **KV-cache-aware routing** | Sending a request to the replica that already holds the KV cache for its prompt prefix, to cut time to first token. See [Model serving and inference](./03-model-serving.md). |
| **Lineage** | The recorded chain from a served model back to its base model, data, code, configuration and evaluation runs. See [Model lifecycle and adaptation](./04-model-lifecycle-adaptation.md). |
| **LLM** | Large language model. |
| **LLM-as-judge** | Using one model to grade another model's outputs. It is convenient but biased, so it should be calibrated against human review. See [Evaluation and quality](./08-evaluation-quality.md). |
| **LoRA / QLoRA** | Low-Rank Adaptation: tuning by training small adapter matrices instead of all weights. QLoRA does so on a quantised base model to save memory. See [Model lifecycle and adaptation](./04-model-lifecycle-adaptation.md). |
| **MCP** | Model Context Protocol: an open protocol that lets applications give models access to tools, resources and prompts through standard servers. See [Agents, tools and protocols](./06-agents-mcp.md). |
| **Model registry** | A catalogue of model artifacts and their versions, metadata and approval state. See [Model lifecycle and adaptation](./04-model-lifecycle-adaptation.md) and [Governance, risk, compliance and FinOps](./10-governance-finops.md). |
| **Model router** | The component that decides which model or endpoint serves each request, by rules, cost, latency, quality or complexity. See [AI gateway and routing](./02-ai-gateway-routing.md). |
| **ModelPack** | A vendor-neutral specification for packaging models as OCI artifacts so they move through registries like container images. See [Model lifecycle and adaptation](./04-model-lifecycle-adaptation.md). |
| **mTLS** | Mutual TLS: both client and server present certificates, so each proves its identity. See [Security and safety](./09-security-safety.md). |
| **Multi-LoRA serving** | Hosting many LoRA adapters on one base model inside a single inference engine, selecting the adapter per request. See [Model lifecycle and adaptation](./04-model-lifecycle-adaptation.md). |
| **Multi-tenancy** | Serving several teams or customers from one platform with isolation of data, quota and policy. See [Platform experience and tenancy](./13-platform-experience.md). |
| **Non-human identity** | A credential identity for a workload, service or agent rather than a person, issued, scoped and rotated by the platform. See [Agents, tools and protocols](./06-agents-mcp.md) and [Security and safety](./09-security-safety.md). |
| **OIDC / SAML / SSO** | OpenID Connect and SAML are protocols for signing users in through an identity provider; single sign-on (SSO) lets one login serve many applications. See [Security and safety](./09-security-safety.md). |
| **OMS** | OpenSSF Model Signing: signing and verifying model weights and their file manifests with Sigstore-style identities. See [Security and safety](./09-security-safety.md). |
| **On-behalf-of token** | A token that lets an agent or service act for a specific user with that user's limited authority, usually obtained by token exchange. See [Agents, tools and protocols](./06-agents-mcp.md). |
| **OpenAI-compatible API** | An HTTP API that follows the request and response shapes of the OpenAI chat completions and embeddings endpoints, so existing clients work unchanged. |
| **Open-core** | A licensing model with an open-source core and proprietary features or directories. See the [licence legend](./00-methodology.md#32-licence-policy-and-legend). |
| **OpenTelemetry (OTel)** | A vendor-neutral standard and set of tools for traces, metrics and logs; the GenAI semantic conventions define attributes for model calls. See [Observability](./07-observability-evaluation.md). |
| **Open weights** | A model whose weights can be downloaded under a licence that is not OSI-approved. Open weights are not open source. |
| **Over-refusal** | A safety control or model refusing legitimate requests; measured alongside missed attacks so that tightening a guardrail is not scored as a pure win. See [Evaluation and quality](./08-evaluation-quality.md). |
| **OSI** | The Open Source Initiative, which approves open-source licences. |

## P–Z

| Term | Definition |
|------|------------|
| **PII** | Personally identifiable information. See [Security and safety](./09-security-safety.md). |
| **Platform-as-a-product** | Running the platform like a product: named users, a roadmap, support, documentation and adoption metrics instead of a ticket queue. See [Platform experience and tenancy](./13-platform-experience.md). |
| **Pod Security Standards** | Kubernetes profiles (privileged, baseline, restricted) that limit what pods may do. See [Security and safety](./09-security-safety.md). |
| **Policy as code** | Expressing rules (admission, authorisation, spend limits) as versioned code that is evaluated automatically. See [Governance, risk, compliance and FinOps](./10-governance-finops.md). |
| **Pre-flight / post-flight chain** | The ordered security checks run on every model call: before it (PII scan, prompt-risk detection, retrieval sanitisation, tool allow-list) and after it (data-loss and policy checks on the output, with decision metadata sent to the audit trail). See [Security and safety](./09-security-safety.md). |
| **Prefill** | The first phase of generation, where the engine processes the whole prompt in parallel before producing tokens one at a time (the *decode* phase). |
| **Prefill/decode disaggregation** | Splitting the compute-heavy prefill phase and the memory-bound decode phase onto separate worker pools so each scales independently. See *Disaggregated inference*. |
| **Prefix cache** | Reusing the KV cache of a shared prompt prefix across requests, which reduces time to first token. See [Reliability, performance and capacity](./11-reliability-capacity.md). |
| **Prompt injection** | An attack in which instructions hidden in user input or retrieved content override the application's intended instructions. *Indirect* injection arrives through data the model reads, not from the user. See [Security and safety](./09-security-safety.md). |
| **Provenance** | Verifiable evidence of where an artifact came from and how it was built. See [Security and safety](./09-security-safety.md). |
| **Quantisation** | Storing model weights at lower numeric precision to cut memory use and cost, at some quality risk. See [Model lifecycle and adaptation](./04-model-lifecycle-adaptation.md) and [Model serving and inference](./03-model-serving.md). |
| **RAG** | Retrieval-augmented generation: fetching relevant documents at request time and adding them to the prompt. See [Knowledge and context](./05-data-knowledge-rag.md). |
| **Rate limit (RPM, TPM)** | A cap on requests per minute (RPM) or tokens per minute (TPM) for a key, team or model. See [AI gateway and routing](./02-ai-gateway-routing.md). |
| **Red teaming** | Deliberately attacking an AI system to find weaknesses before real attackers do. See [Security and safety](./09-security-safety.md). |
| **Safetensors** | A model-weight file format that cannot execute code on load, unlike Python pickle files. See [Security and safety](./09-security-safety.md). |
| **Sandbox** | An isolated runtime, such as gVisor or Kata Containers, in which untrusted or side-effecting code runs. See [Agents, tools and protocols](./06-agents-mcp.md). |
| **SBOM** | Software bill of materials: a list of the components in a software artifact. See [Security and safety](./09-security-safety.md). |
| **Semantic cache** | A cache that returns a stored answer for requests whose meaning is close to an earlier request, not only identical ones. See [Reliability, performance and capacity](./11-reliability-capacity.md). |
| **Semantic / complexity routing** | Choosing a model from the content of the request, such as its intent, difficulty or safety class, rather than from headers or weights. See [AI gateway and routing](./02-ai-gateway-routing.md). |
| **SFT** | Supervised fine-tuning: training on input and desired-output examples. See [Model lifecycle and adaptation](./04-model-lifecycle-adaptation.md). |
| **Shadow testing** | Sending a copy of live traffic to a candidate model or version and comparing its outputs without returning them to users. See [Evaluation and quality](./08-evaluation-quality.md). |
| **SLI / SLO** | A service level indicator is a measured quantity such as latency; a service level objective is the target for it. See [Reliability, performance and capacity](./11-reliability-capacity.md). |
| **SLSA** | Supply-chain Levels for Software Artifacts: a framework for build provenance and integrity. See [Security and safety](./09-security-safety.md). |
| **Soft vs hard tenancy** | Soft tenancy isolates trusted teams with namespaces, quotas and policy on shared nodes and control plane; hard tenancy gives untrusted tenants their own virtual or physical clusters. See [Platform experience and tenancy](./13-platform-experience.md). |
| **SPDX** | Software Package Data Exchange: the standard identifiers for licences, such as `Apache-2.0`. |
| **Streaming** | Returning tokens as they are generated, usually over server-sent events, instead of one final response. |
| **Tenant** | A team, application or customer that is accounted and isolated separately on the platform. See [Platform experience and tenancy](./13-platform-experience.md). |
| **Time to first call** | How long a new team takes from request for access to its first successful model call; the headline onboarding metric. See [Platform experience and tenancy](./13-platform-experience.md). |
| **Token** | The unit of text a model reads and writes, typically a word fragment. Pricing, limits and speed are expressed in tokens. |
| **Token exchange (RFC 8693)** | An OAuth 2.0 mechanism for swapping one token for another with different audience or scope, used to give agents delegated, narrowed authority. See [Agents, tools and protocols](./06-agents-mcp.md). |
| **Tool calling** | A model feature where the model returns a structured request to call a function or tool, which the application executes. See [Agents, tools and protocols](./06-agents-mcp.md). |
| **Trajectory eval** | Scoring the sequence of steps and tool calls an agent took, not only its final answer. See [Evaluation and quality](./08-evaluation-quality.md). |
| **TTFT** | Time to first token: the delay between sending a request and receiving the first generated token. |
| **Unit economics** | Cost per useful unit of work, such as per request, per accepted answer or per million tokens, rather than total spend. See [Governance, risk, compliance and FinOps](./10-governance-finops.md). |
| **vCluster** | A virtual Kubernetes cluster that runs inside a namespace of a host cluster, giving a tenant its own API server and CRDs. See [Platform experience and tenancy](./13-platform-experience.md). |
| **Vector database** | A store optimised for similarity search over embeddings. See [Knowledge and context](./05-data-knowledge-rag.md). |
| **Virtual key** | A gateway-issued credential that maps to a team, user or budget and hides the real provider keys. See [AI gateway and routing](./02-ai-gateway-routing.md). |
