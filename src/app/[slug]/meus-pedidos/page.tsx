'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Package, Search, Clock, ChefHat, CheckCircle,
  MapPin, Phone, CreditCard, AlertCircle, ShoppingBag, Eye
} from 'lucide-react';
import MotoIcon from '@/components/MotoIcon';
import { GridPattern, GlowOrb } from '@/components/GridPattern';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any; glow: string }> = {
  NOVO: { label: 'Novo', color: 'text-blue-400', bg: 'bg-blue-500', icon: Clock, glow: 'shadow-[0_0_15px_rgba(59,130,246,0.4)]' },
  EM_PREPARO: { label: 'Em preparo', color: 'text-yellow-400', bg: 'bg-yellow-500', icon: ChefHat, glow: 'shadow-[0_0_15px_rgba(234,179,8,0.4)]' },
  SAIU_PARA_ENTREGA: { label: 'Saiu', color: 'text-purple-400', bg: 'bg-purple-500', icon: MotoIcon, glow: 'shadow-[0_0_15px_rgba(168,85,247,0.4)]' },
  PRONTO_RETIRADA: { label: 'Pronto', color: 'text-cyan-400', bg: 'bg-cyan-500', icon: Package, glow: 'shadow-[0_0_15px_rgba(6,182,212,0.4)]' },
  ENTREGUE: { label: 'Entregue', color: 'text-green-400', bg: 'bg-green-500', icon: CheckCircle, glow: 'shadow-[0_0_15px_rgba(34,197,94,0.4)]' },
  CANCELADO: { label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-500', icon: AlertCircle, glow: 'shadow-[0_0_15px_rgba(239,68,68,0.4)]' },
};

const PAYMENT_LABELS: Record<string, string> = {
  PIX: 'PIX',
  DINHEIRO: 'Dinheiro',
  CARTAO_CREDITO: 'Cartão Crédito',
  CARTAO_DEBITO: 'Cartão Débito',
  VALE_REFEICAO: 'Vale Refeição',
};

export default function MeusPedidosPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  // Carrega telefone salvo
  useEffect(() => {
    const saved = localStorage.getItem('customer_phone');
    if (saved) {
      setPhone(saved);
      fetchOrders(saved);
    }
  }, [slug]);

  async function fetchOrders(phoneNumber: string) {
    if (!phoneNumber.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/by-customer?storeSlug=${slug}&phone=${encodeURIComponent(phoneNumber.trim())}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data.orders || []);
        setCustomer(data.data.customer);
        localStorage.setItem('customer_phone', phoneNumber.trim());
      }
    } catch {
      alert('Erro ao buscar pedidos');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchOrders(phone);
  }

  const activeOrders = orders.filter(o => !['ENTREGUE', 'CANCELADO'].includes(o.status));
  const pastOrders = orders.filter(o => ['ENTREGUE', 'CANCELADO'].includes(o.status));

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      <GridPattern className="opacity-40" />
      <GlowOrb color="orange" className="w-[500px] h-[500px] -top-40 -right-40 opacity-15" />
      <GlowOrb color="cyan" className="w-[400px] h-[400px] -bottom-20 -left-20 opacity-10" />

      <div className="max-w-lg mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href={`/${slug}`} className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition-all">
            <ArrowLeft className="h-5 w-5 text-white/60" />
          </Link>
          <div>
            <h1 className="text-xl font-black">Meus Pedidos</h1>
            <p className="text-white/40 text-sm">Acompanhe seu histórico</p>
          </div>
        </div>

        {/* Phone Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <label className="block text-xs font-medium text-white/60 mb-2">Digite seu telefone</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#ff9607]/50 focus:shadow-[0_0_15px_rgba(255,150,7,0.15)] transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="px-4 bg-gradient-to-r from-[#ff9607] to-[#ffaa33] text-black rounded-xl font-bold hover:shadow-[0_0_25px_rgba(255,150,7,0.4)] transition-all disabled:opacity-50"
            >
              {loading ? <Clock className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            </button>
          </div>
        </form>

        {searched && orders.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-8 w-8 text-white/20" />
            </div>
            <p className="text-white/40 font-medium">Nenhum pedido encontrado</p>
            <p className="text-white/20 text-sm mt-1">Faça seu primeiro pedido!</p>
            <Link
              href={`/${slug}`}
              className="inline-block mt-4 text-[#ff9607] text-sm font-medium hover:text-[#ffaa33] transition-colors"
            >
              Ir para o cardápio →
            </Link>
          </motion.div>
        )}

        {/* Active Orders */}
        <AnimatePresence>
          {activeOrders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-3">
                Em andamento ({activeOrders.length})
              </h2>
              <div className="space-y-3">
                {activeOrders.map((order) => (
                  <OrderCard key={order.id} order={order} slug={slug} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Past Orders */}
        <AnimatePresence>
          {pastOrders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-3">
                Histórico ({pastOrders.length})
              </h2>
              <div className="space-y-3">
                {pastOrders.map((order) => (
                  <OrderCard key={order.id} order={order} slug={slug} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function OrderCard({ order, slug }: { order: any; slug: string }) {
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.NOVO;
  const StatusIcon = status.icon;
  const paymentLabel = PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="backdrop-blur-sm bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 hover:border-white/[0.15] transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${status.bg} rounded-xl flex items-center justify-center ${status.glow}`}>
            <StatusIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">Pedido #${order.orderNumber || order.id.slice(-6).toUpperCase()}</p>
            <p className="text-xs text-white/40">
              {new Date(order.createdAt).toLocaleDateString('pt-BR')} · {order.items?.length || 0} itens
            </p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${status.color} bg-white/5`}>
          {status.label}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-1 mb-3">
        {order.items?.slice(0, 3).map((item: any) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-white/60">{item.quantity}x {item.product?.name}</span>
            <span className="text-white/40">R$ {item.totalPrice.toFixed(2)}</span>
          </div>
        ))}
        {order.items?.length > 3 && (
          <p className="text-xs text-white/20">+{order.items.length - 3} itens</p>
        )}
      </div>

      <div className="border-t border-white/[0.06] pt-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-white/30">
          <span className="flex items-center gap-1">
            <CreditCard className="h-3 w-3" /> {paymentLabel}
          </span>
          {order.type === 'DELIVERY' && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Delivery
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#ff9607]">R$ {order.total.toFixed(2)}</span>
          <Link
            href={`/pedido/${order.id}`}
            className="p-2 bg-white/[0.05] rounded-lg hover:bg-[#ff9607]/10 hover:text-[#ff9607] transition-colors"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
