# Ten-minute Threadnote recording guide

Audience: engineers and engineering leads. The key moment is a teammate's different coding agent reading a decision published by the first engineer.

## Prepare before recording

1. Run `npm ci`, `npm run demo:compare`, and `npm run typecheck` in this repository. Enlarge the terminal and source editor.
2. Install Threadnote using its [current setup guide](https://threadnote.io/docs/). Connect the two supported agent clients you want to show.
3. Use two genuinely independent Threadnote environments. Two users or machines are easiest. A same-machine rehearsal requires separate Threadnote homes and agent processes configured to use them; two chat tabs sharing one home demonstrate personal continuity.
4. Give both environments a checkout of this repository and use project `threadnote-demo`. Label simulated teammate environments honestly.
5. Configure both environments with the same **dedicated demo memory Git repository**. Keep that memory repository separate from this code repository and from existing personal/team knowledge. Creating or connecting it is a rehearsal step; this repository does not do it automatically.
6. In each clean source checkout, run `threadnote graph index --no-vectors` and `threadnote graph status`. Prepare indexing outside the recording. After any source edit, refresh before demonstrating citation validation.
7. Capture the decision with citations only after the source is committed and the current graph is ready. Confirm citations are finalized and the publication preview succeeds.
8. Rehearse publication, teammate sync/recall/read, and code inspection end to end. Keep actual tool results visible. If a run is slow, use an honestly labeled clip from the rehearsal.

Each agent must use its intended Threadnote home consistently for storing, sharing, graph preparation, and MCP. For a same-machine rehearsal, set `THREADNOTE_HOME` in that agent's MCP server environment to a different absolute directory for each participant. Use the supported installer to configure the client, and check the effective configuration before recording. Do not change the main installation's team settings merely to stage the demo.

## Timeline

| Time       | Screen action                                                    | Narration cue                                                                          |
| ---------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 0:00–0:50  | Camera; “How often do we explain the same thing twice?”          | A useful discovery gets repeated across teammates and agent conversations.             |
| 0:50–1:30  | Draw engineer A → team Git memory → engineer B                   | Threadnote lets different supported agents use selected team knowledge.                |
| 1:30–2:50  | Run `npm run demo:compare`; open `submit-job.ts`                 | A lost response makes a retry ambiguous. Show two jobs versus one; capture the reason. |
| 2:50–4:00  | Inspect the memory, publication preview, and approved Git change | Share the reviewed durable decision. Keep the handoff personal.                        |
| 4:00–5:35  | Switch to the fresh teammate agent; paste the backoff task       | Point to the actual shared memory read and its influence on the plan.                  |
| 5:35–7:05  | Inspect source relationships and code-linked Context Brief       | Check the captured code evidence and report uncertainty accurately.                    |
| 7:05–8:05  | Show durable decision next to a personal handoff                 | Reusable knowledge and work-in-progress status have different lifecycles.              |
| 8:05–9:00  | Show connection status and team setup                            | Explain local retrieval, explicit sharing, and ordinary engineering review.            |
| 9:00–10:00 | Camera; one repo, two engineers, three decisions, one week       | Invite a small pilot around knowledge the team repeatedly explains.                    |

## Copy-and-paste prompts

### Engineer A: investigate and capture

```text
This is a small demo repository. Run the safe and unsafe job-submission
examples and explain why they create different numbers of jobs. Inspect
the implementing source and relevant tests. Use Threadnote's code graph
for source relationships and distinguish verified edges from inference.
```

After reviewing the explanation:

```text
Save the verified job-submission retry decision and its rationale as a
private Threadnote durable memory. Use project threadnote-demo and topic
retry-contract. Cite src/jobs/submit-job.ts, src/server/job-service.ts,
and src/network/retry.ts from the current graph. Include the in-memory
scope and the fact that retry exhaustion may leave an accepted job.
Save a separate personal handoff with actual checks and the next step:
investigate bounded exponential backoff. Do not publish either record yet.
```

### Engineer A: review and publish

```text
Preview publishing the threadnote-demo/retry-contract durable memory to
the demo team. Show the exact shared content and wait for my approval.
```

Review the complete preview. Then approve only the named record and team:

```text
Publish that reviewed retry-contract memory to the demo team.
```

Use the actual configured team name if it differs. Show the resulting Git commit. The handoff stays private.

### Engineer B: retrieve and plan

In a fresh conversation using the independent teammate environment:

```text
Add bounded exponential backoff to job submission. Before editing, use
Threadnote with project threadnote-demo to find relevant team decisions,
read them, inspect the current implementation, and propose a short plan
with regression tests. Explain the source of each constraint.
```

Show the actual `recall_context` / `read_context` results and the shared record. Do not paste the contract itself into this prompt. This is a product workflow demonstration: the repository's documentation and tests also reveal the contract, so it is not a controlled claim that memory was the agent's only possible source.

### Engineer B: connect code and memory

```text
Inspect submitJob and retryRequest using Threadnote's code graph. Follow
the returned stable handles to their definitions or relationships.
Request a Context Brief anchored to src/jobs/submit-job.ts and
src/network/retry.ts. Read the relevant cited decision, explain citation
status and coverage gaps, and verify the source before recommending edits.
```

Show the saved decision alongside the actual code. An unchanged citation means the captured source evidence is unchanged; it does not prove the prose is correct. If the graph is unavailable or stale, refresh it outside the recording and retry. Do not narrate missing evidence as verified.

## CLI reference for rehearsal

Run source commands from this checkout and in the intended participant's environment:

```sh
threadnote graph index --no-vectors
threadnote graph query --query submitJob
threadnote graph query --query retryRequest
threadnote graph path --from submitJob --to retryRequest
threadnote context brief \
  --task "Plan bounded backoff while checking the remembered retry contract" \
  --project threadnote-demo \
  --code-ref src/jobs/submit-job.ts \
  --code-ref src/network/retry.ts \
  --budget-tokens 1500 \
  --json
```

Memory capture is a deliberate write. After reviewing [the sample decision](retry-contract.md) against the current code:

```sh
threadnote remember \
  --kind durable \
  --project threadnote-demo \
  --topic retry-contract \
  --require-current-code-refs \
  --code-ref src/jobs/submit-job.ts \
  --code-ref src/server/job-service.ts \
  --code-ref src/network/retry.ts \
  --stdin < demo/retry-contract.md
```

The file includes teaching-fixture framing on purpose. An agent can instead author a shorter reviewed memory using the same verified evidence. Reuse the returned URI with `--replace-uri` when revising an existing memory rather than creating duplicate topics.

To connect a dedicated memory remote, replace `DEMO_MEMORY_REMOTE` with its real Git URL in each participant's environment:

```sh
threadnote share init DEMO_MEMORY_REMOTE --team loom-demo
threadnote share status
```

Preview a selected memory using the actual `threadnote://` URI returned by capture:

```sh
threadnote share publish MEMORY_URI --team loom-demo --preview
```

After explicit approval, run the same publication command without `--preview`. In the teammate environment:

```sh
threadnote share sync --team loom-demo
threadnote recall --project threadnote-demo --query "job submission backoff"
```

Read the returned shared memory before using it. These commands contain placeholders; they are instructions, not a setup script or an assertion that the share is already configured.

## Optional changed-citation scene

In a disposable rehearsal checkout, make a small, visible change to the cited retry implementation, prepare its current graph, and request the same code-linked Context Brief. Show the actual resulting status. Leave the stored memory untouched so the comparison remains meaningful. This scene illustrates source evidence changing; it does not establish that the decision itself has become wrong.

## Keep the recording focused

Use the terminal output and two source files as the visual anchor. Avoid scrolling through long tool JSON, installing dependencies live, or spending the central minute on settings. The strongest moment is the teammate retrieving a real shared record and explaining how it affects a real plan.
