'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, Sparkles, Zap, Crown } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { PLANS } from '@/lib/plans';

const icons = {
  GRATUITO: Sparkles,
  PRO: Zap,
  PREMIUM: Crown,
};

export default function PlanosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState<any>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    apiFetch('/api/subscriptions/status')
      .then(r => r.json())
      .then(d => {
        if (d.success) setCurrent(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSelect(planId: string) {
    if (planId === 'GRATUITO') {
      setProcessing(true);
      try {
        const res = await apiFetch('/api/subscriptions/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: planId }),
        });
        const data = await res.json();
        if (data.success) router.push('/dashboard');
      } finally {
        setProcessing(false);
      }
      return;
    }
    setSelected(planId);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#ff9607] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-black mb-3">Escolha seu plano</h1>
          <p className="text-white/40">Comece gratis por 7 dias. Cancele quando quiser.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {Object.values(PLANS).map((plan) => {
            const Icon = icons[plan.id as keyof typeof icons];
            const isCurrent = current?.plan === plan.id;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-6 flex flex-col transition-all ${
                  isCurrent
                    ? 'border-[#ff9607] bg-[#ff9607]/5'
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#ff9607]/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-[#ff9607]" />
                  </div>
                  <div>
                    <h3 className="font-bold">{plan.name}</h3>
                    <p className="text-2xl font-black">
                      R$ {plan.price.toFixed(2).replace('.', ',')}
                      <span className="text-sm font-normal text-white/40">/mes</span>
                    </p>
                  </div>
                </div>

                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <Check className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelect(plan.id)}
                  disabled={isCurrent || processing}
                  className={`w-full py-3 rounded-xl font-bold transition-all disabled:opacity-50 ${
                    isCurrent
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-[#ff9607] text-black hover:bg-[#ffaa33]'
                  }`}
                >
                  {isCurrent ? 'Plano atual' : processing && selected === plan.id ? 'Processando...' : 'Escolher'}
                </button>
              </div>
            );
          })}
        </div>

        {selected && selected !== 'GRATUITO' && (
          <CardForm planId={selected} onCancel={() => setSelected(null)} onSuccess={() => router.push('/dashboard')} />
        )}
      </div>
    </div>
  );
}

function CardForm({ planId, onCancel, onSuccess }: { planId: string; onCancel: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [cardToken, setCardToken] = useState('');
  const [processing, setProcessing] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cardToken || !email) return;
    setProcessing(true);
    try {
      const res = await apiFetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, payerEmail: email, cardToken }),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        alert(data.message);
      }
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Dados do cartao</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="E-mail"
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white"
            required
          />
          <input
            value={cardToken}
            onChange={e => setCardToken(e.target.value)}
            placeholder="Card token (sandbox)"
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white font-mono text-sm"
            required
          />
          <p className="text-xs text-white/40">
            Em producao aqui entra o brick seguro do Mercado Pago. No sandbox, use um card token de teste.
          </p>
          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className="flex-1 py-3 border border-white/[0.08] rounded-xl font-bold">
              Voltar
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-[2] bg-[#ff9607] text-black py-3 rounded-xl font-bold disabled:opacity-50"
            >
              {processing ? 'Processando...' : 'Confirmar assinatura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
