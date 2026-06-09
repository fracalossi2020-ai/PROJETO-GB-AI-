'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, CreditCard, QrCode, Banknote, Loader2, MapPin, Store, Armchair, Check } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(false);

  const [name, setName] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('customer_name') || '' : '');
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('customer_phone') || '' : '');
  const [address, setAddress] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('customer_address') || '' : '');
  const [complement, setComplement] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('customer_complement') || '' : '');
  const [neighborhood, setNeighborhood] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('customer_neighborhood') || '' : '');
  const [orderType, setOrderType] = useState('DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [changeFor, setChangeFor] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [orderId, setOrderId] = useState('');

  // Salva dados do cliente no localStorage
  useEffect(() => { localStorage.setItem('customer_name', name); }, [name]);
  useEffect(() => { localStorage.setItem('customer_phone', phone); }, [phone]);
  useEffect(() => { localStorage.setItem('customer_address', address); }, [address]);
  useEffect(() => { localStorage.setItem('customer_complement', complement); }, [complement]);
  useEffect(() => { localStorage.setItem('customer_neighborhood', neighborhood); }, [neighborhood]);

  const cart = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('cart') || '[]') : [];
  const subtotal = cart.reduce((sum: number, item: any) => {
    const addonsTotal = item.selectedAddons?.reduce((s: number, a: any) => s + a.price, 0) || 0;
    return sum + (item.product.price + addonsTotal) * item.quantity;
  }, 0);

  async function handleSubmit() {
    setLoading(true);
    try {
      const storeRes = await fetch(`/api/stores/${slug}`);
      const storeData = await storeRes.json();
      const storeId = storeData.data.id;

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          type: orderType,
          paymentMethod,
          changeFor: paymentMethod === 'DINHEIRO' ? parseFloat(changeFor) : undefined,
          customerNote,
          items: cart.map((item: any) => ({
            productId: item.product.id,
            quantity: item.quantity,
            note: item.note,
            addonIds: item.selectedAddons?.map((a: any) => a.id) || [],
          })),
          customer: { name, phone, address, complement, neighborhood },
        }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.removeItem('cart');
        setOrderId(data.data.id);
        setCompleted(true);
      } else {
        alert(data.message);
      }
    } catch {
      alert('Erro ao finalizar pedido');
    } finally {
      setLoading(false);
    }
  }

  const paymentMethods = [
    { id: 'PIX', label: 'PIX', icon: QrCode, desc: 'Pagamento instantâneo' },
    { id: 'CARTAO_CREDITO', label: 'Cartão de Crédito', icon: CreditCard, desc: 'Na entrega' },
    { id: 'CARTAO_DEBITO', label: 'Cartão de Débito', icon: CreditCard, desc: 'Na entrega' },
    { id: 'DINHEIRO', label: 'Dinheiro', icon: Banknote, desc: 'Pague na entrega' },
  ];

  const orderTypes = [
    { id: 'DELIVERY', label: 'Delivery', icon: MapPin },
    { id: 'PICKUP', label: 'Retirada', icon: Store },
    { id: 'DINE_IN', label: 'Salão', icon: Armchair },
  ];

  if (completed) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#ff9607]/5 via-transparent to-transparent" />
        <div
          className="text-center space-y-6 relative z-10 max-w-sm w-full"
        >
          <div
            className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#ff9607] to-[#ff0080] flex items-center justify-center shadow-[0_0_40px_rgba(255,150,7,0.4)]"
          >
            <Check className="h-12 w-12 text-black" />
          </div>

          <div>
            <h1 className="text-3xl font-black">Pedido confirmado!</h1>
            <p className="text-white/40 mt-2">Seu pedido já entrou na fila de preparo</p>
          </div>

          <div className="backdrop-blur-sm bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            <p className="text-white/40 text-sm">Número do pedido</p>
            <p className="text-3xl font-black mt-1">
              <span className="bg-gradient-to-r from-[#ff9607] to-[#ff0080] bg-clip-text text-transparent">
                #{orderId.slice(-6).toUpperCase()}
              </span>
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push(`/pedido/${orderId}`)}
              className="block w-full bg-gradient-to-r from-[#ff9607] to-[#ffaa33] text-black py-3.5 rounded-xl font-bold hover:shadow-[0_0_25px_rgba(255,150,7,0.4)] transition-all"
            >
              Acompanhar pedido →
            </button>
            <button
              onClick={() => router.push(`/${slug}`)}
              className="block w-full bg-white/[0.03] border border-white/[0.08] text-white py-3.5 rounded-xl font-medium hover:border-white/[0.15] transition-all"
            >
              Fazer novo pedido
            </button>
          </div>
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
        <h1 className="text-lg font-bold">Finalizar Pedido</h1>
      </div>

      <div className="max-w-lg mx-auto p-4 pb-28">
        {/* Steps */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 h-1 rounded-full overflow-hidden bg-white/[0.06]">
              <div
                className="h-full bg-gradient-to-r from-[#ff9607] to-[#ff0080]"
              />
            </div>
          ))}
        </div>

        
          {step === 1 && (
            <div
              key="step1"
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-black mb-1">Tipo de pedido</h2>
                <p className="text-white/40 text-sm">Como você quer receber?</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {orderTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setOrderType(type.id)}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        orderType === type.id
                          ? 'border-[#ff9607] bg-[#ff9607]/5 shadow-[0_0_20px_rgba(255,150,7,0.15)]'
                          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${orderType === type.id ? 'text-[#ff9607]' : 'text-white/30'}`} />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  );
                })}
              </div>

              <div>
                <h2 className="text-2xl font-black mb-4">Seus dados</h2>
                <div className="space-y-3">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome completo"
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-[#ff9607]/50 focus:shadow-[0_0_15px_rgba(255,150,7,0.1)] transition-all"
                  />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Telefone / WhatsApp"
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-[#ff9607]/50 focus:shadow-[0_0_15px_rgba(255,150,7,0.1)] transition-all"
                  />
                  {orderType === 'DELIVERY' && (
                    <>
                      <input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Endereço"
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-[#ff9607]/50 focus:shadow-[0_0_15px_rgba(255,150,7,0.1)] transition-all"
                      />
                      <input
                        value={complement}
                        onChange={(e) => setComplement(e.target.value)}
                        placeholder="Complemento"
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-[#ff9607]/50 focus:shadow-[0_0_15px_rgba(255,150,7,0.1)] transition-all"
                      />
                      <input
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        placeholder="Bairro"
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-[#ff9607]/50 focus:shadow-[0_0_15px_rgba(255,150,7,0.1)] transition-all"
                      />
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-[#ff9607] to-[#ff0080] text-black py-4 rounded-2xl font-bold text-lg shadow-[0_0_20px_rgba(255,150,7,0.3)]"
              >
                Continuar
              </button>
            </div>
          )}

          {step === 2 && (
            <div
              key="step2"
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-black mb-1">Pagamento</h2>
                <p className="text-white/40 text-sm">Escolha como vai pagar</p>
              </div>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        paymentMethod === method.id
                          ? 'border-[#ff9607] bg-[#ff9607]/5 shadow-[0_0_20px_rgba(255,150,7,0.15)]'
                          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        paymentMethod === method.id ? 'bg-[#ff9607]/20' : 'bg-white/[0.04]'
                      }`}>
                        <Icon className={`h-5 w-5 ${paymentMethod === method.id ? 'text-[#ff9607]' : 'text-white/40'}`} />
                      </div>
                      <div>
                        <p className="font-bold">{method.label}</p>
                        <p className="text-xs text-white/30">{method.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {paymentMethod === 'DINHEIRO' && (
                <input
                  value={changeFor}
                  onChange={(e) => setChangeFor(e.target.value)}
                  type="number"
                  placeholder="Troco para quanto?"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-[#ff9607]/50 focus:shadow-[0_0_15px_rgba(255,150,7,0.1)] transition-all"
                />
              )}

              <textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Observação (opcional)"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-[#ff9607]/50 focus:shadow-[0_0_15px_rgba(255,150,7,0.1)] transition-all resize-none"
                rows={3}
              />

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border border-white/[0.08] py-4 rounded-2xl font-bold hover:bg-white/[0.03] transition-colors">
                  Voltar
                </button>
                <button onClick={() => setStep(3)} className="flex-[2] bg-gradient-to-r from-[#ff9607] to-[#ff0080] text-black py-4 rounded-2xl font-bold text-lg shadow-[0_0_20px_rgba(255,150,7,0.3)]">
                  Revisar
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div
              key="step3"
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-black mb-1">Resumo</h2>
                <p className="text-white/40 text-sm">Confira tudo antes de confirmar</p>
              </div>

              <div className="glass rounded-2xl p-4 space-y-3">
                {cart.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-white/70">
                      {item.quantity}x {item.product.name}
                      {item.selectedAddons?.length > 0 && (
                        <span className="block text-white/30 text-xs mt-0.5">
                          + {item.selectedAddons.map((a: any) => a.name).join(', ')}
                        </span>
                      )}
                    </span>
                    <span className="text-[#ff9607] font-medium">
                      R${' '}
                      {(
                        (item.product.price + (item.selectedAddons?.reduce((s: number, a: any) => s + a.price, 0) || 0)) *
                        item.quantity
                      ).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-white/[0.08] pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-[#ff9607]">R$ {subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="glass rounded-2xl p-4 space-y-2 text-sm">
                <p><span className="text-white/30">Nome:</span> <span className="text-white">{name}</span></p>
                <p><span className="text-white/30">Telefone:</span> <span className="text-white">{phone}</span></p>
                <p><span className="text-white/30">Tipo:</span> <span className="text-white">{orderType === 'DELIVERY' ? 'Delivery' : orderType === 'PICKUP' ? 'Retirada' : 'Salão'}</span></p>
                <p><span className="text-white/30">Pagamento:</span> <span className="text-white">{paymentMethods.find((m) => m.id === paymentMethod)?.label}</span></p>
                {address && <p><span className="text-white/30">Endereço:</span> <span className="text-white">{address}</span></p>}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} disabled={loading} className="flex-1 border border-white/[0.08] py-4 rounded-2xl font-bold hover:bg-white/[0.03] transition-colors disabled:opacity-50">
                  Voltar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-[2] bg-gradient-to-r from-[#ff9607] to-[#ff0080] text-black py-4 rounded-2xl font-bold text-lg shadow-[0_0_20px_rgba(255,150,7,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                  Confirmar Pedido
                </button>
              </div>
            </div>
          )}
        
      </div>
    </div>
  );
}
