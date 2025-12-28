import Link from 'next/link';
import { prisma } from '@family/core';
import { getOrCreateUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function createProject(formData: FormData) {
  'use server';
  const title = formData.get('title')?.toString() || 'My Coloring Book';
  const user = await getOrCreateUser();
  await prisma.project.create({ data: { title, userId: user.id, status: 'PENDING' } });
  revalidatePath('/');
}

export default async function HomePage() {
  const user = await getOrCreateUser();
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    include: { assets: true, orders: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="card">
      <h2>Your Projects</h2>
      <form action={createProject} className="list-inline" style={{ marginBottom: 16 }}>
        <input name="title" placeholder="Trip to Yosemite" style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }} />
        <button type="submit">Create Project</button>
      </form>
      <div style={{ display: 'grid', gap: 12 }}>
        {projects.map((project) => (
          <div key={project.id} className="card" style={{ borderColor: '#e2e8f0' }}>
            <div className="list-inline" style={{ justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0 }}>{project.title}</h3>
                <p style={{ margin: 0 }}>Status: {project.status}</p>
              </div>
              <Link href={`/projects/${project.id}`}>Open</Link>
            </div>
            <p style={{ marginTop: 8 }}>{project.assets.length} assets • {project.orders.length} orders</p>
          </div>
        ))}
        {projects.length === 0 && <p>No projects yet. Create one to start uploading photos.</p>}
      </div>
    </div>
  );
}
