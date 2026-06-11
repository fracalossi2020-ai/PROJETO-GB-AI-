import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: atribuir pedido a entregador (calcula taxa por zoneamento automaticamente)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Busca pedido com cliente e loja
    const order = await prisma.order.findUnique({
      where: { id: body.orderId },
      include: { customer: true, store: { include: { deliveryZones: true } } },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Pedido não encontrado' }, { status: 404 });
    }

    // Busca entregador para fallback de taxa
    const person = await prisma.deliveryPerson.findUnique({
      where: { id: body.deliveryPersonId },
    });

    let fee = body.fee;
    if (fee === undefined || fee === null) {
      // Tenta calcular taxa por zoneamento baseada no bairro do cliente
      const neighborhood = order.customer?.neighborhood?.trim().toLowerCase();
      if (neighborhood && order.store?.deliveryZones) {
        const matchedZone = order.store.deliveryZones.find(z => {
          if (!z.neighborhoods) return false;
          const zones = z.neighborhoods.split(',').map((n: string) => n.trim().toLowerCase());
          return zones.includes(neighborhood);
        });
        if (matchedZone) {
          fee = matchedZone.deliveryFee;
        }
      }
      // Fallback: taxa do entregador
      if (fee === undefined || fee === null) {
        fee = person?.feePerDelivery || 0;
      }
    }

    const assignment = await prisma.deliveryAssignment.create({
      data: {
        orderId: body.orderId,
        deliveryPersonId: body.deliveryPersonId,
        status: 'PENDENTE',
        fee: fee || 0,
      },
    });
    return NextResponse.json({ success: true, data: assignment });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Erro ao atribuir entrega' }, { status: 500 });
  }
}

// PUT: atualizar status da entrega
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const data: any = { status: body.status };
    if (body.status === 'ENTREGUE') {
      data.deliveredAt = new Date();
    }

    const assignment = await prisma.deliveryAssignment.update({
      where: { id: body.id },
      data,
    });
    return NextResponse.json({ success: true, data: assignment });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Erro ao atualizar entrega' }, { status: 500 });
  }
}
