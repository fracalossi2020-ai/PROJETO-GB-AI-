import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuthAndSubscription, getStoreForUser } from '@/lib/api-auth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
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
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Erro ao buscar pedido' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuthAndSubscription(req);
  if ('status' in auth) return auth;

  try {
    const { id } = await params;
    const { status } = await req.json();

    const store = await getStoreForUser(auth.userId);
    if (!store) {
      return NextResponse.json({ success: false, message: 'Loja não encontrada' }, { status: 404 });
    }

    const existing = await prisma.order.findFirst({
      where: { id, storeId: store.id },
    });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Pedido não encontrado' }, { status: 404 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: { include: { product: true, addons: true } },
        customer: true,
      },
    });

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Erro ao atualizar pedido' }, { status: 500 });
  }
}
