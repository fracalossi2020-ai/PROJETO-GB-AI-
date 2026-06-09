import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { storeId, name, icon, image, sortOrder } = body;

    if (!storeId || !name) {
      return NextResponse.json({ success: false, message: 'storeId e name são obrigatórios' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        storeId,
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
