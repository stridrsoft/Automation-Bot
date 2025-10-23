import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import jobsRoutes from './routes/jobs';
import { authRoutes } from './lib/auth';

const prisma = new PrismaClient();

async function buildServer() {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: true });

  const resultsDir = path.join(process.cwd(), 'results');
  const samplePagesDir = path.join(__dirname, '..', 'sample_pages');
  const webDistDir = path.join(process.cwd(), 'web', 'dist');
  
  // Debug logging
  console.log('Current working directory:', process.cwd());
  console.log('Web dist directory:', webDistDir);
  console.log('Web dist exists:', fs.existsSync(webDistDir));
  if (fs.existsSync(webDistDir)) {
    console.log('Web dist contents:', fs.readdirSync(webDistDir));
  }

  if (fs.existsSync(resultsDir)) {
    await app.register(fastifyStatic, {
      root: resultsDir,
      prefix: '/results/',
      decorateReply: false,
    });
  }

  if (fs.existsSync(samplePagesDir)) {
    await app.register(fastifyStatic, {
      root: samplePagesDir,
      prefix: '/sample_pages/',
      decorateReply: false,
      serve: true,
    });
  }

  if (fs.existsSync(webDistDir)) {
    await app.register(fastifyStatic, {
      root: webDistDir,
      prefix: '/',
      decorateReply: false,
    });
  }

  app.get('/health', async () => ({ ok: true }));

  await app.register(authRoutes, { prefix: '/auth', prisma });
  await app.register(jobsRoutes, { prefix: '/jobs', prisma });

  // If web build exists, serve SPA; otherwise keep JSON root
  if (fs.existsSync(path.join(webDistDir, 'index.html'))) {
    app.get('/*', async (_req, reply) => {
      return reply.sendFile('index.html', webDistDir);
    });
  } else {
    app.get('/', async () => ({ message: 'Automation Bot API', status: 'running' }));
  }

  return app;
}

const port = Number(process.env.PORT || 4000);

buildServer()
  .then(app => app.listen({ port, host: '0.0.0.0' }))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

export { buildServer, prisma };