'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, MapPin, Package, Clock, ChevronRight, Loader2
} from 'lucide-react';
import { GridPattern, GlowOrb } from '@/components/GridPattern';

export default function RastrearPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/${orderId.trim()}`);
      const data = await res.json();
      if (data.success && data.data) {
        setOrder(data.data);
      } else {
        setError('Pedido não encontrado. Verifique o número e tente novamente.');
      }
    } catch {
      setError('Erro ao buscar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      <GridPattern className="opacity-40" />
      <GlowOrb color="orange" className="w-[500px] h-[500px] -top-40 -right-40 opacity-15" />
      <GlowOrb color="magenta" className="w-[400px] h-[400px] -bottom-20 -left-20 opacity-10" />

      <div className="max-w-lg mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href={`/${slug}`} className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition-all">
            <ArrowLeft className="h-5 w-5 text-white/60" />
          </Link>
          <div>
            <h1 className="text-xl font-black">Rastrear Pedido</h1>
            <p className="text-white/40 text-sm">Acompanhe em tempo real</p>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <label className="block text-xs font-medium text-white/60 mb-2">Número do pedido</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Ex: abc123"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#ff9607]/50 focus:shadow-[0_0_15px_rgba(255,150,7,0.15)] transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !orderId.trim()}
              className="px-4 bg-gradient-to-r from-[#ff9607] to-[#ffaa33] text-black rounded-xl font-bold hover:shadow-[0_0_25px_rgba(255,150,7,0.4)] transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            </button>
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-xs mt-2"
            >
              {error}
            </motion.p>
          )}
        </form>

        {/* Quick Actions */}
        {!order && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <Link
              href={`/${slug}/meus-pedidos`}
              className="flex items-center gap-4 p-4 backdrop-blur-sm bg-white/[0.03] border border-white/[0.08] rounded-2xl hover:border-white/[0.15] transition-all group"
            >
              <div className="w-12 h-12 bg-[#ff9607]/10 rounded-xl flex items-center justify-center group-hover:bg-[#ff9607]/20 transition-colors">
                <Clock className="h-6 w-6 text-[#ff9607]" />
              </div>
              <div className="flex-1">
                <p className="font-bold">Meus Pedidos</p>
                <p className="text-white/40 text-sm">Ver histórico pelo telefone</p>
              </div>
              <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-white/60 transition-colors" />
            </Link>

            <Link
              href={`/${slug}`}
              className="flex items-center gap-4 p-4 backdrop-blur-sm bg-white/[0.03] border border-white/[0.08] rounded-2xl hover:border-white/[0.15] transition-all group"
            >
              <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                <MapPin className="h-6 w-6 text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold">Fazer novo pedido</p>
                <p className="text-white/40 text-sm">Ir para o cardápio</p>
              </div>
              <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-white/60 transition-colors" />
            </Link>
          </motion.div>
        )}

        {/* Order Result */}
        <AnimatePresence>
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="backdrop-blur-sm bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6"
            >
              <div className="text-center mb-6">
                <p className="text-white/40 text-sm">Pedido encontrado</p>
                <h2 className="text-2xl font-black mt-1">
                  <span className="bg-gradient-to-r from-[#ff9607] to-[#ff0080] bg-clip-text text-transparent">
                    #${order.orderNumber || order.id.slice(-6).toUpperCase()}
                  </span>
                </h2>
                <p className="text-white/30 text-xs mt-1">
                  {new Date(order.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-white/60">{item.quantity}x {item.product?.name}</span>
                    <span className="text-white/40">R$ {item.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-white/[0.06] pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-[#ff9607]">R$ {order.total.toFixed(2)}</span>
                </div>
              </div>

              <Link
                href={`/pedido/${order.id}`}
                className="block w-full text-center bg-gradient-to-r from-[#ff9607] to-[#ffaa33] text-black py-3 rounded-xl font-bold hover:shadow-[0_0_25px_rgba(255,150,7,0.4)] transition-all"
              >
                Acompanhar pedido →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
