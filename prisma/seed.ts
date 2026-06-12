import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  const hashedPassword = await bcrypt.hash('admin123', 12);

  const user = await prisma.user.create({
    data: {
      name: 'Administrador Teste',
      email: 'admin@gbai.com',
      password: hashedPassword,
      phone: '(11) 99999-9999',
      role: 'OWNER',
    },
  });

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 7);

  await prisma.subscription.create({
    data: {
      userId: user.id,
      plan: 'PREMIUM',
      status: 'ATIVO',
      price: 99.9,
      trialEndsAt,
      currentPeriodStart: new Date(),
      currentPeriodEnd: trialEndsAt,
    },
  });

  const store = await prisma.store.create({
    data: {
      name: 'Burger King do GB',
      slug: 'burger-king-gb',
      description: 'Os melhores hambúrgueres artesanais da cidade!',
      phone: '(11) 99999-8888',
      whatsapp: '(11) 99999-8888',
      email: 'contato@burgergb.com',
      address: 'Rua das Delícias, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01000-000',
      themeColor: '#ff9607',
      deliveryFee: 5,
      minOrderValue: 15,
      deliveryTimeMin: 25,
      deliveryTimeMax: 45,
      acceptCash: true,
      acceptCard: true,
      acceptPix: true,
      pixKey: 'burgergb@pix.com',
      hasDelivery: true,
      hasPickup: true,
      hasDineIn: true,
      businessType: 'HAMBURGUERIA',
      userId: user.id,
    },
  });

  // Horários de funcionamento
  const days = [
    { dayOfWeek: 0, openTime: '11:00', closeTime: '23:00', isOpen: true },
    { dayOfWeek: 1, openTime: '11:00', closeTime: '23:00', isOpen: true },
    { dayOfWeek: 2, openTime: '11:00', closeTime: '23:00', isOpen: true },
    { dayOfWeek: 3, openTime: '11:00', closeTime: '23:00', isOpen: true },
    { dayOfWeek: 4, openTime: '11:00', closeTime: '23:00', isOpen: true },
    { dayOfWeek: 5, openTime: '11:00', closeTime: '00:00', isOpen: true },
    { dayOfWeek: 6, openTime: '11:00', closeTime: '00:00', isOpen: true },
  ];

  for (const day of days) {
    await prisma.businessHour.create({
      data: { ...day, storeId: store.id },
    });
  }

  // Zonas de entrega
  await prisma.deliveryZone.createMany({
    data: [
      { name: 'Próximo', radiusKm: 1, deliveryFee: 0, minOrderValue: 15, storeId: store.id },
      { name: 'Médio', radiusKm: 3, deliveryFee: 3, minOrderValue: 20, storeId: store.id },
      { name: 'Longe', radiusKm: 5, deliveryFee: 5, minOrderValue: 30, storeId: store.id },
    ],
  });

  // Categorias
  const categories = await prisma.category.createMany({
    data: [
      { name: '🍔 Hambúrgueres', storeId: store.id, sortOrder: 1 },
      { name: '🍟 Porções', storeId: store.id, sortOrder: 2 },
      { name: '🥤 Bebidas', storeId: store.id, sortOrder: 3 },
      { name: '🍰 Sobremesas', storeId: store.id, sortOrder: 4 },
    ],
  });

  const cats = await prisma.category.findMany({ where: { storeId: store.id } });
  const burguerCat = cats.find(c => c.name.includes('Hambúrgueres'))!;
  const portionsCat = cats.find(c => c.name.includes('Porções'))!;
  const drinksCat = cats.find(c => c.name.includes('Bebidas'))!;
  const dessertsCat = cats.find(c => c.name.includes('Sobremesas'))!;

  // Produtos
  await prisma.product.create({
    data: {
      name: 'X-Burger Artesanal',
      description: 'Pão brioche, hambúrguer 180g, queijo cheddar, bacon crocante, alface e tomate',
      price: 28.9,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      isFeatured: true,
      sortOrder: 1,
      storeId: store.id,
      categoryId: burguerCat.id,
      addons: {
        create: [
          { name: 'Bacon extra', price: 5 },
          { name: 'Queijo extra', price: 4 },
          { name: 'Ovo', price: 3 },
          { name: 'Dobro de carne', price: 12 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: 'X-Salada Clássico',
      description: 'Pão de hambúrguer, carne 150g, queijo, alface, tomate e maionese especial',
      price: 22.9,
      image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400',
      sortOrder: 2,
      storeId: store.id,
      categoryId: burguerCat.id,
      addons: {
        create: [
          { name: 'Bacon', price: 4 },
          { name: 'Queijo extra', price: 3.5 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: '🌶️ Burger Picante',
      description: 'Pão brioche, carne 180g, jalapeño, pimenta, queijo pepper jack',
      price: 32.9,
      isFeatured: true,
      sortOrder: 3,
      storeId: store.id,
      categoryId: burguerCat.id,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Batata Frita Grande',
      description: 'Porção grande de batata frita crocante com sal',
      price: 18.9,
      image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400',
      isFeatured: true,
      sortOrder: 1,
      storeId: store.id,
      categoryId: portionsCat.id,
      addons: {
        create: [
          { name: 'Cheddar e bacon', price: 8 },
          { name: 'Molho especial', price: 3 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: 'Onion Rings',
      description: 'Anéis de cebola empanados e crocantes',
      price: 16.9,
      sortOrder: 2,
      storeId: store.id,
      categoryId: portionsCat.id,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Coca-Cola 350ml',
      description: 'Lata gelada',
      price: 6.5,
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400',
      sortOrder: 1,
      storeId: store.id,
      categoryId: drinksCat.id,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Suco Natural',
      description: 'Laranja, limão ou maracujá',
      price: 8.9,
      sortOrder: 2,
      storeId: store.id,
      categoryId: drinksCat.id,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Brownie com Sorvete',
      description: 'Brownie quentinho com bola de sorvete de creme',
      price: 16.9,
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
      sortOrder: 1,
      storeId: store.id,
      categoryId: dessertsCat.id,
    },
  });

  // Mesas
  for (let i = 1; i <= 10; i++) {
    await prisma.table.create({
      data: {
        number: String(i),
        storeId: store.id,
      },
    });
  }

  console.log('✅ Seed concluído!');
  console.log('\n📋 Credenciais de teste:');
  console.log('   E-mail: admin@gbai.com');
  console.log('   Senha: admin123');
  console.log('\n🌐 Loja: http://localhost:3000/burger-king-gb');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
