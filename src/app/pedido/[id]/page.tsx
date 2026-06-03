'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Clock, ChefHat, Bike, CheckCircle, ArrowLeft } from 'lucide-react';

const steps = [
  { key: 'NOVO', label: 'Pedido recebido', icon: Clock, color: 'bg-blue-500' },
  { key: 'EM_PREPARO', label: 'Em preparo', icon: ChefHat, color: 'bg-yellow-500' },
  { key: 'SAIU_PARA_ENTREGA', label: 'Saiu para entrega', icon: Bike, color: 'bg-purple-500' },
  { key: 'ENTREGUE', label: 'Entregue', icon: CheckCircle, color: 'bg-green-500' },
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
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin h-10 w-10 border-4 border-[#ff9607] border-t-transparent rounded-full" />
    </div>
  );

  const currentIndex = steps.findIndex(s => s.key === order.status);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-lg mx-auto space-y-8">
        <Link href="/burger-king-gb" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao cardápio
        </Link>

        <div className="text-center">
          <p className="text-gray-400 text-sm">Pedido</p>
          <h1 className="text-3xl font-black text-[#ff9607]">#{order.id.slice(-6)}</h1>
          <p className="text-gray-500 text-sm mt-1">{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
        </div>

        <div className="bg-gray-900 border border-white/5 rounded-3xl p-8">
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-white/10" />
            <div className="space-y-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentIndex;
                const isCurrent = index === currentIndex;

                return (
                  <div key={step.key} className="relative flex items-center gap-5">
                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isActive ? step.color : 'bg-gray-800'
                    } ${isCurrent ? 'ring-4 ring-[#ff9607]/20' : ''}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className={`font-bold ${isActive ? 'text-white' : 'text-gray-600'}`}>{step.label}</p>
                      {isCurrent && (
                        <p className="text-sm text-[#ff9607]">Em andamento...</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-white/5 rounded-3xl p-6">
          <h2 className="font-bold mb-4">Itens do pedido</h2>
          {order.items.map((item: any, i: number) => (
            <div key={i} className="flex justify-between items-start py-3 border-b border-white/5 last:border-0">
              <div>
                <p className="font-medium">{item.quantity}x {item.product.name}</p>
                {item.addons.length > 0 && (
                  <p className="text-sm text-gray-500">+ {item.addons.map((a: any) => a.name).join(', ')}</p>
                )}
              </div>
              <span className="font-medium text-[#ff9607]">R$ {(item.unitPrice * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-white/10 pt-4 mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span>R$ {order.subtotal.toFixed(2)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-gray-400">
                <span>Taxa de entrega</span>
                <span>R$ {order.deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold pt-2">
              <span>Total</span>
              <span className="text-[#ff9607]">R$ {order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
