export interface JobInput {
  readonly kind: 'thumbnail' | 'report';
  readonly source: string;
}

export interface JobRequest {
  readonly requestId: string;
  readonly input: JobInput;
}

export interface Job {
  readonly id: string;
  readonly input: JobInput;
}

export interface JobTransport {
  send(request: JobRequest): Promise<Job>;
}
