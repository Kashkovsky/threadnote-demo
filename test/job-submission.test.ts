import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { unsafeSubmitJob } from '../examples/unsafe-submit-job.ts';
import { submitJob } from '../src/jobs/submit-job.ts';
import { FlakyTransport } from '../src/network/flaky-transport.ts';
import { RequestConflictError, ResponseLostError } from '../src/network/errors.ts';
import { JobService } from '../src/server/job-service.ts';

const input = { kind: 'thumbnail', source: 'demo.png' } as const;

describe('job submission', () => {
  it('reuses the accepted job after its response is lost', async () => {
    const service = new JobService();
    const transport = new FlakyTransport(service);
    let idsCreated = 0;
    const result = await submitJob(transport, input, {
      createRequestId: () => `request-${++idsCreated}`,
    });
    expect(result.id).toBe('job-1');
    expect(service.jobCount).toBe(1);
    expect(idsCreated).toBe(1);
    expect(transport.history.map((attempt) => attempt.requestId)).toEqual([
      'request-1',
      'request-1',
    ]);
    expect(transport.history.map((attempt) => attempt.created)).toEqual([true, false]);
  });

  it('reproduces duplicate work in the intentionally unsafe example', async () => {
    const service = new JobService();
    const transport = new FlakyTransport(service);
    let id = 0;
    await unsafeSubmitJob(transport, input, { createRequestId: () => `request-${++id}` });
    expect(service.jobCount).toBe(2);
    expect(transport.history.map((attempt) => attempt.requestId)).toEqual([
      'request-1',
      'request-2',
    ]);
  });

  it('treats two independent submissions of identical input as two jobs', async () => {
    const service = new JobService();
    const transport = new FlakyTransport(service, 0);
    let id = 0;
    const options = { createRequestId: () => `request-${++id}` };
    const first = await submitJob(transport, input, options);
    const second = await submitJob(transport, input, options);
    expect(first.id).not.toBe(second.id);
    expect(service.jobCount).toBe(2);
  });

  it('rejects an ID reused for different input without creating another job', async () => {
    const service = new JobService();
    const transport = new FlakyTransport(service, 0);
    const options = { createRequestId: () => 'same-id' };
    await submitJob(transport, input, options);
    await expect(
      submitJob(transport, { ...input, source: 'other.png' }, options),
    ).rejects.toBeInstanceOf(RequestConflictError);
    expect(service.jobCount).toBe(1);
  });

  it('snapshots input before retrying', async () => {
    const service = new JobService();
    const transport = new FlakyTransport(service, 1);
    const mutableInput = { ...input, source: 'original.png' };
    const result = submitJob(
      {
        async send(request) {
          const response = transport.send(request);
          mutableInput.source = 'edited.png';
          return response;
        },
      },
      mutableInput,
    );
    expect((await result).input.source).toBe('original.png');
    expect(service.jobCount).toBe(1);
  });

  it('creates one job for every bounded response-loss and retry-budget combination', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 12 }),
        fc.integer({ min: 1, max: 10 }),
        fc.string({ minLength: 1, maxLength: 32 }),
        async (lostResponses, maxAttempts, source) => {
          const service = new JobService();
          const transport = new FlakyTransport(service, lostResponses);
          const result = submitJob(
            transport,
            { kind: 'report', source },
            {
              maxAttempts,
              createRequestId: () => 'one-operation',
            },
          );
          if (lostResponses < maxAttempts) {
            await expect(result).resolves.toMatchObject({ id: 'job-1' });
          } else {
            await expect(result).rejects.toBeInstanceOf(ResponseLostError);
          }
          expect(service.jobCount).toBe(1);
          expect(transport.history).toHaveLength(Math.min(lostResponses + 1, maxAttempts));
          expect(new Set(transport.history.map((attempt) => attempt.requestId)).size).toBe(1);
        },
      ),
      { numRuns: 100, seed: 20260907 },
    );
  });

  it('deduplicates arbitrary repeated request sequences by operation identity', () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: 0, max: 12 }), { maxLength: 40 }), (ids) => {
        const service = new JobService();
        for (const id of ids) {
          service.acceptJob({ requestId: `request-${id}`, input });
        }
        expect(service.jobCount).toBe(new Set(ids).size);
      }),
      { numRuns: 100, seed: 20260907 },
    );
  });
});
