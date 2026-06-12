import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const type = payload.type;

    if (type !== 'preapproval' && type !== 'payment') {
      return NextResponse.json({ success: true, message: 'Evento ignorado' });
    }

    const data = payload.data || {};
    const preapprovalId = type === 'preapproval' ? data.id : data.preapproval_id;

    if (!preapprovalId) {
      return NextResponse.json({ success: true, message: 'Sem id de assinatura' });
    }

    const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` },
    });

    if (!mpRes.ok) {
      return NextResponse.json({ success: false, message: 'Erro ao consultar Mercado Pago' }, { status: 500 });
    }

    const mpJson = await mpRes.json();
    const userId = mpJson.external_reference;
    const status = mpJson.status;

    if (!userId) {
      return NextResponse.json({ success: true, message: 'Sem external_reference' });
    }

    const planId = (mpJson.reason || '').replace('Plano ', '').replace(' - GB.AI', '').toUpperCase();
    const planKey = ['GRATUITO', 'PRO', 'PREMIUM'].find(p => p === planId) || 'PRO';

    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await prisma.subscription.update({
      where: { userId },
      data: {
        status: status === 'authorized' || status === 'active' ? 'ATIVO' : 'INATIVO',
        mercadoPagoPreapprovalId: preapprovalId,
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
        lastPaymentAt: status === 'authorized' ? now : undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Erro no webhook' }, { status: 500 });
  }
}
