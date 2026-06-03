import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true, addons: true } },
      customer: true,
    },
  });

  if (!order) {
    return NextResponse.json({ success: false, message: 'Pedido não encontrado' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: order });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await req.json();

  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      items: { include: { product: true, addons: true } },
      customer: true,
    },
  });

  return NextResponse.json({ success: true, data: order });
}
