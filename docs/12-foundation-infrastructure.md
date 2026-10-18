# P12. Foundation and delivery

> **TL;DR** — Foundation and delivery is the substrate the rest of the platform stands on: Kubernetes, networking, storage, GitOps, certificates, packaging and infrastructure as code. Good choices here make every other pillar easier to operate and easier to replace.

*Snapshot: 2026-10-11 · Related: [Methodology](./00-methodology.md) · [Reference architecture](./01-reference-architecture.md) · [Model serving](./03-model-serving.md) · [Reliability, performance and capacity](./11-reliability-capacity.md) · [Platform experience and tenancy](./13-platform-experience.md)*

## 1. Why it matters

A platform can have excellent model choices and still fail because the substrate is inconsistent: clusters built by hand, ad hoc networking, storage with unclear recovery, secrets copied manually, or upgrades that only work in one environment.

This pillar owns:

- the Kubernetes substrate and its extension points;
- networking and Gateway API as the common traffic contract;
- storage choices for persistent platform services;
- GitOps, packaging and environment promotion;
- infrastructure as code and self-service control-plane composition;
- certificate management and batch-queue primitives;
- the infrastructure licence watch-list.

It does **not** own tenancy design (namespace, vcluster and hierarchical models), which belongs to [P13](./13-platform-experience.md), though the cluster substrate here must support it. It also does not own guardrails, PII policy or workload and node hardening; those belong to [Security and safety](./09-security-safety.md). It also does not own caching policy; that belongs to [Reliability, performance and capacity](./11-reliability-capacity.md). Secret *plumbing* appears here as infrastructure, but secret *policy* belongs to [Security and safety](./09-security-safety.md).

## 2. Capability map

| Capability | What good looks like | Default building block | Boundary |
|------------|----------------------|------------------------|----------|
| Cluster substrate | Every environment is reproducible and declarative | Kubernetes | AI-specific runtime choices still belong to [P03](./03-model-serving.md) |
| Accelerator allocation interface | GPUs and other devices are requested by attributes, not only integer counts | Kubernetes Dynamic Resource Allocation (DRA) | Scheduling policy still belongs to [P03](./03-model-serving.md) and [P11](./11-reliability-capacity.md) |
| Traffic contract | Gateways and routes use standard Kubernetes APIs where possible | Gateway API | Product routing policy belongs to [P02](./02-ai-gateway-routing.md) |
| Cluster networking | One network layer handles policy, service reachability and observability cleanly | Cilium | Network hardening policy belongs to [P09](./09-security-safety.md) |
| Persistent storage | Stateful platform services have a clear object, block and backup story | Rook/Ceph by default | MinIO's community repository is archived and no longer maintained (verified 2026-10-11), so do not choose it for new designs |
| GitOps delivery | Desired state is promoted through Git and continuously reconciled | Argo CD or Flux | Release approval process belongs to [P10](./10-governance-finops.md) |
| Infrastructure as code | Shared environments are created from reviewable, reusable definitions | OpenTofu | Governance of exceptions still belongs to [P10](./10-governance-finops.md) |
| Control-plane composition | Product teams request higher-level platform resources instead of raw cloud APIs | Crossplane | Keep ownership boundaries clear to avoid shadow platform teams |
| Packaging | Upstream projects install in a repeatable way | Helm | Kustomize overlays are still useful around Helm |
| Certificates | Internal and edge-facing certificates are automated | cert-manager | Identity policy still belongs to [P09](./09-security-safety.md) |
| Service mesh (optional) | East-west mTLS and L7 policy are added only where the platform genuinely needs them | Istio ambient mode | Do not add a mesh when Gateway API + Cilium already solve the problem |
| Batch and queueing | Offline eval, ETL and GPU-heavy jobs do not starve online services | Kueue | Online serving autoscaling and GPU quota and capacity planning belong to [P11](./11-reliability-capacity.md) |

## 3. Tool comparison table

Defaults here were weighted towards OSI licensing, ecosystem fit with Kubernetes/Gateway API and the amount of undifferentiated platform plumbing they remove.

| Capability | Default pick | Licence label | Steward | 1-3 alternatives | Key trade-off | Choose the default when… | Do not choose the default when… |
|------------|--------------|---------------|---------|------------------|---------------|--------------------------|---------------------------------|
| Cluster substrate | **Kubernetes** | OSI (`Apache-2.0`) | Kubernetes project (CNCF graduated) | managed distributions (`Not OSS`), Talos Linux (`MPL-2.0`) or other opinionated distro bundles | biggest ecosystem and portability, but also the broadest operational surface | you want the broadest ecosystem and the control surface assumed by the rest of this blueprint | a managed platform already removes enough undifferentiated work and you do not need deep substrate control |
| Accelerator allocation interface | **Kubernetes DRA** | Kubernetes core feature | Kubernetes project | classic device plugins, vendor schedulers | far richer device matching, but driver and managed-service support still varies by environment | you want GPUs and other devices requested by attributes, claims and classes rather than raw integer counts | your chosen cloud, driver stack or accelerator vendor still depends on classic device plugins for production support |
| Cluster networking | **Cilium** | OSI (`Apache-2.0`) | Cilium project (CNCF graduated) | cloud CNI plugins, Calico (`Apache-2.0`), Istio ambient mode (`Apache-2.0`) for a mesh | broad policy and observability in one stack, but it is more opinionated than plain `NetworkPolicy` | you want network policy, service networking and observability from one stack; add a mesh only when you need L7 identity or traffic features | the team only wants a minimal CNI or already standardises on another network plane |
| Persistent storage | **Rook/Ceph** | OSI (`Apache-2.0` for Rook; Ceph is LGPL — verify the `LICENSE` files) | Rook (CNCF graduated) and Ceph communities | Longhorn (`Apache-2.0`) for simpler block-first clusters, SeaweedFS (`Apache-2.0`) or Garage (`AGPL-3.0`) for S3-led designs, external cloud storage (`Not OSS`) | most capable self-hosted storage option, but also the heaviest to operate well | you need self-hosted object and block storage with a broad operational feature set and clear replication controls | the team cannot operate Ceph reliably and a simpler block store or external object service is the safer choice |
| GitOps delivery | **Argo CD** | OSI (`Apache-2.0`) | Argo project (CNCF graduated) | Flux (`Apache-2.0`, CNCF graduated) | strongest app-centric UI and operational workflow, but another central control plane to run | you want an app-centric GitOps workflow with a strong operational UI | you prefer controller-per-repo primitives, Git-first workflows and less central UI-driven operation |
| Infrastructure as code | **OpenTofu** | OSI (`MPL-2.0`) | OpenTofu project (CNCF sandbox) | Terraform (`Source-available`, BUSL-1.1, now IBM-owned), cloud-specific templates | familiar Terraform workflows without BUSL, but still the same state and provider discipline to manage | you want Terraform-style workflows without BUSL licensing | the estate already standardises on another IaC system and migration cost outweighs licence risk |
| Control-plane composition | **Crossplane** | OSI (`Apache-2.0`) | Crossplane project (CNCF graduated) | raw OpenTofu modules, provider-native operators | strongest self-service abstraction layer, but it needs product-level API design and governance | product teams need self-service composite resources instead of direct infrastructure APIs | the platform is too small to justify another abstraction layer beyond IaC modules |
| Packaging | **Helm** | OSI (`Apache-2.0`) | Helm project | raw manifests, Kustomize overlays | standard packaging lingua franca, but chart sprawl can become an upgrade problem | upstream projects already ship charts and you want repeatable install values | the project ships better plain manifests and a chart adds indirection without value |
| Certificates | **cert-manager** | OSI (`Apache-2.0`) | cert-manager project | self-managed PKI, service-mesh issuance | easiest Kubernetes-native PKI path, but one more controller and issuer model to own | you need automated issuance and rotation for gateways, webhooks and internal services | certificate lifecycle is already solved centrally outside Kubernetes |
| Service mesh (optional) | **Istio ambient mode** | OSI (`Apache-2.0`) | Istio project | sidecar-mode Istio, no mesh | best current balance of mesh features and overhead, but still extra operational surface | you genuinely need east-west mTLS, service identity and selective L7 policy beyond what Cilium and Gateway API already give | the platform cannot show a concrete L7 or identity use case and would be adding mesh complexity on speculation |
| Batch queueing | **Kueue** | OSI (`Apache-2.0`) | Kubernetes SIG Scheduling | Volcano (`Apache-2.0`, CNCF incubating), NVIDIA KAI Scheduler (`Apache-2.0`), native Job priority | Kubernetes-native quota and admission, but less HPC-specific than Volcano | GPU-heavy batch or evaluation jobs compete with online inference and need explicit admission control; choose Volcano or KAI when you need gang scheduling or GPU sharing beyond Kueue's quota model | you need only simple job priority or deep HPC-style scheduling semantics |
| Node autoscaling | **Karpenter** | OSI (`Apache-2.0`) | Kubernetes SIG Autoscaling | Cluster Autoscaler | faster, shape-aware provisioning, but with narrower provider support | you need fast, GPU-aware node provisioning on a supported cloud provider; on bare metal use Cluster Autoscaler or fixed pools | you run on bare metal, unsupported clouds or fixed pools where Cluster Autoscaler is simpler |
| GPU enablement | **NVIDIA GPU Operator** | OSI (`Apache-2.0`) | NVIDIA | vendor device plugins for other accelerators, hand-managed drivers | cleanest declarative NVIDIA path, but it ties you to the operator's version matrix | NVIDIA GPUs need drivers, device plugin and monitoring managed declaratively | another accelerator family dominates or your driver lifecycle is already standardised elsewhere |
| Secrets and policy plumbing | **External Secrets Operator** and **Kyverno** | OSI (`Apache-2.0`) | ESO and Kyverno projects | OpenBao (`MPL-2.0`) as a Vault-compatible store; OPA Gatekeeper (`Apache-2.0`) | strong GitOps fit, but it still leaves secret-store and policy-language choices to the platform | provider keys and certificates must be synced from a secret manager and cluster policy enforced as code (policy design stays in [P09](./09-security-safety.md)) | the environment is so small that manual secret distribution and ad hoc admission rules are genuinely lower risk than more controllers |

Notes:

- Licence, steward, stars and archive status were checked on 2026-10-11 via GitHub (**Opened**) and re-checked selectively in this review; CNCF levels come from the landscape file. DRA and Istio ambient mode status are mostly **Search-cited** from Kubernetes and Istio materials.
- MinIO: the repository README says it is no longer maintained and points to the commercial AIStor editions; GitHub shows `AGPL-3.0` and the repository is archived (**Opened**).
- Flux is a strong default too. Pick one GitOps controller family per environment unless you have a clear reason to run both.
- Longhorn is the simpler alternative for small or edge-style clusters; Rook/Ceph remains the default where the platform needs both block and object semantics with stronger failure-domain controls.
- Why the defaults: each is OSI-licensed or core Kubernetes, at least CNCF incubating or Kubernetes-SIG-hosted where a foundation home exists (adoption and maintenance signals), and Gateway-API- or Helm-friendly (interoperability and operability). OpenTofu is chosen over Terraform on the licence signal; Rook/Ceph over MinIO on the licence and maintenance signals.

## 4. Reference design

A sturdy foundation for this blueprint usually looks like this:

1. One or more Kubernetes clusters provide the common control plane.
2. Gateway API is the traffic contract, even when different gateway implementations sit behind it.
3. Cilium provides service networking and baseline network policy.
4. Rook/Ceph or another reviewed storage layer backs stateful services and backup targets.
5. GitOps continuously reconciles platform add-ons, application namespaces and policy.
6. OpenTofu builds the shared infrastructure boundaries, while Crossplane exposes safer self-service abstractions inside the platform.
7. Helm installs third-party projects, with environment overlays held in Git.
8. DRA, the GPU Operator and DCGM Exporter make accelerator claims, drivers and telemetry declarative instead of ad hoc.
9. cert-manager issues and rotates the certificates that the rest of the platform assumes exist.
10. Add a mesh only if the platform has a concrete east-west mTLS or L7-policy use case; if so, favour ambient mode before sidecars.
11. Kueue governs bursty batch work so offline jobs do not crowd out online paths.

A common operating pattern is to separate:

- a platform-management repo for shared controllers and policy;
- environment repos for promoted configuration;
- application repos for service-specific releases.

That split keeps blast radius smaller and ownership clearer.

## 5. Implementation guide

A minimal `ClusterIssuer` pattern for internal PKI with cert-manager is:

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: platform-ca
spec:
  ca:
    secretName: platform-root-ca
```

Practical implementation advice:

- Treat Gateway API as the stable interface and avoid binding applications directly to one ingress controller's custom fields where you can.
- Keep GitOps bootstrap small: cluster access, namespaces, core controllers and policy first; applications later.
- Use OpenTofu for shared environment creation, then let Crossplane publish higher-level resources such as databases, object buckets or inference namespaces.
- Keep Helm values in Git and minimise click-ops changes in cluster UIs.
- Document storage classes, backup targets and restore expectations together. "We have object storage" is not the same as "we can recover the registry in four hours".

## 6. Operations

Day-2 operations for the foundation include:

- Kubernetes and add-on upgrade planning with clear compatibility windows;
- GitOps drift review and reconciliation failure alerts;
- storage capacity, failure-domain and restore testing;
- PKI expiry monitoring and renewal drills;
- infrastructure module review for stale providers and accidental hand edits;
- periodic bootstrap-from-scratch exercises for at least one lower environment;
- mirroring critical images and charts when internet access is constrained.

Foundational runbooks should be boring and explicit: how to bootstrap a new cluster, how to rotate a root or intermediate CA, how to restore object storage dependencies, how to promote a platform add-on and how to roll it back.

## 7. Pitfalls

- Building clusters by hand and then trying to add GitOps later.
- Mixing experimental and production workloads on one shared control plane without clear boundaries.
- Depending on controller-specific annotations everywhere, which makes migration hard.
- Treating GitOps as a backup system; Git history is not a substitute for stateful-service recovery.
- Assuming storage is solved because an S3 endpoint exists.
- Letting every team write raw cloud resources when a safer platform abstraction would do.
- Enabling a service mesh before proving you need east-west mTLS or L7 policy, then carrying the cost forever.
- Assuming DRA is equally mature on every cloud and driver stack without checking the exact provider support you run.

### Licence watch-list

These items are worth re-checking before a long-term foundation decision:

- **Terraform** — moved to BUSL-1.1 (`Source-available`; the repository now names IBM as licensor, **Opened**); if you want the old workflow with an OSI licence, prefer OpenTofu (`MPL-2.0`, CNCF sandbox).
- **HashiCorp Vault** — BUSL-1.1 (`Source-available`, **Opened**); if an OSI option matters, compare OpenBao (`MPL-2.0`) carefully.
- **Redis** — Redis moved from BSD to RSALv2/SSPL (7.4) and later added AGPL-3.0 as an option (8.0) — **Unverified**, search-cited; confirm exactly which edition and terms you mean, and consider Valkey (BSD-3-Clause, Linux Foundation) as an OSI alternative.
- **Elasticsearch** — moved to SSPL/Elastic-2.0 in 2021 and added AGPL-3.0 as an option in 2024 — **Unverified**, search-cited; confirm whether the chosen distribution matches your policy, and consider OpenSearch (`Apache-2.0`).
- **MinIO** — `AGPL-3.0`, but the community repository is archived with a README notice that it is no longer maintained and that the AIStor editions are the successors (**Opened**). Plan a migration path.
- **Ray, Kong, LiteLLM** — see [P03](./03-model-serving.md) and [P02](./02-ai-gateway-routing.md): Ray is `Apache-2.0`; Kong Gateway core is `Apache-2.0` with upstream OSS-binary policy **Unverified**; LiteLLM is `Open-core`.

For any of the above, re-read the current `LICENSE` file and upstream announcements using the refresh process in [Methodology §5](./00-methodology.md#5-snapshot-and-refresh).

## 8. Checklist

### MVP

- [ ] Build every environment from declarative infrastructure and cluster definitions.
- [ ] Standardise on one Kubernetes substrate and one GitOps path.
- [ ] Decide whether accelerator allocation stays on classic device plugins or moves to DRA, and document the provider support you actually have.
- [ ] Use Gateway API as the preferred traffic contract.
- [ ] Automate certificate issuance and renewal.
- [ ] Document storage, backup target and restore expectations for shared services.

### Production

- [ ] Separate platform, environment and application ownership in Git.
- [ ] Standardise Helm-based installs and reviewed value overrides.
- [ ] Provide self-service infrastructure through reviewed abstractions, not broad cloud access.
- [ ] Validate GPU Operator, DCGM Exporter and (if used) DRA in a lower environment before production rollout.
- [ ] Exercise cluster bootstrap and add-on rollback in a lower environment.
- [ ] Keep a reviewed licence watch-list for sticky infrastructure dependencies.

### Enterprise

- [ ] Support multi-cluster promotion and disaster-recovery bootstrap from code.
- [ ] Mirror critical images, charts and packages for restricted-network environments.
- [ ] Operate clear failure-domain, backup and restore tests for storage layers.
- [ ] Integrate batch admission so offline work cannot starve online services.
- [ ] Add a service mesh only where the east-west identity or L7-policy use case is documented and reviewed.
- [ ] Re-verify infrastructure licensing and ownership before major renewals or migrations.

## 9. Sources

Core references and upstream projects for this pillar:

- [Kubernetes](https://kubernetes.io/)
- [Gateway API](https://gateway-api.sigs.k8s.io/)
- [Cilium](https://github.com/cilium/cilium)
- [Kubernetes Dynamic Resource Allocation](https://kubernetes.io/docs/concepts/resource-management/dynamic-resource-allocation/)
- [Rook](https://github.com/rook/rook)
- [Ceph](https://ceph.io/)
- [Longhorn](https://github.com/longhorn/longhorn) · [SeaweedFS](https://github.com/seaweedfs/seaweedfs) · [Garage](https://github.com/deuxfleurs-org/garage)
- [MinIO](https://github.com/minio/minio)
- [Argo CD](https://argo-cd.readthedocs.io/)
- [Flux](https://fluxcd.io/)
- [OpenTofu](https://opentofu.org/)
- [Crossplane](https://crossplane.io/)
- [Helm](https://helm.sh/)
- [cert-manager](https://cert-manager.io/)
- [Kueue](https://github.com/kubernetes-sigs/kueue)
- [Volcano](https://github.com/volcano-sh/volcano), [NVIDIA KAI Scheduler](https://github.com/kai-scheduler/KAI-Scheduler)
- [Karpenter](https://github.com/kubernetes-sigs/karpenter), [NVIDIA GPU Operator](https://github.com/NVIDIA/gpu-operator)
- [External Secrets Operator](https://github.com/external-secrets/external-secrets), [Kyverno](https://github.com/kyverno/kyverno), [OpenBao](https://github.com/openbao/openbao)
- [Istio](https://github.com/istio/istio), [Talos Linux](https://github.com/siderolabs/talos)
- [CNCF landscape file](https://github.com/cncf/landscape/blob/master/landscape.yml)
- [Methodology](./00-methodology.md) for the licence legend, evidence grades and refresh commands
