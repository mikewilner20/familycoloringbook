import Link from 'next/link';
import { prisma } from '@family/core';
import { getOrCreateUser } from '@/lib/auth';
import { CheckoutButton } from '@/app/(components)/CheckoutButton';

export default async function CheckoutPage({ params }: { params: { id: string } }) {
  const user = await getOrCreateUser();
  const project = await prisma.project.findFirst({ where: { id: params.id, userId: user.id }, include: { assets: true, orders: true } });
  if (!project) {
    return (
      <div className="card">
        <p>Project not found</p>
        <Link href="/">Back</Link>
      </div>
    );
  }

  const latestOrder = project.orders[0];

  return (
    <div className="card">
      <h2>Checkout for {project.title}</h2>
      <p>Includes {project.assets.filter((a) => a.lineArtKey).length} processed pages.</p>
      <p>Status: {project.status}</p>
      {latestOrder && (
        <div>
          <p>Order: {latestOrder.id}</p>
          <p>Print status: {latestOrder.status}</p>
        </div>
      )}
      <CheckoutButton projectId={project.id} />
      <div style={{ marginTop: 12 }}>
        <Link href={`/projects/${project.id}`}>Back to project</Link>
      </div>
    </div>
  );
}
