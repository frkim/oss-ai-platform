# Glossary

> **TL;DR** — Short definitions of the terms used across this blueprint, in alphabetical order. Tool names are not defined here; look them up in the [tool landscape](./14-tool-landscape.md).

*Snapshot: 2026-10-11 · Related: [Methodology](./00-methodology.md) · [Reference architecture](./01-reference-architecture.md)*

## A–F

| Term | Definition |
|------|------------|
| **A2A** | Agent2Agent: an open protocol for communication between AI agents built on different frameworks. See [Agents and MCP](./06-agents-mcp.md). |
| **AAIF** | The Agentic AI Foundation, a Linux Foundation-hosted home for agent-related open-source projects. Agent Router (formerly Envoy AI Gateway) describes itself as an AAIF project. See [AI gateway](./02-ai-gateway.md). |
| **ACL** | Access control list: per-document or per-resource permissions stored with data so retrieval and tools can filter by who may see it. See [Data and RAG](./05-data-knowledge-rag.md). |
| **Agent** | A program that uses a model to decide which actions or tool calls to take in a loop, rather than answering once. See [Agents and MCP](./06-agents-mcp.md). |
| **AGPL** | GNU Affero General Public License: an OSI-approved copyleft licence that also applies to software offered over a network. See the [licence legend](./00-methodology.md#32-licence-policy-and-legend). |
| **AI-BOM** | An AI bill of materials: an inventory of the models, datasets, prompts and software that make up an AI system, extending the idea of an SBOM. See [Governance](./09-governance-risk-compliance.md). |
| **AI gateway** | A single governed entry point for model traffic that provides a unified API, authentication, quotas, metering and policy hooks. See [AI gateway](./02-ai-gateway.md). |
| **Air-gapped** | Running without any connection to the public internet. It affects how images, models and updates are delivered. See [Hardening](./11-hardening.md). |
| **Autoscaling** | Automatically adding or removing replicas (pod autoscaling) or nodes (cluster autoscaling) in response to load. See [Reliability and performance](./10-reliability-performance.md). |
| **Canary release** | Sending a small share of traffic to a new model or version before a full rollout. See [Model router](./03-model-router.md). |
| **Chargeback / showback** | Charging teams for the cost they cause (chargeback) or only reporting it to them (showback). See [Governance](./09-governance-risk-compliance.md). |
| **Chat completions API** | The request and response format popularised by OpenAI for conversational models; the de facto interface that gateways and inference engines implement. See *OpenAI-compatible API*. |
| **Chunk** | A piece of a document sized for embedding and retrieval. See [Data and RAG](./05-data-knowledge-rag.md). |
| **Circuit breaker** | A resilience pattern that stops sending requests to a failing backend for a while so that it can recover. See [Reliability and performance](./10-reliability-performance.md). |
| **CNCF** | Cloud Native Computing Foundation: the Linux Foundation body that hosts Kubernetes, Prometheus and other projects, with Sandbox, Incubating and Graduated maturity levels. |
| **CRD** | CustomResourceDefinition: a Kubernetes extension point that lets an operator add its own resource types. |
| **Disaggregated inference** | Running the prefill and decode phases of generation on separately scaled workers. See *Prefill* and [Model serving](./04-model-serving.md). |
| **DRA** | Dynamic Resource Allocation: the Kubernetes mechanism for requesting and sharing devices such as GPUs. See [Model serving](./04-model-serving.md). |
| **Egress** | Outbound network traffic from a workload. Egress control limits what agents and tools can reach. See [Hardening](./11-hardening.md). |
| **Embedding** | A numeric vector that represents the meaning of a piece of text or other data, used for similarity search. See [Data and RAG](./05-data-knowledge-rag.md). |
| **Error budget / burn rate** | The amount of unreliability an SLO allows over a period, and how fast it is being used up. See [Reliability and performance](./10-reliability-performance.md). |
| **Evaluation (eval)** | A repeatable test of model or application quality using datasets, metrics or a judge model. See [Observability and evaluation](./07-observability-evaluation.md). |
| **Fallback** | Automatically retrying a request on another model or endpoint when the first one fails or is overloaded. See [Model router](./03-model-router.md). |
| **Fine-tuning** | Further training of a model on a smaller dataset to specialise it. Out of scope here; see [methodology](./00-methodology.md#24-deliberate-non-pillars). |
| **FinOps** | The practice of managing cloud and GPU spend through shared accountability between engineering and finance. See [Governance](./09-governance-risk-compliance.md). |

## G–O

| Term | Definition |
|------|------------|
| **Gang scheduling** | All-or-nothing scheduling of a group of pods, so a distributed job starts only when all its workers can run. See [Model serving](./04-model-serving.md). |
| **Gateway API** | The Kubernetes API for describing traffic routing (`Gateway`, `HTTPRoute` and related resources), implemented by many proxies. See [Foundation](./12-foundation-infrastructure.md). |
| **Gateway API Inference Extension (GAIE)** | An extension to the Gateway API that lets a gateway pick an inference endpoint using model-server metrics such as queue depth or KV-cache use. See [Model router](./03-model-router.md). |
| **GGUF** | A single-file model format used by llama.cpp and Ollama, often quantised for CPU and edge inference. See [Model serving](./04-model-serving.md). |
| **GitOps** | Operating infrastructure and applications by declaring the desired state in Git and letting a controller apply it. See [Foundation](./12-foundation-infrastructure.md). |
| **Guardrail** | A control that checks or constrains model inputs and outputs: content filters, prompt-injection detection, PII masking and similar. See [Security](./08-security.md). |
| **Hallucination** | Model output that is fluent but unsupported by facts or the supplied context. |
| **Hedging** | Sending the same request to more than one backend and using the first response, to cut tail latency. See [Reliability and performance](./10-reliability-performance.md). |
| **IaC** | Infrastructure as code: infrastructure defined in versioned, reviewable files. See [Foundation](./12-foundation-infrastructure.md). |
| **Inference** | Running a trained model to produce outputs. Contrast with training. |
| **Inference engine** | The server software that loads model weights and runs inference efficiently, for example with batching. See [Model serving](./04-model-serving.md). |
| **KV cache** | The attention key and value tensors an engine keeps for tokens it has already processed, so it does not recompute them for each new token. See [Reliability and performance](./10-reliability-performance.md). |
| **LLM** | Large language model. |
| **LLM-as-judge** | Using one model to grade another model's outputs. It is convenient but biased, so it should be calibrated against human review. See [Observability and evaluation](./07-observability-evaluation.md). |
| **MCP** | Model Context Protocol: an open protocol that lets applications give models access to tools, resources and prompts through standard servers. See [Agents and MCP](./06-agents-mcp.md). |
| **Model registry** | A catalogue of model artifacts and their versions, metadata and approval state. See [Model serving](./04-model-serving.md) and [Governance](./09-governance-risk-compliance.md). |
| **Model router** | The component that decides which model or endpoint serves each request, by rules, cost, latency, quality or complexity. See [Model router](./03-model-router.md). |
| **mTLS** | Mutual TLS: both client and server present certificates, so each proves its identity. See [Security](./08-security.md). |
| **Multi-tenancy** | Serving several teams or customers from one platform with isolation of data, quota and policy. See the [methodology](./00-methodology.md#24-deliberate-non-pillars). |
| **OIDC / SAML / SSO** | OpenID Connect and SAML are protocols for signing users in through an identity provider; single sign-on (SSO) lets one login serve many applications. See [Security](./08-security.md). |
| **OpenAI-compatible API** | An HTTP API that follows the request and response shapes of the OpenAI chat completions and embeddings endpoints, so existing clients work unchanged. |
| **Open-core** | A licensing model with an open-source core and proprietary features or directories. See the [licence legend](./00-methodology.md#32-licence-policy-and-legend). |
| **OpenTelemetry (OTel)** | A vendor-neutral standard and set of tools for traces, metrics and logs; the GenAI semantic conventions define attributes for model calls. See [Observability and evaluation](./07-observability-evaluation.md). |
| **Open weights** | A model whose weights can be downloaded under a licence that is not OSI-approved. Open weights are not open source. |
| **OSI** | The Open Source Initiative, which approves open-source licences. |

## P–Z

| Term | Definition |
|------|------------|
| **PII** | Personally identifiable information. See [Security](./08-security.md). |
| **Pod Security Standards** | Kubernetes profiles (privileged, baseline, restricted) that limit what pods may do. See [Hardening](./11-hardening.md). |
| **Policy as code** | Expressing rules (admission, authorisation, spend limits) as versioned code that is evaluated automatically. See [Governance](./09-governance-risk-compliance.md). |
| **Prefill** | The first phase of generation, where the engine processes the whole prompt in parallel before producing tokens one at a time (the *decode* phase). |
| **Prefix cache** | Reusing the KV cache of a shared prompt prefix across requests, which reduces time to first token. See [Reliability and performance](./10-reliability-performance.md). |
| **Prompt injection** | An attack in which instructions hidden in user input or retrieved content override the application's intended instructions. *Indirect* injection arrives through data the model reads, not from the user. See [Security](./08-security.md). |
| **Provenance** | Verifiable evidence of where an artifact came from and how it was built. See [Hardening](./11-hardening.md). |
| **Quantisation** | Storing model weights at lower numeric precision to cut memory use and cost, at some quality risk. See [Model serving](./04-model-serving.md). |
| **RAG** | Retrieval-augmented generation: fetching relevant documents at request time and adding them to the prompt. See [Data and RAG](./05-data-knowledge-rag.md). |
| **Rate limit (RPM, TPM)** | A cap on requests per minute (RPM) or tokens per minute (TPM) for a key, team or model. See [AI gateway](./02-ai-gateway.md). |
| **Red teaming** | Deliberately attacking an AI system to find weaknesses before real attackers do. See [Security](./08-security.md). |
| **Safetensors** | A model-weight file format that cannot execute code on load, unlike Python pickle files. See [Hardening](./11-hardening.md). |
| **Sandbox** | An isolated runtime, such as gVisor or Kata Containers, in which untrusted or side-effecting code runs. See [Agents and MCP](./06-agents-mcp.md). |
| **SBOM** | Software bill of materials: a list of the components in a software artifact. See [Hardening](./11-hardening.md). |
| **Semantic cache** | A cache that returns a stored answer for requests whose meaning is close to an earlier request, not only identical ones. See [Reliability and performance](./10-reliability-performance.md). |
| **SLI / SLO** | A service level indicator is a measured quantity such as latency; a service level objective is the target for it. See [Reliability and performance](./10-reliability-performance.md). |
| **SLSA** | Supply-chain Levels for Software Artifacts: a framework for build provenance and integrity. See [Hardening](./11-hardening.md). |
| **SPDX** | Software Package Data Exchange: the standard identifiers for licences, such as `Apache-2.0`. |
| **Streaming** | Returning tokens as they are generated, usually over server-sent events, instead of one final response. |
| **Tenant** | A team, application or customer that is accounted and isolated separately on the platform. See [AI gateway](./02-ai-gateway.md). |
| **Token** | The unit of text a model reads and writes, typically a word fragment. Pricing, limits and speed are expressed in tokens. |
| **Tool calling** | A model feature where the model returns a structured request to call a function or tool, which the application executes. See [Agents and MCP](./06-agents-mcp.md). |
| **TTFT** | Time to first token: the delay between sending a request and receiving the first generated token. |
| **Vector database** | A store optimised for similarity search over embeddings. See [Data and RAG](./05-data-knowledge-rag.md). |
| **Virtual key** | A gateway-issued credential that maps to a team, user or budget and hides the real provider keys. See [AI gateway](./02-ai-gateway.md). |
