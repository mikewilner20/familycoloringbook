import { NextResponse } from 'next/server';
import { prisma } from '@family/core';
import { z } from 'zod';
import { getOrCreateUser } from '@/lib/auth';

const createProjectSchema = z.object({
  title: z.string().min(1).max(120).default('My Coloring Book')
});

export async function GET() {
  const user = await getOrCreateUser();
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    include: { assets: true, orders: true },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const user = await getOrCreateUser();
  const json = await req.json();
  const body = createProjectSchema.parse(json ?? {});
  const project = await prisma.project.create({
    data: {
      title: body.title,
      userId: user.id,
      status: 'PENDING'
    }
  });
  return NextResponse.json({ project }, { status: 201 });
}
