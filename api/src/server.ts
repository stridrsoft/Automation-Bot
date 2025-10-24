import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import jobsRoutes from './routes/jobs';
import { authRoutes } from './lib/auth';

const prisma = new PrismaClient();

// Test database connection
prisma.$connect()
  .then(() => console.log('Database connected successfully'))
  .catch(err => {
    console.error('Database connection failed:', err);
    // Don't exit here, let the server try to start anyway
  });

async function buildServer() {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: true });

  const resultsDir = path.join(process.cwd(), 'results');
  const samplePagesDir = path.join(__dirname, '..', 'sample_pages');
  const webDistDir = path.join(process.cwd(), '..', 'web', 'dist');
  
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

  app.get('/health', async () => ({ ok: true }));

  // Temporarily disable database-dependent routes
  // await app.register(authRoutes, { prefix: '/auth', prisma });
  // await app.register(jobsRoutes, { prefix: '/jobs', prisma });
  
  // Add simple mock routes for testing
  app.post('/auth/login', async (request, reply) => {
    return { token: 'mock-token', user: { email: 'admin@example.com' } };
  });
  
  app.get('/jobs', async (request, reply) => {
    return [];
  });
  
  // Serve web app if it exists
  if (fs.existsSync(webDistDir)) {
    await app.register(fastifyStatic, {
      root: webDistDir,
      prefix: '/app',
      decorateReply: false,
    });
    
    // Redirect root to web app
    app.get('/', async (_req, reply) => {
      return reply.redirect('/app/');
    });
    
    // Set environment variable for the web app
    process.env.VITE_API_URL = process.env.VITE_API_URL || '';
  } else {
    app.get('/', async () => ({ message: 'Automation Bot API', status: 'running' }));
  }

  return app;
}

const port = Number(process.env.PORT || 4000);

console.log('Starting server on port:', port);
console.log('Environment:', process.env.NODE_ENV);

buildServer()
  .then(app => {
    console.log('Server built successfully, starting to listen...');
    return app.listen({ port, host: '0.0.0.0' });
  })
  .then(() => {
    console.log(`Server listening on port ${port}`);
  })
  .catch(err => {
    console.error('Server startup error:', err);
    process.exit(1);
  });

export { buildServer, prisma };