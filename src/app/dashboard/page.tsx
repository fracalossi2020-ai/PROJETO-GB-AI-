'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, DollarSign, Users, TrendingUp, Clock, ChefHat, Bike, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    totalCustomers: 0,
    avgTicket: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    fetch('/api/stores')
      .then(r => r.json())
      .then(d => {
        if (d.data?.[0]) {
          const store = d.data[0];
          const orders = store.orders || [];
          const today = new Date().toDateString();
          const todayOrders = orders.filter((o: any) => new Date(o.createdAt).toDateString() === today);
          setStats({
            todayOrders: todayOrders.length,
            todayRevenue: todayOrders.reduce((s: number, o: any) => s + o.total, 0),
            totalCustomers: store.customers?.length || 0,
            avgTicket: todayOrders.length > 0 ? todayOrders.reduce((s: number, o: any) => s + o.total, 0) / todayOrders.length : 0,
            pendingOrders: orders.filter((o: any) => o.status === 'NOVO' || o.status === 'EM_PREPARO').length,
          });
        }
      });
  }, []);

  const cards = [
    { title: 'Pedidos hoje', value: stats.todayOrders, icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Faturamento hoje', value: `R$ ${stats.todayRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-400/10' },
    { title: 'Clientes', value: stats.totalCustomers, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'Ticket médio', value: `R$ ${stats.avgTicket.toFixed(2)}`, icon: TrendingUp, color: 'text-[#ff9607]', bg: 'bg-[#ff9607]/10' },
  ];

  const statusCards = [
    { label: 'Novo', count: 2, icon: Clock, color: 'bg-blue-500' },
    { label: 'Em preparo', count: 3, icon: ChefHat, color: 'bg-yellow-500' },
    { label: 'Saiu', count: 1, icon: Bike, color: 'bg-purple-500' },
    { label: 'Entregue', count: 15, icon: CheckCircle, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-400">Visão geral do seu negócio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-gray-900 border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
              <p className="text-gray-400 text-sm">{card.title}</p>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div>
        <h3 className="font-bold mb-4">Status dos pedidos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statusCards.map((status) => {
            const Icon = status.icon;
            return (
              <div key={status.label} className="bg-gray-900 border border-white/5 rounded-2xl p-5 text-center">
                <div className={`w-10 h-10 ${status.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-2xl font-bold">{status.count}</p>
                <p className="text-gray-400 text-sm">{status.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
