'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Download, BarChart3, TrendingUp, TrendingDown, Calendar,
  ShoppingBag, DollarSign, Users, MapPin, Star
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

interface Order {
  id: string;
  status: string;
  total: number;
  paymentMethod: string;
  type: string;
  createdAt: string;
}

export default function RelatoriosPage() {
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

    const filtered = orders.filter(o => new Date(o.createdAt) >= cutoff);
    const delivered = filtered.filter(o => o.status === 'ENTREGUE');

    // Daily orders & revenue
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

    // Delivery vs Pickup
    const deliveryCount = delivered.filter(o => o.type === 'DELIVERY').length;
    const pickupCount = delivered.filter(o => o.type === 'PICKUP').length;
    const dineInCount = delivered.filter(o => o.type === 'DINE_IN').length;
    const typeData = [
      { name: 'Delivery', value: deliveryCount },
      { name: 'Retirada', value: pickupCount },
      { name: 'Salão', value: dineInCount },
    ].filter(d => d.value > 0);

    // Hourly distribution
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

  const COLORS = ['#ff9607', '#22c55e', '#3b82f6'];

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
          <h1 className="text-xl font-bold">Relatórios</h1>
          <p className="text-gray-400 text-sm">Análise completa do desempenho do seu negócio</p>
        </div>
        <div className="flex gap-2">
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
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-lg text-xs text-gray-400 hover:text-white transition-colors">
            <Download className="h-3.5 w-3.5" /> Exportar
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <RelCard icon={ShoppingBag} label="Pedidos" value={stats.totalOrders.toString()} color="bg-blue-500" />
        <RelCard icon={DollarSign} label="Faturamento" value={`R$ ${stats.revenue.toFixed(0)}`} color="bg-green-500" />
        <RelCard icon={TrendingUp} label="Ticket Médio" value={`R$ ${stats.avgTicket.toFixed(2)}`} color="bg-[#ff9607]" />
        <RelCard icon={TrendingDown} label="Cancelados" value={stats.cancelledCount.toString()} color="bg-red-500" />
        <RelCard icon={Star} label="Taxa Conversão" value={`${stats.totalOrders > 0 ? ((stats.deliveredCount / stats.totalOrders) * 100).toFixed(0) : 0}%`} color="bg-purple-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Orders & Revenue */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <h3 className="font-bold text-sm mb-4">Pedidos e Faturamento por Dia</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.dailyData}>
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

        {/* Hourly Distribution */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <h3 className="font-bold text-sm mb-4">Pedidos por Hora do Dia</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={stats.hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="hora" stroke="#666" fontSize={10} />
              <YAxis stroke="#666" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="pedidos" stroke="#ff9607" strokeWidth={2} dot={{ fill: '#ff9607', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order Type */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <h3 className="font-bold text-sm mb-4">Pedidos por Tipo</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={stats.typeData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {stats.typeData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {stats.typeData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-gray-400">{item.name}</span>
                <span className="font-medium">({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Table */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <h3 className="font-bold text-sm mb-4">Resumo do Período</h3>
          <div className="space-y-3">
            <SummaryRow label="Total de pedidos" value={stats.totalOrders.toString()} />
            <SummaryRow label="Pedidos entregues" value={stats.deliveredCount.toString()} color="text-green-400" />
            <SummaryRow label="Pedidos cancelados" value={stats.cancelledCount.toString()} color="text-red-400" />
            <SummaryRow label="Faturamento bruto" value={`R$ ${stats.revenue.toFixed(2)}`} />
            <SummaryRow label="Ticket médio" value={`R$ ${stats.avgTicket.toFixed(2)}`} />
            <SummaryRow label="Taxa de conversão" value={`${stats.totalOrders > 0 ? ((stats.deliveredCount / stats.totalOrders) * 100).toFixed(1) : 0}%`} />
            <SummaryRow label="Média diária" value={`${(stats.deliveredCount / (period === '7d' ? 7 : period === '30d' ? 30 : 90)).toFixed(1)} pedidos`} />
          </div>
        </div>
      </div>
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
