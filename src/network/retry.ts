import { ResponseLostError } from './errors.ts';

export interface RetryOptions {
  readonly maxAttempts?: number;
}

export async function retryRequest<T>(
  operation: () => Promise<T>,
  { maxAttempts = 3 }: RetryOptions = {},
): Promise<T> {
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 10) {
    throw new RangeError('maxAttempts must be an integer between 1 and 10.');
  }

  for (let attempt = 1; ; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (!(error instanceof ResponseLostError) || attempt === maxAttempts) {
        throw error;
      }
    }
  }
}
