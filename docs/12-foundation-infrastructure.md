# Foundation and delivery

> **TL;DR** — Foundation and delivery is the substrate the rest of the platform stands on: Kubernetes, networking, storage, GitOps, certificates, packaging and infrastructure as code. Good choices here make every other pillar easier to operate and easier to replace.

*Snapshot: 2026-10-11 · Related: [Methodology](./00-methodology.md) · [Reference architecture](./01-reference-architecture.md) · [Model serving](./04-model-serving.md) · [Reliability and performance](./10-reliability-performance.md)*

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

It does **not** own guardrails or PII policy; those belong to [Security](./08-security.md). It also does not own caching policy; that belongs to [Reliability and performance](./10-reliability-performance.md). Secret *plumbing* appears here as infrastructure, but secret *policy* belongs to [Security](./08-security.md).

## 2. Capability map

| Capability | What good looks like | Default building block | Boundary |
|------------|----------------------|------------------------|----------|
| Cluster substrate | Every environment is reproducible and declarative | Kubernetes | AI-specific runtime choices still belong to [P04](./04-model-serving.md) |
| Traffic contract | Gateways and routes use standard Kubernetes APIs where possible | Gateway API | Product routing policy belongs to [P02](./02-ai-gateway.md) and [P03](./03-model-router.md) |
| Cluster networking | One network layer handles policy, service reachability and observability cleanly | Cilium | Hardening policy details belong to [P11](./11-hardening.md) |
| Persistent storage | Stateful platform services have a clear object, block and backup story | Rook/Ceph by default | MinIO is valid in some designs, but its current packaging and licence details should be re-checked |
| GitOps delivery | Desired state is promoted through Git and continuously reconciled | Argo CD or Flux | Release approval process belongs to [P09](./09-governance-risk-compliance.md) |
| Infrastructure as code | Shared environments are created from reviewable, reusable definitions | OpenTofu | Governance of exceptions still belongs to [P09](./09-governance-risk-compliance.md) |
| Control-plane composition | Product teams request higher-level platform resources instead of raw cloud APIs | Crossplane | Keep ownership boundaries clear to avoid shadow platform teams |
| Packaging | Upstream projects install in a repeatable way | Helm | Kustomize overlays are still useful around Helm |
| Certificates | Internal and edge-facing certificates are automated | cert-manager | Identity policy still belongs to [P08](./08-security.md) |
| Batch and queueing | Offline eval, ETL and GPU-heavy jobs do not starve online services | Kueue | Online serving autoscaling still belongs to [P10](./10-reliability-performance.md) |

## 3. Tool comparison table

| Capability | Default pick | Licence label | Steward | 1-3 alternatives | Choose the default when… |
|------------|--------------|---------------|---------|------------------|--------------------------|
| Cluster substrate | **Kubernetes** | OSI (`Apache-2.0`) | Kubernetes project | managed distributions (`Not OSS`), opinionated distro bundles | you want the broadest ecosystem and the control surface assumed by the rest of this blueprint |
| Cluster networking | **Cilium** | OSI (`Apache-2.0`) | Cilium project | cloud CNI plugins, Calico (verify the LICENSE file) | you want network policy, service networking and observability from one stack |
| Persistent storage | **Rook/Ceph** | OSI — verify the relevant `LICENSE` files | Rook and Ceph communities | MinIO (`AGPL-3.0`, details unverified), external cloud storage (`Not OSS`) | you need self-hosted object and block storage with a broad operational feature set |
| GitOps delivery | **Argo CD** | OSI (`Apache-2.0`) | Argo project | Flux (`Apache-2.0`) | you want an app-centric GitOps workflow with a strong operational UI |
| Infrastructure as code | **OpenTofu** | OSI (`MPL-2.0`) | OpenTofu project | Terraform (`Source-available`), cloud-specific templates | you want Terraform-style workflows without BUSL licensing |
| Control-plane composition | **Crossplane** | OSI (`Apache-2.0`) | Crossplane project | raw OpenTofu modules, provider-native operators | product teams need self-service composite resources instead of direct infrastructure APIs |
| Packaging | **Helm** | OSI (`Apache-2.0`) | Helm project | raw manifests, Kustomize overlays | upstream projects already ship charts and you want repeatable install values |
| Certificates | **cert-manager** | OSI (`Apache-2.0`) | cert-manager project | self-managed PKI, service-mesh issuance | you need automated issuance and rotation for gateways, webhooks and internal services |
| Batch queueing | **Kueue** | OSI (`Apache-2.0`) | Kubernetes SIG Scheduling | native Job priority, bespoke queue controllers | GPU-heavy batch or evaluation jobs compete with online inference and need explicit admission control |

Notes:

- The current status of MinIO community packaging and some licence details are **Unverified (not re-checked in this edit)**; confirm with [Methodology §5](./00-methodology.md#5-snapshot-and-refresh) before standardising.
- Flux is a strong default too. Pick one GitOps controller family per environment unless you have a clear reason to run both.

## 4. Reference design

A sturdy foundation for this blueprint usually looks like this:

1. One or more Kubernetes clusters provide the common control plane.
2. Gateway API is the traffic contract, even when different gateway implementations sit behind it.
3. Cilium provides service networking and baseline network policy.
4. Rook/Ceph or another reviewed storage layer backs stateful services and backup targets.
5. GitOps continuously reconciles platform add-ons, application namespaces and policy.
6. OpenTofu builds the shared infrastructure boundaries, while Crossplane exposes safer self-service abstractions inside the platform.
7. Helm installs third-party projects, with environment overlays held in Git.
8. cert-manager issues and rotates the certificates that the rest of the platform assumes exist.
9. Kueue governs bursty batch work so offline jobs do not crowd out online paths.

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

### Licence watch-list

These items are worth re-checking before a long-term foundation decision:

- **Terraform** — moved to a `Source-available` licence family; if you want the old workflow with an OSI licence, prefer OpenTofu.
- **HashiCorp Vault** — now generally discussed as `Source-available`; if an OSI option matters, compare OpenBao carefully.
- **Redis** — licensing and ownership history changed; confirm exactly which edition and terms you mean.
- **Elasticsearch** — licensing diverged from the old Apache-only line; confirm whether the chosen distribution matches your policy.
- **MinIO** — reported as `AGPL-3.0`, but recent community-edition packaging and commercial terms are **Unverified (not re-checked in this edit)**.

For any of the above, re-read the current `LICENSE` file and upstream announcements using the refresh process in [Methodology §5](./00-methodology.md#5-snapshot-and-refresh).

## 8. Checklist

### MVP

- [ ] Build every environment from declarative infrastructure and cluster definitions.
- [ ] Standardise on one Kubernetes substrate and one GitOps path.
- [ ] Use Gateway API as the preferred traffic contract.
- [ ] Automate certificate issuance and renewal.
- [ ] Document storage, backup target and restore expectations for shared services.

### Production

- [ ] Separate platform, environment and application ownership in Git.
- [ ] Standardise Helm-based installs and reviewed value overrides.
- [ ] Provide self-service infrastructure through reviewed abstractions, not broad cloud access.
- [ ] Exercise cluster bootstrap and add-on rollback in a lower environment.
- [ ] Keep a reviewed licence watch-list for sticky infrastructure dependencies.

### Enterprise

- [ ] Support multi-cluster promotion and disaster-recovery bootstrap from code.
- [ ] Mirror critical images, charts and packages for restricted-network environments.
- [ ] Operate clear failure-domain, backup and restore tests for storage layers.
- [ ] Integrate batch admission so offline work cannot starve online services.
- [ ] Re-verify infrastructure licensing and ownership before major renewals or migrations.

## 9. Sources

Core references and upstream projects for this pillar:

- [Kubernetes](https://kubernetes.io/)
- [Gateway API](https://gateway-api.sigs.k8s.io/)
- [Cilium](https://github.com/cilium/cilium)
- [Rook](https://github.com/rook/rook)
- [Ceph](https://ceph.io/)
- [MinIO](https://github.com/minio/minio)
- [Argo CD](https://argo-cd.readthedocs.io/)
- [Flux](https://fluxcd.io/)
- [OpenTofu](https://opentofu.org/)
- [Crossplane](https://crossplane.io/)
- [Helm](https://helm.sh/)
- [cert-manager](https://cert-manager.io/)
- [Kueue](https://github.com/kubernetes-sigs/kueue)
- [Methodology](./00-methodology.md) for the licence legend, evidence grades and refresh commands
