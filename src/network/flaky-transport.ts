import type { Job, JobRequest, JobTransport } from '../jobs/types.ts';
import { JobService } from '../server/job-service.ts';
import { ResponseLostError } from './errors.ts';

export interface Attempt {
  readonly requestId: string;
  readonly jobId: string;
  readonly created: boolean;
  readonly response: 'lost' | 'delivered';
}

/** Deterministically drops responses AFTER the service has accepted a request. */
export class FlakyTransport implements JobTransport {
  private readonly service: JobService;
  private readonly lostResponses: number;
  private readonly attempts: Attempt[] = [];

  constructor(service: JobService, lostResponses = 1) {
    if (!Number.isSafeInteger(lostResponses) || lostResponses < 0) {
      throw new RangeError('lostResponses must be a non-negative safe integer.');
    }
    this.service = service;
    this.lostResponses = lostResponses;
  }

  async send(request: JobRequest): Promise<Job> {
    const { job, created } = this.service.acceptJob(request);
    const response = this.attempts.length < this.lostResponses ? 'lost' : 'delivered';
    this.attempts.push(
      Object.freeze({ requestId: request.requestId, jobId: job.id, created, response }),
    );

    if (response === 'lost') {
      throw new ResponseLostError();
    }
    return job;
  }

  get history(): readonly Attempt[] {
    return [...this.attempts];
  }
}
