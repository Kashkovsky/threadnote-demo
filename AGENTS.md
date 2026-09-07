# Working in the Threadnote demo

This is a deliberately small TypeScript recording fixture with an in-memory service and deterministic response loss.
Keep changes easy to explain on screen. Production infrastructure and external service dependencies are out of scope.

When Threadnote is connected:

1. Recall relevant context with project `threadnote-demo` and this checkout's absolute `callerCwd`.
2. Read useful returned memory pointers before using their contents.
3. Use the code graph to locate and trace unfamiliar source, then verify the exact code.
4. For code-linked context, use the discovered repository-relative paths with Context Brief and check citation status and coverage gaps.
5. Save reusable findings and a personal handoff when finishing meaningful work. Preview and obtain approval before publishing a durable memory to a team.

If Threadnote is unavailable, say so and inspect the source directly. Never invent memory or graph results.
Presenter documentation under `demo/` describes the demonstration; it is not evidence that a tool returned a result.

Use `npm run typecheck` and focused Vitest tests for changed behavior. Add a bounded Fast-check property when a useful invariant exists.
CI runs the full suite and both executable scenarios. The intentionally unsafe example must remain visibly labeled and separate from the safe implementation.
