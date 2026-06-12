import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuthAndSubscription, getStoreForUser } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const auth = await requireAuthAndSubscription(req);
  if ('status' in auth) return auth;

  try {
    const { items } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: 'items deve ser um array' }, { status: 400 });
    }

    const ids = items.map((item: { id: string }) => item.id);
    const categories = await prisma.category.findMany({
      where: { id: { in: ids } },
      select: { id: true, storeId: true },
    });

    if (categories.length !== ids.length) {
      return NextResponse.json({ success: false, message: 'Categoria não encontrada' }, { status: 404 });
    }

    const storeIds = [...new Set(categories.map(c => c.storeId))];
    if (storeIds.length !== 1) {
      return NextResponse.json({ success: false, message: 'Categorias devem pertencer à mesma loja' }, { status: 400 });
    }

    const store = await getStoreForUser(auth.userId, storeIds[0]);
    if (!store) {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    await prisma.$transaction(
      items.map((item: { id: string; sortOrder: number }) =>
        prisma.category.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Erro ao reordenar categorias' }, { status: 500 });
  }
}
