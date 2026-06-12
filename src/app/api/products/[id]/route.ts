import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuthAndSubscription, getStoreForUser } from '@/lib/api-auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuthAndSubscription(req);
  if ('status' in auth) return auth;

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, price, stock, isActive, image, categoryId } = body;

    const store = await getStoreForUser(auth.userId);
    if (!store) {
      return NextResponse.json({ success: false, message: 'Loja não encontrada' }, { status: 404 });
    }

    const existing = await prisma.product.findFirst({
      where: { id, storeId: store.id },
    });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Produto não encontrado' }, { status: 404 });
    }

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description || null;
    if (price !== undefined) data.price = parseFloat(price);
    if (stock !== undefined) data.stock = parseInt(stock);
    if (isActive !== undefined) data.isActive = isActive;
    if (image !== undefined) data.image = image || null;
    if (categoryId !== undefined) data.categoryId = categoryId || null;

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Erro ao atualizar produto' }, { status: 500 });
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

    const existing = await prisma.product.findFirst({
      where: { id, storeId: store.id },
    });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Produto não encontrado' }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Erro ao deletar produto' }, { status: 500 });
  }
}
