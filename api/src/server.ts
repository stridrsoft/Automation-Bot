import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import jobsRoutes from './routes/jobs';
import { authRoutes } from './lib/auth';

const prisma = new PrismaClient();

async function buildServer() {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: true });

  // Use relative paths instead of absolute paths
  const resultsDir = path.join(process.cwd(), 'results');
  const samplePagesDir = path.join(__dirname, '..', 'sample_pages');
  // Change this line in server.ts
  const webDistDir = path.join(process.cwd(), 'web/dist');

  // Only register static files if directories exist
  try {
    const fs = require('fs');
    if (fs.existsSync(resultsDir)) {
      app.register(fastifyStatic, {
        root: resultsDir,
        prefix: '/results/',
        decorateReply: false,
      });
    }
  } catch (err) {
    console.log('Results directory not found, skipping...');
  }

  try {
    const fs = require('fs');
    if (fs.existsSync(samplePagesDir)) {
      app.register(fastifyStatic, {
        root: samplePagesDir,
        prefix: '/sample_pages/',
        decorateReply: false,
        serve: true,
      });
    }
  } catch (err) {
    console.log('Sample pages directory not found, skipping...');
  }

  try {
    const fs = require('fs');
    if (fs.existsSync(webDistDir)) {
      app.register(fastifyStatic, {
        root: webDistDir,
        prefix: '/',
        decorateReply: false,
      });
    }
  } catch (err) {
    console.log('Web dist directory not found, skipping...');
  }

  app.get('/health', async () => ({ ok: true }));

  await app.register(authRoutes, { prefix: '/auth', prisma });
  await app.register(jobsRoutes, { prefix: '/jobs', prisma });
  
  // Simple root route
  app.get('/', async (request, reply) => {
    return { message: 'Automation Bot API', status: 'running' };
  });
  
  return app;
}

const port = Number(process.env.PORT || 4000);

buildServer()
  .then((app) => app.listen({ port, host: '0.0.0.0' }))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

export { buildServer, prisma };