'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ShoppingBag, DollarSign, Users, TrendingUp, Clock, ChefHat,
  CheckCircle, Package, AlertCircle, Star, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import MotoIcon from '@/components/MotoIcon';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

interface Order {
  id: string;
  status: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
  customer: { name: string; phone: string };
  items: any[];
}

interface StoreData {
  orders: Order[];
  customers: any[];
  products: any[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  NOVO: { label: 'Novo', color: 'text-blue-400', bg: 'bg-blue-500', icon: Clock },
  EM_PREPARO: { label: 'Em preparo', color: 'text-yellow-400', bg: 'bg-yellow-500', icon: ChefHat },
  SAIU_PARA_ENTREGA: { label: 'Saiu', color: 'text-purple-400', bg: 'bg-purple-500', icon: MotoIcon },
  PRONTO_RETIRADA: { label: 'Pronto', color: 'text-cyan-400', bg: 'bg-cyan-500', icon: Package },
  ENTREGUE: { label: 'Entregue', color: 'text-green-400', bg: 'bg-green-500', icon: CheckCircle },
  CANCELADO: { label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-500', icon: AlertCircle },
};

const PAYMENT_COLORS = ['#ff9607', '#22c55e', '#3b82f6', '#a855f7', '#ef4444'];

export default function DashboardPage() {
  const [data, setData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'hoje' | 'semana' | 'mes'>('hoje');

  useEffect(() => {
    fetch('/api/stores')
      .then(r => r.json())
      .then(d => {
        if (d.data?.[0]) {
          setData(d.data[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    if (!data) return null;
    const orders = data.orders || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    const filterDate = period === 'hoje' ? today : period === 'semana' ? weekAgo : monthAgo;

    const filteredOrders = orders.filter((o: Order) => new Date(o.createdAt) >= filterDate);
    const deliveredOrders = filteredOrders.filter((o: Order) => o.status === 'ENTREGUE');
    const revenue = deliveredOrders.reduce((s: number, o: Order) => s + o.total, 0);
    const avgTicket = deliveredOrders.length > 0 ? revenue / deliveredOrders.length : 0;

    // Status counts
    const statusCounts: Record<string, number> = {};
    orders.forEach((o: Order) => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    // Payment methods
    const paymentCounts: Record<string, number> = {};
    filteredOrders.forEach((o: Order) => {
      const method = o.paymentMethod || 'PIX';
      paymentCounts[method] = (paymentCounts[method] || 0) + 1;
    });

    // Hourly data for chart
    const hourlyData: Record<number, number> = {};
    for (let i = 8; i <= 23; i++) hourlyData[i] = 0;
    filteredOrders.forEach((o: Order) => {
      const h = new Date(o.createdAt).getHours();
      if (hourlyData[h] !== undefined) hourlyData[h] += o.total;
    });
    const chartData = Object.entries(hourlyData).map(([h, v]) => ({ hora: `${h}h`, valor: v }));

    // Payment chart data
    const paymentChartData = Object.entries(paymentCounts).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value,
    }));

    // Weekly comparison (mock growth)
    const prevPeriodOrders = orders.filter((o: Order) => {
      const d = new Date(o.createdAt);
      return d >= new Date(filterDate.getTime() - (period === 'hoje' ? 86400000 : period === 'semana' ? 604800000 : 2592000000)) && d < filterDate;
    }).filter((o: Order) => o.status === 'ENTREGUE');

    const growth = prevPeriodOrders.length > 0
      ? ((deliveredOrders.length - prevPeriodOrders.length) / prevPeriodOrders.length * 100)
      : 0;

    return {
      totalOrders: filteredOrders.length,
      deliveredCount: deliveredOrders.length,
      revenue,
      avgTicket,
      totalCustomers: data.customers?.length || 0,
      statusCounts,
      paymentChartData,
      chartData,
      growth,
      pendingOrders: orders.filter((o: Order) => o.status === 'NOVO' || o.status === 'EM_PREPARO').length,
    };
  }, [data, period]);

  const recentOrders = useMemo(() => {
    if (!data) return [];
    return [...(data.orders || [])]
      .sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Visão Geral</h1>
          <p className="text-gray-400 text-sm">Acompanhe o desempenho do seu negócio</p>
        </div>
        <div className="flex bg-white/[0.03] rounded-xl p-1 border border-white/[0.08] backdrop-blur-sm">
          {(['hoje', 'semana', 'mes'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                period === p ? 'bg-gradient-to-r from-[#ff9607] to-[#ffaa33] text-black font-bold shadow-[0_0_10px_rgba(255,150,7,0.3)]' : 'text-white/40 hover:text-white'
              }`}
            >
              {p === 'hoje' ? 'Hoje' : p === 'semana' ? '7 dias' : '30 dias'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Pedidos"
          value={stats.totalOrders.toString()}
          subtitle={`${stats.deliveredCount} entregues`}
          icon={ShoppingBag}
          color="bg-blue-500"
          trend={stats.growth}
        />
        <KpiCard
          title="Faturamento"
          value={`R$ ${stats.revenue.toFixed(2)}`}
          subtitle="Total no período"
          icon={DollarSign}
          color="bg-green-500"
          trend={stats.growth}
        />
        <KpiCard
          title="Ticket Médio"
          value={`R$ ${stats.avgTicket.toFixed(2)}`}
          subtitle="Por pedido"
          icon={TrendingUp}
          color="bg-[#ff9607]"
        />
        <KpiCard
          title="Clientes"
          value={stats.totalCustomers.toString()}
          subtitle="Cadastrados"
          icon={Users}
          color="bg-purple-500"
        />
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const Icon = config.icon;
          const count = stats.statusCounts[key] || 0;
          return (
            <div key={key} className="bg-zinc-900 border border-white/5 rounded-xl p-4 text-center hover:border-white/10 transition-colors">
              <div className={`w-9 h-9 ${config.bg} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <p className="text-xl font-bold">{count}</p>
              <p className="text-gray-400 text-xs">{config.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 backdrop-blur-sm">
          <h3 className="font-bold text-sm mb-4">Faturamento por hora</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={stats.chartData}>
              <defs>
                <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff9607" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ff9607" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="hora" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} tickFormatter={(v) => `R$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Faturamento']}
              />
              <Area type="monotone" dataKey="valor" stroke="#ff9607" fillOpacity={1} fill="url(#colorValor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 backdrop-blur-sm">
          <h3 className="font-bold text-sm mb-4">Formas de Pagamento</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={stats.paymentChartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {stats.paymentChartData.map((_, i) => (
                  <Cell key={i} fill={PAYMENT_COLORS[i % PAYMENT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {stats.paymentChartData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[i % PAYMENT_COLORS.length] }} />
                  <span className="text-gray-400">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders + Rating */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Pedidos Recentes</h3>
            <Link href="/dashboard/pedidos" className="text-[#ff9607] text-xs hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="space-y-2">
            {recentOrders.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">Nenhum pedido ainda</p>
            )}
            {recentOrders.map((order: Order) => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.NOVO;
              const StatusIcon = status.icon;
              return (
                <Link
                  key={order.id}
                  href={`/dashboard/pedidos/${order.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${status.bg} rounded-lg flex items-center justify-center`}>
                      <StatusIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{order.customer?.name || 'Cliente'}</p>
                      <p className="text-xs text-gray-500">
                        {order.items?.length || 0} itens · {order.paymentMethod?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">R$ {order.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {/* Rating Card */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 backdrop-blur-sm">
            <h3 className="font-bold text-sm mb-3">Avaliação do Cardápio</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 bg-[#ff9607]/10 rounded-xl flex items-center justify-center">
                <Star className="h-7 w-7 text-[#ff9607]" />
              </div>
              <div>
                <p className="text-2xl font-bold">4.8</p>
                <p className="text-xs text-gray-500">de 5 estrelas</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map(star => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-3">{star}</span>
                  <Star className="h-3 w-3 text-[#ff9607]" />
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ff9607] rounded-full"
                      style={{ width: `${star === 5 ? 65 : star === 4 ? 25 : star === 3 ? 7 : star === 2 ? 2 : 1}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-6 text-right">
                    {star === 5 ? '65%' : star === 4 ? '25%' : star === 3 ? '7%' : star === 2 ? '2%' : '1%'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Alert */}
          {stats.pendingOrders > 0 && (
            <div className="bg-[#ff9607]/5 border border-[#ff9607]/20 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-[#ff9607]" />
                <div>
                  <p className="text-sm font-bold text-[#ff9607]">{stats.pendingOrders} pedido{stats.pendingOrders > 1 ? 's' : ''} pendente{stats.pendingOrders > 1 ? 's' : ''}</p>
                  <p className="text-xs text-gray-400">Aguardando preparo ou entrega</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, subtitle, icon: Icon, color, trend }: {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  color: string;
  trend?: number;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 hover:border-white/[0.15] transition-all hover:-translate-y-0.5 backdrop-blur-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend).toFixed(0)}%
          </div>
        )}
      </div>
      <p className="text-gray-400 text-xs">{title}</p>
      <p className="text-xl font-bold mt-0.5">{value}</p>
      <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
    </div>
  );
}
