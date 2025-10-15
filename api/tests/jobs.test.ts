import request from 'supertest';
import { buildServer, prisma } from '../src/server';
import bcrypt from 'bcryptjs';

let app: any;
let token: string;

beforeAll(async () => {
  app = await buildServer();

  // Ensure user exists
  const email = 'test@example.com';
  const pass = 'secret';
  const hash = await bcrypt.hash(pass, 10);
  await prisma.user.upsert({
    where: { email },
    update: { password: hash },
    create: { email, password: hash, role: 'admin' },
  });

  const res = await request(app.server)
    .post('/auth/login')
    .send({ email, password: pass });
  token = res.body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
  await app.close();
});

test('health', async () => {
  const res = await request(app.server).get('/health');
  expect(res.status).toBe(200);
  expect(res.body.ok).toBe(true);
});

test('create job and list', async () => {
  const body = {
    name: 'Contact form demo',
    url: 'http://localhost:4000/sample_pages/contact.html',
    steps: [
      { action: 'fill', selector: "input[name='name']", value: 'Alec' },
      { action: 'fill', selector: "input[name='email']", value: 'alec@example.com' },
      { action: 'fill', selector: "textarea[name='message']", value: 'Hello from bot!' },
      { action: 'click', selector: "button[type='submit']" },
      { action: 'wait', selector: '#success', timeout: 5000 },
      { action: 'screenshot', selector: 'body' },
    ],
  };

  process.env.ALLOW_ANY_URL = 'true';
  const create = await request(app.server)
    .post('/jobs')
    .set('Authorization', `Bearer ${token}`)
    .send(body);

  expect(create.status).toBe(201);
  const list = await request(app.server)
    .get('/jobs')
    .set('Authorization', `Bearer ${token}`);
  expect(list.status).toBe(200);
  expect(Array.isArray(list.body)).toBe(true);
});


