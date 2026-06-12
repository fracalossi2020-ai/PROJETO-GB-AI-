import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuthAndSubscription, getStoreForUser } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const auth = await requireAuthAndSubscription(req);
  if ('status' in auth) return auth;

  try {
    const body = await req.json();
    const { storeId, name, icon, image, sortOrder } = body;

    if (!storeId || !name) {
      return NextResponse.json({ success: false, message: 'storeId e name são obrigatórios' }, { status: 400 });
    }

    const store = await getStoreForUser(auth.userId, storeId);
    if (!store) {
      return NextResponse.json({ success: false, message: 'Loja não encontrada' }, { status: 404 });
    }

    const category = await prisma.category.create({
      data: {
        storeId: store.id,
        name,
        icon: icon || null,
        image: image || null,
        sortOrder: sortOrder != null ? parseInt(sortOrder) : 0,
      },
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Erro ao criar categoria' }, { status: 500 });
  }
}
