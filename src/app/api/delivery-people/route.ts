import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuthAndSubscription, getStoreForUser } from '@/lib/api-auth';

async function getUserStore(req: NextRequest) {
  const auth = await requireAuthAndSubscription(req);
  if ('status' in auth) return { error: auth };
  const store = await getStoreForUser(auth.userId);
  if (!store) return { error: NextResponse.json({ success: false, message: 'Loja não encontrada' }, { status: 404 }) };
  return { store, auth };
}

// GET: listar entregadores da loja
export async function GET(req: NextRequest) {
  const result = await getUserStore(req);
  if (result.error) return result.error;
  const { store } = result;

  const people = await prisma.deliveryPerson.findMany({
    where: { storeId: store.id },
    include: {
      assignments: {
        select: { id: true, status: true, fee: true, paid: true, paidAt: true, assignedAt: true, deliveredAt: true, orderId: true },
      },
    },
    orderBy: { code: 'asc' },
  });

  return NextResponse.json({ success: true, data: people });
}

// POST: criar entregador
export async function POST(req: NextRequest) {
  const result = await getUserStore(req);
  if (result.error) return result.error;
  const { store } = result;

  try {
    const body = await req.json();

    const existing = await prisma.deliveryPerson.findMany({
      where: { storeId: store.id },
      select: { code: true },
    });
    const numbers = existing
      .map(p => p.code)
      .filter(Boolean)
      .map(c => parseInt(c!.replace('E', ''), 10))
      .filter(n => !isNaN(n));
    const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

    const person = await prisma.deliveryPerson.create({
      data: {
        code: `E${nextNum}`,
        name: body.name,
        phone: body.phone,
        vehicle: body.vehicle || 'MOTO',
        feePerDelivery: body.feePerDelivery || 0,
        isActive: body.isActive ?? true,
        storeId: store.id,
      },
    });

    return NextResponse.json({ success: true, data: person });
  } catch {
    return NextResponse.json({ success: false, message: 'Erro ao criar entregador' }, { status: 500 });
  }
}

// PUT: atualizar entregador
export async function PUT(req: NextRequest) {
  const result = await getUserStore(req);
  if (result.error) return result.error;
  const { store } = result;

  try {
    const body = await req.json();
    const existing = await prisma.deliveryPerson.findFirst({
      where: { id: body.id, storeId: store.id },
    });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Entregador não encontrado' }, { status: 404 });
    }

    const person = await prisma.deliveryPerson.update({
      where: { id: body.id },
      data: {
        name: body.name,
        phone: body.phone,
        vehicle: body.vehicle,
        feePerDelivery: body.feePerDelivery,
        isActive: body.isActive,
      },
    });

    return NextResponse.json({ success: true, data: person });
  } catch {
    return NextResponse.json({ success: false, message: 'Erro ao atualizar entregador' }, { status: 500 });
  }
}

// DELETE: remover entregador
export async function DELETE(req: NextRequest) {
  const result = await getUserStore(req);
  if (result.error) return result.error;
  const { store } = result;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'ID obrigatório' }, { status: 400 });

    const existing = await prisma.deliveryPerson.findFirst({
      where: { id, storeId: store.id },
    });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Entregador não encontrado' }, { status: 404 });
    }

    await prisma.deliveryPerson.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: 'Erro ao remover entregador' }, { status: 500 });
  }
}
