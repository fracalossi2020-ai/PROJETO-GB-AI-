'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, AlertTriangle, CreditCard, Calendar } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { PLANS } from '@/lib/plans';

export default function AssinaturaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    apiFetch('/api/subscriptions/status')
      .then(r => r.json())
      .then(d => {
        if (d.success) setData(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#ff9607] animate-spin" />
      </div>
    );
  }

  const plan = PLANS[data?.plan as keyof typeof PLANS] || PLANS.GRATUITO;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold">Assinatura</h1>
        <p className="text-gray-400 text-sm">Gerencie seu plano e pagamentos</p>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-white/40">Plano atual</p>
            <h2 className="text-2xl font-black">{plan.name}</h2>
            <p className="text-lg font-medium text-[#ff9607]">
              R$ {plan.price.toFixed(2).replace('.', ',')}/mes
            </p>
          </div>
          <div className={`px-3 py-1.5 rounded-xl text-sm font-bold border ${
            data?.isActive
              ? 'bg-green-500/10 text-green-400 border-green-500/20'
              : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            {data?.isActive ? 'Ativo' : 'Inativo'}
          </div>
        </div>

        {data?.isTrial && (
          <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-400">Periodo de teste</p>
              <p className="text-xs text-white/60">
                Seu trial termina em {data.trialEndsAt ? new Date(data.trialEndsAt).toLocaleDateString('pt-BR') : '-'}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
            <Calendar className="h-5 w-5 text-[#ff9607]" />
            <div>
              <p className="text-xs text-white/40">Inicio do periodo</p>
              <p className="text-sm font-medium">
                {data?.currentPeriodStart ? new Date(data.currentPeriodStart).toLocaleDateString('pt-BR') : '-'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
            <CreditCard className="h-5 w-5 text-[#ff9607]" />
            <div>
              <p className="text-xs text-white/40">Proxima cobranca</p>
              <p className="text-sm font-medium">
                {data?.currentPeriodEnd ? new Date(data.currentPeriodEnd).toLocaleDateString('pt-BR') : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
        <h3 className="font-bold mb-4">Recursos inclusos</h3>
        <ul className="space-y-2">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-white/70">
              <Check className="h-4 w-4 text-green-400" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => router.push('/planos')}
        className="w-full bg-[#ff9607] text-black py-3 rounded-xl font-bold hover:bg-[#ffaa33] transition-colors"
      >
        Alterar plano
      </button>
    </div>
  );
}
