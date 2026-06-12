import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuthAndSubscription } from '@/lib/api-auth';
import { mpFetch } from '@/lib/mercadopago';
import { PLANS, PlanId } from '@/lib/plans';

export async function POST(req: NextRequest) {
  const auth = await requireAuthAndSubscription(req);
  if ('status' in auth) return auth;

  try {
    const body = await req.json();
    const { plan, payerEmail, cardToken } = body;

    if (!plan || !PLANS[plan as PlanId]) {
      return NextResponse.json({ success: false, message: 'Plano inválido' }, { status: 400 });
    }

    const planConfig = PLANS[plan as PlanId];

    const existing = await prisma.subscription.findUnique({
      where: { userId: auth.userId },
    });

    if (planConfig.price === 0) {
      await prisma.subscription.upsert({
        where: { userId: auth.userId },
        update: {
          plan: planConfig.id,
          status: 'ATIVO',
          price: 0,
          mercadoPagoPreapprovalId: null,
        },
        create: {
          userId: auth.userId,
          plan: planConfig.id,
          status: 'ATIVO',
          price: 0,
        },
      });
      return NextResponse.json({ success: true, data: { plan: planConfig.id, status: 'ATIVO' } });
    }

    if (!cardToken || !payerEmail) {
      return NextResponse.json({ success: false, message: 'Dados do cartão são obrigatórios' }, { status: 400 });
    }

    const preapprovalData = {
      preapproval_plan_id: null,
      reason: `Plano ${planConfig.name} - GB.AI`,
      external_reference: auth.userId,
      payer_email: payerEmail,
      card_token_id: cardToken,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: planConfig.price,
        currency_id: 'BRL',
        start_date: new Date().toISOString(),
      },
      back_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/assinatura`,
      status: 'authorized',
    };

    const mpRes = await mpFetch('/preapproval', {
      method: 'POST',
      body: JSON.stringify(preapprovalData),
    });

    const mpJson = await mpRes.json();

    if (!mpRes.ok) {
      return NextResponse.json({ success: false, message: mpJson.message || 'Erro ao criar assinatura' }, { status: 500 });
    }

    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await prisma.subscription.upsert({
      where: { userId: auth.userId },
      update: {
        plan: planConfig.id,
        status: 'ATIVO',
        price: planConfig.price,
        mercadoPagoPreapprovalId: mpJson.id,
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
        lastPaymentAt: now,
      },
      create: {
        userId: auth.userId,
        plan: planConfig.id,
        status: 'ATIVO',
        price: planConfig.price,
        mercadoPagoPreapprovalId: mpJson.id,
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
        lastPaymentAt: now,
      },
    });

    return NextResponse.json({ success: true, data: { plan: planConfig.id, status: 'ATIVO', preapprovalId: mpJson.id } });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Erro ao criar assinatura' }, { status: 500 });
  }
}
