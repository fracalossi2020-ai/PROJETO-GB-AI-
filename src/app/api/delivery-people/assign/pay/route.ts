import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuthAndSubscription, getStoreForUser } from '@/lib/api-auth';

export async function PUT(req: NextRequest) {
  const auth = await requireAuthAndSubscription(req);
  if ('status' in auth) return auth;

  try {
    const body = await req.json();

    if (body.id) {
      const assignment = await prisma.deliveryAssignment.findUnique({
        where: { id: body.id },
        include: { order: { include: { store: true } } },
      });
      if (!assignment) {
        return NextResponse.json({ success: false, message: 'Entrega não encontrada' }, { status: 404 });
      }
      if (assignment.order.store.userId !== auth.userId) {
        return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
      }

      const updated = await prisma.deliveryAssignment.update({
        where: { id: body.id },
        data: {
          paid: body.paid,
          paidAt: body.paid ? new Date() : null,
        },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    if (body.deliveryPersonId && body.paid) {
      const person = await prisma.deliveryPerson.findUnique({
        where: { id: body.deliveryPersonId },
      });
      if (!person) {
        return NextResponse.json({ success: false, message: 'Entregador não encontrado' }, { status: 404 });
      }
      const store = await getStoreForUser(auth.userId, person.storeId);
      if (!store) {
        return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
      }

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
