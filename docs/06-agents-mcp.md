# P06. Agents, tools and protocols

> **TL;DR** — Standardise tool access and agent identity before you standardise agent frameworks. Give every agent its own non-human identity with delegated, short-lived authority, put approval gates on side effects, and use MCP to expose tools and resources, add A2A only when agents really need to coordinate, and run side-effecting agents with least privilege inside a sandbox you can patch and audit.

*Snapshot: 2026-10-11 · Related: [Reference architecture](./01-reference-architecture.md) · [AI gateway and routing](./02-ai-gateway-routing.md) · [Knowledge and context](./05-data-knowledge-rag.md) · [Security and safety](./09-security-safety.md) · [Observability](./07-observability-evaluation.md) · [Evaluation](./08-evaluation-quality.md)*

## 1. Why it matters

Agents are where a platform stops being a single model call and becomes a controlled system of decisions, tools and side effects. This pillar matters because it decides:

- **How models see tools and data**
- **How many degrees of autonomy they get**
- **How those actions are isolated, audited and revoked**
- **How much framework lock-in the platform accepts**

In practice, most failures are not "the agent was not smart enough". They are:

- Too many tools with weak descriptions
- No approval boundary for side effects
- Long-lived credentials in prompts or environment variables
- No replayable state when something goes wrong

Ownership boundaries are important:

- **Fallbacks and retry policy across models or backends** belong to [P02](./02-ai-gateway-routing.md).
- **Guardrails, prompt-injection defence and content policy** belong to [P09](./09-security-safety.md).
- **Isolation, sandbox hardening and supply-chain baseline** belong to [P09](./09-security-safety.md), even though the runtime choices appear here.

## 2. Capability map

| Capability | What it must do | Notes |
|------------|-----------------|-------|
| **Tool protocol** | Present tools, resources and prompts through a standard contract | MCP is the default protocol for tool exposure when you want framework-neutral integration |
| **Agent runtime** | Hold state, plan steps, call tools and wait for approvals | Prefer explicit state machines over hidden recursive loops |
| **Inter-agent coordination** | Let specialist agents hand off work or request help | A2A is useful only when agents are separate services or teams, not inside one process by default |
| **Execution sandbox** | Limit filesystem, network, kernel and identity access for tool calls | Choose the sandbox according to the blast radius of the tools, not the elegance of the framework |
| **Identity and authorisation** | Map user, service and tool identity to least privilege | Short-lived credentials beat shared static secrets; see section 5.6 for non-human agent identity |
| **Memory and state** | Persist what matters between steps without turning prompts into databases | Source-of-truth business state still belongs in normal data stores; long-term recall is a [P05](./05-data-knowledge-rag.md) memory store |
| **Human-in-the-loop** | Pause side-effecting steps for approval and resume with durable state | Approval gates map to risk tiers (section 5.7) |
| **Discovery and protocol translation** | Publish approved MCP servers and agents in one catalogue, and bridge legacy REST or gRPC systems into that surface deliberately | Dynamic discovery from the public internet is a development convenience, not a production default |
| **Agent registry and catalogue** | One inventory of agents, MCP servers and skills with owner, version, scopes and status | Feeds governance records in [P10](./10-governance-finops.md) |
| **AgentOps hooks** | Emit traces, tool audit events and eval hooks per run, and support replay | Telemetry in [P07](./07-observability-evaluation.md); trajectory evals in [P08](./08-evaluation-quality.md) |
| **Audit and observability** | Record tool calls, approvals, inputs, outputs and trace IDs | Deep telemetry lives in [P07](./07-observability-evaluation.md) |

## 3. Tool comparison

The original table was based on repository checks opened on 2026-10-11. This review adds missing runtimes, registry corrections and MCP-registry status spot-checks opened on 2026-10-17. Evidence grades follow [Methodology §4.1](./00-methodology.md#41-evidence-grades): repo pages, `LICENSE` files and release pages read on GitHub are **Opened**; foundation-governance claims that still depend on secondary sources remain **Search-cited**; immature projects or preview APIs are flagged **Unverified**.

Selection criteria used in this pillar:

- **Protocol neutrality:** can tools, prompts and resources move between clients and runtimes without bespoke adapters?
- **State visibility:** can operators inspect, replay and interrupt the run, or does the framework hide control flow?
- **Security envelope:** identity, sandboxing, egress control and approvals matter more than agent cleverness.
- **Registry maturity:** production teams need approved inventory and ownership first, marketplace-style discovery second.
- **Kubernetes fit:** cluster-native control planes help only when there are enough agents and enough platform owners to justify them.

| Capability | Default pick | Licence label | Steward | Alternatives | Decision criteria | Choose the default when… | Do not choose the default when… |
|------------|--------------|---------------|---------|--------------|-------------------|---------------------------|---------------------------------|
| **Tool and resource protocol** | **MCP** | `OSI` ✅ (Apache-2.0 for new contributions; legacy contributions remain MIT during a relicensing transition) | Agentic AI Foundation (Linux Foundation), donated by Anthropic in December 2025 (**Search-cited**) | Framework-specific tool APIs, direct HTTP wrappers, OpenAPI adapters | Client and framework interoperability, stable tool schemas, resource and prompt transport | you want one tool surface that multiple agent frameworks and clients can consume without bespoke adapters | only one application and one runtime exist, with no realistic need to expose tools outside that codebase, so direct function calls are simpler |
| **Agent-to-agent protocol** | **A2A** (26.1k★) | `OSI` ✅ (Apache-2.0) | Linux Foundation; joined the Agentic AI Foundation in August 2026 (**Search-cited**) | Queue-and-worker handoffs, webhooks, direct RPC between services | Separate deployment boundaries, explicit handoff semantics, provenance across services | agents are separately deployed services or team-owned systems that need a formal handoff contract | all participants run inside one runtime or one service boundary, where queue jobs or plain RPC are cheaper to operate |
| **Application-level agent runtime** | **LangGraph** (43.4k★; 1.2.16, 2026-10-16) | `OSI` ✅ (MIT) | LangChain (company) | CrewAI (`OSI` ✅ MIT; 59.8k★), OpenAI Agents SDK (`OSI` ✅ MIT; 30.1k★), Google ADK (`OSI` ✅ Apache-2.0; 21.9k★), Microsoft Agent Framework (`OSI` ✅ MIT; 14.2k★), Pydantic AI (`OSI` ✅ MIT; 20.7k★), Letta (`OSI` ✅ Apache-2.0), internal workflow engine | Explicit state, checkpoints, interruptibility, ecosystem breadth, language or stack fit | you want explicit state graphs, checkpoints, human approvals and application-controlled execution flow | a lighter typed Python loop is enough, where **Pydantic AI** can be a better fit, or you need a strongly opinionated role model such as **CrewAI** |
| **Kubernetes-native agent control plane** | **kagent** (4.0k★; v1.0.0-alpha14, 2026-10-16) | `OSI` ✅ (Apache-2.0) | kagent maintainers; CNCF Sandbox project (landscape) | LangGraph (`OSI` ✅ MIT), internal controllers | Need for CRDs, cluster-native lifecycle, shared platform ownership across many agents | platform teams want CRDs, cluster-native lifecycle and a shared control plane for many agents | there are only a few agents, or one application team owns them end to end and does not need another control plane |
| **Sandbox with low friction** | **gVisor** (19.6k★) | `OSI` ✅ (Apache-2.0) | Google / gVisor maintainers | Kata Containers (`OSI` ✅ Apache-2.0), `kubernetes-sigs/agent-sandbox` (`OSI` ✅ Apache-2.0) | Isolation strength, syscall interception overhead, operational simplicity | syscall isolation is the main concern and you want a lighter-weight runtime boundary than a full VM | you need a stronger VM-style boundary for high-risk side effects or noisy multi-tenancy, where **Kata Containers** is the safer default |
| **Sandbox with stronger VM-style isolation** | **Kata Containers** (8.9k★) | `OSI` ✅ (Apache-2.0) | Kata Containers community | gVisor (`OSI` ✅ Apache-2.0), `kubernetes-sigs/agent-sandbox` (`OSI` ✅ Apache-2.0) | Blast radius of side effects, regulator expectations, willingness to pay the overhead | side-effecting tools are high risk and the platform can afford the stronger isolation boundary | most tools are read-mostly or internal-only and the extra VM-style overhead would price the feature out |
| **Per-agent sandbox lifecycle on Kubernetes** | **agent-sandbox** (4.3k★; v1.0.7, 2026-10-15) | `OSI` ✅ (Apache-2.0) | Kubernetes SIGs (`kubernetes-sigs`) | Plain `RuntimeClass` pods (section 5.4), gVisor or Kata underneath | Need for pausable, stateful sandboxes created per session, not just one-off pods | you need many isolated, stateful, pausable sandboxes created per agent session through a Kubernetes API | a normal `RuntimeClass` plus job or pod lifecycle is already enough, or the project maturity remains too young for your risk profile (**Unverified**) |
| **Workload identity for agents** | **SPIFFE/SPIRE** (SPIRE 2.6k★) | `OSI` ✅ (Apache-2.0) | CNCF Graduated (**Search-cited**) | Cloud-provider workload identity, projected service-account tokens with OIDC federation, mesh-issued identity | Need for portable non-human identity, attestation and short-lived credentials across clusters or clouds | agents and tool servers span clusters or clouds and need a vendor-neutral, short-lived workload identity | one cluster and one IdP are enough, where projected service-account tokens are simpler and cheaper to run |
| **Agent and MCP registry** | **Git-backed catalogue plus portal entries** | n/a | Your platform team | agentregistry (`OSI` ✅ Apache-2.0; 0.5k★), Official MCP Registry (`OSI` ✅ licence-transition file; 7.4k★; preview / API freeze v0.1), Backstage catalogue entries ([P13](./13-platform-experience.md)) | Approval workflow, ownership metadata, need for publish/install APIs, maturity of discovery surface | you primarily need an approved inventory with owners, versions, scopes and deployment status, and you want no dependency on a young registry service | self-service publishing, CLI install flows and discovery APIs are already a real requirement across many teams, where **agentregistry** becomes attractive |
| **MCP and agent gateway layer** | **agentgateway** (5.4k★; v1.6.0, 2026-10-02) | `OSI` ✅ (Apache-2.0) | agentgateway maintainers; foundation status **Unverified** | IBM ContextForge (`OSI` ✅ Apache-2.0; 4.6k★), thin internal gateway | Authentication, allow-lists, audit, egress control, and whether you also need registry or protocol translation | you want an open MCP and A2A-aware proxy with authentication, allow-lists, audit and egress control instead of building one | you also need integrated registry and REST or gRPC-to-MCP federation now, where **ContextForge** may be the better fit, or you only need a very small internal allow-list proxy |

### 3.1 Trade-offs and default reasoning

1. **Standardise on MCP before standardising on one framework.** Tool interoperability is the slower-moving decision; frameworks churn faster.
2. **Keep A2A optional.** Queue-based delegation covers many first releases and is easier to secure and observe.
3. **Make the catalogue boring first.** A Git-backed approved inventory is less exciting than a live registry, but it is easier to review, back up and reconcile.
4. **Treat sandboxes and identities as part of the control plane, not runtime garnish.** The moment an agent can write, patch or purchase, isolation and identity become product requirements.

Notes:

- **Official MCP Registry status.** The repository README says the registry launched in preview and later entered an API freeze for `v0.1`, not general availability. Treat it as promising infrastructure, but not yet the only production catalogue of record.
- **AutoGen status correction.** Microsoft AutoGen remains useful as a reference and still has MIT code in `LICENSE-CODE`, but the root `LICENSE` is `CC-BY-4.0` for documentation and the README steers new users towards Microsoft Agent Framework. Keep it as legacy, not as a default.
- **ContextForge scope.** IBM ContextForge now spans registry plus proxy duties. That breadth is useful when you need protocol translation, but it is more than many teams need on day one.

Default platform stance:

1. **Standardise on MCP for tool exposure before choosing a dominant agent framework.**
2. **Keep A2A optional.** Many teams can ship with a single runtime plus queue-based delegation first.
3. **Run write-capable tools in a sandbox with short-lived identity.**
4. **Treat the gateway around MCP servers as a control point, not as optional plumbing.**
5. **Start the catalogue as code.** Promote to a live registry only when publish, discovery and install workflows become real operational pain.

## 4. Reference design

A reference design for this pillar looks like this:

1. **User or application request** enters through the governed API path in [P02](./02-ai-gateway-routing.md).
2. **Application policy layer** decides whether the request is a single model call or an agent workflow.
3. **Agent runtime** keeps workflow state, tool budget, approval checkpoints and trace context.
4. **MCP gateway** authenticates the agent, authorises tool access, logs calls and routes to approved MCP servers only.
5. **MCP servers** expose narrow, composable capabilities: search, tickets, repos, SQL, document retrieval, deployment actions.
6. **Sandboxed executors** run high-risk tool calls with network, filesystem and credential limits.
7. **Optional A2A handoff** connects one agent service to another only when ownership or deployment boundaries require it.
8. **Observability path** sends traces, tool audit events and latency metrics to [P07](./07-observability-evaluation.md).

Design rules:

- **The planner never gets more privilege than the tool it may call.**
- **Tool descriptions are part of the control plane.** Poor descriptions create bad plans.
- **Read-only and write-capable tools should be separated at the server and credential level.**
- **A sandbox is not a substitute for authorisation.** It reduces blast radius; it does not decide who may act.

## 5. Implementation guide

### 5.1 Start with tools, not with multi-agent choreography

Expose a small number of high-value tools first:

- search or retrieval
- issue or ticket lookup
- repository read access
- one carefully approved write action, if needed

Each tool should have:

- a clear name
- a one-purpose description
- explicit input schema
- explicit error behaviour
- a documented owner

### 5.2 Put MCP behind a control point

Even when an MCP server is simple, put a gateway or proxy in front of it for:

- authentication
- allow-listed upstreams
- audit logging
- per-tool quotas or budgets
- egress control

This is the place to attach enterprise controls without rewriting each MCP server.

### 5.3 Prefer explicit state machines

LangGraph-style graphs or controller-style reconcilers are easier to review than hidden recursive loops. The runtime should persist:

- current step
- tool budget
- approval state
- trace ID
- retry count
- durable references to outputs, not only prompt text

### 5.4 Isolate risky execution paths

A minimal Kubernetes runtime boundary for an agent executor can be as small as:

```yaml
apiVersion: node.k8s.io/v1
kind: RuntimeClass
metadata:
  name: gvisor
handler: runsc
```

Then bind only the write-capable executor workloads to that `RuntimeClass`. Stronger isolation may justify Kata Containers instead.

### 5.5 Keep business state outside the prompt loop

Agent memory is useful for local reasoning state, but durable facts still belong in normal databases, queues and ticketing systems. If an action matters later, record it in a system of record the platform already backs up and audits. Long-term recall of user or agent facts is a memory store owned by [P05](./05-data-knowledge-rag.md); the runtime here owns only checkpointed step state.

### 5.6 Give agents their own identity and delegated authority

- **Non-human identity.** Each agent (not each framework or team) gets a distinct workload identity, for example a SPIFFE ID such as `spiffe://corp/agent/<name>`, with an owner and an expiry. Never reuse a human account or a shared API key.
- **Delegated authority.** When an agent acts for a user, exchange the user's token for a narrow, short-lived, audience-restricted token using OAuth 2.0 Token Exchange (RFC 8693), so the tool sees both the user (`sub`) and the agent (`act`). The MCP authorisation specification builds on OAuth 2.1 with resource indicators; verify current spec details before implementing.
- **Least privilege per tool.** Scope tokens to one MCP server and the minimum operations; keep read and write scopes separate.
- **Revocation.** Short lifetimes plus a kill switch per agent identity make break-glass practical.
- **Policy and audit.** Enforce at the MCP gateway; policy language and evidence belong to [P09](./09-security-safety.md) and [P10](./10-governance-finops.md).

### 5.7 Add human-in-the-loop approval gates

Classify tools by risk tier (read, reversible write, irreversible or external write, financial or privileged). Auto-run the first tier, require approval for the others, and forbid the last in autonomous mode. The runtime pauses at an interrupt, persists state, records approver, time and the exact arguments approved, and resumes after a decision or times out safely. Approvals expire; a stale approval must not authorise a changed action.

### 5.8 Register agents and wire AgentOps hooks

- **Registry.** Every production agent, MCP server and skill has a catalogue record: owner, version, purpose, risk tier, granted scopes, data classes, model families, protocol versions and status. Reconcile it against what is deployed; unregistered agents are blocked at the gateway.
- **Discovery policy.** Separate approved internal records from public registries. Production agents should resolve tools from the approved catalogue first and use public registries only through a review workflow.
- **AgentOps hooks.** Emit one trace per run with spans for model calls, tool calls, approvals and A2A handoffs ([P07](./07-observability-evaluation.md)); store enough state to replay a run; export trajectories to the evaluation pipeline for trajectory and task-success evals and regression gates ([P08](./08-evaluation-quality.md)); and report tokens and tool cost per agent for showback ([P10](./10-governance-finops.md)).

## 6. Operations

Operating agent systems is mostly about narrowing blast radius:

- **Tool catalogue management:** approve, version and retire tools deliberately.
- **Credential rotation:** use short-lived credentials wherever possible; rotate shared secrets aggressively if you cannot avoid them yet.
- **Registry hygiene:** review owners, scopes, protocol versions and last-used dates; retire dormant agents and revoke their identities.
- **Approval policy:** define which actions need human approval, which can auto-run, and which are forbidden.
- **Schema drift:** detect MCP tool-schema changes before a client or planner picks them up implicitly.
- **Discovery control:** pin which public registries or discovery endpoints are reachable from production runtimes.
- **Tracing:** propagate one trace ID across model calls, tool calls and any A2A handoffs into [P07](./07-observability-evaluation.md).
- **Timeouts and budgets:** bound steps, total runtime, token budgets and external call counts.
- **Patchability:** keep the sandbox runtime and base images upgradable on the same cadence as other platform components.
- **Egress review:** explicitly list where agents may call out, rather than allowing general outbound internet by default.

Operational heuristics:

- If an agent becomes unreliable, remove tools before you change models.
- If operators cannot explain why a tool was called, improve the tool description, schema and audit fields before tuning prompts.
- If teams keep adding agent-to-agent hops, verify that they are not compensating for missing tool boundaries or ownership clarity.
- If new MCP servers appear faster than they can be reviewed, freeze discovery and fall back to the approved catalogue.

## 7. Pitfalls

- **Starting with a giant toolbox.** The agent learns ambiguity faster than it learns restraint.
- **Letting prompts carry credentials or durable state.** That breaks rotation, audit and replay.
- **Treating MCP as a security control by itself.** It is an interface standard, not an authorisation system.
- **Using A2A for every internal call.** It adds protocol overhead where a queue or normal service call would do.
- **Registering MCP servers by URL alone.** Without owner, version, scopes and review status, the registry becomes a bookmark list, not a control plane.
- **Skipping human approval for side effects.** Fast automation is still risk if the target system changes state.
- **Relying on the framework's defaults for retry or fallback behaviour.** Those policies belong in [P02](./02-ai-gateway-routing.md).
- **Allowing live production discovery from public registries.** It widens supply-chain and authorisation risk far faster than most teams can review.
- **Sharing one service account across agents.** Audit logs then cannot say which agent acted or for whom.
- **Approvals that approve a category, not an action.** Approve the exact arguments, with an expiry.
- **Assuming sandboxing solves prompt injection.** The primary defences still live in [P09](./09-security-safety.md).

## 8. Checklist

### MVP

- [ ] One agent runtime chosen, with explicit persisted state
- [ ] MCP used for new tool integrations unless there is a strong reason not to
- [ ] Read-only and write-capable tools split by credential and endpoint
- [ ] Tool allow-list and audit logging in place
- [ ] Approved catalogue record exists for each production agent or MCP server
- [ ] At least one human approval checkpoint for side-effecting workflows
- [ ] Each agent has its own identity, not a shared key

### Production

- [ ] MCP servers fronted by a gateway or proxy with authn, authz and logging
- [ ] Trace IDs propagated across model, tool and queue boundaries
- [ ] Sandbox runtime selected for write-capable executors
- [ ] Per-tool quotas, timeouts and retry policies documented
- [ ] Tool owners, lifecycle and deprecation process defined
- [ ] Prompt-injection and data-exfiltration controls linked from [P09](./09-security-safety.md)
- [ ] Agent and MCP registry with owner, version, protocol version, risk tier and scopes
- [ ] Run traces and trajectories exported to [P07](./07-observability-evaluation.md) and [P08](./08-evaluation-quality.md)

### Enterprise

- [ ] Optional A2A adopted only where cross-team or cross-runtime handoffs are real
- [ ] Fine-grained service identity and short-lived credentials used for tool calls
- [ ] Delegated user authority via token exchange, with the acting agent recorded
- [ ] Approval tiers mapped to risk, with expiry and recorded approver
- [ ] Registry reconciled against deployed agents; unregistered agents blocked
- [ ] Public-registry intake or mirroring process reviewed and documented
- [ ] Agent action approvals mapped to business risk levels
- [ ] Sandboxing and base images patched through the same release process as the rest of the platform
- [ ] Multi-tenant agent isolation requirements explicitly tested
- [ ] Break-glass and emergency disable path for unsafe tools documented

## 9. Sources

Primary upstreams to re-check:

- [Model Context Protocol site](https://modelcontextprotocol.io/)
- [MCP specification repository](https://github.com/modelcontextprotocol/modelcontextprotocol)
- [A2A repository](https://github.com/a2aproject/A2A)
- [LangGraph repository](https://github.com/langchain-ai/langgraph)
- [CrewAI repository](https://github.com/crewAIInc/crewAI)
- [OpenAI Agents SDK repository](https://github.com/openai/openai-agents-python)
- [Google ADK repository](https://github.com/google/adk-python)
- [Microsoft Agent Framework repository](https://github.com/microsoft/agent-framework)
- [Pydantic AI repository](https://github.com/pydantic/pydantic-ai)
- [Letta repository](https://github.com/letta-ai/letta)
- [AutoGen repository](https://github.com/microsoft/autogen) and [`LICENSE-CODE`](https://github.com/microsoft/autogen/blob/main/LICENSE-CODE)
- [kagent repository](https://github.com/kagent-dev/kagent)
- [agentgateway repository](https://github.com/agentgateway/agentgateway)
- [IBM ContextForge repository](https://github.com/IBM/mcp-context-forge)
- [agentregistry repository](https://github.com/agentregistry-dev/agentregistry)
- [Official MCP Registry repository](https://github.com/modelcontextprotocol/registry)
- [SPIRE repository](https://github.com/spiffe/spire) and [SPIFFE](https://spiffe.io/)
- [RFC 8693 OAuth 2.0 Token Exchange](https://www.rfc-editor.org/rfc/rfc8693)
- [gVisor repository](https://github.com/google/gvisor)
- [Kata Containers repository](https://github.com/kata-containers/kata-containers)
- [kubernetes-sigs/agent-sandbox repository](https://github.com/kubernetes-sigs/agent-sandbox)
- [Kubernetes AI Conformance checklist](https://github.com/cncf/k8s-ai-conformance/blob/main/docs/AIConformance-1.37.yaml)
- [Cloud Native AI whitepaper](https://github.com/cncf/tag-runtime/blob/main/wgs/cnai/whitepapers/cloudnativeai.md)

The original table facts were read on 2026-10-11 (**Opened**). Added rows and status corrections for Pydantic AI, agentregistry, the official MCP Registry, ContextForge and AutoGen licence details were spot-checked on 2026-10-17 (**Opened**). Foundation status remains **Search-cited** where noted. Refresh with [Methodology §5](./00-methodology.md#5-snapshot-and-refresh).
