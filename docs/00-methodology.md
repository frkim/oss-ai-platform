# Methodology

> **TL;DR** — The eleven pillars of this blueprint were derived by cross-reading three primary sources (the CNCF Cloud Native AI whitepaper, the Kubernetes AI Conformance checklist and the CNCF landscape's AI categories) with two cloud "well-architected" guides, then giving every concern exactly one owner. Tools were ranked on six signals (licence, adoption, maintenance, interoperability, security posture, operability), and every time-sensitive fact is dated and graded by how it was verified. Read this page to understand how far to trust the rest.

*Snapshot: 2026-10-11 · Related: [Reference architecture](./01-reference-architecture.md) · [Tool landscape](./14-tool-landscape.md) · [References](./16-references.md)*

## 1. Research questions and scope

The research answered three questions:

1. **Which capabilities must a self-hosted, open-source AI platform provide?** This produced the pillars.
2. **For each capability, which open-source tools are the best and the most popular?** This produced the shortlists and default picks.
3. **How do the parts fit together, and in what order should a team adopt them?** This produced the [reference architecture](./01-reference-architecture.md) and the [roadmap](./13-implementation-roadmap.md).

| In scope | Out of scope |
|----------|--------------|
| Serving and applying models: gateway, routing, inference, retrieval, agents and tools | Pre-training and fine-tuning pipelines, feature stores, classic MLOps |
| Observability, evaluation, security, governance, reliability, hardening | Evaluating commercial SaaS platforms (named only as "Not OSS — reference only") |
| The foundation the platform runs on (Kubernetes, networking, GitOps, secrets) | Legal advice, including regulatory interpretation |

The platform itself must be open source. It may still call commercial model APIs *through* the gateway.

## 2. How the pillars were derived

### 2.1 Sources consulted

Sources are graded by how they were read (see [section 4.1](#41-evidence-grades)).

| Source | Evidence | What it contributed | Limits |
|--------|----------|---------------------|--------|
| [CNCF Cloud Native AI whitepaper](https://github.com/cncf/tag-runtime/blob/main/wgs/cnai/whitepapers/cloudnativeai.md) (March 2024) | Opened | Lifecycle stages (data preparation, model training, model serving, user experience) and cross-cutting concerns (reference implementation, right-sizing, cost control, observability, disaster recovery and business continuity, security and compliance audits, sustainability) | Predates the LLM-gateway and agent-protocol wave: it has no content on gateways, routers, guardrails, MCP or A2A, so those pillars rest on the other sources |
| [Kubernetes AI Conformance checklist, v1.37](https://github.com/cncf/k8s-ai-conformance/blob/main/docs/AIConformance-1.37.yaml) (latest in the repository at snapshot) | Opened | 15 requirements in six areas (accelerators, networking, scheduling and orchestration, observability, security, operator): 8 `MUST`, 7 `SHOULD` | Kubernetes-level only; silent on prompt injection, RAG or governance |
| [CNCF landscape](https://github.com/cncf/landscape/blob/master/landscape.yml) | Opened | Five AI-specific top-level categories (AI Agent, Inference, Data, Training, AI Native Infra) and their subcategories; CNCF maturity levels used throughout | Entries are self-submitted, so coverage is uneven (two AI Native Infra subcategories, Storage and Network, were empty at snapshot) |
| AWS Well-Architected Generative AI Lens | Search-cited | Quality attributes (operational excellence, security, reliability, performance efficiency, cost optimization, sustainability) and generative-AI design principles: controlled autonomy, comprehensive observability, resource efficiency, distributed resilience, standardized resource management, secure interaction boundaries | Cloud-vendor framing; the publisher's site could not be opened |
| Azure Well-Architected Framework, AI workload guidance | Search-cited | Five quality pillars and the pattern of putting an AI gateway in front of model endpoints for routing, resilience and governance | Same as above |
| Risk and threat frameworks (OWASP LLM and agentic Top 10, MITRE ATLAS, NIST AI RMF, ISO/IEC 42001, EU AI Act) | Pillar-level | They define what [Security](./08-security.md) and [Governance](./09-governance-risk-compliance.md) must cover; each pillar document states how its claims were verified | Standards bodies' sites were mostly unreachable; check official texts before any compliance decision |

### 2.2 From concerns to pillars

The three primary sources were read for *concerns*, not for tools. Each concern was assigned to the pillar that owns it:

| Concern: the platform must… | Evidence in the sources | Pillar |
|-----------------------------|-------------------------|--------|
| Give all model traffic one governed entry point | Conformance `ai_inference` (MUST): Gateway API with weighted traffic splitting and header-based routing for OpenAI-protocol headers; landscape AI Native Infra › Gateway; Azure AI-gateway pattern | [P02 AI gateway](./02-ai-gateway.md) |
| Decide which model or endpoint serves a request | Conformance `advanced_inference_ingress` (SHOULD): Gateway API Inference Extension with, for example, KV-cache-aware routing; landscape Inference › Framework | [P03 Model router](./03-model-router.md) |
| Run models efficiently on scarce accelerators | CNAI "Model Serving"; Conformance accelerators (three SHOULD items), gang scheduling, cluster and pod autoscaling (MUST), `disaggregated_inference` (SHOULD); landscape Inference and AI Native Infra › Orchestration and Scheduling | [P04 Model serving](./04-model-serving.md) |
| Ground models in organisational data | CNAI "Data Preparation" and "Context - Vector Databases"; landscape AI Agent › RAG and Vector Database | [P05 Data and RAG](./05-data-knowledge-rag.md) |
| Let models act through tools and other agents | Landscape AI Agent › Agent Framework, Agent Tool, Protocol (MCP, A2A); Conformance `workload_sandboxing` (SHOULD); AWS "controlled autonomy" | [P06 Agents and MCP](./06-agents-mcp.md) |
| Show what the system does and whether it is any good | CNAI "Observability" and OpenLLMetry; Conformance `accelerator_metrics`, `ai_service_metrics` (MUST); landscape AI Agent › Evaluation and AI Native Infra › Observability; AWS "comprehensive observability" | [P07 Observability and evaluation](./07-observability-evaluation.md) |
| Defend against AI-specific attacks | CNAI "Security and Compliance Audits"; landscape AI Agent › Guardrail; AWS "secure interaction boundaries" | [P08 Security](./08-security.md) |
| Prove control, compliance and cost accountability | CNAI "Data Governance", "Cost Control" and "Security and Compliance Audits"; landscape AI Native Infra › Governance, Policy and Security and › Model Asset and Registry; AWS "standardized resource management" | [P09 Governance](./09-governance-risk-compliance.md) |
| Stay fast and available under load and failure | CNAI "Right-sizing", "Disaster Recovery and Business Continuity"; Conformance `cluster_autoscaling`, `pod_autoscaling` (MUST); AWS "distributed resilience" and "resource efficiency" | [P10 Reliability and performance](./10-reliability-performance.md) |
| Shrink the platform's own attack surface | Conformance `secure_accelerator_access` (MUST) and `workload_sandboxing` (SHOULD); CNAI "Security and Compliance Audits" | [P11 Hardening](./11-hardening.md) |
| Run on dependable, reproducible infrastructure | CNAI "Reference Implementation" (calls for an OpenTofu-based starter implementation); Conformance `robust_controller` (MUST); landscape AI Native Infra › Continuous Integration and Delivery | [P12 Foundation](./12-foundation-infrastructure.md) |

Pillar identifiers match file numbers: `P02` is `docs/02-ai-gateway.md`. File `01` is the [reference architecture](./01-reference-architecture.md) that connects the pillars; it is not a pillar.

### 2.3 Why capability pillars rather than the well-architected pillars

The AWS and Azure frameworks organise guidance by *quality attribute*: how well a workload must behave. This blueprint answers a different question, *what to deploy*, so its pillars are capabilities. The quality attributes were not dropped; they were mapped onto the pillars. The mapping is an editorial choice, not something the frameworks prescribe.

| Quality attribute | Where this blueprint handles it |
|-------------------|---------------------------------|
| Operational excellence | [P07](./07-observability-evaluation.md) (telemetry, evaluation) and [P12](./12-foundation-infrastructure.md) (GitOps, delivery) |
| Security | [P08](./08-security.md) (AI-specific threats) and [P11](./11-hardening.md) (platform baseline and supply chain) |
| Reliability | [P10](./10-reliability-performance.md), with routing fallbacks owned by [P03](./03-model-router.md) |
| Performance efficiency | [P03](./03-model-router.md), [P04](./04-model-serving.md) and [P10](./10-reliability-performance.md) |
| Cost optimization | [P02](./02-ai-gateway.md) (quotas and metering), [P07](./07-observability-evaluation.md) (cost dashboards) and [P09](./09-governance-risk-compliance.md) (FinOps process) |
| Sustainability | Cross-cutting; see section 2.4 |

### 2.4 Deliberate non-pillars

- **Model training and fine-tuning.** The CNAI paper and the landscape treat training as a lifecycle stage. This blueprint is about serving and applying models, so it links out instead of covering it. Shared GPU scheduling, which serves both, is covered in [P04](./04-model-serving.md).
- **Sustainability.** The CNAI paper and the AWS lens both give it a place of its own. Here it is a cross-cutting efficiency concern: right-sizing and utilisation live in [P10](./10-reliability-performance.md), and energy telemetry is an optional add-on (for example Kepler, a CNCF Sandbox project listed under Observability and Analysis › Observability in the landscape) noted in the [tool landscape](./14-tool-landscape.md).
- **End-user front-ends.** Chat interfaces and IDE assistants are consumers of the gateway. They appear in the [reference architecture](./01-reference-architecture.md) as the experience layer, not as a pillar.

### 2.5 One owner per topic

Many topics span pillars. To keep the documents consistent, each topic has one owning pillar that carries the deep treatment; every other pillar gives a short mention and a link.

| Topic | Owner | Others do only this |
|-------|-------|---------------------|
| Fallbacks, retries, routing policies | [P03 Model router](./03-model-router.md) | One paragraph and a link |
| Quotas, rate limits, virtual keys | [P02 AI gateway](./02-ai-gateway.md) | Overload handling ([P10](./10-reliability-performance.md)); budgeting process ([P09](./09-governance-risk-compliance.md)) |
| Caching (exact, semantic, prefix, KV) | [P10 Reliability and performance](./10-reliability-performance.md) | Mention the hook and link |
| Guardrails, prompt-injection defence, PII | [P08 Security](./08-security.md) | A hook paragraph ([P02](./02-ai-gateway.md)); secret plumbing ([P12](./12-foundation-infrastructure.md)) |
| Image signing, SBOM, model-artifact safety, tenant isolation | [P11 Hardening](./11-hardening.md) | Link |

The complete ownership map is in the contributor brief for each pillar; the table above shows the pattern. When a tool belongs to several pillars, its licence, star count and caveats are stated identically wherever it appears.

## 3. How tools were selected

### 3.1 Six signals

Candidates were ranked on six signals. Each pillar document says which signals drove its recommendation.

| Signal | What was checked | Where |
|--------|------------------|-------|
| **Licence** | The actual `LICENSE` file (not only GitHub's detector), the SPDX identifier, any `enterprise/` or `ee/` directory, past relicensing | Repository, package metadata |
| **Adoption** | Stars at the snapshot date, foundation membership and CNCF maturity level, named production users, package downloads where easy to get | GitHub, CNCF landscape |
| **Maintenance health** | Latest release tag and date, last push, archived flag, steward and bus factor | GitHub releases |
| **Interoperability** | OpenAI-compatible API, OpenTelemetry, Kubernetes Gateway API, MCP and A2A, open formats | Project documentation |
| **Security posture** | `SECURITY.md`, advisories and CVE history, signed releases and SBOMs, past incidents | Repository, advisories, search |
| **Operability** | Helm chart or operator, high-availability story, upgrade path, Kubernetes-native behaviour | Project documentation |

Stars are a popularity proxy, not a quality measure. They favour well-marketed, recent and Python/JavaScript projects, and they can be inflated. They are rounded to 0.1k and always read alongside the other signals.

### 3.2 Licence policy and legend

GitHub reports `NOASSERTION` or "Other" for custom licences, so the `LICENSE` file was opened for every recommended tool.

| Label | Meaning |
|-------|---------|
| `OSI` ✅ | OSI-approved licence; the SPDX identifier is given (Apache-2.0, MIT, BSD-3-Clause, MPL-2.0, AGPL-3.0, GPL-3.0 and so on). Copyleft implications of AGPL or GPL are noted |
| `Open-core` ⚠️ | An OSI-licensed core plus proprietary or enterprise directories or features; the documents state what is gated |
| `Source-available` ⚠️ | Not OSI-approved: BSL, SSPL, Elastic-2.0, FSL, custom licences or field-of-use restrictions |
| `Open weights` | Models only: weights can be downloaded but the licence is not OSI-approved. Open weights are not open source |
| `Not OSS` | Proprietary or SaaS; reference only, never recommended as a platform component |

Policy: the default pick for a capability is OSI-licensed whenever a credible OSI option exists. Open-core tools are recommended only where the open part covers the use case, and the gated features are listed. Source-available tools appear to help readers orient, with the licence called out.

### 3.3 Defaults and alternatives

Every capability gets one default pick, one to three alternatives, and "choose X when…" guidance. The shortlists are deliberately small, typically three to seven tools per capability, rather than exhaustive. Commercial offerings are mentioned only when they help readers orient.

## 4. Evidence and verification

### 4.1 Evidence grades

Time-sensitive claims (licences, star counts, releases, maintainers, acquisitions, incidents, foundation status) were verified at the snapshot date rather than recalled.

| Grade | Meaning | How it appears |
|-------|---------|----------------|
| **Opened** | The upstream artefact was read: a repository file (`LICENSE`, README, docs), GitHub repository and release data, a PyPI release index, or the CNCF landscape file | Stated plainly, with a link |
| **Search-cited** | The claim comes from search-engine summaries whose cited pages could not be opened. Accepted only when at least two independent results agree | Worded as "reported", and marked in [References](./16-references.md) |
| **Unverified** | One source only, or sources conflict | Flagged in the text, or omitted |

### 4.2 What could not be reached

During the research window most vendor, foundation and standards websites could not be opened, including the Kubernetes, OpenTelemetry, OWASP, NIST and cloud-provider documentation sites. Where a project keeps its documentation in a GitHub repository, that copy was read directly. Otherwise the claim was graded *search-cited*. Regulatory dates and standards details are therefore mostly secondary evidence. Check the official texts before making any compliance decision.

### 4.3 Why live verification matters: two examples

- **Renames hide in plain sight.** The repository `envoyproxy/ai-gateway` now redirects to `theagentrouter/agent-router`, whose README says "Formerly Envoy AI Gateway". The licence (Apache-2.0) and code are continuous, and the machine-visible names (the `aigateway.envoyproxy.io` API group, the `AIGatewayRoute` resource, the `aigw` CLI and the container images) are unchanged. The CNCF landscape still lists the old name. This blueprint writes "Agent Router (formerly Envoy AI Gateway)".
- **A licence badge can mislead.** GitHub shows no SPDX identifier for `BerriAI/litellm`. The root `LICENSE` grants MIT for everything outside `enterprise/`, while `enterprise/LICENSE.md` requires a commercial subscription for production use of that directory. The PyPI metadata says only `MIT`. LiteLLM is therefore labelled `Open-core`, and the gated parts are named in [P02](./02-ai-gateway.md).

## 5. Snapshot and refresh

All facts are as of **2026-10-11**. Stars are given in thousands, rounded to 0.1k; release dates use ISO 8601. Fast-moving facts decay at different rates:

| Fact | Suggested refresh |
|------|-------------------|
| Star counts, latest versions | Quarterly |
| Licences, ownership, project status (acquisitions, archival, renames) | Whenever a project is adopted or upgraded, and on any announcement |
| Foundation and maturity levels | Twice a year, against the CNCF landscape |
| Regulatory dates and standards versions | On each legislative or standards update |

To re-verify a tool, use the same sources the research used:

```bash
# Stars, SPDX licence, last push and archived flag (requires the GitHub CLI)
gh api repos/BerriAI/litellm \
  --jq '{stars: .stargazers_count, spdx: .license.spdx_id, pushed: .pushed_at, archived: .archived}'

# Latest published release
gh api repos/BerriAI/litellm/releases/latest --jq '{tag: .tag_name, date: .published_at}'

# Python packages: latest version and declared licence expression
curl -s https://pypi.org/pypi/litellm/json | jq '{version: .info.version, license: .info.license_expression}'
```

To check a CNCF maturity level, download the landscape file and search for the project:

```bash
curl -sO https://raw.githubusercontent.com/cncf/landscape/master/landscape.yml
grep -n -B3 -A12 "name: KServe" landscape.yml
```

Then open the `LICENSE` file itself, because the badge can differ from the file (section 4.3).

## 6. Limitations

- **Popularity is not quality.** Stars and downloads guide the shortlist; they do not replace your own evaluation.
- **Single-day snapshot.** Projects change licences, owners and names. Anything adopted should be re-verified with the commands above.
- **Mostly secondary evidence outside GitHub.** See [section 4.2](#42-what-could-not-be-reached).
- **No original benchmarks.** Performance numbers appear only with a cited source and its conditions. Measure your own workload ([P10](./10-reliability-performance.md) describes how).
- **Opinionated shortlists.** A tool that is absent is not necessarily worse.
- **AI-assisted authoring.** This repository was drafted with AI assistance (parallel research agents) and then reviewed and fact-checked in separate passes. Treat it as a researched starting point, not audited guidance, and open an issue when something is wrong.
- **Not legal advice.** Licence and regulation summaries are orientation only.

## 7. Sources

Opened:

- [Cloud Native AI whitepaper (source)](https://github.com/cncf/tag-runtime/blob/main/wgs/cnai/whitepapers/cloudnativeai.md) — lifecycle stages and cross-cutting concerns
- [Kubernetes AI Conformance programme](https://github.com/cncf/k8s-ai-conformance) and [requirements project](https://github.com/kubernetes-sigs/ai-conformance) — programme structure
- [AI Conformance checklist v1.37](https://github.com/cncf/k8s-ai-conformance/blob/main/docs/AIConformance-1.37.yaml) — the 15 requirements and their MUST/SHOULD levels
- [CNCF landscape source](https://github.com/cncf/landscape/blob/master/landscape.yml) — AI categories and maturity levels
- [Agent Router repository](https://github.com/theagentrouter/agent-router) — rename and licence
- [LiteLLM `LICENSE`](https://github.com/BerriAI/litellm/blob/main/LICENSE) and [`enterprise/LICENSE.md`](https://github.com/BerriAI/litellm/blob/main/enterprise/LICENSE.md) — open-core boundary
- [LiteLLM on PyPI (JSON index)](https://pypi.org/pypi/litellm/json) — package licence metadata
- [Kepler repository](https://github.com/sustainable-computing-io/kepler) — energy telemetry project referenced in section 2.4

Search-cited (could not be opened, accessed 2026-10-11):

- [Design principles — AWS Well-Architected Generative AI Lens](https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/design-principles.html) and [the lens overview](https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/generative-ai-lens.html)
- [Design principles for AI workloads on Azure](https://learn.microsoft.com/en-us/azure/well-architected/ai/design-principles) and [Access models through a gateway](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/azure-openai-gateway-guide)
- [Azure AI Landing Zones](https://github.com/Azure/AI-Landing-Zones) — Azure's reference implementation repository (opened, not read in depth)
