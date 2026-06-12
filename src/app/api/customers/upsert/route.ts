import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuthAndSubscription } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const auth = await requireAuthAndSubscription(req);
  if ('status' in auth) return auth;

  try {
    const { storeSlug, name, phone, email, address, complement, neighborhood, city, state, zipCode } = await req.json();

    if (!storeSlug || !phone) {
      return NextResponse.json({ success: false, message: 'Loja e telefone são obrigatórios' }, { status: 400 });
    }

    const store = await prisma.store.findUnique({ where: { slug: storeSlug } });
    if (!store) {
      return NextResponse.json({ success: false, message: 'Loja não encontrada' }, { status: 404 });
    }

    if (store.userId !== auth.userId) {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
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
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Erro ao salvar cliente' }, { status: 500 });
  }
}
