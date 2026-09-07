import assert from 'node:assert/strict';
import { unsafeSubmitJob } from '../examples/unsafe-submit-job.ts';
import { submitJob } from './jobs/submit-job.ts';
import { FlakyTransport } from './network/flaky-transport.ts';
import { JobService } from './server/job-service.ts';

async function showScenario(mode: 'safe' | 'unsafe'): Promise<void> {
  const service = new JobService();
  const transport = new FlakyTransport(service, 1);
  let requestNumber = 0;
  const submit = mode === 'safe' ? submitJob : unsafeSubmitJob;
  const job = await submit(
    transport,
    { kind: 'thumbnail', source: 'demo-image.png' },
    {
      createRequestId: () => `request-${++requestNumber}`,
    },
  );

  console.log(`\n${mode === 'safe' ? 'SAFE' : 'INTENTIONALLY UNSAFE'} JOB SUBMISSION`);
  console.log('The first request is accepted. Its response is lost. The client retries.\n');
  for (const [index, attempt] of transport.history.entries()) {
    console.log(`  Attempt ${index + 1}: ${attempt.requestId}`);
    console.log(`    Server: ${attempt.created ? 'created' : 'reused '} ${attempt.jobId}`);
    console.log(`    Response: ${attempt.response}`);
  }
  console.log(`\n  Client received: ${job.id}`);
  console.log(`  Jobs created: ${service.jobCount}`);
  console.log(
    mode === 'safe'
      ? '  Result: two attempts, one job. The request ID survived the retry.\n'
      : '  Result: two attempts, TWO jobs. A new request ID created duplicate work.\n',
  );

  assert.equal(transport.history.length, 2);
  assert.equal(service.jobCount, mode === 'safe' ? 1 : 2);
}

const mode = process.argv[2] ?? 'safe';
if (mode === 'compare') {
  await showScenario('unsafe');
  await showScenario('safe');
} else if (mode === 'safe' || mode === 'unsafe') {
  await showScenario(mode);
} else {
  console.error('Usage: node src/demo.ts [safe|unsafe|compare]');
  process.exitCode = 1;
}
