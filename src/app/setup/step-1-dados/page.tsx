'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, ArrowRight, MapPin, Loader2 } from 'lucide-react';

export default function Step1Dados() {
  const router = useRouter();
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    cep: '',
    address: '',
    addressNumber: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    cnpj: '',
    cpf: '',
  });

  function formatCep(value: string) {
    return value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);
  }

  async function buscarCep(rawCep: string) {
    const cepLimpo = rawCep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    setLoadingCep(true);
    setCepError('');

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();

      if (data.erro) {
        setCepError('CEP não encontrado');
        setLoadingCep(false);
        return;
      }

      setForm(prev => ({
        ...prev,
        address: data.logradouro || prev.address,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
      }));
    } catch {
      setCepError('Erro ao buscar CEP');
    } finally {
      setLoadingCep(false);
    }
  }

  function handleCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatCep(e.target.value);
    setForm(prev => ({ ...prev, cep: formatted }));
    setCepError('');

    const cepLimpo = formatted.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      buscarCep(formatted);
    }
  }

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

        {/* CEP */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#ff9607]" />
            CEP
          </label>
          <div className="relative">
            <input
              value={form.cep}
              onChange={handleCepChange}
              placeholder="00000-000"
              maxLength={9}
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607] pr-12 ${
                cepError ? 'border-red-500' : 'border-white/10'
              }`}
            />
            {loadingCep && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#ff9607] animate-spin" />
            )}
          </div>
          {cepError && <p className="text-red-400 text-xs mt-1">{cepError}</p>}
          <p className="text-gray-500 text-xs mt-1">Digite o CEP para preencher o endereço automaticamente</p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-1">Endereço (Rua / Avenida)</label>
          <input
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            placeholder="Rua das Flores"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Número *</label>
          <input
            value={form.addressNumber}
            onChange={e => setForm({ ...form, addressNumber: e.target.value })}
            placeholder="123, Apt 45, Casa 2"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Complemento</label>
          <input
            value={form.complement}
            onChange={e => setForm({ ...form, complement: e.target.value })}
            placeholder="Bloco B, Sala 101"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Bairro</label>
          <input
            value={form.neighborhood}
            onChange={e => setForm({ ...form, neighborhood: e.target.value })}
            placeholder="Centro"
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
            maxLength={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607] uppercase"
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
