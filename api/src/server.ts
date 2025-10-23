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

  // Serve results and sample pages statically
  const resultsDir = '/data/results';
  app.register(fastifyStatic, {
    root: path.resolve(resultsDir),
    prefix: '/results/',
    decorateReply: false,
  });
  app.register(fastifyStatic, {
    root: path.resolve(__dirname, '..', 'sample_pages'),
    prefix: '/sample_pages/',
    decorateReply: false,
    serve: true,
  });

  app.get('/health', async () => ({ ok: true }));

  await app.register(authRoutes, { prefix: '/auth', prisma });
  await app.register(jobsRoutes, { prefix: '/jobs', prisma });
  // Add this to serve the built web app
  app.use(express.static(path.join(__dirname, '../web/dist')));

  // Serve the web app on all routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../web/dist/index.html'));
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


