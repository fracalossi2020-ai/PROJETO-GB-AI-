'use client';

import { useState, useEffect } from 'react';
import { Save, Store, Clock, CreditCard, Truck, Palette, Bell, Shield } from 'lucide-react';

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<'loja' | 'horario' | 'pagamento' | 'entrega' | 'aparencia'>('loja');
  const [saved, setSaved] = useState(false);

  const [storeData, setStoreData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    address: '',
    themeColor: '#ff9607',
    isOpen: true,
    autoAcceptOrders: false,
    autoPrint: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem('setup_dados');
    if (saved) {
      try {
        const d = JSON.parse(saved);
        setStoreData(prev => ({ ...prev, ...d }));
      } catch { /* ignore */ }
    }
  }, []);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const tabs = [
    { id: 'loja' as const, label: 'Loja', icon: Store },
    { id: 'horario' as const, label: 'Horário', icon: Clock },
    { id: 'pagamento' as const, label: 'Pagamento', icon: CreditCard },
    { id: 'entrega' as const, label: 'Entrega', icon: Truck },
    { id: 'aparencia' as const, label: 'Aparência', icon: Palette },
  ];

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold">Configurações</h1>
        <p className="text-gray-400 text-sm">Personalize as configurações do seu estabelecimento</p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#ff9607] text-black'
                  : 'bg-zinc-900 text-gray-400 border border-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5 space-y-4">
        {activeTab === 'loja' && (
          <>
            <h3 className="font-bold text-sm mb-1">Dados da Loja</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Nome do estabelecimento</label>
                <input
                  value={storeData.name}
                  onChange={e => setStoreData({ ...storeData, name: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff9607]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Telefone</label>
                <input
                  value={storeData.phone}
                  onChange={e => setStoreData({ ...storeData, phone: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff9607]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">WhatsApp</label>
                <input
                  value={storeData.whatsapp}
                  onChange={e => setStoreData({ ...storeData, whatsapp: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff9607]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Endereço</label>
                <input
                  value={storeData.address}
                  onChange={e => setStoreData({ ...storeData, address: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff9607]"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={storeData.isOpen}
                  onChange={e => setStoreData({ ...storeData, isOpen: e.target.checked })}
                  className="w-4 h-4 accent-[#ff9607]"
                />
                <span className="text-sm text-gray-300">Loja aberta</span>
              </label>
            </div>
          </>
        )}

        {activeTab === 'horario' && (
          <>
            <h3 className="font-bold text-sm mb-1">Horário de Funcionamento</h3>
            {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((day, i) => (
              <div key={day} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <span className="text-sm w-20">{day}</span>
                <input type="time" defaultValue="08:00" className="bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-sm text-white" />
                <span className="text-gray-500">até</span>
                <input type="time" defaultValue="22:00" className="bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-sm text-white" />
                <label className="flex items-center gap-2 ml-auto">
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#ff9607]" />
                  <span className="text-xs text-gray-400">Aberto</span>
                </label>
              </div>
            ))}
          </>
        )}

        {activeTab === 'pagamento' && (
          <>
            <h3 className="font-bold text-sm mb-1">Formas de Pagamento</h3>
            <div className="space-y-3">
              {[
                { key: 'pix', label: 'PIX', desc: 'Pagamento instantâneo' },
                { key: 'cash', label: 'Dinheiro', desc: 'Pagamento na entrega' },
                { key: 'credit', label: 'Cartão de Crédito', desc: 'Na maquininha' },
                { key: 'debit', label: 'Cartão de Débito', desc: 'Na maquininha' },
              ].map(p => (
                <label key={p.key} className="flex items-center gap-3 p-3 bg-black/30 rounded-xl cursor-pointer hover:bg-black/40 transition-colors">
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#ff9607]" />
                  <div>
                    <p className="text-sm font-medium">{p.label}</p>
                    <p className="text-xs text-gray-500">{p.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="pt-2">
              <label className="block text-xs text-gray-400 mb-1">Chave PIX</label>
              <input
                placeholder="CPF, CNPJ, email ou chave aleatória"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#ff9607]"
              />
            </div>
          </>
        )}

        {activeTab === 'entrega' && (
          <>
            <h3 className="font-bold text-sm mb-1">Configurações de Entrega</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Taxa de entrega padrão (R$)</label>
                <input type="number" defaultValue={5} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff9607]" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Pedido mínimo (R$)</label>
                <input type="number" defaultValue={15} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff9607]" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Tempo mínimo (min)</label>
                <input type="number" defaultValue={25} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff9607]" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Tempo máximo (min)</label>
                <input type="number" defaultValue={45} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff9607]" />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-[#ff9607]" />
                <span className="text-sm text-gray-300">Aceitar retirada na loja</span>
              </label>
            </div>
          </>
        )}

        {activeTab === 'aparencia' && (
          <>
            <h3 className="font-bold text-sm mb-1">Aparência</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2">Cor principal</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={storeData.themeColor}
                    onChange={e => setStoreData({ ...storeData, themeColor: e.target.value })}
                    className="w-12 h-12 rounded-xl border-0 cursor-pointer"
                  />
                  <input
                    value={storeData.themeColor}
                    onChange={e => setStoreData({ ...storeData, themeColor: e.target.value })}
                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#ff9607]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Logo da loja</label>
                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-[#ff9607]/30 transition-colors cursor-pointer">
                  <Store className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Clique para fazer upload do logo</p>
                  <p className="text-xs text-gray-600 mt-1">PNG, JPG até 2MB</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-[#ff9607] text-black py-3 rounded-xl font-bold text-sm hover:bg-[#ffaa33] transition-colors flex items-center justify-center gap-2"
      >
        <Save className="h-4 w-4" />
        {saved ? 'Salvo com sucesso!' : 'Salvar Configurações'}
      </button>
    </div>
  );
}
