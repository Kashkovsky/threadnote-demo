import { randomUUID } from 'node:crypto';
import { retryRequest, type RetryOptions } from '../network/retry.ts';
import type { Job, JobInput, JobTransport } from './types.ts';

export interface SubmitOptions extends RetryOptions {
  readonly createRequestId?: () => string;
}

export async function submitJob(
  transport: JobTransport,
  input: JobInput,
  { createRequestId = randomUUID, maxAttempts }: SubmitOptions = {},
): Promise<Job> {
  const request = Object.freeze({
    requestId: createRequestId(),
    input: Object.freeze({ ...input }),
  });

  return retryRequest(() => transport.send(request), { maxAttempts });
}
