import { NextResponse } from 'next/server';
import { prisma, lineArtQueueName, pdfQueueName } from '@family/core';
import { lineArtQueue, pdfQueue } from '@/lib/queues';
import { z } from 'zod';
import { getOrCreateUser } from '@/lib/auth';

const schema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('generateLineArt'), assetId: z.string().uuid() }),
  z.object({ type: z.literal('compilePdf'), projectId: z.string().uuid() })
]);

export async function POST(req: Request) {
  const user = await getOrCreateUser();
  const json = await req.json();
  const body = schema.parse(json);

  if (body.type === 'generateLineArt') {
    const asset = await prisma.asset.findFirst({ where: { id: body.assetId, project: { userId: user.id } } });
    if (!asset) return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    await lineArtQueue.add('generateLineArt', { assetId: body.assetId }, { removeOnComplete: true });
    await prisma.asset.update({ where: { id: body.assetId }, data: { status: 'PROCESSING' } });
    return NextResponse.json({ queued: true, queue: lineArtQueueName });
  }

  const project = await prisma.project.findFirst({ where: { id: body.projectId, userId: user.id } });
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  await pdfQueue.add('compilePdf', { projectId: body.projectId }, { removeOnComplete: true });
  await prisma.project.update({ where: { id: body.projectId }, data: { status: 'PROCESSING' } });
  return NextResponse.json({ queued: true, queue: pdfQueueName });
}
