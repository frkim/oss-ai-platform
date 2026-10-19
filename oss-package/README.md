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

### Windows / PowerShell (without WSL)

Use Windows PowerShell 5.1 or PowerShell 7, **Docker Desktop with its Hyper-V
backend**, and [Ollama for Windows](https://ollama.com/download/windows).
Docker Desktop still runs **Linux containers in a Hyper-V VM**; this is not an
all-native Windows deployment. A supported Windows edition with Hyper-V (such
as Pro, Enterprise or Education), hardware virtualization and sufficient
resources are required; check the
[Docker Windows prerequisites](https://docs.docker.com/desktop/setup/install/windows-install/).
In Docker Desktop, disable **Use the WSL 2 based engine** and switch to **Linux
containers**, not Windows containers. Compose **2.24.4+** is required for the override.

1. Install and start native Ollama. To make it reachable from Docker Desktop,
   set its listening address in PowerShell:

   ```powershell
   [Environment]::SetEnvironmentVariable('OLLAMA_HOST', '0.0.0.0:11434', 'User')
   ```

   **Quit and restart the Ollama application** to apply this setting (or set
   `$env:OLLAMA_HOST = '0.0.0.0:11434'` in the shell before `ollama serve`).
   Ollama has no API authentication: binding to `0.0.0.0` can expose inference
   and model-management APIs to your network. Restrict inbound access with
   Windows Firewall to the Docker Desktop/Hyper-V network; do not allow public
   or unrestricted LAN access. Do not disable the firewall.
2. Run from PowerShell:

   ```powershell
   cd oss-package
   .\deploy.ps1 up
   .\deploy.ps1 test
   ```

   If local script execution is blocked, use an approved execution policy for
   your environment (for example, `Set-ExecutionPolicy -Scope Process RemoteSigned`
   for this session, where permitted).

`deploy.ps1` generates `.env` secrets without overwriting existing values,
starts the container services, downloads the configured models through the
native Ollama API, checks readiness and prints URLs and credentials. Keep `.env`
private; it is ignored by Git. The script restricts its Windows ACL to the current
user (explicit permissions already present are retained).
It always combines `docker-compose.yml` with `docker-compose.windows.yml`:
containerized Ollama is disabled and LiteLLM connects to
`http://host.docker.internal:11434`. If you change `OLLAMA_PORT` in `.env`, also
change native Ollama's listening port. A container-side connectivity check reports
Ollama binding/firewall problems before model downloads.

The same commands are available: `status`, `logs`, `down`, `reset`. `down` leaves
native Ollama running; `reset` requires typing `yes` and deletes container data,
**not native Ollama models**. Manage those separately with `ollama rm`.
Do not mix Bash and PowerShell deployments in the same running Compose project;
stop the old stack with its original script before switching.

There is no `--gpu` flag in `deploy.ps1`: native Ollama uses supported Windows GPU
drivers automatically. Docker's NVIDIA container GPU passthrough requires the
[WSL2 backend](https://docs.docker.com/desktop/features/gpu/) and cannot be used
with this Hyper-V setup. The existing Bash deployment and GPU override are unchanged.

## Use the gateway

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" -H "Content-Type: application/json" \
  -d '{"model":"chat","messages":[{"role":"user","content":"Hello"}]}'
```

`LITELLM_MASTER_KEY` is in `.env`. Any OpenAI SDK works with `base_url=http://localhost:4000/v1` and that key as the API key. `./deploy.sh test` uses the generated key automatically. To add a commercial provider, set its key in `.env` and uncomment the model in `config/litellm.yaml`.

## Deployment tests

From the repository root, run `node --test oss-package/test/deploy.test.js`
(Node.js 18+). PowerShell tests require `pwsh` on Unix or `powershell.exe` on Windows;
Compose checks require Docker Compose. Tests use temporary directories and mocked
services (including a local HTTP server); they do not start the stack or download models.

## Scope

This is a development setup: single node, no TLS, no high availability. For production use the Kubernetes designs in the pillar documents.
