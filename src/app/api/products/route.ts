import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuthAndSubscription, getStoreForUser } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const auth = await requireAuthAndSubscription(req);
  if ('status' in auth) return auth;

  try {
    const body = await req.json();
    const { storeId, name, description, price, stock, isActive, image, categoryId } = body;

    if (!storeId || !name || price == null) {
      return NextResponse.json({ success: false, message: 'storeId, name e price são obrigatórios' }, { status: 400 });
    }

    const store = await getStoreForUser(auth.userId, storeId);
    if (!store) {
      return NextResponse.json({ success: false, message: 'Loja não encontrada' }, { status: 404 });
    }

    const product = await prisma.product.create({
      data: {
        storeId: store.id,
        name,
        description: description || null,
        price: parseFloat(price),
        stock: stock != null ? parseInt(stock) : 999,
        isActive: isActive !== undefined ? isActive : true,
        image: image || null,
        categoryId: categoryId || null,
      },
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Erro ao criar produto' }, { status: 500 });
  }
}
