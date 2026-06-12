import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuthAndSubscription, getStoreForUser } from '@/lib/api-auth';

async function requireStoreAccessForOrder(userId: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { store: { include: { deliveryZones: true } }, customer: true },
  });
  if (!order || order.store.userId !== userId) return null;
  return order;
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthAndSubscription(req);
  if ('status' in auth) return auth;

  try {
    const body = await req.json();
    const { orderId, deliveryPersonId, fee } = body;

    if (!orderId || !deliveryPersonId) {
      return NextResponse.json({ success: false, message: 'Pedido e entregador são obrigatórios' }, { status: 400 });
    }

    const order = await requireStoreAccessForOrder(auth.userId, orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    const person = await prisma.deliveryPerson.findUnique({
      where: { id: deliveryPersonId },
    });
    if (!person || person.storeId !== order.storeId) {
      return NextResponse.json({ success: false, message: 'Entregador não encontrado' }, { status: 404 });
    }

    let finalFee = fee;
    if (finalFee === undefined || finalFee === null) {
      const neighborhood = order.customer?.neighborhood?.trim().toLowerCase();
      if (neighborhood && order.store?.deliveryZones) {
        const matchedZone = order.store.deliveryZones.find(z => {
          if (!z.neighborhoods) return false;
          const zones = z.neighborhoods.split(',').map((n: string) => n.trim().toLowerCase());
          return zones.includes(neighborhood);
        });
        if (matchedZone) {
          finalFee = matchedZone.deliveryFee;
        }
      }
      if (finalFee === undefined || finalFee === null) {
        finalFee = person.feePerDelivery || 0;
      }
    }

    const assignment = await prisma.deliveryAssignment.create({
      data: {
        orderId,
        deliveryPersonId,
        status: 'PENDENTE',
        fee: finalFee || 0,
      },
    });
    return NextResponse.json({ success: true, data: assignment });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Erro ao atribuir entrega' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuthAndSubscription(req);
  if ('status' in auth) return auth;

  try {
    const body = await req.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json({ success: false, message: 'ID e status são obrigatórios' }, { status: 400 });
    }

    const assignment = await prisma.deliveryAssignment.findUnique({
      where: { id },
      include: { order: { include: { store: true } } },
    });
    if (!assignment) {
      return NextResponse.json({ success: false, message: 'Entrega não encontrada' }, { status: 404 });
    }

    if (assignment.order.store.userId !== auth.userId) {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    const data: any = { status };
    if (status === 'ENTREGUE') {
      data.deliveredAt = new Date();
    }

    const updated = await prisma.deliveryAssignment.update({
      where: { id },
      data,
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Erro ao atualizar entrega' }, { status: 500 });
  }
}
