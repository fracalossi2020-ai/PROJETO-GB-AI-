import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function formatCurrency(value: number) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function formatOrderNumber(n: number) {
  return String(n).padStart(3, '0');
}

async function sendWhatsAppConfirmation(phone: string, order: any, storeName?: string) {
  try {
    const itemsText = order.items.map((item: any) => {
      let line = `• ${item.product.name}`;
      if (item.quantity > 1) line += ` (${item.quantity}x)`;
      if (item.addons?.length) {
        line += `\n   + ${item.addons.map((a: any) => a.name).join(', ')}`;
      }
      if (item.note) line += `\n   📝 ${item.note}`;
      line += `\n   ${formatCurrency(item.totalPrice)}`;
      return line;
    }).join('\n\n');

    const store = storeName || 'nossa loja';
    const orderNum = order.orderNumber || order.id.slice(-6).toUpperCase();

    const message = `🛒 *Pedido #${orderNum} confirmado!*\n\n` +
      `Oi ${order.customer.name}! 👋\n` +
      `Recebemos seu pedido na *${store}*:\n\n` +
      `${itemsText}\n\n` +
      `💰 *Total: ${formatCurrency(order.total)}*\n` +
      `📊 Status: *Em preparação* ⏳\n\n` +
      `Estamos preparando com muito carinho! 🍳\n\n` +
      `Precisa de mais alguma coisa? É só mandar aqui! 😊`;

    const res = await fetch('http://localhost:3001/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: phone, message }),
    });

    if (!res.ok) {
      await res.json().catch(() => ({}));
    }
  } catch {
    // Falha silenciosa — não bloqueia o pedido
  }
}

async function generateOrderNumber(storeId: string): Promise<string> {
  const lastOrder = await prisma.order.findFirst({
    where: { storeId, orderNumber: { not: null } },
    orderBy: { orderNumber: 'desc' },
  });

  const lastNum = lastOrder?.orderNumber ? parseInt(lastOrder.orderNumber, 10) : 0;
  return formatOrderNumber(lastNum + 1);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { storeId, customer, items, type, paymentMethod, changeFor, customerNote, tableNumber } = body;

    if (!storeId || !customer?.name || !customer?.phone || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Dados do pedido incompletos' }, { status: 400 });
    }

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

  // Gera número sequencial do pedido
  const orderNumber = await generateOrderNumber(storeId);

  const order = await prisma.order.create({
    data: {
      storeId,
      customerId: cust.id,
      orderNumber,
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

    // Envia confirmação via WhatsApp para o cliente que fez o pedido
    await sendWhatsAppConfirmation(customer.phone, order, store?.name);

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Erro ao criar pedido' }, { status: 500 });
  }
}
