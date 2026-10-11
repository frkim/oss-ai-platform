# P10. Governance, risk and compliance

> **TL;DR** — Governance is how the platform proves control: which model was approved, which policy allowed deployment, which data fed the response, who owns the risk and who pays the bill. This pillar is orientation only, not legal advice.

*Snapshot: 2026-10-11 · Related: [Methodology](./00-methodology.md) · [Observability and evaluation](./07-observability-evaluation.md) · [Security](./09-security-safety.md) · [Hardening](./09-security-safety.md)*

## 1. Why it matters

If security answers "can the system be abused?", governance answers "can we explain what happened, why we allowed it and who approved it?" AI platforms need both.

For most teams, the hard part is not one big regulation. It is the accumulation of small, operational questions:

- Which models are allowed for which use cases?
- Which prompts, datasets and tools were in scope when an answer was produced?
- Which controls are mandatory before a model moves to production?
- How are spend, exceptions and approvals assigned to a real owner?

This pillar owns:

- policy as code for platform and workload governance;
- model registry, approval state and lineage;
- AI-BOM and related evidence packaging;
- control mapping to frameworks such as the NIST AI RMF, ISO/IEC 42001 and the EU AI Act;
- FinOps processes for chargeback and accountability.

It does **not** own gateway quotas or token limits; those belong to [AI gateway](./02-ai-gateway-routing.md). It also does not own signing, provenance generation or SBOM scanning mechanics; those belong to [Hardening](./09-security-safety.md), while this pillar owns how such evidence is recorded and used.

## 2. Capability map

| Capability | What good looks like | Default building block | Boundary |
|------------|----------------------|------------------------|----------|
| Kubernetes policy | Required labels, approved registries and environment rules are enforced before rollout | Kyverno | Use OPA when you need one policy language across many systems |
| Cross-system policy | The same policy intent can be evaluated in CI, admission, gateways and apps | OPA | Do not duplicate policy logic in five places |
| Model registry and lineage | Each promoted model has owner, approval state, inputs and serving target recorded | MLflow | Registry depth belongs here; serving runtime belongs to [P03](./03-model-serving.md) |
| AI-BOM and evidence | Software, models, prompts, datasets and controls can be assembled into a machine-readable evidence pack | CycloneDX ML-BOM | SBOM generation mechanics belong to [P09](./09-security-safety.md) |
| Alternate evidence schema | A second schema exists for organisations standardising on SPDX artefacts | SPDX 3 AI profile | Pick one primary schema first |
| Data lineage events | Pipeline runs, datasets and jobs emit standard lineage events that link to model records | OpenLineage | Model-level lineage stays in the registry; RAG ingestion pipelines belong to [P05](./05-data-knowledge-rag.md) |
| Vulnerability finding management | Scanner output from CI is deduplicated, triaged and tied to owners and SLAs | DefectDojo | Scanning itself belongs to [P09](./09-security-safety.md) |
| Cost accountability | Teams can see and allocate infrastructure cost, including GPU-heavy namespaces | OpenCost | Token-level quotas still belong to [P02](./02-ai-gateway-routing.md) |
| Control mapping | Controls map to internal policy and external frameworks with named owners and exceptions | NIST AI RMF as the organising taxonomy, OSCAL for machine-readable controls | Regulatory interpretation is legal work, not platform engineering |

## 3. Tool comparison table

| Capability | Default pick | Licence label | Steward | 1-3 alternatives | Choose the default when… |
|------------|--------------|---------------|---------|------------------|--------------------------|
| Kubernetes admission and drift policy | **Kyverno** | OSI (`Apache-2.0`) | Kyverno project | OPA + Gatekeeper (`Apache-2.0`), ValidatingAdmissionPolicy (built into Kubernetes), custom admission webhooks | you want Kubernetes-native policy written mostly as YAML plus built-in background audit |
| Shared policy engine | **OPA** | OSI (`Apache-2.0`) | OPA maintainers (CNCF graduated) | Cedar (`Apache-2.0`, application authorisation), Gatekeeper (`Apache-2.0`), application-local checks | the same policy language must serve CI, admission, APIs and custom services |
| Kubernetes integration for OPA | **Gatekeeper** | OSI (`Apache-2.0`) | Gatekeeper maintainers | Kyverno (`Apache-2.0`), validating webhooks | you already use Rego heavily and want constraint templates at admission time |
| Model registry and lineage | **MLflow** | OSI (`Apache-2.0`) | MLflow maintainers (Linux Foundation) | artifact repositories, serving-stack registries | you need one place for experiments, model versions, lineage and promotion state |
| AI-BOM schema | **CycloneDX ML-BOM** | OSI (`Apache-2.0` spec; **Unverified** for tooling) | CycloneDX community (OWASP; Ecma International ECMA-424) | SPDX 3 AI profile, internal evidence schemas | you want a BOM shape that fits existing CycloneDX tooling and vulnerability workflows |
| Lineage events | **OpenLineage** | OSI (`Apache-2.0`; **Unverified**) | LF AI & Data | MLflow lineage, vendor catalogues | jobs span several schedulers and you want one open event format |
| Vulnerability finding management | **DefectDojo** | OSI (`BSD-3-Clause`; **Unverified**) | OWASP / DefectDojo Inc. | spreadsheets and ticket queues, scanner-native dashboards | many scanners feed one triage workflow with SLAs |
| Control catalogue format | **OSCAL** | Public-domain NIST specification (**Unverified**) | NIST | internal spreadsheets, GRC SaaS (`Not OSS`) | you want controls, profiles and assessment results as code |
| Cost allocation | **OpenCost** | OSI (`Apache-2.0`) | OpenCost project (CNCF incubating) | Kubecost (`Open-core`: IBM-owned, commercial self-hosted tier under IBM licence terms; **Unverified** free-tier terms), cloud billing exports (`Not OSS`), bespoke cost scripts | you need Kubernetes cost by namespace, label or team without waiting for monthly invoices |

Notes:

- Framework texts such as the NIST AI RMF, ISO/IEC 42001 and the EU AI Act are control references, not deployable software.
- Tools added without re-reading their licence files (OpenLineage, DefectDojo, OSCAL, Cedar, Kubecost terms) are marked **Unverified**.
- Standards, maturity and stewardship can change. Re-check any decision-critical claim with [Methodology §5](./00-methodology.md#5-snapshot-and-refresh).

## 4. Reference design

A lightweight governance flow looks like this:

1. All deployable artifacts are declared in Git, including policy, prompts, serving config and ownership metadata.
2. CI creates or updates the model record, attaches lineage and generates evidence such as SBOM or AI-BOM references.
3. Policy checks run before merge and again before cluster admission.
4. GitOps deploys only approved objects from approved sources.
5. Runtime telemetry, cost data and audit events are attached back to the model, service or tenant owner.
6. Exceptions are explicit records with an owner, reason and expiry date.

The minimum metadata set worth standardising early is:

- system owner;
- business purpose;
- risk tier;
- allowed data classes;
- allowed model families or providers;
- approval state;
- evidence links.

If those fields are missing, every later audit becomes detective work.

## 5. Implementation guide

A small Kyverno policy can enforce governance metadata on AI workloads:

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-ai-metadata
spec:
  validationFailureAction: Enforce # newer Kyverno releases prefer validate.failureAction
  rules:
    - name: require-owner-and-risk
      match:
        any:
          - resources:
              kinds:
                - Deployment
      validate:
        message: "Set ai.owner and ai.risk labels."
        pattern:
          metadata:
            labels:
              ai.owner: "?*"
              ai.risk: "?*"
```

Implementation sequence:

- Start with **required metadata**, not dozens of rules.
- Promote models through named states such as draft, approved and retired.
- Attach BOM references to the model or deployment record, rather than storing them in random CI folders.
- Keep cost labels stable across namespaces, jobs and serving deployments so OpenCost can aggregate cleanly.
- Map external frameworks to your internal controls once, then reuse that mapping. The platform should not invent a fresh checklist for every review.

Regulatory note: the EU AI Act, the NIST AI RMF and ISO/IEC 42001 are useful organising frames, but this document is orientation only. Use counsel and the official texts before making a compliance claim.

EU AI Act dates (search-cited, secondary sources; verify against EUR-Lex):

- 2 Feb 2025: prohibited practices and AI literacy apply.
- 2 Aug 2025: general-purpose AI model obligations, governance and penalties apply.
- The Digital Omnibus on AI (Regulation (EU) 2026/1744, published 24 Jul 2026) moved high-risk obligations from 2 Aug 2026 to **2 Dec 2027** (Annex III stand-alone systems) and **2 Aug 2028** (Annex I product-embedded systems). Article 50 transparency duties keep their original schedule, with a short grace period for marking until 2 Dec 2026 (**Unverified**).
- Other frames: NIST AI RMF 1.0 with the Generative AI Profile (NIST AI 600-1); ISO/IEC 42001:2023 is a certifiable AI management-system standard. Map OWASP LLM Top 10 (2025) and agentic risks through [Security](./09-security-safety.md).

## 6. Operations

Run governance as a recurring operating cycle:

- review exception records and expired waivers;
- reconcile the registry against what is actually deployed;
- check that every production model or agent still has a named owner;
- review cost anomalies with engineering and product together, not as a finance-only report;
- verify that BOM and lineage links are still reachable after CI or storage changes;
- produce evidence bundles for audits from live systems, not by hand-built slide decks.

Useful standing reports include:

- workloads missing owner or risk metadata;
- models with no active approval record;
- namespaces with cost but no mapped team;
- policy failures by rule and business unit;
- exceptions past expiry;
- retired models that still receive traffic.

## 7. Pitfalls

- Writing policies before agreeing on a shared metadata vocabulary.
- Using one engine for CI and another for admission without synchronising policy intent.
- Treating a model registry as a file store instead of a control point.
- Generating BOMs but never linking them to approvals, deployments or incidents.
- Running showback reports without stable labels, so teams dispute the numbers every month.
- Assuming the NIST AI RMF, ISO/IEC 42001 and the EU AI Act ask for identical evidence.
- Calling something "compliant" when you really mean "mapped to our current control set".

## 8. Checklist

### MVP

- [ ] Define required ownership and risk metadata for AI workloads.
- [ ] Enforce that metadata at merge or admission time.
- [ ] Record model versions, approval state and deployment target in one registry.
- [ ] Tag namespaces and workloads so infrastructure cost can be attributed.
- [ ] Map internal controls to one external reference framework for orientation.

### Production

- [ ] Run policy checks in CI and again at admission time.
- [ ] Attach SBOM or AI-BOM references to model and release records.
- [ ] Maintain explicit exception records with owner and expiry.
- [ ] Reconcile deployed workloads against the approved registry on a schedule.
- [ ] Publish recurring reports for owners, policy failures and cost anomalies.

### Enterprise

- [ ] Package evidence for audits from live systems and immutable logs.
- [ ] Separate duties for approval, deployment and exception granting.
- [ ] Link governance metadata to incident response, risk review and change management.
- [ ] Keep multi-tenant policy overlays without losing a shared baseline.
- [ ] Re-assess framework mappings whenever regulation or standards change.

## 9. Sources

Primary references to consult when adopting this pillar:

- [Open Policy Agent](https://www.openpolicyagent.org/)
- [Gatekeeper](https://github.com/open-policy-agent/gatekeeper)
- [Kyverno](https://kyverno.io/)
- [MLflow](https://github.com/mlflow/mlflow)
- [CycloneDX](https://cyclonedx.org/)
- [SPDX](https://spdx.dev/)
- [OpenLineage](https://openlineage.io/)
- [DefectDojo](https://github.com/DefectDojo/django-DefectDojo)
- [OSCAL](https://pages.nist.gov/OSCAL/)
- [Cedar](https://www.cedarpolicy.com/)
- [Kubecost](https://www.ibm.com/products/kubecost)
- [OpenCost](https://opencost.io/)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [ISO/IEC 42001 overview](https://www.iso.org/standard/81230.html)
- [EU AI Act information portal](https://artificialintelligenceact.eu/)
- [Methodology](./00-methodology.md) for evidence grades, the licence legend and refresh commands
