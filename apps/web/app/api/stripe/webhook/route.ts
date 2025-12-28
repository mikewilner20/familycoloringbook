import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@family/core';
import { stripe } from '@/lib/stripe';
import { env } from '@family/core';

export async function POST(req: Request) {
  const signature = headers().get('stripe-signature');
  const payload = await req.text();

  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const projectId = session.metadata?.projectId as string | undefined;
      const orderId = session.metadata?.orderId as string | undefined;
      if (orderId) {
        await prisma.order.update({ where: { id: orderId }, data: { status: 'PAID' } });
      }
      if (projectId) {
        await prisma.project.update({ where: { id: projectId }, data: { status: 'PAID' } });
      }
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
}
