# OSS AI platform package (developer edition)

A runnable, laptop-sized slice of the blueprint in [`../docs`](../docs), deployed with one command.

| Pillar | Component | Licence | Role |
|--------|-----------|---------|------|
| P02 Gateway | [LiteLLM](https://github.com/BerriAI/litellm) | MIT (core) | One OpenAI-compatible entry point, virtual keys, routing, usage tracking |
| P03 Serving | [Ollama](https://github.com/ollama/ollama) | MIT | Local inference (swap for vLLM on Kubernetes/GPU in production) |
| P05 Knowledge | [Qdrant](https://github.com/qdrant/qdrant) | Apache-2.0 | Vector store |
| P07 Observability | [Langfuse](https://github.com/langfuse/langfuse) | MIT (core) | Traces, cost and usage; every gateway call is traced |
| P13 Experience | [Open WebUI](https://github.com/open-webui/open-webui) | Open WebUI licence (source-available) | Chat and RAG UI on top of the gateway |
| State | PostgreSQL | PostgreSQL | Gateway and Langfuse metadata |

Verify licences and versions before adopting (see [methodology](../docs/00-methodology.md#5-snapshot-and-refresh)). Pillars not in this package (guardrails, evals, agents, policy, GitOps) are the next steps in the [roadmap](../docs/14-implementation-roadmap.md).

## Quick start

Requirements: Docker with Compose v2, ~8 GB free RAM and ~5 GB disk.

```bash
cd oss-package
./deploy.sh up          # add --gpu for NVIDIA GPUs
./deploy.sh test        # calls the gateway
```

`up` creates `.env` with random secrets, starts the stack, pulls the models and prints URLs and credentials. All ports bind to `127.0.0.1`.

Other commands: `status`, `logs`, `down`, `reset` (deletes data). Change ports in `.env`; change the local models in `config/litellm.yaml` (`ollama/...` entries are pulled automatically), then re-run `up`.

## Use the gateway

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" -H "Content-Type: application/json" \
  -d '{"model":"chat","messages":[{"role":"user","content":"Hello"}]}'
```

`$LITELLM_MASTER_KEY` is in `.env`. Any OpenAI SDK works with `base_url=http://localhost:4000/v1`. To add a commercial provider, set its key in `.env` and uncomment the model in `config/litellm.yaml`.

## Scope

This is a development setup: single node, no TLS, no high availability. For production use the Kubernetes designs in the pillar documents.
