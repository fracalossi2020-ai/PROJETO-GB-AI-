'use client';

import { useEffect, useState } from 'react';
import { Clock, ChefHat, Bike, CheckCircle, XCircle, Volume2, VolumeX } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  type: string;
  total: number;
  customer: { name: string; phone: string };
  items: { product: { name: string }; quantity: number }[];
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any; next: string | null }> = {
  NOVO: { label: 'Novo', color: 'text-blue-400', bg: 'bg-blue-500', icon: Clock, next: 'EM_PREPARO' },
  EM_PREPARO: { label: 'Em Preparo', color: 'text-yellow-400', bg: 'bg-yellow-500', icon: ChefHat, next: 'SAIU_PARA_ENTREGA' },
  SAIU_PARA_ENTREGA: { label: 'Saiu', color: 'text-purple-400', bg: 'bg-purple-500', icon: Bike, next: 'ENTREGUE' },
  ENTREGUE: { label: 'Entregue', color: 'text-green-400', bg: 'bg-green-500', icon: CheckCircle, next: null },
  CANCELADO: { label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-500', icon: XCircle, next: null },
};

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  async function loadOrders() {
    try {
      const res = await fetch('/api/stores');
      const data = await res.json();
      if (data.data?.[0]) {
        setOrders(data.data[0].orders || []);
      }
    } catch (e) {}
  }

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, [])

  async function updateStatus(orderId: string, status: string) {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadOrders();
  }

  const grouped = orders.reduce((acc, order) => {
    if (!acc[order.status]) acc[order.status] = [];
    acc[order.status].push(order);
    return acc;
  }, {} as Record<string, Order[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <p className="text-gray-400">Gerencie todos os pedidos em tempo real</p>
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-3 rounded-xl border transition-colors ${
            soundEnabled ? 'border-[#ff9607] text-[#ff9607]' : 'border-white/10 text-gray-400'
          }`}
        >
          {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Object.entries(statusConfig).filter(([k]) => k !== 'CANCELADO').map(([status, config]) => {
          const Icon = config.icon;
          const statusOrders = grouped[status] || [];
          return (
            <div key={status} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${config.bg}`} />
                <h3 className="font-bold">{config.label}</h3>
                <span className="text-sm text-gray-400">({statusOrders.length})</span>
              </div>
              <div className="space-y-3">
                {statusOrders.map((order) => (
                  <div key={order.id} className="bg-gray-900 border border-white/5 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm text-gray-500">#{order.id.slice(-6)}</span>
                      <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString('pt-BR')}</span>
                    </div>
                    <div>
                      <p className="font-medium">{order.customer.name}</p>
                      <p className="text-sm text-gray-400">{order.customer.phone}</p>
                    </div>
                    <div className="text-sm text-gray-400">
                      {order.items.map((item, i) => (
                        <span key={i}>{item.quantity}x {item.product.name}{i < order.items.length - 1 ? ', ' : ''}</span>
                      ))}
                    </div>
                    <p className="text-lg font-bold text-[#ff9607]">R$ {order.total.toFixed(2)}</p>
                    {config.next && (
                      <button
                        onClick={() => updateStatus(order.id, config.next!)}
                        className="w-full bg-white/5 hover:bg-[#ff9607] hover:text-black py-2 rounded-xl text-sm font-medium transition-colors"
                      >
                        Avançar →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
