import { test, expect } from '@playwright/test';
import path from 'path';
import { runJob } from '../src/runner';

test('runner executes steps on local sample page', async () => {
  const samplePath = path.resolve(__dirname, '../../../sample_pages/contact.html');
  const url = 'file://' + samplePath;
  const result = await runJob({
    id: 'job1',
    runId: 'run1',
    url,
    steps: [
      { action: 'fill', selector: "input[name='name']", value: 'Alec' },
      { action: 'fill', selector: "input[name='email']", value: 'alec@example.com' },
      { action: 'fill', selector: "textarea[name='message']", value: 'Hello from bot!' },
      { action: 'click', selector: "button[type='submit']" },
      { action: 'wait', selector: '#success', timeout: 5000 },
      { action: 'screenshot', selector: 'body' },
    ],
  });
  expect(result.ok).toBeTruthy();
});


