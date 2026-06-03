import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const body = await req.json();
  const { storeId, customer, items, type, paymentMethod, changeFor, customerNote, tableNumber } = body;

  let cust = await prisma.customer.findUnique({
    where: { storeId_phone: { storeId, phone: customer.phone } },
  });

  if (!cust) {
    cust = await prisma.customer.create({
      data: {
        storeId,
        name: customer.name,
        phone: customer.phone,
        email: customer.email || null,
        address: customer.address,
        complement: customer.complement,
        neighborhood: customer.neighborhood,
      },
    });
  }

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  const productIds = items.map((i: any) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, storeId },
    include: { addons: true },
  });

  const productMap = new Map(products.map(p => [p.id, p]));
  let subtotal = 0;

  const orderItems = items.map((item: any) => {
    const product = productMap.get(item.productId)!;
    const selectedAddons = product.addons.filter((a: any) => item.addonIds?.includes(a.id));
    const addonsTotal = selectedAddons.reduce((s: number, a: any) => s + a.price, 0);
    const unitPrice = product.price + addonsTotal;
    const totalPrice = unitPrice * item.quantity;
    subtotal += totalPrice;

    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
      note: item.note,
      addons: selectedAddons.map((a: any) => ({ name: a.name, price: a.price, productAddonId: a.id })),
    };
  });

  const deliveryFee = type === 'DELIVERY' ? (store?.deliveryFee || 0) : 0;
  const serviceFee = type === 'DINE_IN' ? (store?.serviceFee || 0) / 100 * subtotal : 0;
  const total = subtotal + deliveryFee + serviceFee;

  const order = await prisma.order.create({
    data: {
      storeId,
      customerId: cust.id,
      type,
      paymentMethod,
      changeFor,
      customerNote,
      tableNumber,
      subtotal,
      deliveryFee,
      serviceFee,
      total,
      items: {
        create: orderItems.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          note: item.note,
          addons: { create: item.addons },
        })),
      },
    },
    include: {
      items: { include: { product: true, addons: true } },
      customer: true,
    },
  });

  return NextResponse.json({ success: true, data: order }, { status: 201 });
}
