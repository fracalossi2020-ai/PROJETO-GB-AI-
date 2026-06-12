'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Loader2, QrCode, CreditCard, Check, ArrowLeft } from 'lucide-react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

const publicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY;
if (publicKey) {
  initMercadoPago(publicKey, { locale: 'pt-BR' });
}

export default function PagamentoPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const orderId = searchParams.get('orderId');
  const method = searchParams.get('method');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payment, setPayment] = useState<any>(null);
  const [paid, setPaid] = useState(false);
  const [orderTotal, setOrderTotal] = useState<number>(0);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!orderId || !method) {
      router.push(`/${slug}`);
      return;
    }

    fetch(`/api/orders/${orderId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setOrderTotal(d.data.total || 0);
      })
      .catch(() => {});

    if (method === 'PIX_ONLINE') {
      fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, method: 'pix' }),
      })
        .then(r => r.json())
        .then(d => {
          if (d.success) {
            setPayment(d.data);
            setLoading(false);
            startPolling(d.data.id);
          } else {
            setError(d.message || 'Erro ao criar pagamento');
            setLoading(false);
          }
        })
        .catch(() => {
          setError('Erro ao criar pagamento');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [orderId, method, router, slug]);

  function startPolling(paymentId: string) {
    pollingRef.current = setInterval(() => {
      fetch(`/api/payments/status/${paymentId}`)
        .then(r => r.json())
        .then(d => {
          if (d.success && d.data.status === 'APROVADO') {
            setPaid(true);
            if (pollingRef.current) clearInterval(pollingRef.current);
            setTimeout(() => router.push(`/pedido/${orderId}`), 2000);
          }
        });
    }, 5000);
  }

  async function handleCardPayment(data: any) {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          method: 'credit_card',
          token: data.token,
          paymentMethodId: data.payment_method_id,
          issuerId: data.issuer_id,
          installments: data.installments || 1,
        }),
      });
      const json = await res.json();
      if (json.success) {
        if (json.data.status === 'APROVADO') {
          setPaid(true);
          setTimeout(() => router.push(`/pedido/${orderId}`), 2000);
        } else {
          setPayment(json.data);
          startPolling(json.data.id);
        }
      } else {
        setError(json.message || 'Erro no pagamento');
      }
    } catch {
      setError('Erro no pagamento');
    } finally {
      setLoading(false);
    }
  }

  if (paid) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="h-10 w-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold">Pagamento aprovado!</h1>
          <p className="text-white/40">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="sticky top-0 bg-[#050505]/80 backdrop-blur-sm border-b border-white/[0.06] z-10 flex items-center gap-3 p-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">Pagamento</h1>
      </div>

      <div className="max-w-lg mx-auto p-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-[#ff9607] animate-spin mb-4" />
            <p className="text-white/40">Preparando pagamento...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {!loading && method === 'PIX_ONLINE' && payment?.qrCodeBase64 && (
          <div className="space-y-6">
            <div className="text-center">
              <QrCode className="h-10 w-10 text-[#ff9607] mx-auto mb-3" />
              <h2 className="text-xl font-bold">Pague com PIX</h2>
              <p className="text-white/40 text-sm mt-1">Escaneie o QR Code com o app do seu banco</p>
            </div>

            <div className="bg-white p-6 rounded-2xl flex items-center justify-center">
              <img src={`data:image/png;base64,${payment.qrCodeBase64}`} alt="QR Code PIX" className="w-64 h-64" />
            </div>

            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4">
              <p className="text-xs text-white/40 mb-1">Codigo PIX</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={payment.qrCode || ''}
                  className="flex-1 bg-black/30 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(payment.qrCode || '')}
                  className="px-4 py-2 bg-[#ff9607] text-black rounded-xl text-sm font-bold"
                >
                  Copiar
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-white/40">
              <Loader2 className="h-4 w-4 animate-spin" />
              Aguardando confirmacao...
            </div>
          </div>
        )}

        {!loading && method === 'CARTAO_CREDITO_ONLINE' && publicKey && (
          <div className="space-y-6">
            <div className="text-center">
              <CreditCard className="h-10 w-10 text-[#ff9607] mx-auto mb-3" />
              <h2 className="text-xl font-bold">Pague com cartao</h2>
              <p className="text-white/40 text-sm mt-1">Preencha os dados do cartao abaixo</p>
            </div>
            <Payment
              initialization={{ amount: orderTotal }}
              onSubmit={handleCardPayment}
              customization={{
                paymentMethods: { creditCard: 'all', debitCard: 'all' },
                visual: { style: { theme: 'dark' } },
              }}
            />
          </div>
        )}

        {!loading && method === 'CARTAO_CREDITO_ONLINE' && !publicKey && (
          <div className="text-center py-20">
            <p className="text-white/40">Chave publica do Mercado Pago nao configurada.</p>
          </div>
        )}
      </div>
    </div>
  );
}
