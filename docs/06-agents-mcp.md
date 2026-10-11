# P06. Agents and MCP

> **TL;DR** — Standardise tool access before you standardise agent frameworks. Use MCP to expose tools and resources, add A2A only when agents really need to coordinate, and run side-effecting agents with least privilege inside a sandbox you can patch and audit.

*Snapshot: 2026-10-11 · Related: [Reference architecture](./01-reference-architecture.md) · [Model router](./03-model-router.md) · [Security](./08-security.md) · [Hardening](./11-hardening.md)*

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

- **Fallbacks and retry policy across models or backends** belong to [P03](./03-model-router.md).
- **Guardrails, prompt-injection defence and content policy** belong to [P08](./08-security.md).
- **Isolation, sandboxing hardening and supply-chain baseline** belong to [P11](./11-hardening.md), even though the runtime choices appear here.

## 2. Capability map

| Capability | What it must do | Notes |
|------------|-----------------|-------|
| **Tool protocol** | Present tools, resources and prompts through a standard contract | MCP is the default protocol for tool exposure when you want framework-neutral integration |
| **Agent runtime** | Hold state, plan steps, call tools and wait for approvals | Prefer explicit state machines over hidden recursive loops |
| **Inter-agent coordination** | Let specialist agents hand off work or request help | A2A is useful only when agents are separate services or teams, not inside one process by default |
| **Execution sandbox** | Limit filesystem, network, kernel and identity access for tool calls | Choose the sandbox according to the blast radius of the tools, not the elegance of the framework |
| **Identity and authorisation** | Map user, service and tool identity to least privilege | Short-lived credentials beat shared static secrets |
| **Memory and state** | Persist what matters between steps without turning prompts into databases | Source-of-truth business state still belongs in normal data stores |
| **Audit and observability** | Record tool calls, approvals, inputs, outputs and trace IDs | Deep telemetry lives in [P07](./07-observability-evaluation.md) |

## 3. Tool comparison

Licences and stars were read from upstream repositories on 2026-10-11 (**Opened**; stars rounded to 0.1k). Foundation statuses are **Search-cited**. Re-check with [Methodology §5](./00-methodology.md#5-snapshot-and-refresh). Picks were driven by licence, interoperability (MCP, A2A, OpenTelemetry) and operability (Kubernetes-native lifecycle); all projects below were pushed in the last month except AutoGen (see the note).

| Capability | Default pick | Licence label | Steward | Alternatives | Choose X when… |
|------------|--------------|---------------|---------|--------------|----------------|
| **Tool and resource protocol** | **MCP** | `OSI` ✅ (Apache-2.0 for new contributions; legacy contributions remain MIT during a relicensing transition) | Agentic AI Foundation (Linux Foundation), donated by Anthropic in December 2025 (search-cited) | Framework-specific tool APIs, direct HTTP wrappers, OpenAPI adapters | Choose **MCP** when you want one tool surface that multiple agent frameworks and clients can consume without bespoke adapters |
| **Agent-to-agent protocol** | **A2A** (26.1k★) | `OSI` ✅ (Apache-2.0) | Linux Foundation; joined the Agentic AI Foundation in August 2026 (search-cited) | Queue-and-worker handoffs, webhooks, direct RPC between services | Choose **A2A** when agents are separately deployed services that need explicit handoff semantics rather than in-process function calls |
| **Application-level agent runtime** | **LangGraph** (43.0k★) | `OSI` ✅ (MIT) | LangChain (company) | CrewAI (`OSI` ✅ MIT; 59.6k★, role-based crews), OpenAI Agents SDK (`OSI` ✅ MIT; 30.0k★, Python), Google ADK (`OSI` ✅ Apache-2.0; 21.8k★), Microsoft Agent Framework (`OSI` ✅ MIT; 14.1k★), internal workflow engine | Choose **LangGraph** when you want explicit state, checkpoints, human approvals and application-controlled execution flow; choose another only for a stack fit (for example ADK on Google tooling, Agent Framework on .NET/Azure) |
| **Kubernetes-native agent control plane** | **kagent** (4.0k★) | `OSI` ✅ (Apache-2.0) | kagent maintainers; CNCF Sandbox project (landscape) | LangGraph (`OSI` ✅ MIT), internal controllers | Choose **kagent** when platform teams want CRDs, cluster-native lifecycle and a shared control plane for many agents |
| **Sandbox with low friction** | **gVisor** (19.6k★) | `OSI` ✅ (Apache-2.0) | Google / gVisor maintainers | Kata Containers (`OSI` ✅ Apache-2.0), `kubernetes-sigs/agent-sandbox` (`OSI` ✅ Apache-2.0) | Choose **gVisor** when syscall isolation is the main concern and you want a lighter-weight runtime boundary than a full VM |
| **Sandbox with stronger VM-style isolation** | **Kata Containers** (8.9k★) | `OSI` ✅ (Apache-2.0) | Kata Containers community | gVisor (`OSI` ✅ Apache-2.0), `kubernetes-sigs/agent-sandbox` (`OSI` ✅ Apache-2.0) | Choose **Kata Containers** when the side-effecting tools are high risk and the platform can afford the stronger isolation boundary |
| **Per-agent sandbox lifecycle on Kubernetes** | **agent-sandbox** (4.2k★) | `OSI` ✅ (Apache-2.0) | Kubernetes SIGs (`kubernetes-sigs`) | Plain `RuntimeClass` pods (section 5.4), gVisor or Kata underneath | Choose **agent-sandbox** when you need many isolated, stateful, pausable sandboxes created per agent session through a Kubernetes API; it manages lifecycle and sits on top of gVisor or Kata rather than replacing them. Project maturity is **Unverified** |
| **MCP and agent gateway layer** | **agentgateway** (5.3k★) | `OSI` ✅ (Apache-2.0) | agentgateway maintainers; foundation status **Unverified** | IBM ContextForge (`OSI` ✅ Apache-2.0; 4.6k★), thin internal gateway | Choose **agentgateway** when you want an open MCP/A2A-aware proxy with authentication, allow-lists, audit and egress control instead of building one; choose a **thin internal gateway** when you only need an allow-list and audit log. LLM-traffic gateways are owned by [P02](./02-ai-gateway.md) |

Note: Microsoft AutoGen (61.3k★) is in maintenance mode, community-managed and pointing new users to Microsoft Agent Framework (read from its README), so it is not listed as an option. The repository `LICENSE` shows `CC-BY-4.0` for documentation; check the code licence file before reuse.

Default platform stance:

1. **Standardise on MCP for tool exposure before choosing a dominant agent framework.**
2. **Keep A2A optional.** Many teams can ship with a single runtime plus queue-based delegation first.
3. **Run write-capable tools in a sandbox with short-lived identity.**
4. **Treat the gateway around MCP servers as a control point, not as optional plumbing.**

## 4. Reference design

A reference design for this pillar looks like this:

1. **User or application request** enters through the governed API path in [P02](./02-ai-gateway.md).
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

Agent memory is useful for local reasoning state, but durable facts still belong in normal databases, queues and ticketing systems. If an action matters later, record it in a system of record the platform already backs up and audits.

## 6. Operations

Operating agent systems is mostly about narrowing blast radius:

- **Tool catalogue management:** approve, version and retire tools deliberately.
- **Credential rotation:** use short-lived credentials wherever possible; rotate shared secrets aggressively if you cannot avoid them yet.
- **Approval policy:** define which actions need human approval, which can auto-run, and which are forbidden.
- **Tracing:** propagate one trace ID across model calls, tool calls and any A2A handoffs into [P07](./07-observability-evaluation.md).
- **Timeouts and budgets:** bound steps, total runtime, token budgets and external call counts.
- **Patchability:** keep the sandbox runtime and base images upgradable on the same cadence as other platform components.
- **Egress review:** explicitly list where agents may call out, rather than allowing general outbound internet by default.

Operational heuristics:

- If an agent becomes unreliable, remove tools before you change models.
- If operators cannot explain why a tool was called, improve the tool description and audit fields before tuning prompts.
- If teams keep adding agent-to-agent hops, verify that they are not compensating for missing tool boundaries or ownership clarity.

## 7. Pitfalls

- **Starting with a giant toolbox.** The agent learns ambiguity faster than it learns restraint.
- **Letting prompts carry credentials or durable state.** That breaks rotation, audit and replay.
- **Treating MCP as a security control by itself.** It is an interface standard, not an authorisation system.
- **Using A2A for every internal call.** It adds protocol overhead where a queue or normal service call would do.
- **Skipping human approval for side effects.** Fast automation is still risk if the target system changes state.
- **Relying on the framework's defaults for retry or fallback behaviour.** Those policies belong in [P03](./03-model-router.md).
- **Assuming sandboxing solves prompt injection.** The primary defences still live in [P08](./08-security.md).

## 8. Checklist

### MVP

- [ ] One agent runtime chosen, with explicit persisted state
- [ ] MCP used for new tool integrations unless there is a strong reason not to
- [ ] Read-only and write-capable tools split by credential and endpoint
- [ ] Tool allow-list and audit logging in place
- [ ] At least one human approval checkpoint for side-effecting workflows

### Production

- [ ] MCP servers fronted by a gateway or proxy with authn, authz and logging
- [ ] Trace IDs propagated across model, tool and queue boundaries
- [ ] Sandbox runtime selected for write-capable executors
- [ ] Per-tool quotas, timeouts and retry policies documented
- [ ] Tool owners, lifecycle and deprecation process defined
- [ ] Prompt-injection and data-exfiltration controls linked from [P08](./08-security.md)

### Enterprise

- [ ] Optional A2A adopted only where cross-team or cross-runtime handoffs are real
- [ ] Fine-grained service identity and short-lived credentials used for tool calls
- [ ] Agent action approvals mapped to business risk levels
- [ ] Sandboxing and base images patched through the same release process as the rest of the platform
- [ ] Multi-tenant agent isolation requirements explicitly tested
- [ ] Break-glass and emergency disable path for unsafe tools documented

## 9. Sources

Primary upstreams:

- [Model Context Protocol site](https://modelcontextprotocol.io/)
- [MCP specification repository](https://github.com/modelcontextprotocol/modelcontextprotocol)
- [A2A repository](https://github.com/a2aproject/A2A)
- [LangGraph repository](https://github.com/langchain-ai/langgraph)
- [kagent repository](https://github.com/kagent-dev/kagent)
- [CrewAI](https://github.com/crewAIInc/crewAI), [OpenAI Agents SDK](https://github.com/openai/openai-agents-python), [Google ADK](https://github.com/google/adk-python), [Microsoft Agent Framework](https://github.com/microsoft/agent-framework) and [AutoGen](https://github.com/microsoft/autogen)
- [agentgateway](https://github.com/agentgateway/agentgateway) and [IBM ContextForge](https://github.com/IBM/mcp-context-forge)
- [gVisor repository](https://github.com/google/gvisor)
- [Kata Containers repository](https://github.com/kata-containers/kata-containers)
- [kubernetes-sigs/agent-sandbox repository](https://github.com/kubernetes-sigs/agent-sandbox)
- [Kubernetes AI Conformance checklist](https://github.com/cncf/k8s-ai-conformance/blob/main/docs/AIConformance-1.37.yaml)
- [Cloud Native AI whitepaper](https://github.com/cncf/tag-runtime/blob/main/wgs/cnai/whitepapers/cloudnativeai.md)

Licences and stars were **Opened** on 2026-10-11; foundation status is **Search-cited**. Refresh with [Methodology §5](./00-methodology.md#5-snapshot-and-refresh).
