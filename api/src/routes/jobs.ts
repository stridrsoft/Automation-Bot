import { FastifyPluginCallback } from 'fastify';
import { z } from 'zod';
import { Queue } from 'bullmq';
import { getQueue } from '../lib/queue';
import { requireAuth } from '../lib/auth';

const stepSchema = z.object({
  action: z.enum(['fill', 'click', 'wait', 'screenshot', 'pause']),
  selector: z.string().optional(),
  value: z.string().optional(),
  timeout: z.number().optional(),
});

const createSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  steps: z.array(stepSchema).min(1),
  runImmediately: z.boolean().optional(),
  config: z.object({
    proxy: z.object({
      server: z.string().optional(),
      username: z.string().optional(),
      password: z.string().optional(),
      bypass: z.string().optional(),
    }).optional(),
    device: z.object({
      userAgent: z.string().optional(),
      viewport: z.object({
        width: z.number(),
        height: z.number(),
      }).optional(),
      deviceScaleFactor: z.number().optional(),
      isMobile: z.boolean().optional(),
      hasTouch: z.boolean().optional(),
      locale: z.string().optional(),
      timezoneId: z.string().optional(),
      geolocation: z.object({
        latitude: z.number(),
        longitude: z.number(),
      }).optional(),
      permissions: z.array(z.string()).optional(),
    }).optional(),
    fingerprintMasking: z.boolean().optional(),
    multiBot: z.object({
      enabled: z.boolean(),
      count: z.number().min(1).max(50),
      proxies: z.array(z.string()).optional(),
      devices: z.array(z.object({
        userAgent: z.string().optional(),
        viewport: z.object({
          width: z.number(),
          height: z.number(),
        }).optional(),
        deviceScaleFactor: z.number().optional(),
        isMobile: z.boolean().optional(),
        hasTouch: z.boolean().optional(),
        locale: z.string().optional(),
        timezoneId: z.string().optional(),
        geolocation: z.object({
          latitude: z.number(),
          longitude: z.number(),
        }).optional(),
        permissions: z.array(z.string()).optional(),
      })).optional(),
      delayBetweenBots: z.number().optional(),
      randomizeOrder: z.boolean().optional(),
    }).optional(),
    visualMode: z.object({
      enabled: z.boolean(),
      headless: z.boolean(),
      slowMo: z.number().optional(),
      showDevTools: z.boolean().optional(),
      allowManualIntervention: z.boolean().optional(),
      pauseOnError: z.boolean().optional(),
    }).optional(),
  }).optional(),
});

const jobsRoutes: FastifyPluginCallback<{ prisma: any }> = (app, opts, done) => {
  const prisma = (opts as any).prisma;
  const queue: Queue = getQueue();

  app.addHook('onRequest', requireAuth);

  app.get('/', async (req, reply) => {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      include: { runs: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    return jobs;
  });

  app.post('/', async (req, reply) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }
    const { name, url, steps, runImmediately, config } = parsed.data;

    // URL allowlist enforcement
    const allowAny = String(process.env.ALLOW_ANY_URL || 'false') === 'true';
    if (!allowAny) {
      const allowed = String(process.env.ALLOWED_HOSTS || 'localhost,127.0.0.1')
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      try {
        const host = new URL(url).hostname.toLowerCase();
        if (!allowed.includes(host)) {
          return reply.code(400).send({
            error:
              'URL host not in allowlist. Set ALLOW_ANY_URL=true only if you have explicit permission and understand legal risks.',
          });
        }
      } catch {
        return reply.code(400).send({ error: 'Invalid URL' });
      }
    }

    const job = await prisma.job.create({
      data: { name, url, stepsJson: steps, configJson: config },
    });

    if (runImmediately) {
      await queue.add('run', { jobId: job.id }, { removeOnComplete: true, removeOnFail: true });
    }
    return reply.code(201).send(job);
  });

  app.get('/:id', async (req, reply) => {
    const { id } = req.params as any;
    const job = await prisma.job.findUnique({
      where: { id },
      include: { runs: { orderBy: { createdAt: 'desc' } } },
    });
    if (!job) return reply.code(404).send({ error: 'Not found' });
    return job;
  });

  app.post('/:id/run', async (req, reply) => {
    const { id } = req.params as any;
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) return reply.code(404).send({ error: 'Not found' });
    await queue.add('run', { jobId: job.id }, { removeOnComplete: true, removeOnFail: true });
    return { ok: true };
  });

  done();
};

export default jobsRoutes;


