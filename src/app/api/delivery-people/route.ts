import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: listar entregadores da loja
export async function GET() {
  const store = await prisma.store.findFirst();
  if (!store) return NextResponse.json({ success: false, message: 'Loja não encontrada' }, { status: 404 });

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
  try {
    const store = await prisma.store.findFirst();
    if (!store) return NextResponse.json({ success: false, message: 'Loja não encontrada' }, { status: 404 });

    const body = await req.json();

    // Gera código sequencial E1, E2, E3...
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
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Erro ao criar entregador' }, { status: 500 });
  }
}

// PUT: atualizar entregador
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
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
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Erro ao atualizar entregador' }, { status: 500 });
  }
}

// DELETE: remover entregador
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'ID obrigatório' }, { status: 400 });

    await prisma.deliveryPerson.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Erro ao remover entregador' }, { status: 500 });
  }
}
