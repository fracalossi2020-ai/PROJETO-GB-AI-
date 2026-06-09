import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID da loja é obrigatório' }, { status: 400 });
    }

    const allowedFields = [
      'name', 'slug', 'description', 'logo', 'coverImage', 'phone', 'whatsapp', 'email',
      'address', 'city', 'state', 'zipCode', 'cnpj', 'cpf', 'themeColor',
      'isActive', 'isOpen', 'deliveryFee', 'minOrderValue', 'deliveryTimeMin',
      'deliveryTimeMax', 'acceptCash', 'acceptCard', 'acceptPix', 'pixKey',
      'acceptOnlineCard', 'hasDelivery', 'hasPickup', 'hasDineIn', 'tableCount',
      'commandCount', 'hasWaiters', 'serviceFee', 'autoAcceptOrders', 'autoPrint',
      'whatsappNumber', 'businessType',
    ];

    const data: any = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        data[field] = updates[field];
      }
    }

    // Valida unicidade do slug se estiver sendo alterado
    if (data.slug) {
      const existing = await prisma.store.findFirst({
        where: { slug: data.slug, id: { not: id } },
      });
      if (existing) {
        return NextResponse.json({ success: false, message: 'Este link já está em uso por outra loja' }, { status: 409 });
      }
    }

    const store = await prisma.store.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: store });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Erro ao atualizar loja' }, { status: 500 });
  }
}
