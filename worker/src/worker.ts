import Fastify from 'fastify';
import { Worker, Queue, QueueEvents, JobsOptions } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { runJob } from './runner';
import { RESULTS_DIR, WORKER_CONCURRENCY, PER_DOMAIN_CONCURRENCY } from './config';
import pino from 'pino';

const prisma = new PrismaClient();
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  // BullMQ v5 requires this to be null to avoid breaking blocking commands
  maxRetriesPerRequest: null,
});

let successCount = 0;
let failureCount = 0;

const resultsDir = process.env.RESULTS_DIR || './results';
let logFile;
try {
  logFile = pino.destination({ dest: `${resultsDir}/worker.log`, append: true, mkdir: true });
} catch (error) {
  console.warn('Could not create log file, using stdout only:', (error as Error).message);
  logFile = process.stdout;
}
const logger = pino({ level: 'info' }, pino.multistream([{ stream: process.stdout }, { stream: logFile }]));
const app = Fastify({ logger });
app.get('/metrics', async () => ({ successCount, failureCount }));

async function main() {
  try {
    // Test Redis connection
    await connection.ping();
    console.log('Redis connection successful');
  } catch (error) {
    console.error('Redis connection failed:', error);
    console.log('Worker will not start without Redis connection');
    process.exit(1);
  }

  const queue = new Queue('jobs', { connection });
  const qe = new QueueEvents('jobs', { connection });

  // naive per-domain semaphore
  const domainCounts = new Map<string, number>();
  function getHost(url: string): string {
    try { return new URL(url).hostname; } catch { return 'unknown'; }
  }
  async function acquire(host: string) {
    for (;;) {
      const c = domainCounts.get(host) || 0;
      if (c < PER_DOMAIN_CONCURRENCY) { domainCounts.set(host, c + 1); return; }
      await new Promise((r) => setTimeout(r, 50));
    }
  }
  function release(host: string) {
    const c = domainCounts.get(host) || 1;
    domainCounts.set(host, Math.max(0, c - 1));
  }

  const worker = new Worker(
    'jobs',
    async (job) => {
      const jobId = (job.data as any).jobId as string;
      const jobRec = await prisma.job.findUnique({ where: { id: jobId } });
      if (!jobRec) throw new Error('Job not found');
      const run = await prisma.run.create({ data: { jobId, status: 'RUNNING', startedAt: new Date() } });
      const host = getHost(jobRec.url);
      await acquire(host);
      const result = await runJob({ 
        id: jobRec.id, 
        url: jobRec.url, 
        steps: jobRec.stepsJson as any[], 
        runId: run.id,
        config: (jobRec as any).configJson as any
      });
      release(host);
      if (result.ok) {
        await prisma.run.update({ where: { id: run.id }, data: { status: 'SUCCESS', logs: result.logs || '', finishedAt: new Date() } });
        successCount++;
      } else {
        const errorText = 'error' in result ? (result as any).error || 'Unknown' : 'Unknown';
        const screenshotPath = 'screenshot' in result ? (result as any).screenshot ?? null : null;
        await prisma.run.update({
          where: { id: run.id },
          data: { status: 'FAILED', logs: result.logs || '', error: errorText, screenshot: screenshotPath, finishedAt: new Date() },
        });
        failureCount++;
      }
    },
    { connection, concurrency: WORKER_CONCURRENCY }
  );

  worker.on('error', (err) => app.log.error({ err }, 'Worker error'));

  const port = Number(process.env.WORKER_PORT || 4001);
  await app.listen({ port, host: '0.0.0.0' });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});


