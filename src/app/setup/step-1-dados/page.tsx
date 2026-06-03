'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, ArrowRight } from 'lucide-react';

export default function Step1Dados() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    address: '',
    city: '',
    state: '',
    cnpj: '',
    cpf: '',
  });

  function handleNext() {
    localStorage.setItem('setup_dados', JSON.stringify(form));
    router.push('/setup/step-2-pagamento');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-[#ff9607]/10 rounded-2xl flex items-center justify-center">
          <Store className="h-7 w-7 text-[#ff9607]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Dados do estabelecimento</h2>
          <p className="text-gray-400">Informe os dados básicos do seu negócio</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-1">Nome do estabelecimento *</label>
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Ex: Burger King do GB"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Telefone *</label>
          <input
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="(11) 99999-9999"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">WhatsApp</label>
          <input
            value={form.whatsapp}
            onChange={e => setForm({ ...form, whatsapp: e.target.value })}
            placeholder="(11) 98888-7777"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607]"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-1">Endereço</label>
          <input
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            placeholder="Rua das Flores, 123 - Centro"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Cidade</label>
          <input
            value={form.city}
            onChange={e => setForm({ ...form, city: e.target.value })}
            placeholder="São Paulo"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Estado</label>
          <input
            value={form.state}
            onChange={e => setForm({ ...form, state: e.target.value })}
            placeholder="SP"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">CNPJ</label>
          <input
            value={form.cnpj}
            onChange={e => setForm({ ...form, cnpj: e.target.value })}
            placeholder="00.000.000/0000-00"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">CPF</label>
          <input
            value={form.cpf}
            onChange={e => setForm({ ...form, cpf: e.target.value })}
            placeholder="000.000.000-00"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607]"
          />
        </div>
      </div>

      <button
        onClick={handleNext}
        className="w-full bg-[#ff9607] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#ffaa33] transition-colors flex items-center justify-center gap-2"
      >
        Continuar <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}
