'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, ArrowRight, ArrowLeft, Banknote, QrCode, Smartphone } from 'lucide-react';

export default function Step2Pagamento() {
  const router = useRouter();
  const [form, setForm] = useState({
    acceptCash: true,
    acceptCard: true,
    acceptPix: true,
    acceptOnlineCard: false,
    pixKey: '',
  });

  function handleNext() {
    localStorage.setItem('setup_pagamento', JSON.stringify(form));
    router.push('/setup/step-3-horario');
  }

  const methods = [
    { key: 'acceptCash', label: 'Dinheiro', icon: Banknote },
    { key: 'acceptCard', label: 'Cartão na entrega', icon: CreditCard },
    { key: 'acceptPix', label: 'PIX', icon: QrCode },
    { key: 'acceptOnlineCard', label: 'Cartão online', icon: Smartphone },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-[#ff9607]/10 rounded-2xl flex items-center justify-center">
          <CreditCard className="h-7 w-7 text-[#ff9607]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Formas de pagamento</h2>
          <p className="text-gray-400">Selecione como seus clientes vão pagar</p>
        </div>
      </div>

      <div className="space-y-3">
        {methods.map((method) => {
          const Icon = method.icon;
          const isActive = form[method.key as keyof typeof form] as boolean;
          return (
            <button
              key={method.key}
              onClick={() => setForm({ ...form, [method.key]: !isActive })}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                isActive ? 'border-[#ff9607] bg-[#ff9607]/5' : 'border-white/10 bg-white/5'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isActive ? 'bg-[#ff9607]' : 'bg-white/10'}`}>
                <Icon className={`h-5 w-5 ${isActive ? 'text-black' : 'text-gray-400'}`} />
              </div>
              <span className="flex-1 text-left font-medium">{method.label}</span>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-[#ff9607] bg-[#ff9607]' : 'border-white/30'}`}>
                {isActive && <div className="w-2 h-2 bg-black rounded-full" />}
              </div>
            </button>
          );
        })}
      </div>

      {form.acceptPix && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Chave PIX</label>
          <input
            value={form.pixKey}
            onChange={e => setForm({ ...form, pixKey: e.target.value })}
            placeholder="Sua chave PIX"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607]"
          />
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => router.push('/setup/step-1-dados')}
          className="flex-1 border border-white/10 py-4 rounded-xl font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" /> Voltar
        </button>
        <button
          onClick={handleNext}
          className="flex-[2] bg-[#ff9607] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#ffaa33] transition-colors flex items-center justify-center gap-2"
        >
          Continuar <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
