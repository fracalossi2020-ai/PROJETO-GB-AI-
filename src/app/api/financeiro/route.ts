import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const store = await prisma.store.findFirst({
    include: {
      categories: { select: { id: true, name: true } },
      products: { select: { id: true, name: true, price: true, costPrice: true, categoryId: true } },
      customers: { select: { id: true, name: true, phone: true, neighborhood: true } },
      orders: {
        where: { status: { not: 'CANCELADO' } },
        select: {
          id: true,
          status: true,
          type: true,
          paymentMethod: true,
          subtotal: true,
          deliveryFee: true,
          discount: true,
          serviceFee: true,
          total: true,
          createdAt: true,
          updatedAt: true,
          customerId: true,
          items: {
            select: {
              quantity: true,
              unitPrice: true,
              totalPrice: true,
              productId: true,
              product: { select: { id: true, name: true, price: true, costPrice: true, categoryId: true } },
            },
          },
          customer: { select: { id: true, name: true, phone: true, neighborhood: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5000,
      },
      deliveryZones: { select: { id: true, name: true, deliveryFee: true } },
    },
  });

  if (!store) {
    return NextResponse.json({ success: false, message: 'Loja não encontrada' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: store });
}
