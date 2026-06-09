'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search, Filter, Clock, ChefHat, Bike, CheckCircle, Package,
  AlertCircle, ArrowUpDown, Eye, MapPin, Phone, CreditCard
} from 'lucide-react';

interface Order {
  id: string;
  status: string;
  type: string;
  total: number;
  paymentMethod: string;
  changeFor?: number;
  createdAt: string;
  customer: { name: string; phone: string; address?: string };
  items: { quantity: number; product: { name: string }; totalPrice: number }[];
}

const STATUS_OPTIONS = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'NOVO', label: 'Novo' },
  { value: 'EM_PREPARO', label: 'Em preparo' },
  { value: 'SAIU_PARA_ENTREGA', label: 'Saiu para entrega' },
  { value: 'PRONTO_RETIRADA', label: 'Pronto p/ retirada' },
  { value: 'ENTREGUE', label: 'Entregue' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  NOVO: { label: 'Novo', color: 'text-blue-400', bg: 'bg-blue-500', icon: Clock },
  EM_PREPARO: { label: 'Em preparo', color: 'text-yellow-400', bg: 'bg-yellow-500', icon: ChefHat },
  SAIU_PARA_ENTREGA: { label: 'Saiu', color: 'text-purple-400', bg: 'bg-purple-500', icon: Bike },
  PRONTO_RETIRADA: { label: 'Pronto', color: 'text-cyan-400', bg: 'bg-cyan-500', icon: Package },
  ENTREGUE: { label: 'Entregue', color: 'text-green-400', bg: 'bg-green-500', icon: CheckCircle },
  CANCELADO: { label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-500', icon: AlertCircle },
};

const PAYMENT_LABELS: Record<string, string> = {
  PIX: 'PIX',
  DINHEIRO: 'Dinheiro',
  CARTAO_CREDITO: 'Cartão Crédito',
  CARTAO_DEBITO: 'Cartão Débito',
  VALE_REFEICAO: 'Vale Refeição',
};

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [sortBy, setSortBy] = useState<'date' | 'total'>('date');
  const [sortDesc, setSortDesc] = useState(true);

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

  const filtered = useMemo(() => {
    let result = [...orders];

    if (statusFilter !== 'TODOS') {
      result = result.filter(o => o.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        o.customer?.name?.toLowerCase().includes(q) ||
        o.id?.toLowerCase().includes(q) ||
        o.items?.some(i => i.product?.name?.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'date') {
        const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return sortDesc ? diff : -diff;
      }
      return sortDesc ? b.total - a.total : a.total - b.total;
    });

    return result;
  }, [orders, statusFilter, search, sortBy, sortDesc]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { TODOS: orders.length };
    orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return counts;
  }, [orders]);

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
          <h1 className="text-xl font-bold">Pedidos</h1>
          <p className="text-gray-400 text-sm">Gerencie todos os pedidos do seu estabelecimento</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Total:</span>
          <span className="font-bold">{orders.length}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por cliente, ID ou produto..."
            className="w-full bg-white/[0.03] border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607]"
          />
        </div>
        <button
          onClick={() => { setSortBy(sortBy === 'date' ? 'total' : 'date'); setSortDesc(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-white/5 rounded-xl text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowUpDown className="h-4 w-4" />
          {sortBy === 'date' ? 'Data' : 'Valor'}
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              statusFilter === opt.value
                ? 'bg-[#ff9607] text-black'
                : 'bg-white/[0.03] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            {opt.label}
            <span className="ml-1.5 opacity-70">({statusCounts[opt.value] || 0})</span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm">
            <Filter className="h-8 w-8 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Nenhum pedido encontrado</p>
          </div>
        )}

        {filtered.map(order => {
          const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.NOVO;
          const StatusIcon = status.icon;
          const paymentLabel = PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod;

          return (
            <div
              key={order.id}
              className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 hover:border-white/[0.15] transition-all backdrop-blur-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${status.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <StatusIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{order.customer?.name || 'Cliente'}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${status.color} bg-white/5`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(order.createdAt).toLocaleString('pt-BR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        {paymentLabel}
                        {order.changeFor && order.changeFor > 0 && ` · Troco p/ R$ ${order.changeFor.toFixed(2)}`}
                      </span>
                      {order.type === 'DELIVERY' && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />Delivery
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <p className="font-bold">R$ {order.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{order.items?.length || 0} itens</p>
                  </div>
                  <Link
                    href={`/dashboard/pedidos/${order.id}`}
                    className="p-2 bg-white/5 rounded-lg hover:bg-[#ff9607]/10 hover:text-[#ff9607] transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Items preview */}
              <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                {order.items?.slice(0, 3).map((item, i) => (
                  <span key={i} className="text-xs bg-white/5 px-2 py-1 rounded-md text-gray-400">
                    {item.quantity}x {item.product?.name}
                  </span>
                ))}
                {(order.items?.length || 0) > 3 && (
                  <span className="text-xs text-gray-500">+{(order.items.length - 3)} mais</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
