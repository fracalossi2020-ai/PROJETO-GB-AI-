import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await prisma.store.findUnique({
    where: { slug },
    include: {
      categories: { orderBy: { sortOrder: 'asc' } },
      products: {
        where: { isActive: true },
        include: { category: true, addons: true },
        orderBy: { sortOrder: 'asc' },
      },
      deliveryZones: true,
      businessHours: true,
      tables: true,
    },
  });

  if (!store) {
    return NextResponse.json({ success: false, message: 'Loja não encontrada' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: store });
}
