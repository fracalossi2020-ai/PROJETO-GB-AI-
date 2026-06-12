import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuthAndSubscription, getStoreForUser } from '@/lib/api-auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuthAndSubscription(req);
  if ('status' in auth) return auth;

  try {
    const { id } = await params;
    const person = await prisma.deliveryPerson.findUnique({
      where: { id },
      select: { storeId: true },
    });

    if (!person) {
      return NextResponse.json({ success: false, message: 'Entregador não encontrado' }, { status: 404 });
    }

    const store = await getStoreForUser(auth.userId, person.storeId);
    if (!store) {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    const assignments = await prisma.deliveryAssignment.findMany({
      where: { deliveryPersonId: id },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            type: true,
            customer: {
              select: { name: true, phone: true, address: true, neighborhood: true },
            },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: assignments });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Erro ao buscar histórico' }, { status: 500 });
  }
}
