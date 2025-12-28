import sharp from 'sharp';
import { compilePdf as buildPdf } from '@family/core/pdf';
import { createWorker, lineArtQueueName, pdfQueueName, putObject, fetchObject, prisma } from '@family/core';

createWorker<{ assetId: string }>(lineArtQueueName, async ({ data }) => {
  const asset = await prisma.asset.findUnique({ where: { id: data.assetId }, include: { project: true } });
  if (!asset) {
    throw new Error(`Asset ${data.assetId} not found`);
  }

  const original = await fetchObject(asset.originalKey);
  const lineArt = await sharp(Buffer.from(original))
    .resize(1600, 1600, { fit: 'inside' })
    .grayscale()
    .threshold(170)
    .toFormat('png')
    .toBuffer();

  const lineArtKey = `projects/${asset.projectId}/lineart/${asset.id}.png`;
  await putObject(lineArtKey, lineArt, 'image/png');
  await prisma.asset.update({ where: { id: asset.id }, data: { lineArtKey, status: 'READY' } });
  await prisma.project.update({ where: { id: asset.projectId }, data: { status: 'PROCESSING' } });
});

createWorker<{ projectId: string }>(pdfQueueName, async ({ data }) => {
  const project = await prisma.project.findUnique({ where: { id: data.projectId }, include: { assets: true } });
  if (!project) {
    throw new Error(`Project ${data.projectId} not found`);
  }
  const pages = project.assets
    .filter((asset) => !!asset.lineArtKey)
    .map((asset, idx) => ({ title: `Page ${idx + 1}`, imageKey: asset.lineArtKey || undefined }));
  const pdf = await buildPdf(project.id, pages);
  await prisma.project.update({ where: { id: project.id }, data: { interiorPdfKey: pdf.key, status: 'READY' } });
});

console.log('Workers running for queues:', lineArtQueueName, pdfQueueName);
