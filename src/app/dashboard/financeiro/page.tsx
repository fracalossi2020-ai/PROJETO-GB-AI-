'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, CreditCard, Wallet, PiggyBank,
  Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

interface Order {
  id: string;
  status: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
}

export default function FinanceiroPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetch('/api/stores')
      .then(r => r.json())
      .then(d => {
        if (d.data?.[0]?.orders) {
          setOrders(d.data[0].orders);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const filtered = orders.filter(o => new Date(o.createdAt) >= cutoff && o.status === 'ENTREGUE');
    const revenue = filtered.reduce((s, o) => s + o.total, 0);
    const avgTicket = filtered.length > 0 ? revenue / filtered.length : 0;

    // Daily data
    const dailyMap: Record<string, number> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dailyMap[d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })] = 0;
    }
    filtered.forEach(o => {
      const key = new Date(o.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (dailyMap[key] !== undefined) dailyMap[key] += o.total;
    });
    const dailyData = Object.entries(dailyMap).map(([dia, valor]) => ({ dia, valor }));

    // Payment methods
    const paymentMap: Record<string, number> = {};
    filtered.forEach(o => {
      const m = o.paymentMethod || 'PIX';
      paymentMap[m] = (paymentMap[m] || 0) + o.total;
    });
    const paymentData = Object.entries(paymentMap).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value,
    }));

    // Monthly comparison
    const prevCutoff = new Date(cutoff);
    prevCutoff.setDate(prevCutoff.getDate() - days);
    const prevFiltered = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= prevCutoff && d < cutoff && o.status === 'ENTREGUE';
    });
    const prevRevenue = prevFiltered.reduce((s, o) => s + o.total, 0);
    const revenueGrowth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;

    // Cancelled orders value
    const cancelled = orders.filter(o => o.status === 'CANCELADO' && new Date(o.createdAt) >= cutoff);
    const cancelledValue = cancelled.reduce((s, o) => s + o.total, 0);

    return {
      revenue,
      orderCount: filtered.length,
      avgTicket,
      dailyData,
      paymentData,
      revenueGrowth,
      cancelledValue,
      cancelledCount: cancelled.length,
    };
  }, [orders, period]);

  const PAYMENT_COLORS = ['#ff9607', '#22c55e', '#3b82f6', '#a855f7', '#ef4444'];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-white/5 rounded animate-pulse" />
        <div className="h-96 bg-white/5 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Financeiro</h1>
          <p className="text-gray-400 text-sm">Acompanhe receitas, despesas e métricas financeiras</p>
        </div>
        <div className="flex bg-white/[0.03] rounded-lg p-1 border border-white/5">
          {(['7d', '30d', '90d'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                period === p ? 'bg-[#ff9607] text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FinCard
          title="Faturamento"
          value={`R$ ${stats.revenue.toFixed(2)}`}
          icon={DollarSign}
          color="bg-green-500"
          trend={stats.revenueGrowth}
        />
        <FinCard
          title="Pedidos"
          value={stats.orderCount.toString()}
          subtitle="No período"
          icon={Wallet}
          color="bg-[#ff9607]"
        />
        <FinCard
          title="Ticket Médio"
          value={`R$ ${stats.avgTicket.toFixed(2)}`}
          icon={TrendingUp}
          color="bg-blue-500"
        />
        <FinCard
          title="Cancelamentos"
          value={`R$ ${stats.cancelledValue.toFixed(2)}`}
          subtitle={`${stats.cancelledCount} pedidos`}
          icon={TrendingDown}
          color="bg-red-500"
          negative
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <h3 className="font-bold text-sm mb-4">Faturamento Diário</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="dia" stroke="#666" fontSize={11} />
              <YAxis stroke="#666" fontSize={11} tickFormatter={v => `R$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Faturamento']}
              />
              <Bar dataKey="valor" fill="#ff9607" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <h3 className="font-bold text-sm mb-4">Por Forma de Pagamento</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={stats.paymentData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {stats.paymentData.map((_, i) => (
                  <Cell key={i} fill={PAYMENT_COLORS[i % PAYMENT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {stats.paymentData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[i % PAYMENT_COLORS.length] }} />
                  <span className="text-gray-400">{item.name}</span>
                </div>
                <span className="font-medium">R$ {item.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
        <h3 className="font-bold text-sm mb-4">Resumo por Forma de Pagamento</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.paymentData.map((item, i) => (
            <div key={item.name} className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${PAYMENT_COLORS[i % PAYMENT_COLORS.length]}20` }}>
                  <CreditCard className="h-4 w-4" style={{ color: PAYMENT_COLORS[i % PAYMENT_COLORS.length] }} />
                </div>
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <p className="text-lg font-bold">R$ {item.value.toFixed(2)}</p>
              <p className="text-xs text-gray-500">
                {stats.revenue > 0 ? ((item.value / stats.revenue) * 100).toFixed(1) : 0}% do total
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FinCard({ title, value, subtitle, icon: Icon, color, trend, negative }: any) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${
            negative ? (trend >= 0 ? 'text-red-400' : 'text-green-400') : (trend >= 0 ? 'text-green-400' : 'text-red-400')
          }`}>
            {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend).toFixed(0)}%
          </div>
        )}
      </div>
      <p className="text-gray-400 text-xs">{title}</p>
      <p className="text-xl font-bold mt-0.5">{value}</p>
      {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
    </div>
  );
}
