'use client';

import { useEffect, useState, useMemo } from 'react';

export type Period = '7d' | '30d' | '90d' | 'mes' | 'mes_anterior';

interface Product {
  id: string;
  name: string;
  price: number;
  costPrice: number | null;
  categoryId: string | null;
  category?: { name: string } | null;
}

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productId: string;
  product: Product;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  neighborhood?: string | null;
}

interface Order {
  id: string;
  status: string;
  type: string;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  serviceFee: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  customerId: string;
  customer: Customer;
  items: OrderItem[];
}

interface Store {
  id: string;
  name: string;
  categories: { id: string; name: string; products: Product[] }[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
  deliveryZones: { id: string; name: string; deliveryFee: number }[];
}

function parseDate(d: string | Date) {
  return new Date(d);
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function getPeriodDays(period: Period): number {
  switch (period) {
    case '7d': return 7;
    case '30d': return 30;
    case '90d': return 90;
    case 'mes': return 30; // aproximado, mas usaremos lógica de mês real
    case 'mes_anterior': return 30;
    default: return 30;
  }
}

function getCutoff(period: Period) {
  const now = new Date();
  if (period === 'mes') {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  if (period === 'mes_anterior') {
    return new Date(now.getFullYear(), now.getMonth() - 1, 1);
  }
  const days = getPeriodDays(period);
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function getEndCutoff(period: Period) {
  const now = new Date();
  if (period === 'mes') {
    return now;
  }
  if (period === 'mes_anterior') {
    return new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  }
  return now;
}

function getPrevPeriod(period: Period): { start: Date; end: Date } {
  const currStart = getCutoff(period);
  const currEnd = getEndCutoff(period);
  const duration = currEnd.getTime() - currStart.getTime();
  return {
    start: new Date(currStart.getTime() - duration - 86400000),
    end: new Date(currStart.getTime() - 86400000),
  };
}

export function useFinanceiroData() {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriodState] = useState<Period>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('gbai_financeiro_period') as Period) || '30d';
    }
    return '30d';
  });
  const [meta, setMeta] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return Number(localStorage.getItem('gbai_meta_faturamento') || '0');
    }
    return 0;
  });

  useEffect(() => {
    fetch('/api/stores')
      .then(r => r.json())
      .then(d => {
        if (d.data?.[0]) {
          setStore(d.data[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const setPeriod = (p: Period) => {
    setPeriodState(p);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gbai_financeiro_period', p);
    }
  };

  const saveMeta = (value: number) => {
    setMeta(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gbai_meta_faturamento', String(value));
    }
  };

  const orders = store?.orders || [];
  const products = store?.products || [];
  const categories = store?.categories || [];
  const customers = store?.customers || [];

  const cutoff = useMemo(() => getCutoff(period), [period]);
  const endCutoff = useMemo(() => getEndCutoff(period), [period]);
  const prevPeriod = useMemo(() => getPrevPeriod(period), [period]);

  const inPeriod = (o: Order) => {
    const d = parseDate(o.createdAt);
    return d >= cutoff && d <= endCutoff;
  };
  const inPrev = (o: Order) => {
    const d = parseDate(o.createdAt);
    return d >= prevPeriod.start && d <= prevPeriod.end;
  };

  const allFiltered = useMemo(() => orders.filter(inPeriod), [orders, cutoff, endCutoff]);
  const delivered = useMemo(() => allFiltered.filter(o => o.status === 'ENTREGUE'), [allFiltered]);
  const prevAll = useMemo(() => orders.filter(inPrev), [orders, prevPeriod]);
  const prevDelivered = useMemo(() => prevAll.filter(o => o.status === 'ENTREGUE'), [prevAll]);

  // ─── KPIs Básicos ───
  const kpis = useMemo(() => {
    const revenue = delivered.reduce((s, o) => s + o.total, 0);
    const orderCount = delivered.length;
    const avgTicket = orderCount > 0 ? revenue / orderCount : 0;
    const cancelled = allFiltered.filter(o => o.status === 'CANCELADO');
    const cancelledValue = cancelled.reduce((s, o) => s + o.total, 0);
    const cancelledCount = cancelled.length;

    const prevRevenue = prevDelivered.reduce((s, o) => s + o.total, 0);
    const revenueGrowth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
    const prevOrderCount = prevDelivered.length;
    const orderGrowth = prevOrderCount > 0 ? ((orderCount - prevOrderCount) / prevOrderCount) * 100 : 0;

    return {
      revenue, orderCount, avgTicket, cancelledValue, cancelledCount,
      revenueGrowth, orderGrowth,
      prevRevenue, prevOrderCount,
    };
  }, [delivered, allFiltered, prevDelivered]);

  // ─── Lucratividade / CMV ───
  const lucroData = useMemo(() => {
    let custoTotal = 0;
    let receitaTotal = 0;
    let discountTotal = 0;
    let serviceFeeTotal = 0;
    let deliveryFeeTotal = 0;

    delivered.forEach(o => {
      receitaTotal += o.total;
      discountTotal += o.discount;
      serviceFeeTotal += o.serviceFee;
      deliveryFeeTotal += o.deliveryFee;
      o.items.forEach(item => {
        const cost = item.product?.costPrice ?? 0;
        custoTotal += cost * item.quantity;
      });
    });

    const lucroBruto = receitaTotal - custoTotal;
    const margem = receitaTotal > 0 ? (lucroBruto / receitaTotal) * 100 : 0;
    const cmv = receitaTotal > 0 ? (custoTotal / receitaTotal) * 100 : 0;

    // Ticket médio por tipo
    const ticketByType: Record<string, { count: number; total: number }> = {};
    delivered.forEach(o => {
      if (!ticketByType[o.type]) ticketByType[o.type] = { count: 0, total: 0 };
      ticketByType[o.type].count += 1;
      ticketByType[o.type].total += o.total;
    });
    const ticketPorTipo = Object.entries(ticketByType).map(([type, v]) => ({
      type: type === 'DELIVERY' ? 'Delivery' : type === 'PICKUP' ? 'Retirada' : type === 'DINE_IN' ? 'Salão' : type,
      count: v.count,
      avg: v.count > 0 ? v.total / v.count : 0,
      total: v.total,
    }));

    return { custoTotal, receitaTotal, lucroBruto, margem, cmv, discountTotal, serviceFeeTotal, deliveryFeeTotal, ticketPorTipo };
  }, [delivered]);

  // ─── Produtos ───
  const produtosData = useMemo(() => {
    const map: Record<string, {
      id: string; name: string; category: string;
      qty: number; revenue: number; cost: number; profit: number;
    }> = {};

    delivered.forEach(o => {
      o.items.forEach(item => {
        const pid = item.productId;
        if (!map[pid]) {
          map[pid] = {
            id: pid,
            name: item.product?.name || 'Desconhecido',
            category: item.product?.category?.name || 'Sem categoria',
            qty: 0, revenue: 0, cost: 0, profit: 0,
          };
        }
        const rev = item.unitPrice * item.quantity;
        const cost = (item.product?.costPrice ?? 0) * item.quantity;
        map[pid].qty += item.quantity;
        map[pid].revenue += rev;
        map[pid].cost += cost;
        map[pid].profit += (rev - cost);
      });
    });

    const list = Object.values(map).sort((a, b) => b.qty - a.qty);
    const byProfit = [...list].sort((a, b) => b.profit - a.profit);

    // Por categoria
    const catMap: Record<string, { name: string; revenue: number; cost: number; profit: number; qty: number }> = {};
    list.forEach(p => {
      if (!catMap[p.category]) catMap[p.category] = { name: p.category, revenue: 0, cost: 0, profit: 0, qty: 0 };
      catMap[p.category].revenue += p.revenue;
      catMap[p.category].cost += p.cost;
      catMap[p.category].profit += p.profit;
      catMap[p.category].qty += p.qty;
    });
    const categorias = Object.values(catMap).sort((a, b) => b.revenue - a.revenue);

    return { produtos: list, topLucrativos: byProfit, categorias };
  }, [delivered]);

  // ─── Clientes ───
  const clientesData = useMemo(() => {
    const map: Record<string, { id: string; name: string; phone: string; orders: number; spent: number }> = {};
    let recurrent = 0;
    let newClients = 0;

    delivered.forEach(o => {
      const cid = o.customerId;
      if (!map[cid]) {
        map[cid] = { id: cid, name: o.customer?.name || 'Desconhecido', phone: o.customer?.phone || '', orders: 0, spent: 0 };
      }
      map[cid].orders += 1;
      map[cid].spent += o.total;
    });

    Object.values(map).forEach(c => {
      if (c.orders > 1) recurrent += 1;
      else newClients += 1;
    });

    const list = Object.values(map).sort((a, b) => b.spent - a.spent);
    const totalUnique = list.length;
    const retentionRate = totalUnique > 0 ? (recurrent / totalUnique) * 100 : 0;

    return { top: list.slice(0, 10), totalUnique, recurrent, newClients, retentionRate };
  }, [delivered]);

  // ─── Gráficos Temporais ───
  const temporalData = useMemo(() => {
    const dailyMap: Record<string, { label: string; revenue: number; orders: number; profit: number }> = {};
    const weekdayMap: Record<number, { day: string; revenue: number; orders: number }> = {};
    const hourlyMap: Record<number, { hour: string; orders: number }> = {};
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    // Preencher dias do período para o gráfico diário não ter buracos
    if (period !== 'mes' && period !== 'mes_anterior') {
      const days = getPeriodDays(period);
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        dailyMap[label] = { label, revenue: 0, orders: 0, profit: 0 };
      }
    } else {
      const start = new Date(cutoff);
      const end = new Date(endCutoff);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        dailyMap[label] = { label, revenue: 0, orders: 0, profit: 0 };
      }
    }

    for (let i = 0; i < 7; i++) {
      weekdayMap[i] = { day: dias[i], revenue: 0, orders: 0 };
    }
    for (let i = 0; i < 24; i++) {
      hourlyMap[i] = { hour: `${i}h`, orders: 0 };
    }

    delivered.forEach(o => {
      const d = parseDate(o.createdAt);
      const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (dailyMap[label]) {
        dailyMap[label].revenue += o.total;
        dailyMap[label].orders += 1;
        let dayCost = 0;
        o.items.forEach(item => {
          dayCost += (item.product?.costPrice ?? 0) * item.quantity;
        });
        dailyMap[label].profit += (o.total - dayCost);
      }

      const wd = d.getDay();
      weekdayMap[wd].revenue += o.total;
      weekdayMap[wd].orders += 1;

      const hr = d.getHours();
      hourlyMap[hr].orders += 1;
    });

    return {
      daily: Object.values(dailyMap),
      weekday: Object.values(weekdayMap),
      hourly: Object.values(hourlyMap),
    };
  }, [delivered, period, cutoff, endCutoff]);

  // ─── Formas de Pagamento ───
  const paymentData = useMemo(() => {
    const map: Record<string, number> = {};
    delivered.forEach(o => {
      const m = o.paymentMethod || 'PIX';
      map[m] = (map[m] || 0) + o.total;
    });
    return Object.entries(map).map(([name, value]) => ({
      name: name.replace(/_/g, ' '),
      value,
    }));
  }, [delivered]);

  // ─── Tipos de Pedido ───
  const typeData = useMemo(() => {
    const map: Record<string, number> = {};
    delivered.forEach(o => {
      const t = o.type === 'DELIVERY' ? 'Delivery' : o.type === 'PICKUP' ? 'Retirada' : o.type === 'DINE_IN' ? 'Salão' : o.type;
      map[t] = (map[t] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [delivered]);

  // ─── Zonas / Bairros ───
  const zonasData = useMemo(() => {
    const map: Record<string, { name: string; orders: number; revenue: number }> = {};
    delivered.forEach(o => {
      const bairro = o.customer?.neighborhood || o.customer?.name || 'Não informado';
      if (!map[bairro]) map[bairro] = { name: bairro, orders: 0, revenue: 0 };
      map[bairro].orders += 1;
      map[bairro].revenue += o.total;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }, [delivered]);

  // ─── Tempo Médio ───
  const tempoMedio = useMemo(() => {
    const times = delivered
      .map(o => {
        const start = parseDate(o.createdAt).getTime();
        const end = parseDate(o.updatedAt).getTime();
        const diff = (end - start) / 60000; // minutos
        return diff > 0 && diff < 300 ? diff : null; // ignora diferenças absurdas (>5h)
      })
      .filter((x): x is number => x !== null);
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }, [delivered]);

  // ─── Previsão ───
  const previsao = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysInMonth = endOfMonth.getDate();
    const daysPassed = Math.max(1, now.getDate());

    const monthOrders = orders.filter(o => {
      const d = parseDate(o.createdAt);
      return d >= startOfMonth && d <= now && o.status === 'ENTREGUE';
    });
    const monthRevenue = monthOrders.reduce((s, o) => s + o.total, 0);
    const dailyAvg = monthRevenue / daysPassed;
    const projected = dailyAvg * daysInMonth;

    return { monthRevenue, projected, daysPassed, daysInMonth, dailyAvg };
  }, [orders]);

  return {
    loading,
    period,
    setPeriod,
    meta,
    saveMeta,
    store,
    orders,
    allFiltered,
    delivered,
    kpis,
    lucroData,
    produtosData,
    clientesData,
    temporalData,
    paymentData,
    typeData,
    zonasData,
    tempoMedio,
    previsao,
  };
}
