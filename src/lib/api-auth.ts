import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';
import { prisma } from './prisma';

export interface AuthContext {
  userId: string;
  role: string;
}

export function unauthorized(message = 'Não autorizado') {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

export function forbidden(message = 'Acesso negado') {
  return NextResponse.json({ success: false, error: message }, { status: 403 });
}

export async function getAuthUser(req: NextRequest): Promise<AuthContext | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) return null;

  return { userId: payload.userId, role: payload.role };
}

export async function requireAuth(req: NextRequest): Promise<AuthContext | Response> {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  return user;
}

export async function requireAuthAndSubscription(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('status' in auth) return auth;

  const subscription = await requireActiveSubscription(auth.userId);
  if ('status' in subscription) return subscription;

  return { ...auth, ...subscription };
}

export async function requireActiveSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const now = new Date();
  const isTrial = subscription?.plan === 'GRATUITO' && !!subscription?.trialEndsAt && subscription.trialEndsAt > now;
  const isActive = subscription?.status === 'ATIVO' || isTrial || (!!subscription?.expiresAt && subscription.expiresAt > now);

  if (!isActive) {
    return NextResponse.json(
      { success: false, error: 'Assinatura inativa. Renove seu plano para continuar.' },
      { status: 403 }
    );
  }

  return { subscription, isTrial };
}

export async function getStoreForUser(userId: string, storeId?: string) {
  if (storeId) {
    return prisma.store.findFirst({
      where: { id: storeId, userId },
    });
  }
  return prisma.store.findFirst({
    where: { userId },
  });
}
