# P05. Knowledge and context

> **TL;DR** — Knowledge and context is everything the model sees besides the user's question: retrieved documents, agent memory, and versioned prompt and context assets. Start with disciplined ingestion, stable metadata and access control, not a large vector stack. The first safe default is PostgreSQL plus `pgvector`; add a dedicated vector database, a memory store or graph retrieval only when a measured need justifies the extra system.

*Snapshot: 2026-10-11 · Related: [Reference architecture](./01-reference-architecture.md) · [Model serving](./03-model-serving.md) · [Reliability, performance and capacity](./11-reliability-capacity.md) · [Agents](./06-agents-mcp.md) · [Evaluation](./08-evaluation-quality.md)*

## 1. Why it matters

RAG is how an AI platform uses organisation-specific knowledge without retraining a model. It matters because it changes three things at once:

- **Grounding:** answers can cite current internal documents instead of only model pre-training.
- **Control:** document freshness, provenance and access control stay in your platform, not in the model weights.
- **Change speed:** you can improve quality by fixing ingestion, chunking, metadata or retrieval without re-serving the model.

A weak retrieval layer creates confident but unsupported answers, stale citations and access-control leaks. A good one behaves more like search infrastructure than like prompt engineering.

Ownership boundaries matter here:

- **Caching** belongs to [P11](./11-reliability-capacity.md).
- **Guardrails, prompt-injection defence and PII handling** belong to [P09](./09-security-safety.md).
- **Fallbacks across embedding models or search backends** belong to [P02](./02-ai-gateway-routing.md).

## 2. Capability map

| Capability | What it must do | Notes |
|------------|-----------------|-------|
| **Connectors and ingestion** | Pull content from systems of record, keep source identifiers, and support incremental sync | Prefer idempotent jobs keyed by source URI and content hash |
| **Parsing and normalisation** | Extract clean text, tables and structure from PDFs, HTML, Office files and plain text | Preserve page numbers, headings and tables where possible |
| **Chunking and metadata** | Split content into retrieval units with stable IDs, offsets and ACL tags | Store `document_id`, `chunk_id`, source URI, version hash, timestamps and ACL metadata |
| **Embeddings** | Turn chunks and queries into vectors using one declared model per index | Keep model name, dimension and re-embedding history with the index metadata |
| **Embedding and rerank serving** | Serve embedding and cross-encoder or classifier models with stable APIs, batching and rollout control | Record the embedding and rerank model version separately; both can change relevance |
| **Vector and metadata storage** | Support nearest-neighbour search plus structured filters | The vector store is not the source of truth; raw documents and lineage still need durable storage |
| **Retrieval orchestration** | Combine vector search, filters, optional lexical search and optional reranking into the prompt context | Query rewriting and reranking are optional, but provenance is not |
| **Lifecycle management** | Re-index, delete, re-embed and backfill safely | Deletes and ACL changes must propagate to derived chunks |
| **Quality measurement** | Track freshness, hit quality and citation coverage | Deep evaluation lives in [P08](./08-evaluation-quality.md) |
| **Memory stores** | Persist user, session and agent facts outside the prompt, with scope, TTL and delete support | Memory is derived data: it needs the same ACL, retention and deletion rules as chunks |
| **Prompt and context assets** | Keep prompts, system instructions, few-shot sets and tool descriptions versioned, reviewed and released like code | Pin a version in each deployment; evaluate changes before promotion ([P08](./08-evaluation-quality.md)) |
| **Context-window budgeting** | Decide how many tokens go to instructions, history, memory, retrieved chunks and tool output | Budgets keep cost and tail latency predictable ([P11](./11-reliability-capacity.md)) |
| **Graph and hybrid retrieval** | Add entity and relationship traversal or lexical plus vector fusion where plain top-k fails | Optional; adopt after parsing and metadata are sound |

## 3. Tool comparison

The table keeps the original repository snapshot (2026-10-11) and adds spot-checks for missing tools and status corrections opened on 2026-10-17. Evidence grades follow [Methodology §4.1](./00-methodology.md#41-evidence-grades): repository pages, `LICENSE` files and release pages read on GitHub are **Opened**; governance or acquisition claims that still depend on secondary reporting remain **Search-cited**; immature or conflicting claims are flagged **Unverified**.

Selection criteria used in this pillar:

- **Operational surface:** can the team reuse PostgreSQL and existing search operations, or does the capability justify another clustered system?
- **Retrieval behaviour:** filters, ACL enforcement, hybrid search, reranking and explainability matter more than ANN benchmark headlines.
- **Migration path:** re-embedding, dual-write, dual-read and delete propagation must stay boring.
- **Data governance:** prompt assets and memory need owners, retention, delete paths and auditability, not only convenience APIs.
- **Licence boundary:** where credible `OSI` options exist, the default stays `OSI`; open-core and hosted-only options are alternatives or warnings.

| Capability | Default pick | Licence label | Steward | Alternatives | Decision criteria | Choose the default when… | Do not choose the default when… |
|------------|--------------|---------------|---------|--------------|-------------------|---------------------------|---------------------------------|
| **Vector search inside the main relational store** | **pgvector** (23.3k★) | `OSI` ✅ (PostgreSQL licence) | PostgreSQL ecosystem / pgvector maintainers | Qdrant (`OSI` ✅ Apache-2.0), LanceDB (`OSI` ✅ Apache-2.0, embedded) | Existing PostgreSQL footprint, SQL joins, backup reuse, moderate corpus size | you already run PostgreSQL, need joins and structured filters, and want the smallest first-production surface | the retrieval tier needs independent scaling, specialised multi-tenant operations or a team that does not want vector search inside the OLTP estate |
| **Dedicated vector database** | **Qdrant** (35.1k★; v1.19.2, 2026-10-05) | `OSI` ✅ (Apache-2.0) | Qdrant (company-led) | Milvus (`OSI` ✅ Apache-2.0), Chroma (`OSI` ✅ Apache-2.0; 29.5k★, developer-first), Weaviate (`Open-core` ⚠️) | Payload filters, snapshots, operational separation, moderate-scale multi-tenancy | you want a purpose-built vector service with strong filtering and snapshots, but not the full weight of a larger distributed stack | hybrid lexical search is the first-class need, or PostgreSQL already meets the scale and SLOs |
| **Large-scale or heavily specialised vector platform** | **Milvus** (46.4k★; v3.0.3, 2026-10-14) | `OSI` ✅ (Apache-2.0) | Milvus community (Zilliz-led); LF AI & Data graduated project (**Search-cited**) | Qdrant (`OSI` ✅ Apache-2.0), Vespa (`OSI` ✅ Apache-2.0; 7.1k★, ranking and tensor workloads) | Sharding at scale, index-family choice, high-ingest and high-fan-out retrieval | the retrieval tier is large enough to justify a dedicated distributed system and the team can absorb the extra operational complexity | the corpus is still modest or platform operators do not want another stateful fleet with its own backup, tuning and upgrade path |
| **Schema-rich vector search with built-in object model** | **Weaviate** (16.9k★; v1.40.1, 2026-10-13) | `Open-core` ⚠️ (BSD-3-Clause outside `wl/`; `wl/` carries a separate enterprise licence) | Weaviate BV | Qdrant (`OSI` ✅ Apache-2.0), pgvector (`OSI` ✅ PostgreSQL licence) | Need for an opinionated object model, module ecosystem, acceptance of open-core boundary | you want vector retrieval plus an application-facing object schema and can stay on the open parts | strict `OSI`-only policy applies, or you prefer explicit relational schemas over an opinionated object model |
| **Lexical and hybrid (BM25 + vector) search** | **OpenSearch** (13.9k★; v3.9.0, 2026-09-29) | `OSI` ✅ (Apache-2.0) | OpenSearch Software Foundation (**Search-cited**) | Vespa (`OSI` ✅ Apache-2.0), pgvector plus PostgreSQL full-text search, Elasticsearch (`Source-available` ⚠️: AGPL-3.0, SSPL or Elastic-2.0) | Importance of keyword, code, ID and facet search; hybrid ranking; existing search operations | identifiers, keywords, code and facets matter as much as semantic similarity and you want an Apache-2.0 search engine | you only need a small retrieval tier and cannot justify a second clustered search estate yet |
| **Document parsing and enrichment** | **Docling** (69.0k★; v2.140.0, 2026-10-16) | `OSI` ✅ (MIT) | Docling maintainers (originated at IBM Research) | Unstructured (`OSI` ✅ Apache-2.0 for the open library) | Layout fidelity, table extraction, local-first processing, deterministic parse output | document fidelity, table extraction and local processing matter more than connector breadth | your primary problem is connector coverage or ETL convenience rather than PDF and Office fidelity |
| **Broad file-type and ETL convenience** | **Unstructured** (15.6k★; v0.27.28, 2026-10-16) | `OSI` ✅ (Apache-2.0) for the open-source library; hosted platform is `Not OSS` | Unstructured (company) | Docling (`OSI` ✅ MIT) | Connector coverage, partitioning pipeline, batch ingestion convenience | the open library's connectors or partitioning pipeline fit your estate better than a document-first parser does | you mainly need high-fidelity layout extraction or want to avoid a framework that often leads teams towards its hosted products |
| **Embedding and rerank serving** | **Text Embeddings Inference (TEI)** (5.1k★; v1.9.4, 2026-09-15) | `OSI` ✅ (Apache-2.0) | Hugging Face | Infinity (`OSI` ✅ MIT; 3.0k★; v3.0.0-alpha.3, 2026-10-15), vLLM pooling or in-process inference | Need for stable HTTP serving, batching, OpenAI-compatible endpoints, and model rollout control for embeddings or rerankers | you want a small, purpose-built service for Hugging Face embedding and rerank models with Prometheus and OpenTelemetry support | you need a broader runtime matrix, heavier CPU-first optimisation or one server that mixes several backends and model types more freely, where **Infinity** is often the better fit |
| **RAG orchestration framework (optional)** | **LlamaIndex** (52.5k★; v0.14.25, 2026-09-21) | `OSI` ✅ (MIT) | LlamaIndex (company) | Haystack (`OSI` ✅ Apache-2.0; 26.8k★; v3.4.0, 2026-10-15), hand-written retrieval service | Loader breadth, speed of prototyping, tolerance for fast-moving framework APIs | you want ready-made loaders, chunkers and retrievers to reach a first working service quickly | the retrieval service and schemas are already well-defined and you want fewer fast-moving dependencies in the hot path |
| **Agent memory layer** | **Mem0** (67.3k★; v2.2.1, 2026-09-25) | `OSI` ✅ (Apache-2.0) | Mem0 (company) | Letta (`OSI` ✅ Apache-2.0; 25.2k★), plain PostgreSQL tables, Zep Cloud (`Not OSS`; its `getzep/zep` repository is examples and integrations, not the hosted product) | Need for extract-and-recall convenience, retention controls, and whether memory is typed or fuzzy | you want a drop-in memory API for user and agent facts and can still wrap it in your own retention and delete controls | memory is short, typed and auditable enough to stay in ordinary tables, or you need the runtime and memory model managed together, where **Letta** may fit better |
| **Temporal or graph memory** | **Graphiti** (31.9k★; v0.31.1, 2026-10-15) | `OSI` ✅ (Apache-2.0) | Zep (company) | Microsoft GraphRAG (`OSI` ✅ MIT; 36.3k★, batch corpus-level graph indexing), Zep Cloud (`Not OSS`) | Time-aware facts, relationship traversal, indexing cost, online versus batch graph construction | facts change over time and queries need relationships and validity windows, not just semantic recall | the questions are simple enough for typed tables or ordinary retrieval, or the graph would be built offline only, where **GraphRAG** may be the closer fit |
| **Prompt and context asset versioning** | **Git plus a registry convention** (prompts as files, reviewed by pull request) | n/a | Your platform team | Opik prompt playground (`OSI` ✅ Apache-2.0; 22.7k★), Langfuse prompt management (`Open-core` ⚠️) | Need for code review, release labels, non-engineer editing, and rollback discipline | prompts ship with the application and should follow the same review, promotion and rollback path as code | non-engineers must edit prompts live, or you need labelled prompt environments without an application deploy, where a prompt registry is justified |

### 3.1 Trade-offs and default reasoning

The default posture stays deliberately conservative:

1. **Start with PostgreSQL plus `pgvector`.** Most first-production failures come from parsing, metadata, ACLs or delete propagation, not from ANN limits.
2. **Add parser and embedding-service discipline before changing databases.** A Docling or Unstructured parsing pipeline and a TEI or Infinity service usually move quality more than swapping vector engines early.
3. **Promote to Qdrant or Milvus only for a measured reason**: isolation, scale, distinct operator ownership or SLOs that PostgreSQL cannot meet.
4. **Keep memory and prompts boring until a product need forces more.** Git and typed tables beat clever memory systems when audit, deletion and tenant isolation matter.

Notes:

- **Redis and Elasticsearch relicensing.** Redis 8 is tri-licensed (RSALv2, SSPLv1 or AGPL-3.0; 7.2 and earlier are BSD-3-Clause); Valkey (BSD-3-Clause, Linux Foundation) is the permissive fork. Neither is a recommended vector store here. If a cache or key-value store is needed alongside RAG, prefer Valkey and see [P11](./11-reliability-capacity.md).
- **Zep status correction.** The current `getzep/zep` repository says it is not the product itself; it mainly contains examples, integrations and ingestion tooling for Zep Cloud. Treat Zep Cloud as `Not OSS`; the open-source building block in that ecosystem is Graphiti.
- Vector-store benchmark claims are not reproduced here; measure with your own corpus, filters and rerank path.

Default platform stance:

1. **Start with PostgreSQL + `pgvector`** if your corpus is measured in low millions of chunks and you already trust PostgreSQL operations.
2. **Fix parsing, metadata and optional reranking before changing vector databases.** Retrieval quality usually fails there first.
3. **Promote to a dedicated vector service** only when you need stronger isolation, dedicated scaling or specialised indexing behaviour.

## 4. Reference design

A pragmatic reference design for this pillar is:

1. **Landing zone:** store raw documents and exports in object storage or the source system, with immutable version identifiers.
2. **Ingestion worker:** pull changes incrementally, normalise content, compute a content hash and emit canonical document records.
3. **Parsing stage:** extract text, headings, tables and page boundaries into a structured intermediate form.
4. **Chunking stage:** create stable chunks with deterministic IDs, offsets, section paths and ACL metadata.
5. **Embedding stage:** call the platform's chosen embedding model through the same governed path used for other models ([P02](./02-ai-gateway-routing.md)).
6. **Storage stage:** write chunks and metadata to PostgreSQL; store vectors either in `pgvector` or in a dedicated vector database; keep the document lineage in PostgreSQL even when vectors live elsewhere.
7. **Retrieval service:** accept a query, apply tenant and ACL filters, run similarity search, optionally combine lexical and vector signals, and return candidate chunks with provenance.
8. **Optional rerank stage:** score or reorder candidates with a reranker only after ACL checks and provenance are attached; record the reranker version in the trace and result metadata.
9. **Application layer:** assemble prompt context, attach citations and pass the request onward to the model path.

Design rules that survive tool changes:

- **Documents are the source of truth; vectors are a derived index.**
- **ACLs live on documents and chunks, not only in the application.**
- **Every retrieved chunk must be explainable by source URI, version and offsets.**
- **Re-indexing must be idempotent.**

## 5. Implementation guide

Implementation order matters more than tool choice.

### 5.1 Start with the data contract

Define one canonical chunk schema before choosing a vector database:

- `document_id`
- `chunk_id`
- `source_uri`
- `content`
- `content_sha256`
- `section_path`
- `created_at` / `updated_at`
- `acl_tags`
- `embedding_model`
- `embedding_dimension`

### 5.2 Keep the first index boring

If PostgreSQL is already a platform dependency, the first working design is usually enough:

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE rag_chunk (
  chunk_id text PRIMARY KEY,
  document_id text NOT NULL,
  source_uri text NOT NULL,
  section_path text,
  content text NOT NULL,
  content_sha256 text NOT NULL,
  acl_tags text[] NOT NULL DEFAULT '{}',
  embedding_model text NOT NULL,
  embedding vector(1536) NOT NULL
);

CREATE INDEX rag_chunk_embedding_idx
  ON rag_chunk USING hnsw (embedding vector_cosine_ops);
```

Adjust the vector dimension to the embedding model you standardise on.

### 5.3 Filter before trust

A minimal retrieval query still needs structural filters and provenance:

```sql
SELECT chunk_id, document_id, source_uri, section_path, content
FROM rag_chunk
WHERE acl_tags && ARRAY['team:finance']
ORDER BY embedding <=> $1
LIMIT 8;
```

If you later add lexical search, add it as another signal, not as a replacement for provenance and ACL checks.

### 5.4 Treat ingestion as a pipeline, not a script

Keep these behaviours from day one:

- Incremental sync by source cursor or last-modified timestamp
- Idempotent upsert by `chunk_id`
- Tombstones or delete propagation
- Re-embedding by batch job, not inline in user traffic
- Dead-letter handling for parse failures

### 5.5 Separate retrieval from prompt assembly

The retrieval service should return ranked chunks and metadata. Prompt construction belongs to the application or agent layer. That split makes it easier to test retrieval independently in [P08](./08-evaluation-quality.md).

### 5.6 Add context engineering deliberately

- **Memory stores.** Give every memory record an owner (user, tenant or agent), a scope, a source (which conversation wrote it), a TTL and a delete path. Write memory asynchronously and read it through the same retrieval service, so ACL filters apply. Agent runtime state and approvals stay in [P06](./06-agents-mcp.md); this pillar owns recall of durable facts.
- **Prompt and context assets.** Treat system prompts, templates, few-shot examples and tool descriptions as versioned artefacts with an owner and a changelog. Reference an immutable version (Git SHA or registry version) from each deployment, record it in traces ([P07](./07-observability-evaluation.md)) and gate promotion on the regression set in [P08](./08-evaluation-quality.md).
- **Embedding and rerank serving.** Keep embedding and rerank models behind a named service, not hidden inside ingestion jobs or application code. Record the model ID, revision and API version in index metadata, because swapping the embedder or reranker changes relevance as much as changing the chunker.
- **Context-window budgeting.** Set a per-request token budget split across fixed instructions, conversation history, memory, retrieved chunks and tool output. Truncate or summarise history first, cap tool output, and drop the lowest-ranked chunks before the highest-value instructions. Track average and p95 context tokens per route, since they drive cost ([P10](./10-governance-finops.md)) and TTFT ([P11](./11-reliability-capacity.md)).
- **GraphRAG and hybrid retrieval.** Reach for graph retrieval when questions are about relationships or need multi-hop answers across documents, and for hybrid (lexical plus vector, then optional re-rank) when identifiers and exact terms matter. Both add indexing cost and a second index to keep in sync; prove the gain on the gold set first.

## 6. Operations

Operate the retrieval layer like a data product:

- **Freshness:** define how quickly source changes must appear in search.
- **Backfills:** keep a controlled re-index path for parser, chunking or embedding-model changes.
- **Deletes:** verify that legal deletes, ACL changes and source removals cascade to chunks and vectors.
- **Backup and recovery:** back up both the metadata store and the vector index or snapshot mechanism.
- **Observability:** emit ingestion lag, parse failure rate, index size, query latency and empty-result rate to [P07](./07-observability-evaluation.md).
- **Embedding and rerank migrations:** support dual-read or side-by-side evaluation before a full re-embed or reranker cut-over.
- **Connector security:** scope connector credentials to the narrowest source path or collection that still works; source overreach defeats downstream ACL tags.
- **Change control:** treat new parsers, chunking rules, embedding models and rerankers like production changes with rollback plans.
- **Tenant isolation:** validate filters and namespaces with explicit tests, not by convention.

Operational heuristics:

- When quality drops after a model change, check **embedding compatibility and reranker drift** before changing chunk sizes.
- When latency rises, check **filter selectivity, rerank budget and index health** before introducing caching; caching strategy belongs to [P11](./11-reliability-capacity.md).
- When answers leak unrelated documents, assume an **ACL design bug or over-broad connector credential** before blaming the model.

## 7. Pitfalls

Common failures are architectural, not mathematical:

- **Using the vector database as the only store.** You lose lineage, clean deletes and document-level governance.
- **Chunking by token count alone.** Headings, tables and list structure often matter more than a fixed token window.
- **Dropping provenance.** If you cannot show where a chunk came from, you cannot debug trust failures.
- **Ignoring incremental sync.** Nightly full rebuilds look simple until the corpus or embedding bill grows.
- **Mixing embeddings from different model families in one index.** Similarity scores stop meaning the same thing, and regressions become impossible to explain.
- **Mixing tenants in one flat namespace without tested filters.** This creates the worst class of RAG failure: silent data exposure.
- **Expecting higher `top_k` to solve poor ingestion.** More chunks usually mean more noise.
- **Adding rerankers or query rewriting with no version record.** You changed retrieval behaviour but lost the ability to compare runs.
- **Giving connectors broader read access than the retrieval tier should ever expose.** Downstream filters cannot compensate for a bad source-of-truth ACL model.
- **Unscoped agent memory.** Memory written without owner, scope or TTL becomes a cross-user leak and a deletion problem.
- **Untracked prompt edits.** A prompt changed in a console with no version, owner or evaluation is an unreviewed production change.
- **Stuffing the context window.** More tokens raise cost and latency and often lower answer quality; budget instead.
- **Solving prompt injection only in retrieval.** Retrieval can reduce exposure, but the main controls belong to [P09](./09-security-safety.md).

## 8. Checklist

### MVP

- [ ] One ingestion path with deterministic document and chunk IDs
- [ ] Raw source URI, content hash and ACL metadata stored with every chunk
- [ ] PostgreSQL + `pgvector` or one small dedicated vector store, not both by default
- [ ] Retrieval API returns provenance fields, not only text
- [ ] Embedding model and revision recorded for the first index
- [ ] Manual relevance review set for the first 20-50 representative questions

### Production

- [ ] Incremental sync, delete propagation and dead-letter handling implemented
- [ ] Embedding model, dimension, service revision and index version recorded in metadata
- [ ] Reranker or query-rewrite version recorded when used
- [ ] Hybrid retrieval considered for corpora where keywords and codes matter
- [ ] Retrieval metrics exported: latency, empty-result rate, freshness lag, citation coverage
- [ ] ACL and tenant isolation covered by automated tests
- [ ] Re-index and re-embedding runbooks documented
- [ ] Prompts and system instructions stored in Git or a registry with versions and owners
- [ ] Per-route context-token budget defined and monitored
- [ ] Any agent memory store has scope, TTL and delete support

### Enterprise

- [ ] Separate lifecycle for parse changes, embedding changes, reranker changes and schema changes
- [ ] Dedicated vector service justified by scale, isolation or SLOs
- [ ] Corpus ownership, legal delete requirements and data retention mapped per source
- [ ] Gold evaluation sets linked to release gates in [P08](./08-evaluation-quality.md)
- [ ] Disaster-recovery plan validated for both metadata and vector layers
- [ ] Cross-region or multi-cluster replication requirements explicitly decided
- [ ] Prompt and context releases gated by evaluation and recorded in the audit trail
- [ ] Memory retention, user-delete and cross-tenant isolation tested
- [ ] Graph or hybrid retrieval adopted only where the gold set shows a measured gain

## 9. Sources

Primary upstreams to re-check:

- [pgvector repository](https://github.com/pgvector/pgvector)
- [Qdrant repository](https://github.com/qdrant/qdrant)
- [Milvus repository](https://github.com/milvus-io/milvus)
- [Weaviate repository](https://github.com/weaviate/weaviate)
- [Chroma repository](https://github.com/chroma-core/chroma)
- [LanceDB repository](https://github.com/lancedb/lancedb)
- [Vespa repository](https://github.com/vespa-engine/vespa)
- [OpenSearch repository](https://github.com/opensearch-project/OpenSearch)
- [Elasticsearch `LICENSE.txt`](https://github.com/elastic/elasticsearch/blob/main/LICENSE.txt)
- [Docling repository](https://github.com/docling-project/docling)
- [Unstructured repository](https://github.com/Unstructured-IO/unstructured)
- [Text Embeddings Inference repository](https://github.com/huggingface/text-embeddings-inference)
- [Infinity repository](https://github.com/michaelfeil/infinity)
- [LlamaIndex repository](https://github.com/run-llama/llama_index)
- [Haystack repository](https://github.com/deepset-ai/haystack)
- [Mem0 repository](https://github.com/mem0ai/mem0)
- [Letta repository](https://github.com/letta-ai/letta)
- [Graphiti repository](https://github.com/getzep/graphiti)
- [Zep repository](https://github.com/getzep/zep) — repository text says it is examples and integrations for Zep Cloud, not the hosted product
- [Microsoft GraphRAG repository](https://github.com/microsoft/graphrag)
- [Opik repository](https://github.com/comet-ml/opik) and [Langfuse repository](https://github.com/langfuse/langfuse) for prompt-management alternatives
- [Redis `LICENSE.txt`](https://github.com/redis/redis/blob/unstable/LICENSE.txt) and [Valkey repository](https://github.com/valkey-io/valkey)
- [Cloud Native AI whitepaper](https://github.com/cncf/tag-runtime/blob/main/wgs/cnai/whitepapers/cloudnativeai.md)
- [CNCF landscape source](https://github.com/cncf/landscape/blob/master/landscape.yml)

The original table facts were read on 2026-10-11 (**Opened**). Added rows and status corrections for TEI, Infinity, Haystack, Mem0, Graphiti, Zep and prompt-registry alternatives were spot-checked on 2026-10-17 (**Opened**). Governance or foundation claims remain **Search-cited** where noted. Refresh with [Methodology §5](./00-methodology.md#5-snapshot-and-refresh).
