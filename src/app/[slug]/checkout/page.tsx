'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, CreditCard, QrCode, Banknote, Loader2, MapPin, Store, Armchair } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [orderType, setOrderType] = useState('DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [changeFor, setChangeFor] = useState('');
  const [customerNote, setCustomerNote] = useState('');

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
        router.push(`/pedido/${data.data.id}`);
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
    { id: 'PIX', label: 'PIX', icon: QrCode },
    { id: 'CARTAO_CREDITO', label: 'Cartão de Crédito', icon: CreditCard },
    { id: 'CARTAO_DEBITO', label: 'Cartão de Débito', icon: CreditCard },
    { id: 'DINHEIRO', label: 'Dinheiro', icon: Banknote },
  ];

  const orderTypes = [
    { id: 'DELIVERY', label: 'Delivery', icon: MapPin },
    { id: 'PICKUP', label: 'Retirada', icon: Store },
    { id: 'DINE_IN', label: 'Salão', icon: Armchair },
  ];

  return (
    <div className="min-h-screen bg-black text-white max-w-lg mx-auto">
      <div className="sticky top-0 bg-black border-b border-white/5 z-10 flex items-center gap-3 p-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">Finalizar Pedido</h1>
      </div>

      <div className="p-4 space-y-6">
        <div className="flex gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 h-1.5 rounded-full ${step >= s ? 'bg-[#ff9607]' : 'bg-white/10'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Tipo de pedido</h2>
            <div className="grid grid-cols-3 gap-3">
              {orderTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setOrderType(type.id)}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      orderType === type.id ? 'border-[#ff9607] bg-[#ff9607]/5' : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <Icon className="h-6 w-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">{type.label}</p>
                  </button>
                );
              })}
            </div>
            <h2 className="text-xl font-bold pt-4">Seus dados</h2>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome completo"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607]" />
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Telefone"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607]" />
            {orderType === 'DELIVERY' && (
              <>
                <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Endereço"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607]" />
                <input value={complement} onChange={e => setComplement(e.target.value)} placeholder="Complemento"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607]" />
                <input value={neighborhood} onChange={e => setNeighborhood(e.target.value)} placeholder="Bairro"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607]" />
              </>
            )}
            <button onClick={() => setStep(2)} className="w-full bg-[#ff9607] text-black py-4 rounded-xl font-bold text-lg">
              Continuar
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Pagamento</h2>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === method.id ? 'border-[#ff9607] bg-[#ff9607]/5' : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{method.label}</span>
                  </button>
                );
              })}
            </div>
            {paymentMethod === 'DINHEIRO' && (
              <input value={changeFor} onChange={e => setChangeFor(e.target.value)} type="number" placeholder="Troco para"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607]" />
            )}
            <textarea value={customerNote} onChange={e => setCustomerNote(e.target.value)} placeholder="Observação (opcional)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607] resize-none" rows={3} />
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 border border-white/10 py-4 rounded-xl font-bold">Voltar</button>
              <button onClick={() => setStep(3)} className="flex-[2] bg-[#ff9607] text-black py-4 rounded-xl font-bold text-lg">Revisar</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Resumo</h2>
            <div className="bg-white/5 rounded-2xl p-4 space-y-2">
              {cart.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.product.name}</span>
                  <span>R$ {((item.product.price + (item.selectedAddons?.reduce((s: number, a: any) => s + a.price, 0) || 0)) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-[#ff9607]">R$ {subtotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 space-y-1 text-sm text-gray-400">
              <p><strong className="text-white">Nome:</strong> {name}</p>
              <p><strong className="text-white">Telefone:</strong> {phone}</p>
              <p><strong className="text-white">Tipo:</strong> {orderType === 'DELIVERY' ? 'Delivery' : orderType === 'PICKUP' ? 'Retirada' : 'Salão'}</p>
              <p><strong className="text-white">Pagamento:</strong> {paymentMethods.find(m => m.id === paymentMethod)?.label}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 border border-white/10 py-4 rounded-xl font-bold">Voltar</button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-[2] bg-[#ff9607] text-black py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirmar Pedido
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
