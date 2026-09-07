import { RequestConflictError } from '../network/errors.ts';
import type { Job, JobRequest } from '../jobs/types.ts';

export interface AcceptedJob {
  readonly job: Job;
  readonly created: boolean;
}

/** A single-process, in-memory service for this recording fixture. */
export class JobService {
  private readonly jobsByRequestId = new Map<string, Job>();

  acceptJob({ requestId, input }: JobRequest): AcceptedJob {
    if (requestId.trim().length === 0) {
      throw new TypeError('requestId must not be empty.');
    }

    const existing = this.jobsByRequestId.get(requestId);
    if (existing) {
      if (existing.input.kind !== input.kind || existing.input.source !== input.source) {
        throw new RequestConflictError();
      }
      return { job: existing, created: false };
    }

    const job = Object.freeze({
      id: `job-${this.jobsByRequestId.size + 1}`,
      input: Object.freeze({ ...input }),
    });
    this.jobsByRequestId.set(requestId, job);
    return { job, created: true };
  }

  get jobCount(): number {
    return this.jobsByRequestId.size;
  }
}
