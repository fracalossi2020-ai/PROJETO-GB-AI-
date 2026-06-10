'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, CreditCard, Wallet, PiggyBank,
  Calendar, ArrowUpRight, ArrowDownRight, Download, BarChart3, ShoppingBag,
  Users, MapPin, Star
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

interface Order {
  id: string;
  status: string;
  total: number;
  paymentMethod: string;
  type: string;
  createdAt: string;
}

type Tab = 'financeiro' | 'analise';

export default function FinanceiroPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeTab, setActiveTab] = useState<Tab>('financeiro');

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

  // ─── Financeiro Stats ───
  const finStats = useMemo(() => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const filtered = orders.filter(o => new Date(o.createdAt) >= cutoff && o.status === 'ENTREGUE');
    const revenue = filtered.reduce((s, o) => s + o.total, 0);
    const avgTicket = filtered.length > 0 ? revenue / filtered.length : 0;

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

    const paymentMap: Record<string, number> = {};
    filtered.forEach(o => {
      const m = o.paymentMethod || 'PIX';
      paymentMap[m] = (paymentMap[m] || 0) + o.total;
    });
    const paymentData = Object.entries(paymentMap).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value,
    }));

    const prevCutoff = new Date(cutoff);
    prevCutoff.setDate(prevCutoff.getDate() - days);
    const prevFiltered = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= prevCutoff && d < cutoff && o.status === 'ENTREGUE';
    });
    const prevRevenue = prevFiltered.reduce((s, o) => s + o.total, 0);
    const revenueGrowth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;

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

  // ─── Relatórios Stats ───
  const relStats = useMemo(() => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const filtered = orders.filter(o => new Date(o.createdAt) >= cutoff);
    const delivered = filtered.filter(o => o.status === 'ENTREGUE');

    const dailyMap: Record<string, { orders: number; revenue: number }> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dailyMap[d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })] = { orders: 0, revenue: 0 };
    }
    delivered.forEach(o => {
      const key = new Date(o.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (dailyMap[key]) {
        dailyMap[key].orders += 1;
        dailyMap[key].revenue += o.total;
      }
    });
    const dailyData = Object.entries(dailyMap).map(([dia, v]) => ({ dia, ...v }));

    const deliveryCount = delivered.filter(o => o.type === 'DELIVERY').length;
    const pickupCount = delivered.filter(o => o.type === 'PICKUP').length;
    const dineInCount = delivered.filter(o => o.type === 'DINE_IN').length;
    const typeData = [
      { name: 'Delivery', value: deliveryCount },
      { name: 'Retirada', value: pickupCount },
      { name: 'Salão', value: dineInCount },
    ].filter(d => d.value > 0);

    const hourlyMap: Record<number, number> = {};
    for (let i = 0; i < 24; i++) hourlyMap[i] = 0;
    delivered.forEach(o => { hourlyMap[new Date(o.createdAt).getHours()] += 1; });
    const hourlyData = Object.entries(hourlyMap).map(([h, v]) => ({ hora: `${h}h`, pedidos: v }));

    return {
      totalOrders: filtered.length,
      deliveredCount: delivered.length,
      revenue: delivered.reduce((s, o) => s + o.total, 0),
      avgTicket: delivered.length > 0 ? delivered.reduce((s, o) => s + o.total, 0) / delivered.length : 0,
      cancelledCount: filtered.filter(o => o.status === 'CANCELADO').length,
      dailyData,
      typeData,
      hourlyData,
    };
  }, [orders, period]);

  const PAYMENT_COLORS = ['#ff9607', '#22c55e', '#3b82f6', '#a855f7', '#ef4444'];
  const TYPE_COLORS = ['#ff9607', '#22c55e', '#3b82f6'];

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Financeiro</h1>
          <p className="text-gray-400 text-sm">Acompanhe receitas, despesas e métricas do seu negócio</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white/[0.03] rounded-lg p-1 border border-white/5">
            <button
              onClick={() => setActiveTab('financeiro')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'financeiro' ? 'bg-[#ff9607] text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Visão Financeira
            </button>
            <button
              onClick={() => setActiveTab('analise')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'analise' ? 'bg-[#ff9607] text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Análise de Pedidos
            </button>
          </div>
          <div className="flex bg-white/[0.03] rounded-lg p-1 border border-white/5">
            {(['7d', '30d', '90d'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  period === p ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'financeiro' ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FinCard
              title="Faturamento"
              value={`R$ ${finStats.revenue.toFixed(2)}`}
              icon={DollarSign}
              color="bg-green-500"
              trend={finStats.revenueGrowth}
            />
            <FinCard
              title="Pedidos"
              value={finStats.orderCount.toString()}
              subtitle="No período"
              icon={Wallet}
              color="bg-[#ff9607]"
            />
            <FinCard
              title="Ticket Médio"
              value={`R$ ${finStats.avgTicket.toFixed(2)}`}
              icon={TrendingUp}
              color="bg-blue-500"
            />
            <FinCard
              title="Cancelamentos"
              value={`R$ ${finStats.cancelledValue.toFixed(2)}`}
              subtitle={`${finStats.cancelledCount} pedidos`}
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
                <BarChart data={finStats.dailyData}>
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
                    data={finStats.paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {finStats.paymentData.map((_, i) => (
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
                {finStats.paymentData.map((item, i) => (
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
              {finStats.paymentData.map((item, i) => (
                <div key={item.name} className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${PAYMENT_COLORS[i % PAYMENT_COLORS.length]}20` }}>
                      <CreditCard className="h-4 w-4" style={{ color: PAYMENT_COLORS[i % PAYMENT_COLORS.length] }} />
                    </div>
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <p className="text-lg font-bold">R$ {item.value.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">
                    {finStats.revenue > 0 ? ((item.value / finStats.revenue) * 100).toFixed(1) : 0}% do total
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <RelCard icon={ShoppingBag} label="Pedidos" value={relStats.totalOrders.toString()} color="bg-blue-500" />
            <RelCard icon={DollarSign} label="Faturamento" value={`R$ ${relStats.revenue.toFixed(0)}`} color="bg-green-500" />
            <RelCard icon={TrendingUp} label="Ticket Médio" value={`R$ ${relStats.avgTicket.toFixed(2)}`} color="bg-[#ff9607]" />
            <RelCard icon={TrendingDown} label="Cancelados" value={relStats.cancelledCount.toString()} color="bg-red-500" />
            <RelCard icon={Star} label="Taxa Conversão" value={`${relStats.totalOrders > 0 ? ((relStats.deliveredCount / relStats.totalOrders) * 100).toFixed(0) : 0}%`} color="bg-purple-500" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
              <h3 className="font-bold text-sm mb-4">Pedidos e Faturamento por Dia</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={relStats.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="dia" stroke="#666" fontSize={10} />
                  <YAxis yAxisId="left" stroke="#666" fontSize={10} />
                  <YAxis yAxisId="right" orientation="right" stroke="#666" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} />
                  <Bar yAxisId="left" dataKey="orders" fill="#ff9607" radius={[4, 4, 0, 0]} name="Pedidos" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} name="Faturamento" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
              <h3 className="font-bold text-sm mb-4">Pedidos por Hora do Dia</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={relStats.hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="hora" stroke="#666" fontSize={10} />
                  <YAxis stroke="#666" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="pedidos" stroke="#ff9607" strokeWidth={2} dot={{ fill: '#ff9607', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
              <h3 className="font-bold text-sm mb-4">Pedidos por Tipo</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={relStats.typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {relStats.typeData.map((_, i) => (
                      <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {relStats.typeData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TYPE_COLORS[i % TYPE_COLORS.length] }} />
                    <span className="text-gray-400">{item.name}</span>
                    <span className="font-medium">({item.value})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
              <h3 className="font-bold text-sm mb-4">Resumo do Período</h3>
              <div className="space-y-3">
                <SummaryRow label="Total de pedidos" value={relStats.totalOrders.toString()} />
                <SummaryRow label="Pedidos entregues" value={relStats.deliveredCount.toString()} color="text-green-400" />
                <SummaryRow label="Pedidos cancelados" value={relStats.cancelledCount.toString()} color="text-red-400" />
                <SummaryRow label="Faturamento bruto" value={`R$ ${relStats.revenue.toFixed(2)}`} />
                <SummaryRow label="Ticket médio" value={`R$ ${relStats.avgTicket.toFixed(2)}`} />
                <SummaryRow label="Taxa de conversão" value={`${relStats.totalOrders > 0 ? ((relStats.deliveredCount / relStats.totalOrders) * 100).toFixed(1) : 0}%`} />
                <SummaryRow label="Média diária" value={`${(relStats.deliveredCount / (period === '7d' ? 7 : period === '30d' ? 30 : 90)).toFixed(1)} pedidos`} />
              </div>
            </div>
          </div>
        </>
      )}
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

function RelCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl backdrop-blur-sm p-4">
      <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center mb-2`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function SummaryRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-sm font-bold ${color || 'text-white'}`}>{value}</span>
    </div>
  );
}
