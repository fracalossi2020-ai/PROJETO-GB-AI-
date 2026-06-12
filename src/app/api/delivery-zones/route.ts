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

// GET: listar zonas da loja
export async function GET(req: NextRequest) {
  const result = await getUserStore(req);
  if (result.error) return result.error;
  const { store } = result;

  const zones = await prisma.deliveryZone.findMany({
    where: { storeId: store.id },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ success: true, data: zones });
}

// POST: criar zona
export async function POST(req: NextRequest) {
  const result = await getUserStore(req);
  if (result.error) return result.error;
  const { store } = result;

  try {
    const body = await req.json();
    const zone = await prisma.deliveryZone.create({
      data: {
        name: body.name || 'Nova Zona',
        radiusKm: body.radiusKm ?? 0,
        neighborhoods: body.neighborhoods || '',
        deliveryFee: body.deliveryFee || 0,
        minOrderValue: body.minOrderValue || 0,
        estimatedTimeMin: body.estimatedTimeMin || 30,
        estimatedTimeMax: body.estimatedTimeMax || 60,
        isActive: body.isActive ?? true,
        storeId: store.id,
      },
    });

    return NextResponse.json({ success: true, data: zone });
  } catch {
    return NextResponse.json({ success: false, message: 'Erro ao criar zona' }, { status: 500 });
  }
}

// PUT: atualizar zona
export async function PUT(req: NextRequest) {
  const result = await getUserStore(req);
  if (result.error) return result.error;
  const { store } = result;

  try {
    const body = await req.json();
    const existing = await prisma.deliveryZone.findFirst({
      where: { id: body.id, storeId: store.id },
    });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Zona não encontrada' }, { status: 404 });
    }

    const zone = await prisma.deliveryZone.update({
      where: { id: body.id },
      data: {
        name: body.name,
        radiusKm: body.radiusKm,
        neighborhoods: body.neighborhoods,
        deliveryFee: body.deliveryFee,
        minOrderValue: body.minOrderValue,
        estimatedTimeMin: body.estimatedTimeMin,
        estimatedTimeMax: body.estimatedTimeMax,
        isActive: body.isActive,
      },
    });

    return NextResponse.json({ success: true, data: zone });
  } catch {
    return NextResponse.json({ success: false, message: 'Erro ao atualizar zona' }, { status: 500 });
  }
}

// DELETE: remover zona
export async function DELETE(req: NextRequest) {
  const result = await getUserStore(req);
  if (result.error) return result.error;
  const { store } = result;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'ID obrigatório' }, { status: 400 });

    const existing = await prisma.deliveryZone.findFirst({
      where: { id, storeId: store.id },
    });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Zona não encontrada' }, { status: 404 });
    }

    await prisma.deliveryZone.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: 'Erro ao remover zona' }, { status: 500 });
  }
}
