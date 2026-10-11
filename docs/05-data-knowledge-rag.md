# P05. Data and knowledge (RAG)

> **TL;DR** — Start RAG with disciplined ingestion, stable metadata and access control, not with a large vector stack. For most teams the first safe default is PostgreSQL plus `pgvector`; move to a dedicated vector database only when scale, isolation or retrieval features justify the extra system.

*Snapshot: 2026-10-11 · Related: [Reference architecture](./01-reference-architecture.md) · [Model serving](./03-model-serving.md) · [Reliability and performance](./11-reliability-capacity.md)*

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
| **Vector and metadata storage** | Support nearest-neighbour search plus structured filters | The vector store is not the source of truth; raw documents and lineage still need durable storage |
| **Retrieval orchestration** | Combine vector search, filters and optional lexical search into the prompt context | Re-ranking is optional, but provenance is not |
| **Lifecycle management** | Re-index, delete, re-embed and backfill safely | Deletes and ACL changes must propagate to derived chunks |
| **Quality measurement** | Track freshness, hit quality and citation coverage | Deep evaluation lives in [P07](./07-observability-evaluation.md) |

## 3. Tool comparison

Licences were read from each upstream `LICENSE` file, and stars, push dates and archived flags from the GitHub API, on 2026-10-11 (**Opened**; stars rounded to 0.1k). Foundation statuses are **Search-cited** unless stated. Re-check with [Methodology §5](./00-methodology.md#5-snapshot-and-refresh) before adoption. The six signals ([Methodology §3.1](./00-methodology.md#31-six-signals)) that drove the picks are licence, operability (one system fewer to run) and interoperability (SQL, filters, hybrid search); all listed projects were pushed within the last month and none is archived.

| Capability | Default pick | Licence label | Steward | Alternatives | Choose X when… |
|------------|--------------|---------------|---------|--------------|----------------|
| **Vector search inside the main relational store** | **pgvector** (23.3k★) | `OSI` ✅ (PostgreSQL licence) | PostgreSQL ecosystem / pgvector maintainers | Qdrant (`OSI` ✅ Apache-2.0), LanceDB (`OSI` ✅ Apache-2.0, embedded) | Choose **pgvector** when you already run PostgreSQL, need SQL joins and filters, and want the smallest operational surface for the first production release |
| **Dedicated vector database** | **Qdrant** (35.0k★) | `OSI` ✅ (Apache-2.0) | Qdrant (company-led) | Milvus (`OSI` ✅ Apache-2.0), Chroma (`OSI` ✅ Apache-2.0; 29.5k★, simple developer-first store), Weaviate (`Open-core` ⚠️) | Choose **Qdrant** when you want a purpose-built vector service with filtering, snapshots and operational separation from the transactional database |
| **Large-scale or heavily specialised vector platform** | **Milvus** (46.3k★) | `OSI` ✅ (Apache-2.0) | Milvus community (Zilliz-led); LF AI & Data graduated project (search-cited) | Qdrant (`OSI` ✅ Apache-2.0), Vespa (`OSI` ✅ Apache-2.0; 7.1k★, ranking and tensor workloads) | Choose **Milvus** when the retrieval tier is large enough to justify a dedicated distributed system and the team can absorb the extra operational complexity |
| **Schema-rich vector search with built-in object model** | **Weaviate** (16.9k★) | `Open-core` ⚠️ (BSD-3-Clause outside the `wl/` directory; `wl/` is under a separate Weaviate enterprise licence) | Weaviate BV | Qdrant (`OSI` ✅ Apache-2.0), pgvector (`OSI` ✅ PostgreSQL licence) | Choose **Weaviate** when you want vector retrieval plus an opinionated object model and are comfortable aligning application schemas to that model; confirm you do not need anything under `wl/` |
| **Lexical and hybrid (BM25 + vector) search** | **OpenSearch** (13.8k★) | `OSI` ✅ (Apache-2.0) | OpenSearch Software Foundation (Linux Foundation; **Unverified**) | Elasticsearch (`Source-available` ⚠️: AGPL-3.0, SSPL or Elastic-2.0 at your choice for the default code; AGPL option added in 2024; read from `LICENSE.txt`), Vespa (`OSI` ✅ Apache-2.0), pgvector plus PostgreSQL full-text search | Choose **OpenSearch** when keyword, code and ID matching matter as much as semantic similarity and you want an Apache-2.0 search engine; choose **Elasticsearch** only after legal review of its licence options |
| **Document parsing and enrichment** | **Docling** (68.7k★) | `OSI` ✅ (MIT) | Docling maintainers (open-source project originated at IBM Research; Linux Foundation hosting is **Unverified**) | Unstructured (`OSI` ✅ Apache-2.0 for the open-source library) | Choose **Docling** when document fidelity, table extraction and a local-first parsing path matter more than a broad connector marketplace |
| **Broad file-type and ETL convenience** | **Unstructured** (15.6k★) | `OSI` ✅ (Apache-2.0) for the open-source library; the commercial hosted platform is `Not OSS` | Unstructured (company) | Docling (`OSI` ✅ MIT) | Choose **Unstructured** when its connectors or partitioning pipeline fit your estate; keep to the open library, as hosted and enterprise features are separate products |
| **RAG orchestration framework (optional)** | **LlamaIndex** (52.5k★) | `OSI` ✅ (MIT) | LlamaIndex (company) | Haystack (`OSI` ✅ Apache-2.0; 26.7k★, deepset), hand-written retrieval service | Choose **LlamaIndex** or **Haystack** when you want ready-made loaders, chunkers and retrievers; skip both if the retrieval service from section 4 already fits, since they add a dependency that moves quickly |

Notes:

- **Redis and Elasticsearch relicensing.** Redis 8 is tri-licensed (RSALv2, SSPLv1 or AGPL-3.0; 7.2 and earlier are BSD-3-Clause); Valkey (BSD-3-Clause, Linux Foundation) is the permissive fork. Neither is a recommended vector store here. If a cache or key-value store is needed alongside RAG, prefer Valkey and see [P11](./11-reliability-capacity.md).
- Default picks are justified by the signals above: pgvector minimises systems to run; Qdrant has the strongest Apache-2.0 filtering story at moderate scale; Milvus is the choice when scale justifies a distributed system. Weaviate is not a default because of its open-core boundary.
- Vector-store benchmark claims are not reproduced here; measure with your own corpus and filters.

Default platform stance:

1. **Start with PostgreSQL + pgvector** if your corpus is measured in low millions of chunks and you already trust PostgreSQL operations.
2. **Add Docling-style parsing before changing vector databases.** Retrieval quality usually fails first on parsing, metadata and ACL design.
3. **Promote to a dedicated vector service** only when you need stronger isolation, dedicated scaling or specialised indexing behaviour.

## 4. Reference design

A pragmatic reference design for this pillar is:

1. **Landing zone:** store raw documents and exports in object storage or the source system, with immutable version identifiers.
2. **Ingestion worker:** pull changes incrementally, normalise content, compute a content hash and emit canonical document records.
3. **Parsing stage:** extract text, headings, tables and page boundaries into a structured intermediate form.
4. **Chunking stage:** create stable chunks with deterministic IDs, offsets, section paths and ACL metadata.
5. **Embedding stage:** call the platform's chosen embedding model through the same governed path used for other models ([P02](./02-ai-gateway-routing.md)).
6. **Storage stage:** write chunks and metadata to PostgreSQL; store vectors either in `pgvector` or in a dedicated vector database; keep the document lineage in PostgreSQL even when vectors live elsewhere.
7. **Retrieval service:** accept a query, apply tenant and ACL filters, run similarity search, optionally combine lexical and vector signals, and return chunks with provenance.
8. **Application layer:** assemble prompt context, attach citations and pass the request onward to the model path.

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

The retrieval service should return ranked chunks and metadata. Prompt construction belongs to the application or agent layer. That split makes it easier to test retrieval independently in [P07](./07-observability-evaluation.md).

## 6. Operations

Operate the retrieval layer like a data product:

- **Freshness:** define how quickly source changes must appear in search.
- **Backfills:** keep a controlled re-index path for parser, chunking or embedding-model changes.
- **Deletes:** verify that legal deletes, ACL changes and source removals cascade to chunks and vectors.
- **Backup and recovery:** back up both the metadata store and the vector index or snapshot mechanism.
- **Observability:** emit ingestion lag, parse failure rate, index size, query latency and empty-result rate to [P07](./07-observability-evaluation.md).
- **Change control:** treat new parsers, chunking rules and embedding models like production changes with rollback plans.
- **Tenant isolation:** validate filters and namespaces with explicit tests, not by convention.

Operational heuristics:

- When quality drops after a model change, check **embedding compatibility** before changing chunk sizes.
- When latency rises, check **filter selectivity and index health** before introducing caching; caching strategy belongs to [P11](./11-reliability-capacity.md).
- When answers leak unrelated documents, assume an **ACL design bug** before blaming the model.

## 7. Pitfalls

Common failures are architectural, not mathematical:

- **Using the vector database as the only store.** You lose lineage, clean deletes and document-level governance.
- **Chunking by token count alone.** Headings, tables and list structure often matter more than a fixed token window.
- **Dropping provenance.** If you cannot show where a chunk came from, you cannot debug trust failures.
- **Ignoring incremental sync.** Nightly full rebuilds look simple until the corpus or embedding bill grows.
- **Mixing tenants in one flat namespace without tested filters.** This creates the worst class of RAG failure: silent data exposure.
- **Expecting higher `top_k` to solve poor ingestion.** More chunks usually mean more noise.
- **Solving prompt injection only in retrieval.** Retrieval can reduce exposure, but the main controls belong to [P09](./09-security-safety.md).

## 8. Checklist

### MVP

- [ ] One ingestion path with deterministic document and chunk IDs
- [ ] Raw source URI, content hash and ACL metadata stored with every chunk
- [ ] PostgreSQL + `pgvector` or one small dedicated vector store, not both by default
- [ ] Retrieval API returns provenance fields, not only text
- [ ] Manual relevance review set for the first 20-50 representative questions

### Production

- [ ] Incremental sync, delete propagation and dead-letter handling implemented
- [ ] Embedding model, dimension and index version recorded in metadata
- [ ] Hybrid retrieval considered for corpora where keywords and codes matter
- [ ] Retrieval metrics exported: latency, empty-result rate, freshness lag, citation coverage
- [ ] ACL and tenant isolation covered by automated tests
- [ ] Re-index and re-embedding runbooks documented

### Enterprise

- [ ] Separate lifecycle for parse changes, embedding changes and schema changes
- [ ] Dedicated vector service justified by scale, isolation or SLOs
- [ ] Corpus ownership, legal delete requirements and data retention mapped per source
- [ ] Gold evaluation sets linked to release gates in [P07](./07-observability-evaluation.md)
- [ ] Disaster-recovery plan validated for both metadata and vector layers
- [ ] Cross-region or multi-cluster replication requirements explicitly decided

## 9. Sources

The links below are the primary upstreams. Licences and stars were read from the repositories on 2026-10-11 (**Opened**); foundation and acquisition claims are **Search-cited**. Use the commands in [Methodology §5](./00-methodology.md#5-snapshot-and-refresh) to refresh them.

- [pgvector repository](https://github.com/pgvector/pgvector)
- [Qdrant repository](https://github.com/qdrant/qdrant)
- [Milvus repository](https://github.com/milvus-io/milvus)
- [Weaviate repository](https://github.com/weaviate/weaviate)
- [Chroma repository](https://github.com/chroma-core/chroma)
- [LanceDB repository](https://github.com/lancedb/lancedb)
- [Vespa repository](https://github.com/vespa-engine/vespa)
- [OpenSearch repository](https://github.com/opensearch-project/OpenSearch)
- [Elasticsearch `LICENSE.txt`](https://github.com/elastic/elasticsearch/blob/main/LICENSE.txt)
- [Redis `LICENSE.txt`](https://github.com/redis/redis/blob/unstable/LICENSE.txt) and [Valkey repository](https://github.com/valkey-io/valkey)
- [LlamaIndex repository](https://github.com/run-llama/llama_index)
- [Haystack repository](https://github.com/deepset-ai/haystack)
- [Docling repository](https://github.com/docling-project/docling)
- [Unstructured repository](https://github.com/Unstructured-IO/unstructured)
- [Cloud Native AI whitepaper](https://github.com/cncf/tag-runtime/blob/main/wgs/cnai/whitepapers/cloudnativeai.md)
- [CNCF landscape source](https://github.com/cncf/landscape/blob/master/landscape.yml)
