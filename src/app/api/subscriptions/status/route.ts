import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuthAndSubscription } from '@/lib/api-auth';
import { PLANS } from '@/lib/plans';

export async function GET(req: NextRequest) {
  const auth = await requireAuthAndSubscription(req);
  if ('status' in auth) return auth;

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: auth.userId },
    });

    if (!subscription) {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);
      const created = await prisma.subscription.create({
        data: {
          userId: auth.userId,
          plan: 'GRATUITO',
          status: 'ATIVO',
          trialEndsAt,
          currentPeriodStart: new Date(),
          currentPeriodEnd: trialEndsAt,
        },
      });
      return NextResponse.json({
        success: true,
        data: {
          ...created,
          isActive: true,
          isTrial: true,
          planName: PLANS.GRATUITO.name,
        },
      });
    }

    const now = new Date();
    const isTrial = subscription.plan === 'GRATUITO' && !!subscription.trialEndsAt && subscription.trialEndsAt > now;
    const isActive = subscription.status === 'ATIVO' || isTrial || (!!subscription.expiresAt && subscription.expiresAt > now);

    return NextResponse.json({
      success: true,
      data: {
        ...subscription,
        isActive,
        isTrial,
        planName: PLANS[subscription.plan as keyof typeof PLANS]?.name || subscription.plan,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Erro ao consultar assinatura' }, { status: 500 });
  }
}
