import { NextResponse } from 'next/server';
import { presignUpload, prisma } from '@family/core';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { getOrCreateUser } from '@/lib/auth';

const bodySchema = z.object({ contentType: z.string().min(1) });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getOrCreateUser();
  const project = await prisma.project.findFirst({ where: { id: params.id, userId: user.id } });
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const json = await req.json();
  const body = bodySchema.parse(json);
  const assetId = uuid();
  const key = `projects/${project.id}/uploads/${assetId}`;
  const signed = await presignUpload(key, body.contentType);
  await prisma.asset.create({
    data: {
      id: assetId,
      projectId: project.id,
      originalKey: key,
      status: 'UPLOADING'
    }
  });
  return NextResponse.json({ uploadUrl: signed.url, key: signed.key, assetId });
}
