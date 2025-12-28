import Link from 'next/link';
import { prisma, env } from '@family/core';
import { getOrCreateUser } from '@/lib/auth';
import { UploadPanel } from '@/app/(components)/UploadPanel';
import { CompileButton } from '@/app/(components)/CompileButton';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const user = await getOrCreateUser();
  const project = await prisma.project.findFirst({
    where: { id: params.id, userId: user.id },
    include: { assets: true, orders: true }
  });

  if (!project) {
    return (
      <div className="card">
        <p>Project not found</p>
        <Link href="/">Back</Link>
      </div>
    );
  }

  const bucketBase = `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com`;

  return (
    <div className="card">
      <div className="list-inline" style={{ justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0 }}>{project.title}</h2>
          <p style={{ margin: 0 }}>Status: {project.status}</p>
        </div>
        <Link href={`/checkout/${project.id}`}>Checkout</Link>
      </div>

      <section style={{ marginTop: 16 }}>
        <h3>Assets</h3>
        {project.assets.length === 0 && <p>No uploads yet.</p>}
        <div style={{ display: 'grid', gap: 12 }}>
          {project.assets.map((asset) => (
            <div key={asset.id} className="card" style={{ background: '#f8fafc' }}>
              <p style={{ margin: 0 }}>Asset: {asset.id}</p>
              <p style={{ margin: '4px 0' }}>Status: {asset.status}</p>
              {asset.lineArtKey && (
                <a href={`${bucketBase}/${asset.lineArtKey}`} target="_blank" rel="noreferrer">
                  View line art
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      <UploadPanel projectId={project.id} />
      <CompileButton projectId={project.id} />

      {project.interiorPdfKey && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Interior PDF</h3>
          <a href={`${bucketBase}/${project.interiorPdfKey}`} target="_blank" rel="noreferrer">
            Download PDF
          </a>
        </div>
      )}
    </div>
  );
}
