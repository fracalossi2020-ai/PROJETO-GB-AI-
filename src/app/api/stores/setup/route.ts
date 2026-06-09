import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AI_TEMPLATES } from '@/lib/ai-templates';

function slugify(text: string) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      dados,
      pagamento,
      horario,
      entrega,
      salao,
      cardapioTemplates,
      cardapioOption,
    } = body;

    if (!userId || !dados?.name) {
      return NextResponse.json({ success: false, message: 'userId e nome da loja são obrigatórios' }, { status: 400 });
    }

    const baseSlug = slugify(dados.name);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    // Cria a loja
    const store = await prisma.store.create({
      data: {
        userId,
        name: dados.name,
        slug,
        description: '',
        phone: dados.phone || '',
        whatsapp: dados.whatsapp || null,
        address: dados.address || null,
        city: dados.city || null,
        state: dados.state || null,
        zipCode: dados.cep || null,
        cnpj: dados.cnpj || null,
        cpf: dados.cpf || null,
        acceptCash: pagamento?.acceptCash ?? true,
        acceptCard: pagamento?.acceptCard ?? true,
        acceptPix: pagamento?.acceptPix ?? true,
        acceptOnlineCard: pagamento?.acceptOnlineCard ?? false,
        pixKey: pagamento?.pixKey || null,
        hasDelivery: entrega?.hasDelivery ?? true,
        hasPickup: entrega?.hasPickup ?? true,
        hasDineIn: salao?.hasDineIn ?? false,
        tableCount: salao?.hasDineIn ? (salao.tables || 0) : 0,
        commandCount: salao?.hasDineIn ? (salao.commands || 0) : 0,
        hasWaiters: salao?.hasDineIn ? (salao.hasWaiters || false) : false,
        serviceFee: salao?.hasDineIn ? (salao.serviceFee || 0) : 0,
      },
    });

    // Horários de funcionamento
    if (Array.isArray(horario)) {
      await prisma.businessHour.createMany({
        data: horario.map((h: any, index: number) => ({
          storeId: store.id,
          dayOfWeek: index,
          openTime: h.openTime || '11:00',
          closeTime: h.closeTime || '23:00',
          isOpen: !!h.open,
        })),
      });
    }

    // Zonas de entrega
    if (entrega?.hasDelivery && Array.isArray(entrega.zones)) {
      await prisma.deliveryZone.createMany({
        data: entrega.zones.map((z: any, index: number) => ({
          storeId: store.id,
          name: `Área ${index + 1}`,
          radiusKm: z.radius || 0,
          deliveryFee: z.fee || 0,
          minOrderValue: z.minOrder || 0,
          estimatedTimeMin: 30 + index * 10,
          estimatedTimeMax: 60 + index * 10,
          isActive: true,
        })),
      });
    }

    // Mesas
    if (salao?.hasDineIn && salao.tables > 0) {
      await prisma.table.createMany({
        data: Array.from({ length: Number(salao.tables) }, (_, i) => ({
          storeId: store.id,
          number: String(i + 1),
          isActive: true,
        })),
      });
    }

    // Categorias e produtos do template se escolheu IA/manual com templates
    const templateType = Array.isArray(cardapioTemplates) ? cardapioTemplates[0] : null;
    if (templateType && AI_TEMPLATES[templateType] && cardapioOption === 'ia') {
      for (const catTemplate of AI_TEMPLATES[templateType]) {
        const category = await prisma.category.create({
          data: {
            storeId: store.id,
            name: catTemplate.category,
            sortOrder: 0,
          },
        });
        await prisma.product.createMany({
          data: catTemplate.products.map((p, idx) => ({
            storeId: store.id,
            categoryId: category.id,
            name: p.name,
            description: p.description,
            price: p.price,
            stock: p.stock,
            isActive: true,
            sortOrder: idx,
          })),
        });
      }
    }

    return NextResponse.json({ success: true, data: store }, { status: 201 });
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Erro ao criar loja' }, { status: 500 });
  }
}
