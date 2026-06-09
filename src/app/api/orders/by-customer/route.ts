import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const storeSlug = searchParams.get('storeSlug');
  const phone = searchParams.get('phone');

  if (!storeSlug || !phone) {
    return NextResponse.json({ success: false, message: 'Loja e telefone são obrigatórios' }, { status: 400 });
  }

  try {
    const store = await prisma.store.findUnique({ where: { slug: storeSlug } });
    if (!store) {
      return NextResponse.json({ success: false, message: 'Loja não encontrada' }, { status: 404 });
    }

    const customer = await prisma.customer.findUnique({
      where: { storeId_phone: { storeId: store.id, phone } },
    });

    if (!customer) {
      return NextResponse.json({ success: true, data: { customer: null, orders: [] } });
    }

    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
      include: {
        items: {
          include: {
            product: true,
            addons: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: { customer, orders } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Erro ao buscar pedidos' }, { status: 500 });
  }
}
