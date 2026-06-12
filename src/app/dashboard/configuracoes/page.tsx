'use client';

import { useState, useEffect } from 'react';
import { Save, Store, Clock, CreditCard, Truck, Palette } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

interface BusinessHour {
  id: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

interface StoreData {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  themeColor: string;
  isOpen: boolean;
  autoAcceptOrders: boolean;
  autoPrint: boolean;
  acceptCash: boolean;
  acceptCard: boolean;
  acceptPix: boolean;
  acceptOnlineCard: boolean;
  pixKey: string;
  deliveryFee: number;
  minOrderValue: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  hasDelivery: boolean;
  hasPickup: boolean;
  hasDineIn: boolean;
  businessHours: BusinessHour[];
}

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<'loja' | 'horario' | 'pagamento' | 'entrega' | 'aparencia'>('loja');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [storeData, setStoreData] = useState<StoreData>({
    id: '',
    name: '',
    phone: '',
    whatsapp: '',
    address: '',
    city: '',
    state: '',
    themeColor: '#ff9607',
    isOpen: true,
    autoAcceptOrders: false,
    autoPrint: false,
    acceptCash: true,
    acceptCard: true,
    acceptPix: true,
    acceptOnlineCard: false,
    pixKey: '',
    deliveryFee: 0,
    minOrderValue: 0,
    deliveryTimeMin: 30,
    deliveryTimeMax: 60,
    hasDelivery: true,
    hasPickup: true,
    hasDineIn: false,
    businessHours: [],
  });

  useEffect(() => {
    apiFetch('/api/stores')
      .then(r => r.json())
      .then(d => {
        if (d.data?.[0]) {
          const s = d.data[0];
          setStoreData({
            id: s.id,
            name: s.name || '',
            phone: s.phone || '',
            whatsapp: s.whatsapp || '',
            address: s.address || '',
            city: s.city || '',
            state: s.state || '',
            themeColor: s.themeColor || '#ff9607',
            isOpen: s.isOpen ?? true,
            autoAcceptOrders: s.autoAcceptOrders ?? false,
            autoPrint: s.autoPrint ?? false,
            acceptCash: s.acceptCash ?? true,
            acceptCard: s.acceptCard ?? true,
            acceptPix: s.acceptPix ?? true,
            acceptOnlineCard: s.acceptOnlineCard ?? false,
            pixKey: s.pixKey || '',
            deliveryFee: s.deliveryFee || 0,
            minOrderValue: s.minOrderValue || 0,
            deliveryTimeMin: s.deliveryTimeMin || 30,
            deliveryTimeMax: s.deliveryTimeMax || 60,
            hasDelivery: s.hasDelivery ?? true,
            hasPickup: s.hasPickup ?? true,
            hasDineIn: s.hasDineIn ?? false,
            businessHours: s.businessHours || [],
          });
        }
      })
      .catch(() => setError('Erro ao carregar dados da loja'));
  }, []);

  async function handleSave() {
    if (!storeData.id) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/api/stores/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: storeData.id,
          name: storeData.name,
          phone: storeData.phone,
          whatsapp: storeData.whatsapp,
          address: storeData.address,
          city: storeData.city,
          state: storeData.state,
          themeColor: storeData.themeColor,
          isOpen: storeData.isOpen,
          autoAcceptOrders: storeData.autoAcceptOrders,
          autoPrint: storeData.autoPrint,
          acceptCash: storeData.acceptCash,
          acceptCard: storeData.acceptCard,
          acceptPix: storeData.acceptPix,
          acceptOnlineCard: storeData.acceptOnlineCard,
          pixKey: storeData.pixKey,
          deliveryFee: storeData.deliveryFee,
          minOrderValue: storeData.minOrderValue,
          deliveryTimeMin: storeData.deliveryTimeMin,
          deliveryTimeMax: storeData.deliveryTimeMax,
          hasDelivery: storeData.hasDelivery,
          hasPickup: storeData.hasPickup,
          hasDineIn: storeData.hasDineIn,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(json.message || 'Erro ao salvar');
      }
    } catch {
      setError('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
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
                  : 'bg-white/[0.03] text-gray-400 border border-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5 space-y-4">
        {activeTab === 'loja' && (
          <>
            <h3 className="font-bold text-sm mb-1">Dados da Loja</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Nome do estabelecimento</label>
                <input
                  value={storeData.name}
                  onChange={e => setStoreData({ ...storeData, name: e.target.value })}
                  className="w-full bg-[#050505]/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff9607]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Telefone</label>
                <input
                  value={storeData.phone}
                  onChange={e => setStoreData({ ...storeData, phone: e.target.value })}
                  className="w-full bg-[#050505]/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff9607]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">WhatsApp</label>
                <input
                  value={storeData.whatsapp}
                  onChange={e => setStoreData({ ...storeData, whatsapp: e.target.value })}
                  className="w-full bg-[#050505]/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff9607]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Cidade</label>
                <input
                  value={storeData.city}
                  onChange={e => setStoreData({ ...storeData, city: e.target.value })}
                  className="w-full bg-[#050505]/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff9607]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Estado</label>
                <input
                  value={storeData.state}
                  maxLength={2}
                  onChange={e => setStoreData({ ...storeData, state: e.target.value.toUpperCase() })}
                  className="w-full bg-[#050505]/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff9607]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Endereço</label>
                <input
                  value={storeData.address}
                  onChange={e => setStoreData({ ...storeData, address: e.target.value })}
                  className="w-full bg-[#050505]/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff9607]"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={storeData.isOpen}
                  onChange={e => setStoreData({ ...storeData, isOpen: e.target.checked })}
                  className="w-4 h-4 accent-[#ff9607]"
                />
                <span className="text-sm text-gray-300">Loja aberta</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={storeData.autoAcceptOrders}
                  onChange={e => setStoreData({ ...storeData, autoAcceptOrders: e.target.checked })}
                  className="w-4 h-4 accent-[#ff9607]"
                />
                <span className="text-sm text-gray-300">Aceitar pedidos automaticamente</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={storeData.autoPrint}
                  onChange={e => setStoreData({ ...storeData, autoPrint: e.target.checked })}
                  className="w-4 h-4 accent-[#ff9607]"
                />
                <span className="text-sm text-gray-300">Imprimir pedidos automaticamente</span>
              </label>
            </div>
          </>
        )}

        {activeTab === 'horario' && (
          <div className="space-y-3">
            <h3 className="font-bold text-sm mb-1">Horário de funcionamento</h3>
            {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((day, idx) => {
              const bh = storeData.businessHours.find(b => b.dayOfWeek === idx);
              return (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl">
                  <span className="text-sm font-medium">{day}</span>
                  <span className="text-sm text-gray-400">
                    {bh?.isOpen ? `${bh.openTime} - ${bh.closeTime}` : 'Fechado'}
                  </span>
                </div>
              );
            })}
            <p className="text-xs text-gray-500 mt-2">Para editar os horários, acesse o setup inicial.</p>
          </div>
        )}

        {activeTab === 'pagamento' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm mb-1">Formas de pagamento aceitas</h3>
            {[
              { key: 'acceptCash', label: 'Dinheiro' },
              { key: 'acceptCard', label: 'Cartão na entrega' },
              { key: 'acceptPix', label: 'PIX' },
              { key: 'acceptOnlineCard', label: 'Cartão online' },
            ].map((opt) => (
              <label key={opt.key} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl cursor-pointer">
                <span className="text-sm">{opt.label}</span>
                <input
                  type="checkbox"
                  checked={storeData[opt.key as keyof StoreData] as boolean}
                  onChange={e => setStoreData({ ...storeData, [opt.key]: e.target.checked })}
                  className="w-5 h-5 accent-[#ff9607]"
                />
              </label>
            ))}
            <div>
              <label className="block text-xs text-gray-400 mb-2">Chave PIX</label>
              <input
                value={storeData.pixKey}
                onChange={e => setStoreData({ ...storeData, pixKey: e.target.value })}
                className="w-full bg-[#050505]/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff9607]"
                placeholder="ex: pix@sualoja.com"
              />
            </div>
          </div>
        )}

        {activeTab === 'entrega' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm mb-1">Modos de operação</h3>
            {[
              { key: 'hasDelivery', label: 'Delivery' },
              { key: 'hasPickup', label: 'Retirada no local' },
              { key: 'hasDineIn', label: 'Salão' },
            ].map((opt) => (
              <label key={opt.key} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl cursor-pointer">
                <span className="text-sm">{opt.label}</span>
                <input
                  type="checkbox"
                  checked={storeData[opt.key as keyof StoreData] as boolean}
                  onChange={e => setStoreData({ ...storeData, [opt.key]: e.target.checked })}
                  className="w-5 h-5 accent-[#ff9607]"
                />
              </label>
            ))}

            <h3 className="font-bold text-sm mb-1 mt-6">Taxas e prazos</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-2">Taxa de entrega padrão</label>
                <input
                  type="number"
                  value={storeData.deliveryFee}
                  onChange={e => setStoreData({ ...storeData, deliveryFee: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#050505]/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff9607]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2">Pedido mínimo</label>
                <input
                  type="number"
                  value={storeData.minOrderValue}
                  onChange={e => setStoreData({ ...storeData, minOrderValue: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#050505]/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff9607]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2">Tempo mínimo (min)</label>
                <input
                  type="number"
                  value={storeData.deliveryTimeMin}
                  onChange={e => setStoreData({ ...storeData, deliveryTimeMin: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#050505]/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff9607]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2">Tempo máximo (min)</label>
                <input
                  type="number"
                  value={storeData.deliveryTimeMax}
                  onChange={e => setStoreData({ ...storeData, deliveryTimeMax: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#050505]/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff9607]"
                />
              </div>
            </div>
          </div>
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
                    className="flex-1 bg-[#050505]/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#ff9607]"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={loading || !storeData.id}
        className="w-full bg-[#ff9607] text-black py-3 rounded-xl font-bold text-sm hover:bg-[#ffaa33] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {loading ? 'Salvando...' : saved ? 'Salvo com sucesso!' : 'Salvar Configurações'}
      </button>
    </div>
  );
}
