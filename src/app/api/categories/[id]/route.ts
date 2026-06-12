import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuthAndSubscription, getStoreForUser } from '@/lib/api-auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuthAndSubscription(req);
  if ('status' in auth) return auth;

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, icon, image, sortOrder } = body;

    const store = await getStoreForUser(auth.userId);
    if (!store) {
      return NextResponse.json({ success: false, message: 'Loja não encontrada' }, { status: 404 });
    }

    const existing = await prisma.category.findFirst({
      where: { id, storeId: store.id },
    });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Categoria não encontrada' }, { status: 404 });
    }

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (icon !== undefined) data.icon = icon || null;
    if (image !== undefined) data.image = image || null;
    if (sortOrder !== undefined) data.sortOrder = parseInt(sortOrder);

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Erro ao atualizar categoria' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuthAndSubscription(req);
  if ('status' in auth) return auth;

  try {
    const { id } = await params;

    const store = await getStoreForUser(auth.userId);
    if (!store) {
      return NextResponse.json({ success: false, message: 'Loja não encontrada' }, { status: 404 });
    }

    const existing = await prisma.category.findFirst({
      where: { id, storeId: store.id },
    });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Categoria não encontrada' }, { status: 404 });
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Erro ao deletar categoria' }, { status: 500 });
  }
}
