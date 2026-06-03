import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const stores = await prisma.store.findMany({
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
