import { NextResponse } from 'next/server';
import { prisma, MockPrintProvider, env } from '@family/core';
import { stripe } from '@/lib/stripe';
import { z } from 'zod';
import { getOrCreateUser } from '@/lib/auth';

const schema = z.object({ projectId: z.string().uuid() });

export async function POST(req: Request) {
  const user = await getOrCreateUser();
  const body = schema.parse(await req.json());
  const project = await prisma.project.findFirst({ where: { id: body.projectId, userId: user.id } });
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const order = await prisma.order.upsert({
    where: { projectId: project.id },
    create: {
      projectId: project.id,
      status: 'PENDING',
      amount: 2900,
      currency: 'usd'
    },
    update: {}
  });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: order.currency,
          unit_amount: order.amount,
          product_data: { name: `${project.title} coloring book` }
        }
      }
    ],
    success_url: `${env.APP_URL}/projects/${project.id}`,
    cancel_url: `${env.APP_URL}/projects/${project.id}`,
    metadata: { projectId: project.id, orderId: order.id }
  });

  await prisma.order.update({ where: { id: order.id }, data: { checkoutSessionId: session.id } });
  const provider = new MockPrintProvider();
  const created = await provider.createOrder({ projectId: project.id, pdfKey: project.interiorPdfKey ?? '' });
  await prisma.order.update({ where: { id: order.id }, data: { printOrderId: created.orderId, provider: 'mock' } });

  return NextResponse.json({ url: session.url });
}
