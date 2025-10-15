import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';
  const passwordPlain = 'admin';
  const hash = await bcrypt.hash(passwordPlain, 10);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    await prisma.user.create({ data: { email, password: hash, role: 'admin' } });
    console.log('Seeded admin user:');
    console.log(`  email: ${email}`);
    console.log(`  password: ${passwordPlain}`);
  } else {
    console.log('Admin user already exists:', email);
  }
}

main().finally(async () => prisma.$disconnect());


