import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: listar histórico de entregas de um entregador com detalhes do pedido
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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

    // Adiciona paid e paidAt que já vem do Prisma

    return NextResponse.json({ success: true, data: assignments });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Erro ao buscar histórico' }, { status: 500 });
  }
}
