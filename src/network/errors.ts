export class ResponseLostError extends Error {
  constructor() {
    super('The server accepted the request, but its response was lost.');
    this.name = 'ResponseLostError';
  }
}

export class RequestConflictError extends Error {
  constructor() {
    super('This request ID was already used for a different job.');
    this.name = 'RequestConflictError';
  }
}
