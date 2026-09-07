# Sample decision: job submission retry contract

This file is presenter material, not a stored Threadnote memory or a record of a tool result. Review the implementation before capturing it through Threadnote.

## Decision

Create one request ID per logical job submission and reuse that ID and the same input for every retry. Generate a new ID for a genuinely separate submission, even when its input is identical.

## Why

The service may have accepted a request even when the response is lost. A new ID on the next attempt looks like a new operation and creates duplicate work. Reusing the original ID lets this service return the already-created job. Reusing an ID for different input is a conflict.

## Source to cite

- `src/jobs/submit-job.ts` — captures the ID and input before entering the retry loop.
- `src/server/job-service.ts` — deduplicates by ID and rejects conflicting input.
- `src/network/retry.ts` — applies the attempt budget and retries only modeled response loss.

## Boundaries

Deduplication is in-memory for one service instance. This is a recording fixture, not a distributed exactly-once guarantee. A caller may exhaust the retry budget after the job has been created.

## Implication for a future change

Adding backoff should change retry timing while preserving operation identity, input stability, bounded attempts, and permanent-error behavior. Verify the current implementation and tests before applying this decision.
