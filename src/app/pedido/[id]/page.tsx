'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Clock, ChefHat, CheckCircle, ArrowLeft, Package } from 'lucide-react';
import MotoIcon from '@/components/MotoIcon';
import { GridPattern, GlowOrb } from '@/components/GridPattern';

const steps = [
  { key: 'NOVO', label: 'Pedido recebido', icon: Clock, color: 'bg-blue-500', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.4)]' },
  { key: 'EM_PREPARO', label: 'Em preparo', icon: ChefHat, color: 'bg-yellow-500', glow: 'shadow-[0_0_15px_rgba(234,179,8,0.4)]' },
  { key: 'SAIU_PARA_ENTREGA', label: 'Saiu para entrega', icon: MotoIcon, color: 'bg-[#ff9607]', glow: 'shadow-[0_0_15px_rgba(255,150,7,0.4)]' },
  { key: 'PRONTO_RETIRADA', label: 'Pronto para retirada', icon: Package, color: 'bg-cyan-500', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.4)]' },
  { key: 'ENTREGUE', label: 'Entregue', icon: CheckCircle, color: 'bg-green-500', glow: 'shadow-[0_0_15px_rgba(34,197,94,0.4)]' },
];

export default function RastreamentoPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/orders/${id}`)
      .then(r => r.json())
      .then(d => setOrder(d.data));

    const interval = setInterval(() => {
      fetch(`/api/orders/${id}`)
        .then(r => r.json())
        .then(d => setOrder(d.data));
    }, 10000);

    return () => clearInterval(interval);
  }, [id]);

  if (!order) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
      <GridPattern className="opacity-40" />
      <div className="relative z-10">
        <div className="w-10 h-10 border-2 border-[#ff9607] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );

  const currentIndex = steps.findIndex(s => s.key === order.status);
  const activeStep = steps[currentIndex] || steps[0];

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 relative overflow-hidden">
      <GridPattern className="opacity-40" />
      <GlowOrb color="orange" className="w-[500px] h-[500px] -top-40 -right-40 opacity-15" />

      <div
        className="max-w-lg mx-auto space-y-6 relative z-10"
      >
        <Link href={`/${order.store?.slug || 'burger-king-gb'}`} className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao cardápio
        </Link>

        <div className="text-center">
          <p className="text-white/40 text-sm">Pedido</p>
          <h1 className="text-3xl font-black">
            <span className="bg-gradient-to-r from-[#ff9607] to-[#ff0080] bg-clip-text text-transparent">#${order.orderNumber || order.id.slice(-6)}</span>
          </h1>
          <p className="text-white/30 text-sm mt-1">{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
        </div>

        {/* Status Card */}
        <div className="backdrop-blur-sm bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 text-center">
          <div className={`w-16 h-16 ${activeStep.color} rounded-2xl flex items-center justify-center mx-auto mb-3 ${activeStep.glow}`}>
            <activeStep.icon className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg font-bold">{activeStep.label}</p>
          <p className="text-white/40 text-sm mt-1">
            {order.status === 'ENTREGUE' ? 'Seu pedido foi entregue!' : 'Atualizamos em tempo real'}
          </p>
        </div>

        {/* Timeline */}
        <div className="backdrop-blur-sm bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8">
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-white/10" />
            <div className="space-y-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentIndex;
                const isCurrent = index === currentIndex;

                return (
                  <div
                    key={step.key}
                    className="relative flex items-center gap-5"
                  >
                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isActive ? step.color : 'bg-white/5'
                    } ${isCurrent ? step.glow : ''}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${isActive ? 'text-white' : 'text-white/20'}`}>{step.label}</p>
                      {isCurrent && (
                        <p className="text-xs text-[#ff9607]">Em andamento...</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="backdrop-blur-sm bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6">
          <h2 className="font-bold text-sm mb-4 text-white/60 uppercase tracking-wider">Itens do pedido</h2>
          {order.items.map((item: any, i: number) => (
            <div key={i} className="flex justify-between items-start py-3 border-b border-white/[0.05] last:border-0">
              <div>
                <p className="font-medium text-sm">{item.quantity}x {item.product.name}</p>
                {item.addons.length > 0 && (
                  <p className="text-xs text-white/30">+ {item.addons.map((a: any) => a.name).join(', ')}</p>
                )}
              </div>
              <span className="font-medium text-[#ff9607] text-sm">R$ {(item.unitPrice * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-white/[0.08] pt-4 mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-white/40">
              <span>Subtotal</span>
              <span>R$ {order.subtotal.toFixed(2)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-white/40">
                <span>Taxa de entrega</span>
                <span>R$ {order.deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2">
              <span>Total</span>
              <span className="bg-gradient-to-r from-[#ff9607] to-[#ff0080] bg-clip-text text-transparent">R$ {order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
