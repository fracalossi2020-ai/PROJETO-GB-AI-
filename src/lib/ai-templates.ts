export interface AiProductTemplate {
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface AiCategoryTemplate {
  category: string;
  products: AiProductTemplate[];
}

export const AI_TEMPLATES: Record<string, AiCategoryTemplate[]> = {
  HAMBURGUERIA: [
    {
      category: 'Hambúrgueres',
      products: [
        { name: 'Classic Burger', description: 'Carne 180g, queijo cheddar, alface, tomate, molho especial', price: 28.9, stock: 50 },
        { name: 'Bacon Burger', description: 'Carne 180g, bacon crocante, queijo cheddar, cebola caramelizada', price: 32.9, stock: 50 },
        { name: 'Duplo Smash', description: '2 carnes smash, queijo americano, picles, molho da casa', price: 35.9, stock: 40 },
        { name: 'Veggie Burger', description: 'Hambúrguer de grão-de-bico, queijo prato, rúcula, tomate seco', price: 26.9, stock: 30 },
      ],
    },
    {
      category: 'Combos',
      products: [
        { name: 'Combo Classic', description: 'Classic Burger + Batata média + Refrigerante', price: 42.9, stock: 999 },
        { name: 'Combo Família', description: '2 burgers + Batata grande + 2 refrigerantes', price: 74.9, stock: 999 },
      ],
    },
    {
      category: 'Porções',
      products: [
        { name: 'Batata Frita Média', description: 'Porção de batata frita crocante', price: 18.9, stock: 100 },
        { name: 'Batata Frita Grande', description: 'Porção grande de batata frita com cheddar e bacon', price: 28.9, stock: 100 },
        { name: 'Onion Rings', description: 'Anéis de cebola empanados e crocantes', price: 22.9, stock: 80 },
        { name: 'Nuggets (8un)', description: 'Nuggets de frango com molho barbecue', price: 19.9, stock: 80 },
      ],
    },
    {
      category: 'Bebidas',
      products: [
        { name: 'Coca-Cola 350ml', description: 'Lata', price: 6.5, stock: 200 },
        { name: 'Guaraná Antarctica 350ml', description: 'Lata', price: 6, stock: 200 },
        { name: 'Suco Natural Laranja', description: 'Copo 300ml', price: 9.9, stock: 50 },
        { name: 'Milkshake Chocolate', description: '400ml com chantilly', price: 16.9, stock: 40 },
      ],
    },
  ],
  PIZZARIA: [
    {
      category: 'Pizzas Salgadas',
      products: [
        { name: 'Calabresa', description: 'Molho de tomate, mussarela, calabresa, cebola', price: 45.9, stock: 50 },
        { name: 'Marguerita', description: 'Molho de tomate, mussarela, manjericão fresco', price: 42.9, stock: 50 },
        { name: 'Quatro Queijos', description: 'Mussarela, provolone, parmesão, gorgonzola', price: 49.9, stock: 50 },
        { name: 'Portuguesa', description: 'Mussarela, presunto, ovos, cebola, azeitona', price: 47.9, stock: 50 },
        { name: 'Frango c/ Catupiry', description: 'Mussarela, frango desfiado, catupiry', price: 48.9, stock: 50 },
        { name: 'Pepperoni', description: 'Molho de tomate, mussarela, pepperoni', price: 51.9, stock: 40 },
      ],
    },
    {
      category: 'Pizzas Doces',
      products: [
        { name: 'Brigadeiro', description: 'Mussarela, chocolate, granulado', price: 38.9, stock: 30 },
        { name: 'Romeu e Julieta', description: 'Mussarela, goiabada, queijo minas', price: 36.9, stock: 30 },
      ],
    },
    {
      category: 'Bebidas',
      products: [
        { name: 'Coca-Cola 2L', description: 'Garrafa', price: 14.9, stock: 100 },
        { name: 'Guaraná 2L', description: 'Garrafa', price: 13.9, stock: 100 },
        { name: 'Suco Del Valle', description: '1L', price: 10.9, stock: 50 },
        { name: 'Cerveja Heineken', description: 'Long neck 330ml', price: 9.9, stock: 80 },
      ],
    },
  ],
  ACAITERIA: [
    {
      category: 'Açaís',
      products: [
        { name: 'Açaí Puro 300ml', description: 'Açaí tradicional', price: 14.9, stock: 100 },
        { name: 'Açaí c/ Granola', description: 'Açaí, granola, leite condensado', price: 18.9, stock: 100 },
        { name: 'Açaí Premium', description: 'Açaí, granola, banana, morango, leite em pó, leite condensado', price: 24.9, stock: 80 },
        { name: 'Açaí Power', description: 'Açaí, whey protein, banana, granola, pasta de amendoim', price: 27.9, stock: 60 },
      ],
    },
    {
      category: 'Smoothies',
      products: [
        { name: 'Smoothie Morango', description: 'Leite, morango, banana, mel', price: 16.9, stock: 50 },
        { name: 'Smoothie Verde', description: 'Leite, espinafre, maçã, gengibre', price: 17.9, stock: 40 },
      ],
    },
  ],
  RESTAURANTE: [
    {
      category: 'Pratos Executivos',
      products: [
        { name: 'Filé de Frango Grelhado', description: 'Arroz, feijão, salada, batata frita', price: 29.9, stock: 40 },
        { name: 'Bife Acebolado', description: 'Arroz, feijão, salada, batata frita', price: 34.9, stock: 40 },
        { name: 'Peixe Grelhado', description: 'Arroz, purê de batata, legumes no vapor', price: 32.9, stock: 30 },
      ],
    },
    {
      category: 'Saladas',
      products: [
        { name: 'Salada Caesar', description: 'Alface americana, croutons, parmesão, peito de frango', price: 24.9, stock: 30 },
        { name: 'Salada Tropical', description: 'Mix de folhas, manga, nozes, queijo branco', price: 22.9, stock: 30 },
      ],
    },
  ],
  SORVETERIA: [
    {
      category: 'Sorvetes',
      products: [
        { name: 'Casquinha', description: '1 bola', price: 6, stock: 200 },
        { name: 'Cascão', description: '2 bolas', price: 10, stock: 200 },
        { name: 'Milkshake', description: '400ml', price: 16.9, stock: 100 },
        { name: 'Sundae', description: 'Sorvete, calda, chantilly, cereja', price: 14.9, stock: 100 },
      ],
    },
    {
      category: 'Açaís',
      products: [
        { name: 'Açaí 300ml', description: 'Com granola e leite condensado', price: 15.9, stock: 80 },
        { name: 'Açaí 500ml', description: 'Com 3 complementos à escolha', price: 22.9, stock: 80 },
      ],
    },
  ],
  BAR: [
    {
      category: 'Petiscos',
      products: [
        { name: 'Batata Frita', description: 'Porção grande', price: 28.9, stock: 50 },
        { name: 'Mandioca Frita', description: 'Porção com molho rosé', price: 24.9, stock: 40 },
        { name: 'Camarão Alho e Óleo', description: 'Porção de camarão', price: 42.9, stock: 30 },
        { name: 'Linguiça Acebolada', description: 'Porção com pão de alho', price: 32.9, stock: 40 },
      ],
    },
    {
      category: 'Bebidas',
      products: [
        { name: 'Chopp 300ml', description: 'Cerveja gelada', price: 8.9, stock: 200 },
        { name: 'Heineken Long Neck', description: '330ml', price: 9.9, stock: 150 },
        { name: 'Caipirinha', description: 'Limão, açúcar, cachaça', price: 16.9, stock: 100 },
        { name: 'Gin Tônica', description: 'Gin, água tônica, limão', price: 19.9, stock: 80 },
      ],
    },
  ],
  PADARIA: [
    {
      category: 'Pães',
      products: [
        { name: 'Pão Francês', description: 'Unidade', price: 1.2, stock: 500 },
        { name: 'Pão de Queijo', description: '6 unidades', price: 12.9, stock: 200 },
        { name: 'Baguete', description: 'Unidade', price: 5.9, stock: 100 },
      ],
    },
    {
      category: 'Salgados',
      products: [
        { name: 'Coxinha', description: 'Unidade', price: 5.5, stock: 150 },
        { name: 'Esfiha', description: 'Unidade', price: 6, stock: 150 },
        { name: 'Kibe', description: 'Unidade', price: 5.5, stock: 100 },
      ],
    },
    {
      category: 'Doces',
      products: [
        { name: 'Brigadeiro', description: 'Unidade', price: 3.5, stock: 200 },
        { name: 'Pastel de Belém', description: 'Unidade', price: 6.5, stock: 100 },
      ],
    },
    {
      category: 'Cafés',
      products: [
        { name: 'Café Espresso', description: 'Xícara', price: 4.5, stock: 999 },
        { name: 'Cappuccino', description: 'Xícara média', price: 8.9, stock: 999 },
        { name: 'Café c/ Leite', description: 'Xícara grande', price: 6, stock: 999 },
      ],
    },
  ],
  JAPONESA: [
    {
      category: 'Sushis',
      products: [
        { name: 'Sashimi Salmão (8un)', description: 'Fatias de salmão fresco', price: 38.9, stock: 40 },
        { name: 'Nigiri Salmão (4un)', description: 'Arroz com fatia de salmão', price: 22.9, stock: 40 },
        { name: 'Hot Roll (8un)', description: 'Salmão empanado frito', price: 28.9, stock: 50 },
        { name: 'Uramaki Califórnia (8un)', description: 'Kani, pepino, manga', price: 26.9, stock: 50 },
      ],
    },
    {
      category: 'Temakis',
      products: [
        { name: 'Temaki Salmão', description: 'Salmão, cream cheese, cebolinha', price: 24.9, stock: 40 },
        { name: 'Temaki Atum', description: 'Atum, gengibre, cebolinha', price: 27.9, stock: 30 },
      ],
    },
    {
      category: 'Bebidas',
      products: [
        { name: 'Saquê Quente', description: 'Dose', price: 14.9, stock: 60 },
        { name: 'Soda Italiana', description: 'Morango ou limão siciliano', price: 10.9, stock: 80 },
        { name: 'Coca-Cola 350ml', description: 'Lata', price: 6.5, stock: 100 },
      ],
    },
  ],
  BEBIDAS: [
    {
      category: 'Refrigerantes',
      products: [
        { name: 'Coca-Cola 2L', description: 'Garrafa PET', price: 14.9, stock: 100 },
        { name: 'Guaraná Antarctica 2L', description: 'Garrafa PET', price: 13.5, stock: 100 },
        { name: 'Sprite 2L', description: 'Garrafa PET', price: 13.5, stock: 80 },
        { name: 'Coca-Cola 350ml', description: 'Lata', price: 6.5, stock: 200 },
      ],
    },
    {
      category: 'Sucos',
      products: [
        { name: 'Suco Laranja Natural', description: '300ml', price: 9.9, stock: 50 },
        { name: 'Suco Maracujá', description: '300ml', price: 9.9, stock: 50 },
        { name: 'Água de Coco', description: '330ml', price: 7.5, stock: 80 },
      ],
    },
    {
      category: 'Cervejas',
      products: [
        { name: 'Heineken Long Neck', description: '330ml', price: 9.9, stock: 100 },
        { name: 'Brahma Lata', description: '350ml', price: 5.5, stock: 150 },
        { name: 'Corona Long Neck', description: '330ml', price: 10.9, stock: 80 },
      ],
    },
    {
      category: 'Águas',
      products: [
        { name: 'Água Mineral s/ Gás', description: '500ml', price: 4, stock: 200 },
        { name: 'Água Mineral c/ Gás', description: '500ml', price: 4.5, stock: 150 },
        { name: 'Água Tônica', description: '350ml', price: 6, stock: 80 },
      ],
    },
  ],
};

export const TEMPLATE_META: { key: string; label: string; icon: string }[] = [
  { key: 'HAMBURGUERIA', label: 'Hamburgueria', icon: '🍔' },
  { key: 'PIZZARIA', label: 'Pizzaria', icon: '🍕' },
  { key: 'ACAITERIA', label: 'Açaíteria', icon: '🫐' },
  { key: 'RESTAURANTE', label: 'Restaurante', icon: '🍽️' },
  { key: 'SORVETERIA', label: 'Sorveteria', icon: '🍦' },
  { key: 'BAR', label: 'Bar', icon: '🍺' },
  { key: 'PADARIA', label: 'Padaria', icon: '🥐' },
  { key: 'JAPONESA', label: 'Japonesa', icon: '🍣' },
  { key: 'BEBIDAS', label: 'Bebidas', icon: '🥤' },
];
