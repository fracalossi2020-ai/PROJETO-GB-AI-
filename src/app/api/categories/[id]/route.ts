import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, icon, image, sortOrder } = body;

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

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Erro ao deletar categoria' }, { status: 500 });
  }
}
