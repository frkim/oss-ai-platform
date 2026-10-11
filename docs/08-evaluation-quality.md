# P08. Evaluation and quality

> **TL;DR** - Treat quality as an engineering discipline with its own datasets, owners and gates. Run cheap deterministic and judge-based evals offline on every prompt, retrieval, routing, tool or model change; sample and score production traffic online; calibrate automated judges against human labels; and block releases on regression thresholds in CI. Default stack: **promptfoo** or **DeepEval** for application regression gates, **Ragas** for RAG metrics, **Inspect AI** for agent and safety evals, **lm-evaluation-harness** for model benchmarks, with traces and scores stored in an OTel-fed LLM UI from [P07](./07-observability-evaluation.md).

*Snapshot: 2026-10-11 · Related: [Observability](./07-observability-evaluation.md) · [Knowledge and context](./05-data-knowledge-rag.md) · [Agents, tools and protocols](./06-agents-mcp.md) · [Model lifecycle and adaptation](./04-model-lifecycle-adaptation.md) · [Security and safety](./09-security-safety.md) · [AI gateway and routing](./02-ai-gateway-routing.md)*

## 1. Why it matters

Telemetry ([P07](./07-observability-evaluation.md)) tells you what happened. Evaluation tells you whether it was good. Without it, every prompt edit, chunking change, router rule or model upgrade is a blind release, and AI regressions are usually silent: HTTP 200, fluent text, wrong answer.

Evaluation also has a different cadence and ownership than telemetry: datasets are product assets curated by domain owners, thresholds are agreed with product and risk, and gates run in CI rather than in dashboards.

Ownership boundaries:

- **Telemetry, traces and cost data** come from [P07](./07-observability-evaluation.md); this pillar scores them and writes scores back.
- **RAG pipelines and prompt/context assets** are built in [P05](./05-data-knowledge-rag.md); this pillar measures retrieval and answer quality.
- **Agent behaviour and tool policy** are defined in [P06](./06-agents-mcp.md); this pillar scores trajectories and tool use.
- **Candidate model selection, fine-tunes and rollout of new versions** happen in [P04](./04-model-lifecycle-adaptation.md); this pillar provides the evidence and the promotion gate.
- **Red-team and guardrail policy** are owned by [P09](./09-security-safety.md); safety evals here verify that policy works.
- **Routing policy** in [P02](./02-ai-gateway-routing.md) (cheap vs strong model) must be validated by evals before it ships.

## 2. Capability map

| Capability | What it must do | Notes |
|------------|-----------------|-------|
| **Datasets and golden sets** | Versioned inputs, expected outputs or rubrics, tagged by scenario and risk | Treated like code: reviewed, owned, retired deliberately |
| **Offline evaluation** | Run a fixed dataset against a candidate (prompt, model, retriever, agent) and score it | Fast enough for pull requests; broader suites nightly |
| **Online evaluation** | Score sampled production traffic and collect user feedback | Catches drift and cases no dataset anticipated |
| **Automated judges** | LLM-as-judge and heuristic scorers with rubrics | Secondary evidence; must be calibrated |
| **RAG evaluation** | Separate retrieval metrics from generation metrics | Context precision/recall, faithfulness, answer relevance |
| **Agent and trajectory evaluation** | Score task success, step efficiency, tool selection and arguments, safety of actions | Needs traces from P07 and a sandbox |
| **Safety evaluation** | Jailbreak, prompt injection, data leakage, harmful content, over-refusal | Run continuously, not once before launch |
| **Regression gates** | Fail or pause rollouts when thresholds are crossed | Applies to prompt, parser, routing, embedding and model changes |
| **Experiment design** | Shadow, canary and A/B testing with guardrail metrics | Pairs with rollout in [P04](./04-model-lifecycle-adaptation.md) |
| **Human feedback loop** | Review queues, labels, disagreement handling, feedback into datasets | Calibration anchor for everything automated |
| **Benchmark selection** | Public benchmarks for model comparison, kept apart from app evals | Contamination and relevance caveats |

## 3. Tool comparison

Licences, stars (rounded to 0.1k), push dates and archived flags were read from upstream repositories on 2026-10-11 (**Opened**). Re-check with [Methodology §5](./00-methodology.md#5-snapshot-and-refresh). Picks are driven by interoperability (CI-friendly, OTel/OpenAI-compatible endpoints), licence and adoption.

| Capability | Default pick | Licence label | Steward | Alternatives | Choose X when… |
|------------|--------------|---------------|---------|--------------|----------------|
| **Application and prompt regression gates** | **promptfoo** (25.9k★; active, pushed 2026-10-11) | `OSI` ✅ (MIT) | promptfoo maintainers | DeepEval (`OSI` ✅ Apache-2.0; 18.7k★; python-v4.2.4, 2026-09-22), OpenEvals (`OSI` ✅ MIT; 1.2k★, LangChain), Opik evals (`OSI` ✅ Apache-2.0; 22.5k★) | Choose **promptfoo** for declarative YAML assertions, matrix runs across models and prompts, and CI; choose **DeepEval** when tests already live in pytest and you want its metric library |
| **RAG metrics** | **Ragas** (16.0k★; v0.4.3 January 2026, last push 2026-02-24, so slower than peers) | `OSI` ✅ (Apache-2.0) | Ragas maintainers (`vibrantlabsai/ragas`) | DeepEval RAG metrics, TruLens (`OSI` ✅ MIT; 3.6k★), Phoenix evals (`Source-available` ⚠️ Elastic-2.0; 11.8k★) | Choose **Ragas** when retrieval quality, faithfulness and context use are the main questions; fall back to DeepEval or TruLens if maintenance stalls |
| **Agent, tool-use and safety evals** | **Inspect AI** (3.0k★; 0.3.278, 2026-10-09) | `OSI` ✅ (MIT) | UK AI Security Institute | Inspect Evals (`OSI` ✅ MIT; 0.7k★, ready-made tasks), promptfoo red-team mode, Giskard (`OSI` ✅ Apache-2.0; 5.9k★) | Choose **Inspect** for sandboxed multi-step agent tasks, tool-use scoring and a large community eval collection |
| **Model benchmark harness** | **lm-evaluation-harness** (14.2k★; v0.4.13, 2026-08-31) | `OSI` ✅ (MIT) | EleutherAI maintainers | LightEval (`OSI` ✅ MIT; 2.6k★; last tagged release v0.13.0, 2025-11), HELM (`OSI` ✅ Apache-2.0; 2.9k★; v0.5.16, 2026-04), OpenCompass (`OSI` ✅ Apache-2.0; 7.5k★) | Choose **lm-eval-harness** for standard academic tasks against any OpenAI-compatible or local endpoint; choose **HELM** for broader holistic scenario coverage |
| **Experiments, datasets and score storage** | **Langfuse** (35.6k★) | `Open-core` ⚠️ (MIT outside `ee/` directories) | Langfuse, now part of ClickHouse | MLflow (`OSI` ✅ Apache-2.0; 28.3k★; v3.17.0), Opik (`OSI` ✅ Apache-2.0), Phoenix (`Source-available` ⚠️ Elastic-2.0) | Choose **Langfuse** for datasets, experiment runs and trace-linked scores in one UI, if the `ee/` boundary is acceptable; choose **MLflow** or **Opik** for a pure Apache-2.0 path |
| **Safety and red-team scanning** | **garak** (9.5k★; v0.17.0, 2026-09-09) | `OSI` ✅ (Apache-2.0) | NVIDIA | DeepTeam (`OSI` ✅ Apache-2.0; 3.0k★; last release v1.0.9, 2025-11), promptfoo red-team, Inspect safety tasks | Choose **garak** for broad vulnerability probes against a model endpoint; use **promptfoo** red-team when you want it inside the same CI runner. Policy and tooling depth: [P09](./09-security-safety.md) |
| **Drift and data-quality monitoring** | **Evidently** (8.0k★; v0.7.23, 2026-09-11) | `OSI` ✅ (Apache-2.0) | Evidently AI | Phoenix, Langfuse online evaluators | Choose **Evidently** for report-style drift, text-quality and test-suite monitoring alongside classic ML |

Notes:

- Ragas activity is slower than peers (last release January 2026); keep an escape path to DeepEval.
- Phoenix is `Source-available` (Elastic-2.0, no managed-service resale); Langfuse is `Open-core`. Prefer the Apache-2.0 options when licence risk matters.
- `openai/evals` (19.6k★; last push 2026-04) reports licence `NOASSERTION` through the API; **Unverified** whether it remains actively maintained, so it is not a default pick.
- Do not conflate benchmark harnesses with application evals: a strong MMLU-style score does not show your workflow works.

Default platform stance:

1. **One application-eval runner in CI** (promptfoo or DeepEval) and **one benchmark runner** (lm-eval-harness) for model comparison.
2. **Inspect AI** for agent and safety evals that need sandboxes and multi-turn scoring.
3. **Scores live next to traces** in the LLM UI from [P07](./07-observability-evaluation.md).
4. **Human labels are the anchor**; judges are calibrated against them.

## 4. Reference design

1. **Dataset repo.** Golden sets, rubrics and scenario tags in Git (or dataset registry), versioned and code-reviewed. Sources: domain experts, historical tickets, production traces sampled via P07, synthetic expansion marked as synthetic.
2. **Offline pipeline.** CI runs a small smoke set on every pull request (minutes) and a full suite nightly or before release. Candidates: prompt version, model, retriever config, routing policy, agent graph. Results are written as experiment runs with the git SHA and dataset version.
3. **Scorers.** Layered: deterministic checks (schema, regex, tool-call match, citation exists) first; embedding or heuristic metrics next; LLM judges for open-ended quality last.
4. **Gate.** Compare to the baseline run on the same dataset; fail on regression beyond a threshold per metric and per critical slice, not only on the mean.
5. **Progressive delivery.** After the offline gate: shadow traffic, then canary or A/B with guardrail metrics (latency, cost, refusal rate, safety flags). Rollout mechanics for models are in [P04](./04-model-lifecycle-adaptation.md), routing in [P02](./02-ai-gateway-routing.md).
6. **Online evaluation.** Sample production traces through the same scorers asynchronously; collect thumbs, edits and escalations; alert on score drops.
7. **Human loop.** Review queue for low-confidence, flagged and random samples; disagreements adjudicated; confirmed failures become new dataset rows.
8. **Reporting.** Scores per model, prompt version, tenant and scenario visible in dashboards; quality joins cost in [P10](./10-governance-finops.md) as cost per successful task.

Design rules:

- **Datasets are production assets.** Version, review, own and retire them.
- **Split dev and holdout sets.** Never tune prompts against the set that gates release.
- **Gate on slices** (language, tenant, risk tier), not only on the aggregate.
- **Judge scores are secondary evidence**; human review is the anchor.

## 5. Implementation guide

### 5.1 Offline vs online evaluation

| | Offline | Online |
|---|---|---|
| Data | Curated golden set, fixed | Live sampled traffic |
| Question | Is the candidate at least as good as the baseline? | Is quality holding in the real world? |
| Strengths | Reproducible, fast, pre-release, cheap | Real distribution, catches unknown unknowns |
| Weaknesses | Misses distribution shift and unforeseen cases | No ground truth; noisy; privacy and cost to score |
| Used for | CI gates, model/prompt/retriever comparison | Drift alerts, feedback mining, A/B outcomes |

Use both. Online failures feed the offline set; the offline set keeps old failures from returning.

### 5.2 Datasets and golden sets

- Start with 30 to 100 representative cases per major scenario; grow from incidents.
- Tag each row: scenario, difficulty, risk tier, language, source, expected behaviour (answer, refusal, escalate).
- Include negative cases: unanswerable questions, adversarial inputs, out-of-scope requests.
- Keep expected answers short and checkable, or use rubrics rather than single reference strings.
- Mark synthetic rows and review a sample; synthetic data inflates scores if generated by the model under test.
- Strip or pseudonymise personal data taken from production before it enters the repo.
- Hold out a locked test split that only the release gate sees.

### 5.3 LLM-as-judge: use it, but know the pitfalls

Known risks: position bias in pairwise comparisons, preference for longer answers, self-preference (a model favours its own family), sensitivity to rubric wording, non-determinism, and drift when the judge model is silently updated.

Mitigations:

- pin the judge model version and temperature 0; record both with each run
- use a different model family from the system under test
- randomise answer order in pairwise tests and run both orders
- use specific, decomposed rubrics with anchored scale points; prefer binary or low-cardinality scores
- ask for the reason before the score, and store it for audit
- calibrate: label 50 to 200 items by humans, measure judge agreement (for example Cohen's kappa or simple accuracy), and re-check after every judge or rubric change
- prefer deterministic checks wherever possible

### 5.4 RAG evaluation

Evaluate retrieval and generation separately so you know which stage failed:

- **Retrieval:** context recall, context precision, hit rate or MRR against labelled relevant chunks
- **Generation:** faithfulness (claims supported by context), answer relevance, citation correctness
- **End to end:** task success and refusal on unanswerable questions

Re-run when you change the chunker, embedding model, index, reranker or prompt ([P05](./05-data-knowledge-rag.md)). A frozen labelled retrieval set makes embedding changes comparable.

### 5.5 Agent, trajectory and tool-use evaluation

- **Outcome:** did the task finish correctly (check end state in a sandbox, not just the final text)?
- **Trajectory:** step count, redundant or looping calls, ordering, recovery from tool errors.
- **Tool use:** right tool selected, valid arguments, no forbidden tools, idempotence of side effects.
- **Safety of actions:** approval requested where required ([P06](./06-agents-mcp.md)), no data exfiltration, scoped permissions respected.
- **Efficiency:** tokens and cost per completed task.

Use sandboxed environments with seeded state and mocked or recorded tools for repeatability. Agents are stochastic: run each case several times and report pass rate, not a single pass/fail. Trajectories come from traces ([P07](./07-observability-evaluation.md)); Inspect AI is a good fit for multi-step scoring.

### 5.6 Safety evaluation

Cover prompt injection (direct and via retrieved content or tool output), jailbreaks, sensitive-data leakage, harmful content and **over-refusal** (benign requests wrongly blocked). Run a standing suite on every model, prompt or guardrail change, plus periodic broader scans with garak or promptfoo red-team. Findings and policy responses are handled in [P09](./09-security-safety.md); keep the regression cases here.

### 5.7 Regression gates in CI

Example promptfoo config used as a pull-request gate:

```yaml
description: support-bot regression gate
prompts:
  - file://prompts/support-v12.txt
providers:
  - id: openai:chat:gpt-gateway
    config:
      apiBaseUrl: https://ai-gateway.internal/v1
tests: file://datasets/support-golden.csv
defaultTest:
  assert:
    - type: llm-rubric
      value: Answers only from the provided policy and cites it
    - type: latency
      threshold: 4000
```

Wire it as a CI job that exits non-zero when assertions fail, and store the results as an experiment run with git SHA. Gate rules that work in practice:

- absolute floor per critical metric (for example safety pass rate must be 100% on the blocking set)
- no more than a small relative drop versus baseline on quality metrics, with confidence intervals or repeated runs for noisy scorers
- separate **blocking** and **advisory** suites so flaky metrics do not train teams to ignore the gate
- cap eval cost and runtime; use a smoke set on pull requests and the full set on merge or nightly
- trigger on every change to prompts, retriever settings, routing rules, parsers, embeddings, guardrails and model versions

### 5.8 A/B, shadow and canary testing

- **Shadow:** send a copy of production requests to the candidate, score offline, no user impact. Good for models and prompts; watch for side effects with tool-using agents (mock the tools).
- **Canary:** route a small share to the candidate with automatic rollback on guardrail metrics.
- **A/B:** randomise by user or session, define the primary metric and sample size beforehand, avoid peeking, and guard latency, cost and safety.
- Implement the split at the gateway ([P02](./02-ai-gateway-routing.md)) or the serving layer ([P03](./03-model-serving.md)); measure with trace-linked scores.

### 5.9 Human feedback loops

- Collect explicit feedback (thumbs, corrections) and implicit signals (edits, retries, escalation to a human).
- Maintain review queues with sampling by risk, low judge confidence and user dissent.
- Provide labelling guidelines and measure inter-annotator agreement.
- Close the loop weekly: new failures become dataset rows, new rubrics, or fine-tuning candidates ([P04](./04-model-lifecycle-adaptation.md)).
- Beware of biased feedback: users rarely rate, and dissatisfied users over-represent.

### 5.10 Choosing benchmarks

- Use public benchmarks (lm-eval-harness, HELM, OpenCompass, Inspect Evals) to **shortlist** models, not to approve them.
- Prefer tasks close to your workload (language, domain, tool use, long context); check for contamination risk and saturation.
- Run candidates on your own application dataset before any rollout decision.
- Record benchmark version, harness version, prompt format and decoding settings; small changes shift scores.
- Evaluate through the same serving stack you will run in production, since quantisation and engine choice change results ([P03](./03-model-serving.md), [P04](./04-model-lifecycle-adaptation.md)).

## 6. Operations

- **Dataset curation:** monthly review; retire stale rows; add failure cases after incidents.
- **Judge hygiene:** re-calibrate after judge model, rubric or provider changes; keep a human-labelled calibration set.
- **Threshold ownership:** product owns quality thresholds, risk owns safety thresholds, platform owns the runner and its reliability.
- **Flake control:** track variance per metric; rerun or widen thresholds instead of disabling.
- **Cost control:** budget eval spend; cache deterministic scorer results; sample online scoring.
- **Drift response:** a falling online score triggers the checklist: retrieval index version, prompt version, tool path, upstream model change, then dataset shift.
- **Incident loop:** every quality incident adds at least one regression case.

Operational heuristics:

- If a judge score rises while user complaints rise, the judge or dataset is stale: recalibrate.
- If offline passes but online drops, the dataset no longer matches traffic: resample from production.
- If an upstream hosted model changes silently, pinned snapshot IDs and nightly evals reveal it first.

## 7. Pitfalls

- **One score for everything.** Faithfulness, task success and user satisfaction are different signals.
- **Judge model same as system model**, or unpinned judge versions.
- **Tuning on the gating set.** Scores inflate and the gate stops meaning anything.
- **Aggregate-only gates** that hide a collapse in one tenant, language or risk tier.
- **Treating benchmarks as application evals.**
- **Skipping evals for non-model changes.** Chunking, parsers, routing and tool changes alter outcomes.
- **Flaky blocking tests** that teams learn to bypass.
- **Single-run agent evals** on stochastic systems.
- **Eval data with personal data** copied from production without review.
- **No online signal.** Offline-only teams discover drift from complaints.
- **Over-trusting synthetic data** generated by the model under test.

## 8. Checklist

### MVP

- [ ] One golden set (30 to 100 cases) in Git with owner and version
- [ ] One eval runner (promptfoo or DeepEval) executing in CI on prompt and model changes
- [ ] Deterministic checks (format, citations, tool-call validity) before any LLM judge
- [ ] Baseline results stored with git SHA; failing gate blocks merge

### Production

- [ ] Separate retrieval and generation metrics for RAG changes
- [ ] Judge model pinned, rubric versioned, calibrated against human labels
- [ ] Dev set and locked holdout separated; gates cover critical slices
- [ ] Online sampling scores production traces and writes scores back to traces ([P07](./07-observability-evaluation.md))
- [ ] Safety suite (injection, jailbreak, leakage, over-refusal) runs on every change
- [ ] Shadow or canary step with automatic rollback before full rollout
- [ ] Human review queue with feedback flowing into datasets

### Enterprise

- [ ] Agent and trajectory evals in sandboxes with repeated runs and pass-rate reporting
- [ ] A/B framework with pre-registered metrics and guardrails
- [ ] Benchmark policy: shortlist with public benchmarks, decide with application evals ([P04](./04-model-lifecycle-adaptation.md))
- [ ] Threshold ownership mapped to product, risk and platform; quality joined to cost in [P10](./10-governance-finops.md)
- [ ] Evidence retention for audits and model-risk reviews ([P10](./10-governance-finops.md))
- [ ] Post-incident process adds regression cases within an agreed SLA

## 9. Sources

Primary upstreams to re-check:

- [promptfoo repository](https://github.com/promptfoo/promptfoo)
- [DeepEval repository](https://github.com/confident-ai/deepeval) and [DeepTeam repository](https://github.com/confident-ai/deepteam)
- [Ragas repository](https://github.com/vibrantlabsai/ragas)
- [TruLens repository](https://github.com/truera/trulens)
- [OpenEvals repository](https://github.com/langchain-ai/openevals)
- [Inspect AI repository](https://github.com/UKGovernmentBEIS/inspect_ai) and [Inspect Evals repository](https://github.com/UKGovernmentBEIS/inspect_evals)
- [lm-evaluation-harness repository](https://github.com/EleutherAI/lm-evaluation-harness)
- [LightEval repository](https://github.com/huggingface/lighteval), [HELM repository](https://github.com/stanford-crfm/helm), [OpenCompass repository](https://github.com/open-compass/opencompass)
- [garak repository](https://github.com/NVIDIA/garak)
- [Giskard repository](https://github.com/Giskard-AI/giskard-oss)
- [Evidently repository](https://github.com/evidentlyai/evidently)
- [Langfuse repository](https://github.com/langfuse/langfuse), [Arize Phoenix repository](https://github.com/Arize-ai/phoenix), [MLflow repository](https://github.com/mlflow/mlflow), [Opik repository](https://github.com/comet-ml/opik)
- [openai/evals repository](https://github.com/openai/evals)

Licences, stars, release dates and archived flags were **Opened** on 2026-10-11. Practices in section 5 (judge calibration, gate design, A/B discipline) are architectural guidance, not tool facts. Refresh with [Methodology §5](./00-methodology.md#5-snapshot-and-refresh).
