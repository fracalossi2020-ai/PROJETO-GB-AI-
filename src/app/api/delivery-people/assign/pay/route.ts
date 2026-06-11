import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT: marcar entrega(s) como paga ou pendente
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.id) {
      // Paga uma entrega específica
      const assignment = await prisma.deliveryAssignment.update({
        where: { id: body.id },
        data: {
          paid: body.paid,
          paidAt: body.paid ? new Date() : null,
        },
      });
      return NextResponse.json({ success: true, data: assignment });
    }

    if (body.deliveryPersonId && body.paid) {
      // Paga todas as entregas não pagas de um entregador
      const result = await prisma.deliveryAssignment.updateMany({
        where: {
          deliveryPersonId: body.deliveryPersonId,
          paid: false,
          status: 'ENTREGUE',
        },
        data: {
          paid: true,
          paidAt: new Date(),
        },
      });
      return NextResponse.json({ success: true, count: result.count });
    }

    return NextResponse.json({ success: false, message: 'Parâmetros inválidos' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Erro ao atualizar pagamento' }, { status: 500 });
  }
}
