import { describe, expect, it, vi } from 'vitest';
import { ResponseLostError } from '../src/network/errors.ts';
import { retryRequest } from '../src/network/retry.ts';

describe('retryRequest', () => {
  it('returns the first success without repeating work', async () => {
    const operation = vi.fn().mockResolvedValue('done');
    await expect(retryRequest(operation)).resolves.toBe('done');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('stops at the attempt budget and preserves the final error', async () => {
    const error = new ResponseLostError();
    const operation = vi.fn().mockRejectedValue(error);
    await expect(retryRequest(operation, { maxAttempts: 2 })).rejects.toBe(error);
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('does not retry a permanent failure', async () => {
    const error = new Error('Permission denied');
    const operation = vi.fn().mockRejectedValue(error);
    await expect(retryRequest(operation)).rejects.toBe(error);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it.each([0, -1, 1.5, 11, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid attempt budget %s before sending',
    async (maxAttempts) => {
      const operation = vi.fn();
      await expect(retryRequest(operation, { maxAttempts })).rejects.toBeInstanceOf(RangeError);
      expect(operation).not.toHaveBeenCalled();
    },
  );
});
