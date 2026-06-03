'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Clock, ChefHat, Bike, CheckCircle, Package, AlertCircle,
  MapPin, Phone, CreditCard, User, Printer, MessageCircle
} from 'lucide-react';

const STATUS_FLOW = ['NOVO', 'EM_PREPARO', 'SAIU_PARA_ENTREGA', 'ENTREGUE'];
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  NOVO: { label: 'Recebido', color: 'text-blue-400', bg: 'bg-blue-500', icon: Clock },
  EM_PREPARO: { label: 'Em preparo', color: 'text-yellow-400', bg: 'bg-yellow-500', icon: ChefHat },
  SAIU_PARA_ENTREGA: { label: 'Saiu para entrega', color: 'text-purple-400', bg: 'bg-purple-500', icon: Bike },
  PRONTO_RETIRADA: { label: 'Pronto p/ retirada', color: 'text-cyan-400', bg: 'bg-cyan-500', icon: Package },
  ENTREGUE: { label: 'Entregue', color: 'text-green-400', bg: 'bg-green-500', icon: CheckCircle },
  CANCELADO: { label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-500', icon: AlertCircle },
};

const PAYMENT_LABELS: Record<string, string> = {
  PIX: 'PIX',
  DINHEIRO: 'Dinheiro',
  CARTAO_CREDITO: 'Cartão de Crédito',
  CARTAO_DEBITO: 'Cartão de Débito',
  VALE_REFEICAO: 'Vale Refeição',
};

export default function PedidoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then(r => r.json())
      .then(d => {
        if (d.data) setOrder(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  async function updateStatus(newStatus: string) {
    try {
      await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setOrder((prev: any) => ({ ...prev, status: newStatus }));
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-white/5 rounded animate-pulse" />
        <div className="h-96 bg-white/5 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Pedido não encontrado</p>
        <button
          onClick={() => router.push('/dashboard/pedidos')}
          className="mt-4 text-[#ff9607] hover:underline text-sm"
        >
          Voltar para pedidos
        </button>
      </div>
    );
  }

  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.NOVO;
  const statusIndex = STATUS_FLOW.indexOf(order.status);
  const paymentLabel = PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/pedidos"
            className="p-2 bg-zinc-900 border border-white/5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold">Pedido #{order.id.slice(-6).toUpperCase()}</h1>
            <p className="text-gray-500 text-xs">
              {new Date(order.createdAt).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 bg-zinc-900 border border-white/5 rounded-xl hover:bg-white/5 transition-colors" title="Imprimir">
            <Printer className="h-4 w-4" />
          </button>
          <a
            href={`https://wa.me/${order.customer?.phone?.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-green-500/10 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-colors"
            title="WhatsApp"
          >
            <MessageCircle className="h-4 w-4 text-green-500" />
          </a>
        </div>
      </div>

      {/* Timeline */}
      {order.status !== 'CANCELADO' && (
        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-4">Status do Pedido</h3>
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/10" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-[#ff9607] transition-all"
              style={{ width: `${statusIndex >= 0 ? (statusIndex / (STATUS_FLOW.length - 1)) * 100 : 0}%` }}
            />
            {STATUS_FLOW.map((s, i) => {
              const sConfig = STATUS_CONFIG[s];
              const SIcon = sConfig.icon;
              const reached = i <= statusIndex;
              return (
                <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    reached ? 'bg-[#ff9607]' : 'bg-zinc-800 border border-white/10'
                  }`}>
                    <SIcon className={`h-4 w-4 ${reached ? 'text-black' : 'text-gray-500'}`} />
                  </div>
                  <span className={`text-[10px] font-medium ${reached ? 'text-white' : 'text-gray-600'}`}>
                    {sConfig.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Status Actions */}
          <div className="flex gap-2 mt-5">
            {order.status === 'NOVO' && (
              <button
                onClick={() => updateStatus('EM_PREPARO')}
                className="px-4 py-2 bg-[#ff9607] text-black rounded-lg text-sm font-bold hover:bg-[#ffaa33] transition-colors"
              >
                Iniciar Preparo
              </button>
            )}
            {order.status === 'EM_PREPARO' && order.type === 'DELIVERY' && (
              <button
                onClick={() => updateStatus('SAIU_PARA_ENTREGA')}
                className="px-4 py-2 bg-[#ff9607] text-black rounded-lg text-sm font-bold hover:bg-[#ffaa33] transition-colors"
              >
                Marcar como Saiu
              </button>
            )}
            {order.status === 'EM_PREPARO' && order.type === 'PICKUP' && (
              <button
                onClick={() => updateStatus('PRONTO_RETIRADA')}
                className="px-4 py-2 bg-[#ff9607] text-black rounded-lg text-sm font-bold hover:bg-[#ffaa33] transition-colors"
              >
                Pronto p/ Retirada
              </button>
            )}
            {(order.status === 'SAIU_PARA_ENTREGA' || order.status === 'PRONTO_RETIRADA') && (
              <button
                onClick={() => updateStatus('ENTREGUE')}
                className="px-4 py-2 bg-green-500 text-black rounded-lg text-sm font-bold hover:bg-green-400 transition-colors"
              >
                Marcar como Entregue
              </button>
            )}
            {order.status !== 'ENTREGUE' && order.status !== 'CANCELADO' && (
              <button
                onClick={() => updateStatus('CANCELADO')}
                className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
              >
                Cancelar Pedido
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5">
            <h3 className="font-bold text-sm mb-4">Itens do Pedido</h3>
            <div className="space-y-3">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#ff9607]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[#ff9607]">
                      {item.quantity}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.product?.name}</p>
                      {item.note && <p className="text-xs text-gray-500">Obs: {item.note}</p>}
                    </div>
                  </div>
                  <p className="text-sm font-bold">R$ {item.totalPrice.toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span>R$ {order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Taxa de entrega</span>
                <span>R$ {order.deliveryFee?.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Desconto</span>
                  <span className="text-green-400">- R$ {order.discount.toFixed(2)}</span>
                </div>
              )}
              {order.serviceFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Taxa de serviço</span>
                  <span>R$ {order.serviceFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold pt-2 border-t border-white/5">
                <span>Total</span>
                <span className="text-[#ff9607]">R$ {order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {order.customerNote && (
            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5">
              <h3 className="font-bold text-sm mb-2">Observação do Cliente</h3>
              <p className="text-sm text-gray-400">{order.customerNote}</p>
            </div>
          )}
        </div>

        {/* Customer Info */}
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5">
            <h3 className="font-bold text-sm mb-4">Cliente</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#ff9607]/10 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-[#ff9607]" />
                </div>
                <div>
                  <p className="text-sm font-medium">{order.customer?.name}</p>
                  <p className="text-xs text-gray-500">Cliente desde {new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="h-4 w-4" />
                {order.customer?.phone}
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5">
            <h3 className="font-bold text-sm mb-4">Pagamento</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-[#ff9607]" />
                <span className="font-medium">{paymentLabel}</span>
              </div>
              {order.changeFor && order.changeFor > 0 && (
                <div className="text-sm text-gray-400">
                  Troco para: <span className="text-white">R$ {order.changeFor.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-white/5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total pago</span>
                  <span className="font-bold">R$ {order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {order.type === 'DELIVERY' && (
            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5">
              <h3 className="font-bold text-sm mb-2">Entrega</h3>
              <div className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin className="h-4 w-4 text-[#ff9607] flex-shrink-0 mt-0.5" />
                <span>{order.customer?.address || 'Endereço não informado'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
