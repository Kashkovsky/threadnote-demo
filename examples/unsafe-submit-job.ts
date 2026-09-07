import { randomUUID } from 'node:crypto';
import { retryRequest } from '../src/network/retry.ts';
import type { Job, JobInput, JobTransport } from '../src/jobs/types.ts';
import type { SubmitOptions } from '../src/jobs/submit-job.ts';

/** Intentionally incorrect: each retry looks like a new operation to the service. */
export async function unsafeSubmitJob(
  transport: JobTransport,
  input: JobInput,
  { createRequestId = randomUUID, maxAttempts }: SubmitOptions = {},
): Promise<Job> {
  return retryRequest(() => transport.send({ requestId: createRequestId(), input: { ...input } }), {
    maxAttempts,
  });
}
