import { FastifyPluginCallback, FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export const authRoutes: FastifyPluginCallback<{ prisma: any }> = (app, opts, done) => {
  const prisma = (opts as any).prisma;

  app.post('/login', async (req, reply) => {
    const { email, password } = (req.body || {}) as any;
    if (!email || !password) return reply.code(400).send({ error: 'Missing credentials' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return reply.code(401).send({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return reply.code(401).send({ error: 'Invalid credentials' });
    const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
    return { token };
  });

  done();
};

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return reply.code(401).send({ error: 'Unauthorized' });
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = payload;
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
}


