import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuthAndSubscription } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const auth = await requireAuthAndSubscription(req);
  if ('status' in auth) return auth;

  const stores = await prisma.store.findMany({
    where: { userId: auth.userId },
    include: {
      categories: { include: { products: { include: { addons: true } } } },
      products: { include: { category: true, addons: true } },
      customers: true,
      orders: { include: { items: { include: { product: true, addons: true } }, customer: true } },
      deliveryZones: true,
      businessHours: true,
      tables: true,
    },
  });
  return NextResponse.json({ success: true, data: stores });
}
