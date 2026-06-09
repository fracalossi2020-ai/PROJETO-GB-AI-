import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { storeSlug, name, phone, email, address, complement, neighborhood, city, state, zipCode } = await req.json();

    if (!storeSlug || !phone) {
      return NextResponse.json({ success: false, message: 'Loja e telefone são obrigatórios' }, { status: 400 });
    }

    const store = await prisma.store.findUnique({ where: { slug: storeSlug } });
    if (!store) {
      return NextResponse.json({ success: false, message: 'Loja não encontrada' }, { status: 404 });
    }

    const customer = await prisma.customer.upsert({
      where: { storeId_phone: { storeId: store.id, phone } },
      update: {
        name: name || undefined,
        email: email || undefined,
        address: address || undefined,
        complement: complement || undefined,
        neighborhood: neighborhood || undefined,
        city: city || undefined,
        state: state || undefined,
        zipCode: zipCode || undefined,
      },
      create: {
        name: name || 'Cliente',
        phone,
        email,
        address,
        complement,
        neighborhood,
        city,
        state,
        zipCode,
        storeId: store.id,
      },
    });

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Erro ao salvar cliente' }, { status: 500 });
  }
}
