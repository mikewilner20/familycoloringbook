import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { fetchObject, putObject } from './s3';
import { env } from './env';

export async function compilePdf(projectId: string, pages: { title: string; imageKey?: string }[]) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const page of pages) {
    const pdfPage = pdfDoc.addPage([612, 792]);
    const { width, height } = pdfPage.getSize();
    pdfPage.drawText(page.title, {
      x: 50,
      y: height - 80,
      size: 20,
      font,
      color: rgb(0, 0, 0)
    });

    if (page.imageKey) {
      try {
        const bytes = await fetchObject(page.imageKey);
        const image = await pdfDoc.embedPng(bytes);
        const imgDims = image.scale(1);
        const maxWidth = width - 100;
        const maxHeight = height - 200;
        const scale = Math.min(maxWidth / imgDims.width, maxHeight / imgDims.height, 1);
        const scaled = image.scale(scale);
        pdfPage.drawImage(image, {
          x: (width - scaled.width) / 2,
          y: (height - scaled.height) / 2,
          width: scaled.width,
          height: scaled.height
        });
      } catch (err) {
        console.error('Failed to embed image', page.imageKey, err);
        pdfPage.drawText('Image unavailable', { x: 50, y: height - 120, size: 14, font, color: rgb(0.8, 0, 0) });
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  const key = `projects/${projectId}/interior.pdf`;
  await putObject(key, pdfBytes, 'application/pdf');
  const url = `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com/${key}`;
  return { key, url };
}
