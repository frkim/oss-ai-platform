# Hardening

> **TL;DR** — Hardening reduces the platform's own attack surface: restricted cluster baselines, signed artifacts, scanned images, safer model formats, tighter network boundaries and stronger isolation for untrusted code and tenants. This pillar owns supply chain, tenant isolation and model-artifact safety.

*Snapshot: 2026-10-11 · Related: [Methodology](./00-methodology.md) · [Security](./08-security.md) · [Model serving](./04-model-serving.md) · [Foundation and delivery](./12-foundation-infrastructure.md)*

## 1. Why it matters

AI platforms run unusual workloads: large third-party artifacts, GPU drivers, notebook-derived code, agent tools and sometimes untrusted prompts that can trigger high-risk actions. Even if your prompts are safe, the platform is still exposed if any workload can run privileged, pull unsigned images or load unsafe model files.

This pillar owns:

- cluster and node baselines such as Pod Security Standards and CIS-aligned settings;
- network segmentation and runtime detection;
- image scanning, SBOM generation, signing and provenance;
- tenant and workload isolation for risky code paths;
- model-artifact safety, including format choice and quarantine workflows;
- GPU stack hardening and operational boundaries.

It does **not** own prompt injection, PII redaction or guardrail policy; those belong to [Security](./08-security.md). It also does not own cost or quota policy; those belong to [AI gateway](./02-ai-gateway.md) and [Governance](./09-governance-risk-compliance.md).

## 2. Capability map

| Capability | What good looks like | Default building block | Boundary |
|------------|----------------------|------------------------|----------|
| Baseline cluster policy | Namespaces default to restricted settings and exceptions are explicit | Pod Security Standards + CIS guidance | Detailed governance exceptions belong to [P09](./09-governance-risk-compliance.md) |
| Network enforcement | Only required east-west and egress paths are open | Cilium | Gateway routing policy still belongs to [P03](./03-model-router.md) |
| Runtime detection | Suspicious syscalls, container escapes and crypto-mining patterns alert fast | Falco | Incident response process is wider than the tool |
| Image and config scanning | Images, filesystems and IaC are scanned before rollout | Trivy | Evidence packaging belongs to [P09](./09-governance-risk-compliance.md) |
| Signing and provenance | Images and releases are signed and tied to build identity | Cosign/Sigstore + SLSA practices | Governance uses the evidence; P11 generates and enforces it |
| SBOM generation | Every shipped image can produce a package inventory | Syft | AI-BOM ownership belongs to [P09](./09-governance-risk-compliance.md) |
| Tenant isolation | High-risk or untrusted workloads run with stronger isolation than ordinary web apps | Kata Containers or gVisor | Business-level tenancy policy belongs elsewhere |
| Model-artifact safety | Unsafe formats and suspicious files are quarantined before serving | safetensors-first policy + ModelScan | Model approval state belongs to [P09](./09-governance-risk-compliance.md) |
| GPU lifecycle control | Drivers and device plugins are installed and upgraded consistently | NVIDIA GPU Operator | Capacity planning belongs to [P04](./04-model-serving.md) |

## 3. Tool comparison table

| Capability | Default pick | Licence label | Steward | 1-3 alternatives | Choose the default when… |
|------------|--------------|---------------|---------|------------------|--------------------------|
| Network policy and datapath | **Cilium** | OSI (`Apache-2.0`) | Cilium project | native `NetworkPolicy`, Calico (verify the LICENSE file) | you want policy, observability and eBPF-based enforcement from one networking layer |
| Runtime threat detection | **Falco** | OSI (`Apache-2.0`) | Falco project | auditd rules, Cilium Tetragon (verify the LICENSE file) | you need syscall-level detections with Kubernetes context |
| Vulnerability and misconfiguration scanning | **Trivy** | OSI (`Apache-2.0`) | Trivy maintainers | Grype (`Apache-2.0`), distro-native scanners | you want one scanner for images, filesystems, IaC and cluster config |
| Signing and provenance | **Cosign + Sigstore** | OSI (`Apache-2.0`) | Sigstore project | offline GPG workflows, Notation (verify the LICENSE file) | you want identity-tied signatures and transparent verification flows |
| SBOM generation | **Syft** | OSI (`Apache-2.0`) | Anchore | Trivy SBOM mode, build-system native SBOMs | you need repeatable package inventories for policy and incident response |
| Stronger workload isolation | **Kata Containers** | OSI (`Apache-2.0`) | Kata Containers community | gVisor (`Apache-2.0`) | risky tools or multi-tenant agent runtimes justify VM-like boundaries |
| Model-artifact scanning | **ModelScan** | verify the LICENSE file | ModelScan maintainers | safetensors-only policy, offline malware scanning | you ingest third-party models or notebooks and need artifact-specific findings |
| GPU stack lifecycle | **NVIDIA GPU Operator** | verify the LICENSE file | NVIDIA | hand-built driver and plugin DaemonSets | you want a repeatable GPU software stack, but will re-check the licence before standardising |

Notes:

- `safetensors` is usually the safer default for model exchange because it avoids arbitrary code execution patterns associated with Python pickle loading.
- NVIDIA packaging terms and ModelScan project details are **Unverified (not re-checked in this edit)**; verify before adoption with [Methodology §5](./00-methodology.md#5-snapshot-and-refresh).

## 4. Reference design

A practical hardening baseline for an AI platform is:

1. Default all namespaces to the restricted Pod Security profile.
2. Pin images by digest, sign them in CI and verify them before admission.
3. Scan images and IaC before merge, then scan again against the built artifact.
4. Apply deny-by-default network policy, then open only required paths.
5. Quarantine third-party model files before they reach shared storage or serving fleets.
6. Run untrusted or high-risk agent tools in stronger sandboxes than normal stateless APIs.
7. Separate GPU-serving nodes from general application nodes and control privileged access tightly.
8. Keep a short, reviewable list of exceptions for privileged pods, host mounts and egress bypasses.

The main design choice is where to pay for stronger isolation. A shared internal chatbot may tolerate standard containers plus strong policy. A multi-tenant agent platform that executes tools on behalf of users often needs Kata or gVisor for the riskiest paths.

## 5. Implementation guide

A safe default for namespaces is to enforce the restricted Pod Security profile:

```yaml
metadata:
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

Two low-regret implementation rules:

- Prefer model files in `safetensors` format over pickle-based formats whenever your toolchain allows it.
- Pin workload images by digest, for example `ghcr.io/acme/agent-runner@sha256:...`, so a tag change cannot silently alter what is deployed.

Operationally useful starting controls are:

- verify signatures before admission;
- reject privileged pods outside explicitly approved namespaces;
- quarantine new model artifacts until basic scanning completes;
- keep GPU nodes tainted or dedicated, so only reviewed workloads can land there.

## 6. Operations

Hardening is ongoing maintenance work:

- patch base images and node images on a schedule;
- review Falco detections and tune noisy rules instead of ignoring them;
- refresh SBOMs after rebuilds, not only after source changes;
- rotate signing keys or review keyless identity bindings;
- test the quarantine and rollback path for bad model artifacts;
- review every privileged exception and host mount for continued need;
- track GPU driver, device-plugin and kernel drift together.

A good operating rhythm includes:

- weekly scan review for critical issues;
- monthly exception review;
- quarterly restore and rebuild-from-trusted-source exercise;
- pre-release verification that signatures, SBOMs and policy gates still work end to end.

## 7. Pitfalls

- Confusing "signed" with "safe"; a signed image can still be vulnerable or misconfigured.
- Generating SBOMs but not storing them where responders can find them quickly.
- Allowing privileged debug pods to become a permanent back door.
- Sharing GPU nodes between highly trusted and weakly trusted workloads without policy boundaries.
- Loading untrusted pickle-based artifacts because "the demo needed it".
- Sandboxing too little for risky agent tools, or sandboxing everything so heavily that teams disable the controls.
- Treating CIS benchmarks as literal copy-paste settings rather than guidance for your environment.

## 8. Checklist

### MVP

- [ ] Enforce restricted pod security defaults for ordinary namespaces.
- [ ] Scan images and IaC before deployment.
- [ ] Pin images by digest and keep a trusted base-image set.
- [ ] Prefer safe model formats and quarantine third-party artifacts.
- [ ] Add basic runtime detection for suspicious container behaviour.

### Production

- [ ] Verify signatures or provenance before admission.
- [ ] Apply deny-by-default network policy with explicit egress rules.
- [ ] Generate SBOMs for shipped images and keep them attached to releases.
- [ ] Separate GPU-serving nodes and review privileged access tightly.
- [ ] Track and expire hardening exceptions such as privileged pods and hostPath mounts.

### Enterprise

- [ ] Use stronger sandboxing for high-risk or multi-tenant agent workloads.
- [ ] Maintain end-to-end provenance from build identity to deployed digest.
- [ ] Rebuild critical images from trusted inputs on a regular cadence.
- [ ] Test quarantine, rollback and incident response for malicious model artifacts.
- [ ] Audit hardening controls across clusters, not only in one environment.

## 9. Sources

Upstream projects and references for this pillar:

- [Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/)
- [CIS Kubernetes Benchmarks](https://www.cisecurity.org/benchmark/kubernetes)
- [Cilium](https://github.com/cilium/cilium)
- [Falco](https://falco.org/)
- [Trivy](https://github.com/aquasecurity/trivy)
- [Cosign](https://github.com/sigstore/cosign)
- [Sigstore](https://www.sigstore.dev/)
- [SLSA](https://slsa.dev/)
- [Syft](https://github.com/anchore/syft)
- [Kata Containers](https://katacontainers.io/)
- [gVisor](https://gvisor.dev/)
- [safetensors](https://github.com/huggingface/safetensors)
- [ModelScan](https://github.com/protectai/modelscan)
- [NVIDIA GPU Operator](https://github.com/NVIDIA/gpu-operator)
- [Methodology](./00-methodology.md) for evidence grades and refresh commands
