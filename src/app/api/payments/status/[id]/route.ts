import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { order: { select: { id: true, status: true, paymentStatus: true } } },
    });

    if (!payment) {
      return NextResponse.json({ success: false, message: 'Pagamento não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: payment });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Erro ao consultar pagamento' }, { status: 500 });
  }
}
