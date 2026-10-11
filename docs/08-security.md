# P08. Security

> **TL;DR** — Security for an AI platform is not only TLS and CVEs. It is also prompt-injection defence, PII controls, safe tool use, strong identity, short-lived secrets and repeatable red teaming. This pillar owns guardrails and PII; [Hardening](./11-hardening.md) owns image signing, SBOMs, model-artifact safety and tenant isolation.

*Snapshot: 2026-10-11 · Related: [Methodology](./00-methodology.md) · [AI gateway](./02-ai-gateway.md) · [Agents and MCP](./06-agents-mcp.md) · [Hardening](./11-hardening.md)*

## 1. Why it matters

Classic platform security still applies, but LLM systems add new failure modes:

- untrusted prompts and retrieved content can steer a model away from its intended instructions;
- tools can turn a bad answer into a real action;
- prompts, traces and chat logs can become a new home for secrets and PII;
- agent loops can amplify a single bad policy decision across many calls.

Use the OWASP Top 10 for LLM Applications (2025 edition), the OWASP Top 10 for Agentic Applications (published December 2025; **Unverified** against the official text) and MITRE ATLAS as threat catalogs, not as finished architectures. They help you ask the right questions: who can call which model, with which data, through which tools, and what evidence survives an incident.

This pillar owns:

- guardrails and prompt-injection defence;
- PII detection, masking and retention boundaries;
- human identity, workload identity and fine-grained authorisation patterns;
- secret brokering for model providers and tools;
- AI red teaming and recurring adversarial regression tests.

It does **not** own quotas or rate limits; those belong to [AI gateway](./02-ai-gateway.md). It also does not own cluster isolation, image signing or model-artifact scanning; those belong to [Hardening](./11-hardening.md).

## 2. Capability map

| Capability | What good looks like | Default building block | Boundary |
|------------|----------------------|------------------------|----------|
| Threat modelling | Every agent, tool and retrieval path is mapped to likely abuse cases and compensating controls | OWASP LLM/agentic Top 10 + MITRE ATLAS | Use them to scope tests, not to claim compliance |
| Guardrail orchestration | Pre- and post-call checks run in a defined order, with allow/block/log-only outcomes | NeMo Guardrails | Keep reliability fallbacks in [P03](./03-model-router.md) |
| Prompt-injection handling | Retrieved content is treated as untrusted, tool calls are policy checked and high-risk prompts are flagged | Guardrails + classifier hooks | Do not rely on one classifier alone |
| PII detection and redaction | Sensitive fields are masked before prompts, traces and long-term storage | Presidio | Log minimisation is more important than clever redaction |
| Human identity | Users authenticate with OIDC/SAML and roles map cleanly to teams and apps | Keycloak | Reuse an existing IdP if your organisation already has one |
| Workload identity | Services get short-lived identities for mTLS and policy decisions | SPIFFE/SPIRE | Service accounts alone are rarely enough across clusters |
| Fine-grained authorisation | Tool, document and workspace access is relationship based, not only role based | OpenFGA | Coarse RBAC is still fine for simple apps |
| Secret distribution | Provider keys and tool credentials are centrally stored, rotated and injected just in time | OpenBao + External Secrets Operator | Secret storage belongs here; cluster backup policy belongs to [P12](./12-foundation-infrastructure.md) |
| Transport certificates | Ingress and internal TLS certificates are issued and renewed automatically | cert-manager | Workload mTLS identity comes from SPIFFE/SPIRE; mesh choice belongs to [P12](./12-foundation-infrastructure.md) |
| Red teaming | Jailbreak, exfiltration and unsafe-tool tests run before major changes and on a schedule | garak | Keep eval quality work in [P07](./07-observability-evaluation.md) |

## 3. Tool comparison table

| Capability | Default pick | Licence label | Steward | 1-3 alternatives | Choose the default when… |
|------------|--------------|---------------|---------|------------------|--------------------------|
| Guardrail orchestration | **NeMo Guardrails** | OSI (`Apache-2.0`) | NVIDIA | LLM Guard (`MIT`), Guardrails AI (`Apache-2.0`), gateway hooks, application middleware | you want explicit safety flows around prompts, retrieved context, tool calls and outputs |
| Prompt / response classifiers | **Llama Guard** | `Open weights` (Llama community licence) | Meta | Prompt Guard (`Open weights`), bespoke classifiers, LLM Guard (`MIT`; repository archived, legacy) | you want lightweight detectors in Python pipelines and can combine them with other controls |
| PII detection and redaction | **Presidio** | OSI (`MIT`) | Microsoft | LLM Guard PII features, provider-side DLP, custom regex + validation | you need explainable detectors, structured redaction and local execution |
| Human identity and SSO | **Keycloak** | OSI (`Apache-2.0`) | Keycloak maintainers (CNCF incubating) | existing enterprise IdP (`Not OSS`), application-local auth | you need self-hosted OIDC/SAML, brokering and tenant-aware realms |
| Fine-grained authorisation | **OpenFGA** | OSI (`Apache-2.0`) | OpenFGA maintainers (CNCF incubating) | coarse Keycloak roles, OPA (`Apache-2.0`) or Cedar (`Apache-2.0`) policy checks in the app | permissions depend on relations such as user → workspace → document → tool |
| Workload identity | **SPIFFE/SPIRE** | OSI (`Apache-2.0`) | SPIFFE community (CNCF graduated) | Kubernetes service accounts, mesh-native identity | you want portable workload identities and mTLS across namespaces or clusters |
| Secrets management | **OpenBao + External Secrets Operator** | OSI (`MPL-2.0`) + OSI (`Apache-2.0`) | OpenBao community (Linux Foundation; Vault fork) + ESO maintainers | HashiCorp Vault (`Source-available`, BSL 1.1 since 2023), Kubernetes `Secret` objects managed by hand | you need central rotation and controlled fan-out into workloads |
| Certificate management | **cert-manager** | OSI (`Apache-2.0`) | cert-manager project (CNCF graduated) | mesh-issued certificates, cloud CA services (`Not OSS`) | you need automated X.509 issuance and renewal for ingress and internal TLS |
| AI red teaming | **garak** | OSI (`Apache-2.0`) | garak maintainers (NVIDIA) | PyRIT (`MIT`), promptfoo (`MIT`), manual adversarial suites | you want a repeatable regression suite for jailbreak and prompt-based attacks |

Notes:

- PyRIT suits multi-turn, scripted attack orchestration; promptfoo suits CI-friendly red-team and eval configs. garak is the default for broad probe coverage out of the box.
- Licences and stewards for Guardrails AI, promptfoo, Cedar and cert-manager were not re-opened in this edit; treat as **Unverified** until checked per [Methodology §5](./00-methodology.md#5-snapshot-and-refresh).
- Llama Guard and Prompt Guard are useful open-weight safety models, but *open weights are not open source* under the licence legend in [Methodology](./00-methodology.md#32-licence-policy-and-legend).
- Any licence, owner or project-status claim that matters to a procurement or risk decision should be re-checked with the commands in [Methodology §5](./00-methodology.md#5-snapshot-and-refresh).

## 4. Reference design

A practical security flow for an AI platform looks like this:

1. Users authenticate with OIDC or SAML through Keycloak.
2. The gateway validates the token, resolves the tenant or project and adds security context headers.
3. The application runs a **pre-flight security chain**: PII scan, prompt-risk detection, retrieval-content sanitisation and tool-allowlist checks.
4. The app asks OpenFGA whether this subject may access the chosen tool, document or workspace.
5. Internal calls use SPIFFE identities and mTLS, so policy and audit can distinguish workloads from humans.
6. Provider keys and downstream credentials are fetched from OpenBao and synced into namespaces through External Secrets Operator.
7. The model output passes a **post-flight chain** for data-loss checks, policy violations and optional redaction.
8. Decision metadata, not full sensitive payloads by default, is written to the audit trail.
9. garak and PyRIT suites run in CI and before major prompt, tool or agent changes.

Two design rules matter more than the exact products:

- **Treat all retrieved content as untrusted input.** A PDF in your knowledge base can be an attacker-controlled prompt just as easily as a user message.
- **Authorize actions, not only sessions.** The fact that a user may talk to an agent does not mean the agent may call every tool on that user's behalf.

## 5. Implementation guide

Start with a simple enforcement order and keep it stable:

```text
request -> identity -> PII scan -> prompt-risk checks -> authz(tool/resource) -> model -> output checks -> audit
```

A minimal External Secrets Operator pattern for model credentials is:

```yaml
apiVersion: external-secrets.io/v1
kind: ExternalSecret
metadata:
  name: provider-key
spec:
  secretStoreRef:
    kind: ClusterSecretStore
    name: openbao
  target:
    name: provider-key
  data:
    - secretKey: api-key
      remoteRef:
        key: providers/openai
        property: api_key
```

Useful implementation habits:

- Give every workload a stable SPIFFE ID such as `spiffe://platform.example/ns/rag/sa/retriever`.
- Model authorisation tuples explicitly, for example `user:alice viewer document:policy-handbook` and `service:agent caller tool:crm-read`.
- Prefer **log-only** mode for uncertain classifiers during rollout, but **block** mode for high-confidence findings such as credential leaks or obviously disallowed tool calls.
- Store decision codes, rule IDs and hashes by default; retain raw prompts only where there is a reviewed need and a clear retention period.

## 6. Operations

Operate this pillar like a product, not a one-off review:

- track block rates, override rates and false-positive reviews by rule set;
- measure how often PII redaction triggers before prompts, before traces and before user-visible output;
- rotate provider keys and tool credentials on a schedule, then test the rotation path;
- re-run red-team suites after prompt-template, tool or retrieval changes, not only after model upgrades;
- alert on unusual tool-denial spikes, sudden increases in prompt-risk hits or large jumps in raw-log retention;
- keep a break-glass path for security teams, with expiry and audit, rather than permanent broad access.

Security review should be part of change management:

- new tool integrations need an explicit permission model;
- new data sources need a retrieval trust review;
- new logging sinks need a PII review;
- new providers need a secret-rotation and residency review.

## 7. Pitfalls

- Treating guardrails as a replacement for identity and authorisation.
- Assuming prompt-injection detection is solved by one model or one regex set.
- Sending raw prompts and retrieved documents to every log sink "just for debugging".
- Letting agent tools use shared administrator credentials instead of scoped service identities.
- Redacting PII from outputs but forgetting prompts, traces, eval datasets and replay systems.
- Blocking aggressively without a review loop, so teams simply bypass the control path.
- Confusing self-hosted secrets with safely rotated secrets; manual Kubernetes `Secret` updates do not scale.

## 8. Checklist

### MVP

- [ ] Centralise authentication behind one OIDC or SAML provider.
- [ ] Put every model call through a pre-flight and post-flight security chain.
- [ ] Mask obvious PII before prompts and before long-term logs.
- [ ] Keep provider keys in a central secret store instead of in application configs.
- [ ] Run at least one recurring jailbreak and prompt-injection test suite.

### Production

- [ ] Enforce workload identity and mTLS for service-to-service traffic.
- [ ] Add relationship-based authorisation for tools, documents and shared workspaces.
- [ ] Separate block, warn and log-only policies with owner-approved defaults.
- [ ] Record rule IDs and decisions in audit logs without retaining unnecessary raw content.
- [ ] Review high-risk prompt and tool denials on a regular cadence.

### Enterprise

- [ ] Tie security rules to change management, approval and exception expiry.
- [ ] Run red-team suites in CI and before major prompt, model and agent releases.
- [ ] Maintain data-retention classes for prompts, traces, feedback and replay corpora.
- [ ] Support tenant-specific policy overlays without breaking the shared control plane.
- [ ] Exercise incident response for prompt injection, data exfiltration and compromised tool credentials.

## 9. Sources

These are the main texts and upstream projects to re-open when adopting this pillar:

- [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [OWASP Agentic AI Security Initiative](https://genai.owasp.org/initiatives/agentic-security-initiative/)
- [MITRE ATLAS](https://atlas.mitre.org/)
- [NeMo Guardrails](https://github.com/NVIDIA/NeMo-Guardrails)
- [LLM Guard](https://github.com/protectai/llm-guard) (archived)
- [Presidio](https://github.com/microsoft/presidio)
- [Keycloak](https://www.keycloak.org/)
- [OpenFGA](https://github.com/openfga/openfga)
- [SPIFFE and SPIRE](https://spiffe.io/)
- [OpenBao](https://github.com/openbao/openbao)
- [External Secrets Operator](https://external-secrets.io/)
- [garak](https://github.com/NVIDIA/garak)
- [PyRIT](https://github.com/Azure/PyRIT)
- [promptfoo](https://github.com/promptfoo/promptfoo)
- [Guardrails AI](https://github.com/guardrails-ai/guardrails)
- [cert-manager](https://cert-manager.io/)
- [Methodology](./00-methodology.md) for the licence legend, evidence grades and re-verification commands
