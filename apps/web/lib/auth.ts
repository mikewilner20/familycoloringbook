import { cookies } from 'next/headers';
import { prisma } from '@family/core';
import { v4 as uuid } from 'uuid';

const COOKIE_NAME = 'demo-user';

export async function getOrCreateUser() {
  const jar = cookies();
  let userId = jar.get(COOKIE_NAME)?.value;

  if (userId) {
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (existing) return existing;
  }

  const id = uuid();
  const user = await prisma.user.create({
    data: {
      id,
      email: `${id}@demo.local`,
      name: 'Demo User'
    }
  });
  jar.set({ name: COOKIE_NAME, value: user.id, httpOnly: true, path: '/', sameSite: 'lax' });
  return user;
}
