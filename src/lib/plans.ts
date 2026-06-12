export const PLANS = {
  GRATUITO: {
    id: 'GRATUITO',
    name: 'Grátis',
    price: 0,
    maxStores: 1,
    maxOrdersPerMonth: 100,
    features: ['1 loja', '100 pedidos/mês', 'Cardápio digital', 'Pedidos via WhatsApp'],
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    price: 49.9,
    maxStores: 3,
    maxOrdersPerMonth: Infinity,
    features: ['Até 3 lojas', 'Pedidos ilimitados', 'Relatórios financeiros', 'Múltiplos entregadores'],
  },
  PREMIUM: {
    id: 'PREMIUM',
    name: 'Premium',
    price: 99.9,
    maxStores: Infinity,
    maxOrdersPerMonth: Infinity,
    features: ['Lojas ilimitadas', 'Pedidos ilimitados', 'Robô WhatsApp', 'Entregadores ilimitados', 'Suporte prioritário'],
  },
};

export type PlanId = keyof typeof PLANS;
