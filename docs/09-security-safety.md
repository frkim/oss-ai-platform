# P09. Security and safety

> **TL;DR** - AI platform security has two layers. **Layer A (AI-specific)** covers prompt injection, guardrails, PII, safe tool use, human and agent identity, secrets and red teaming. **Layer B (platform and supply chain)** covers cluster baselines, signed images and model artifacts, runtime detection, sandboxing and tenant isolation. One pillar, one threat model, one owner per topic (see 2.1).

*Snapshot: 2026-10-11 · Related: [Methodology](./00-methodology.md) · [AI gateway](./02-ai-gateway-routing.md) · [Model serving](./03-model-serving.md) · [Agents and MCP](./06-agents-mcp.md) · [Governance and FinOps](./10-governance-finops.md) · [Foundation](./12-foundation-infrastructure.md)*

## 1. Why it matters

Classic platform security still applies, but LLM systems add new failure modes:

- untrusted prompts and retrieved content can steer a model away from its instructions;
- tools turn a bad answer into a real action, and agent loops amplify a single bad decision;
- prompts, traces and chat logs become a new home for secrets and PII;
- the platform runs unusual workloads: large third-party artifacts, GPU drivers, notebook-derived code and agent tools. Safe prompts do not help if any workload can run privileged, pull unsigned images or load an unsafe model file.

Use the OWASP Top 10 for LLM Applications (2025), the OWASP Top 10 for Agentic Applications (December 2025; **Unverified** against the official text) and MITRE ATLAS as threat catalogs, not finished architectures. They help ask: who can call which model, with which data, through which tools, and what evidence survives an incident.

### 1.1 Layers

| Layer | Question it answers | Controls |
|-------|--------------------|----------|
| **A. AI threats and safety** | Can the model, its inputs or its tools be abused? | Threat model, guardrails, prompt-injection defence, PII, agent/tool security, identity and authorisation, secrets, red teaming |
| **B. Platform and supply chain** | Can the platform itself be attacked or its artifacts tampered with? | Pod and node baselines, network policy, image and model provenance, SBOMs, admission, runtime detection, sandboxing, tenant isolation |

Layer A sits mostly in the request path; Layer B sits in build, admission and runtime. Both feed the same audit trail and incident process.

## 2. Capability map

### 2.1 One owner per topic

| Topic | Owner | Everyone else |
|-------|-------|---------------|
| Quotas, rate limits, budgets, failover | [P02](./02-ai-gateway-routing.md) / [P10](./10-governance-finops.md) | Consume, do not duplicate |
| Guardrails, prompt injection, PII | **P09 (A)** | Gateway only hosts the hook |
| Agent identity, tool permission model | **P09 (A)** defines policy; [P06](./06-agents-mcp.md) implements in the runtime | Runtimes call the policy |
| Image, model and release signing, admission | **P09 (B)** | P10 consumes evidence |
| Policy vocabulary, exceptions, AI-BOM, approval state | [P10](./10-governance-finops.md) | P09 generates and enforces |
| Tenant model (namespace, vcluster, quotas) | [P13](./13-platform-experience.md) | P09 owns the isolation strength, not the product model |
| Cluster operations, backup, mesh choice, GPU Operator rollout | [P12](./12-foundation-infrastructure.md) | P09 sets the baseline |
| Eval quality and regression scoring | [P08](./08-evaluation-quality.md) | P09 owns adversarial suites |

### 2.2 Capabilities

| Layer | Capability | What good looks like | Default building block |
|-------|-----------|----------------------|------------------------|
| A | Threat modelling | Every agent, tool and retrieval path mapped to abuse cases and controls | OWASP LLM/agentic Top 10 + MITRE ATLAS |
| A | Guardrail orchestration | Pre- and post-call checks in a fixed order with allow/block/log-only outcomes | NeMo Guardrails |
| A | Prompt-injection handling | Retrieved content untrusted, tool calls policy checked, risky prompts flagged | Guardrails + classifiers (never one alone) |
| A | PII detection and redaction | Masked before prompts, traces and long-term storage | Presidio |
| A | Human identity | OIDC/SAML, roles mapped to teams and apps | Keycloak |
| A | Workload and agent identity | Short-lived, per-workload (and per-agent) identities for mTLS and policy | SPIFFE/SPIRE |
| A | Fine-grained authorisation | Tool, document and workspace access is relationship based | OpenFGA |
| A | Secrets | Central, rotated, injected just in time | OpenBao + External Secrets Operator |
| A | Red teaming | Jailbreak, exfiltration and unsafe-tool tests before major changes and on a schedule | garak |
| B | Cluster baseline | Restricted namespaces, explicit exceptions | Pod Security Standards + CIS guidance |
| B | Network enforcement | Deny by default, only required east-west and egress paths | Cilium |
| B | Certificates | Automatic issuance and renewal | cert-manager |
| B | Scanning and SBOM | Images, filesystems and IaC scanned; package inventory per image | Trivy + Syft |
| B | Signing and admission | Only signed, digest-pinned images from approved registries run | Cosign/Sigstore + Kyverno `verifyImages` |
| B | Model-artifact safety | Unsafe formats quarantined; weights signed and verified | safetensors-first + ModelScan + OpenSSF model-signing |
| B | Runtime detection | Suspicious syscalls and escapes alert fast | Falco |
| B | Isolation and sandboxing | Risky tools and untrusted tenants get stronger boundaries | Kata Containers (gVisor alternative) |

Model registry workflow and artifact storage belong to [P04](./04-model-lifecycle-adaptation.md); this pillar sets the safety gates they must pass. GPU driver lifecycle (NVIDIA GPU Operator) is rolled out by [P12](./12-foundation-infrastructure.md); P09 only requires dedicated, tainted GPU nodes.

## 3. Tool comparison table

### 3.1 Layer A: AI threats and safety

| Capability | Default pick | Licence label | Steward | Alternatives | Choose the default when... |
|------------|--------------|---------------|---------|--------------|----------------------------|
| Guardrail orchestration | **NeMo Guardrails** | OSI (`Apache-2.0`) | NVIDIA | Guardrails AI (`Apache-2.0`), gateway hooks, app middleware | you want explicit safety flows around prompts, context, tool calls and outputs |
| Classifiers | **Llama Guard** | `Open weights` (Llama community licence) | Meta | Prompt Guard (`Open weights`), bespoke classifiers | you want lightweight detectors combined with other controls |
| PII detection | **Presidio** | OSI (`MIT`) | Microsoft | provider-side DLP, custom regex + validation | you need explainable detectors, structured redaction and local execution |
| Human identity | **Keycloak** | OSI (`Apache-2.0`) | Keycloak maintainers (CNCF incubating) | existing enterprise IdP (`Not OSS`) | you need self-hosted OIDC/SAML and tenant-aware realms |
| Fine-grained authz | **OpenFGA** | OSI (`Apache-2.0`) | OpenFGA maintainers (CNCF incubating) | coarse Keycloak roles, OPA or Cedar (`Apache-2.0`) in the app | permissions depend on relations (user, workspace, document, tool) |
| Workload / agent identity | **SPIFFE/SPIRE** | OSI (`Apache-2.0`) | SPIFFE community (CNCF graduated) | Kubernetes service accounts, mesh-native identity | you want portable identities and mTLS across namespaces or clusters |
| Secrets | **OpenBao + External Secrets Operator** | OSI (`MPL-2.0`) + OSI (`Apache-2.0`) | OpenBao community (Linux Foundation) + ESO maintainers | HashiCorp Vault (`Source-available`, BSL 1.1 since 2023), hand-managed `Secret` objects | you need central rotation and controlled fan-out |
| Red teaming | **garak** | OSI (`Apache-2.0`) | NVIDIA | PyRIT (`MIT`), promptfoo (`MIT`) | you want broad probe coverage out of the box |

- LLM Guard (`MIT`) is **archived**; do not adopt it for new work.
- PyRIT suits multi-turn scripted attacks; promptfoo suits CI-friendly red-team configs.
- Open weights are not open source (see the [licence legend](./00-methodology.md#32-licence-policy-and-legend)).
- Licences and stewards for Guardrails AI, promptfoo and Cedar were not re-opened in this edit: **Unverified**.

### 3.2 Layer B: platform and supply chain

| Capability | Default pick | Licence label | Steward | Alternatives | Choose the default when... |
|------------|--------------|---------------|---------|--------------|----------------------------|
| Network policy | **Cilium** | OSI (`Apache-2.0`) | Cilium project | native `NetworkPolicy`, Calico (**Unverified**) | you want policy, observability and eBPF enforcement in one layer |
| Certificates | **cert-manager** | OSI (`Apache-2.0`; **Unverified**) | cert-manager project (CNCF graduated; **Unverified**) | mesh-issued certs, cloud CAs (`Not OSS`) | you need automated X.509 for ingress and internal TLS |
| Scanning | **Trivy** | OSI (`Apache-2.0`) | Aqua Security | Grype (`Apache-2.0`), kube-bench (**Unverified**) | one scanner for images, filesystems, IaC and cluster config; pin by digest (note below) |
| SBOM | **Syft** | OSI (`Apache-2.0`) | Anchore | Trivy SBOM mode, build-native SBOMs | you need repeatable inventories for policy and incident response |
| Signing and provenance | **Cosign + Sigstore** | OSI (`Apache-2.0`) | Sigstore project | GPG, Notation (**Unverified**) | you want identity-tied signatures and transparent verification |
| Admission | **Kyverno** `verifyImages` | OSI (`Apache-2.0`) | Kyverno project | Sigstore policy-controller (**Unverified**), Ratify | you already run Kyverno for [P10](./10-governance-finops.md) policy |
| Model provenance | **OpenSSF model-signing (OMS)** | OSI (`Apache-2.0`; **Unverified**) | OpenSSF | cosign blob signing, checksum manifests | you sign weights with the same Sigstore trust chain as images |
| Model scanning | **ModelScan** | verify the LICENSE file | ModelScan maintainers | safetensors-only policy | you ingest third-party models or notebooks |
| Runtime detection | **Falco** | OSI (`Apache-2.0`) | Falco project (CNCF graduated) | Tetragon (`Apache-2.0`; **Unverified**, enforcement-capable), auditd | you need syscall detections with Kubernetes context |
| Isolation | **Kata Containers** | OSI (`Apache-2.0`) | Kata community | gVisor (`Apache-2.0`) | risky tools or untrusted tenants justify VM-grade boundaries |

Notes:

- **Trivy compromise:** on 19 March 2026 its release pipeline, `trivy-action` and `setup-trivy` were compromised and malicious binaries/images published (affected versions include v0.69.4; advisory GHSA-69fq-xp46-6x23). Licence unchanged (`Apache-2.0`); Aqua reports remediation. Pin binaries, images and actions by digest or commit SHA, verify signatures and rotate CI secrets exposed to affected versions. Search-cited; confirm in the advisory.
- gVisor suits syscall-level sandboxing without nested virtualisation; Kata suits VM-grade isolation where hardware virtualisation exists.
- `safetensors` avoids the code-execution risk of Python pickle loading and is the default exchange format.
- SLSA and CIS benchmarks are guidance frameworks, not tools. ModelScan terms and Kata/gVisor/Cosign details were not re-checked here; verify per [Methodology §5](./00-methodology.md#5-snapshot-and-refresh).

## 4. Reference design

Request path (Layer A):

1. Users authenticate with OIDC/SAML through Keycloak; the gateway validates the token, resolves tenant or project and adds security context.
2. A **pre-flight chain** runs PII scan, prompt-risk detection, retrieval sanitisation and tool-allowlist checks.
3. OpenFGA decides whether this subject (human or agent) may use the tool, document or workspace.
4. Internal calls use SPIFFE identities and mTLS, so audit can tell humans, agents and services apart.
5. Provider keys come from OpenBao via External Secrets Operator.
6. A **post-flight chain** checks output for data loss and policy violations; decision metadata, not raw payloads, goes to the audit trail.

Platform path (Layer B):

1. Namespaces default to the restricted Pod Security profile and deny-by-default network policy.
2. CI builds, scans, generates an SBOM, signs by digest; Kyverno admits only signed, digest-pinned images.
3. Third-party model files are quarantined, scanned and signed before reaching shared storage or serving ([P03](./03-model-serving.md)).
4. Untrusted or high-risk agent tools run in Kata or gVisor sandboxes; GPU nodes are dedicated and tainted.
5. Falco watches runtime; exceptions (privileged pods, hostPath, egress bypass) are a short, expiring list.

Design rules that matter more than product choice:

- **Treat all retrieved content as untrusted input**; a PDF can be an attacker prompt.
- **Authorise actions, not sessions.** Talking to an agent does not mean it may call every tool on the user's behalf.
- **Agents are non-human identities**: give each its own short-lived identity, least-privilege scopes and an owner; never share admin credentials. Use delegated (on-behalf-of) tokens with the user's scope intersection, not the agent's maximum.
- **Pay for isolation where risk is.** An internal chatbot tolerates containers plus policy; a multi-tenant agent platform executing user tools needs sandboxes on the riskiest paths. Tenant model itself lives in [P13](./13-platform-experience.md).

## 5. Implementation guide

Keep the enforcement order stable:

```text
request -> identity -> PII scan -> prompt-risk checks -> authz(tool/resource) -> model -> output checks -> audit
```

Model credentials via External Secrets Operator:

```yaml
apiVersion: external-secrets.io/v1
kind: ExternalSecret
metadata:
  name: provider-key
spec:
  secretStoreRef: {kind: ClusterSecretStore, name: openbao}
  target: {name: provider-key}
  data:
    - secretKey: api-key
      remoteRef: {key: providers/openai, property: api_key}
```

Restricted namespaces:

```yaml
metadata:
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

Habits:

- stable SPIFFE IDs such as `spiffe://platform.example/ns/rag/sa/retriever`; agents get their own, e.g. `.../sa/agent-support`;
- explicit authorisation tuples: `user:alice viewer document:policy-handbook`, `service:agent caller tool:crm-read`;
- log-only mode for uncertain classifiers during rollout; block mode for high-confidence findings (credential leaks, disallowed tool calls);
- store decision codes, rule IDs and hashes; keep raw prompts only with a reviewed need and retention period;
- pin images by digest (`ghcr.io/acme/agent-runner@sha256:...`), prefer `safetensors`, reject privileged pods outside approved namespaces, taint GPU nodes.

## 6. Operations

- Track block, override and false-positive rates per rule set; measure PII redaction hits before prompts, traces and output.
- Rotate provider keys, tool credentials and signing keys (or review keyless identity bindings) on schedule, and test the rotation path.
- Re-run red-team suites after prompt-template, tool, retrieval or model changes.
- Patch base and node images on schedule; refresh SBOMs after every rebuild and store them where responders find them.
- Tune noisy Falco rules rather than ignoring them; track GPU driver, device-plugin and kernel drift together.
- Alert on tool-denial spikes, prompt-risk surges and jumps in raw-log retention.
- Keep an expiring, audited break-glass path.
- Rhythm: weekly critical-scan review, monthly exception review, quarterly rebuild-from-trusted-source and incident exercise.
- Change management: new tools need a permission model, new data sources a retrieval trust review, new log sinks a PII review, new providers a rotation and residency review.

## 7. Pitfalls

- Treating guardrails as a replacement for identity and authorisation.
- Assuming one model or regex set solves prompt injection.
- Sending raw prompts and documents to every log sink "for debugging"; redacting outputs but not prompts, traces, eval sets or replay stores.
- Shared administrator credentials for agent tools.
- Confusing "signed" with "safe": a signed image can still be vulnerable.
- Unpinned scanner actions or images (see the Trivy note).
- Loading pickle-based artifacts "because the demo needed it".
- Privileged debug pods that become permanent back doors; GPU nodes shared across trust levels.
- Sandboxing too little, or so much that teams disable it; blocking without a review loop so teams bypass it.
- Treating CIS benchmarks as copy-paste settings; manual `Secret` updates at scale.

## 8. Checklist

### MVP

- [ ] One OIDC/SAML provider for all human authentication.
- [ ] Pre- and post-flight security chain on every model call; PII masked before prompts and long-term logs.
- [ ] Provider keys in a central secret store, not app configs.
- [ ] At least one recurring jailbreak and prompt-injection suite.
- [ ] Restricted pod security defaults; images and IaC scanned; images pinned by digest.
- [ ] Safe model formats; third-party artifacts quarantined; basic runtime detection.

### Production

- [ ] Workload and agent identity with mTLS; each agent has its own identity and owner.
- [ ] Relationship-based authorisation for tools, documents and workspaces.
- [ ] Block, warn and log-only policies with owner-approved defaults; rule IDs in audit logs without unnecessary raw content.
- [ ] Signatures verified at admission; deny-by-default network policy with explicit egress.
- [ ] SBOMs generated and attached to releases; GPU nodes dedicated; exceptions tracked and expiring.
- [ ] Regular review of high-risk prompt and tool denials.

### Enterprise

- [ ] Sandboxing (Kata or gVisor) for high-risk and multi-tenant agent workloads.
- [ ] End-to-end provenance from build identity to deployed digest, including signed model weights.
- [ ] Red-team suites in CI and before major prompt, model and agent releases.
- [ ] Data-retention classes for prompts, traces, feedback and replay corpora; tenant-specific policy overlays.
- [ ] Critical images rebuilt from trusted inputs regularly; controls audited across clusters.
- [ ] Incident response exercised for prompt injection, exfiltration, compromised tool credentials and malicious model artifacts.

## 9. Sources

- [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [OWASP Agentic AI Security Initiative](https://genai.owasp.org/initiatives/agentic-security-initiative/)
- [MITRE ATLAS](https://atlas.mitre.org/)
- [NeMo Guardrails](https://github.com/NVIDIA/NeMo-Guardrails)
- [LLM Guard](https://github.com/protectai/llm-guard) (archived)
- [Guardrails AI](https://github.com/guardrails-ai/guardrails)
- [Presidio](https://github.com/microsoft/presidio)
- [Keycloak](https://www.keycloak.org/)
- [OpenFGA](https://github.com/openfga/openfga)
- [SPIFFE and SPIRE](https://spiffe.io/)
- [OpenBao](https://github.com/openbao/openbao)
- [External Secrets Operator](https://external-secrets.io/)
- [garak](https://github.com/NVIDIA/garak)
- [PyRIT](https://github.com/Azure/PyRIT) (repository archived at snapshot; treat as legacy)
- [promptfoo](https://github.com/promptfoo/promptfoo)
- [Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/)
- [CIS Kubernetes Benchmarks](https://www.cisecurity.org/benchmark/kubernetes)
- [Cilium](https://github.com/cilium/cilium) · [Tetragon](https://github.com/cilium/tetragon)
- [cert-manager](https://cert-manager.io/)
- [Falco](https://falco.org/)
- [Trivy](https://github.com/aquasecurity/trivy) · [Grype](https://github.com/anchore/grype) · [Syft](https://github.com/anchore/syft)
- [Cosign](https://github.com/sigstore/cosign) · [Sigstore](https://www.sigstore.dev/) · [SLSA](https://slsa.dev/)
- [Kyverno image verification](https://kyverno.io/docs/policy-types/cluster-policy/verify-images/)
- [Kata Containers](https://katacontainers.io/) · [gVisor](https://gvisor.dev/)
- [safetensors](https://github.com/huggingface/safetensors) · [ModelScan](https://github.com/protectai/modelscan) · [OpenSSF model-signing](https://github.com/sigstore/model-transparency)
- [NVIDIA GPU Operator](https://github.com/NVIDIA/gpu-operator)
- [Methodology](./00-methodology.md) for licence legend, evidence grades and refresh commands
