'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Truck, ArrowRight, ArrowLeft, Plus, X, Search, MapPin } from 'lucide-react';

const DeliveryMap = dynamic(() => import('@/components/DeliveryMap'), { ssr: false });

interface Zone {
  radius: number;
  fee: number;
  minOrder: number;
}

export default function Step5Entrega() {
  const router = useRouter();
  const [hasDelivery, setHasDelivery] = useState(true);
  const [hasPickup, setHasPickup] = useState(true);
  const [zones, setZones] = useState<Zone[]>([
    { radius: 1, fee: 0, minOrder: 15 },
    { radius: 3, fee: 3, minOrder: 20 },
    { radius: 5, fee: 5, minOrder: 30 },
  ]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-23.5505, -46.6333]); // São Paulo default
  const [addressSearch, setAddressSearch] = useState('');
  const [searching, setSearching] = useState(false);

  // Tenta pegar endereço do step-1
  useEffect(() => {
    const saved = localStorage.getItem('setup_dados');
    if (saved) {
      try {
        const dados = JSON.parse(saved);
        const endereco = [dados.address, dados.addressNumber, dados.city, dados.state]
          .filter(Boolean)
          .join(', ');
        if (endereco) {
          setAddressSearch(endereco);
          buscarEndereco(endereco);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  async function buscarEndereco(query: string) {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { 'Accept-Language': 'pt-BR' } }
      );
      const data = await res.json();
      if (data && data[0]) {
        setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      }
    } catch {
      // mantém centro atual
    } finally {
      setSearching(false);
    }
  }

  function handleSearch() {
    buscarEndereco(addressSearch);
  }

  function addZone() {
    const lastRadius = zones.length > 0 ? zones[zones.length - 1].radius : 0;
    setZones([...zones, { radius: lastRadius + 2, fee: 0, minOrder: 0 }]);
  }

  function removeZone(index: number) {
    setZones(zones.filter((_, i) => i !== index));
  }

  function updateZone(index: number, field: keyof Zone, value: number) {
    const newZones = [...zones];
    newZones[index] = { ...newZones[index], [field]: value };
    setZones(newZones);
  }

  function handleNext() {
    localStorage.setItem('setup_entrega', JSON.stringify({ hasDelivery, hasPickup, zones }));
    router.push('/setup/step-6-salao');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-[#ff9607]/10 rounded-2xl flex items-center justify-center">
          <Truck className="h-7 w-7 text-[#ff9607]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Configuração de delivery</h2>
          <p className="text-gray-400">Defina como seus clientes recebem os pedidos</p>
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-3 bg-white/5 rounded-xl p-4 flex-1 cursor-pointer">
          <input type="checkbox" checked={hasDelivery} onChange={e => setHasDelivery(e.target.checked)} className="w-5 h-5 accent-[#ff9607]" />
          <span className="font-medium">Delivery</span>
        </label>
        <label className="flex items-center gap-3 bg-white/5 rounded-xl p-4 flex-1 cursor-pointer">
          <input type="checkbox" checked={hasPickup} onChange={e => setHasPickup(e.target.checked)} className="w-5 h-5 accent-[#ff9607]" />
          <span className="font-medium">Retirada na loja</span>
        </label>
      </div>

      {hasDelivery && (
        <div className="space-y-4">
          {/* Busca de endereço */}
          <div className="bg-white/5 rounded-xl p-4 space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <MapPin className="h-4 w-4 text-[#ff9607]" />
              Local do estabelecimento
            </label>
            <div className="flex gap-2">
              <input
                value={addressSearch}
                onChange={e => setAddressSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Digite o endereço da loja..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607]"
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                className="bg-[#ff9607] text-black px-4 py-3 rounded-xl font-bold hover:bg-[#ffaa33] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                {searching ? '...' : 'Buscar'}
              </button>
            </div>
          </div>

          {/* Mapa */}
          <DeliveryMap center={mapCenter} zones={zones} />

          {/* Legenda */}
          <div className="flex flex-wrap gap-3">
            {zones.map((zone, i) => {
              const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];
              return (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                  Área {i + 1}: {zone.radius} km
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <h3 className="font-bold">Áreas de entrega</h3>
            <button onClick={addZone} className="text-[#ff9607] flex items-center gap-1 text-sm font-medium">
              <Plus className="h-4 w-4" /> Adicionar área
            </button>
          </div>

          {zones.map((zone, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'][i % 6] }} />
                  <span className="text-sm font-medium text-[#ff9607]">Área {i + 1}</span>
                </div>
                {zones.length > 1 && (
                  <button onClick={() => removeZone(i)} className="text-gray-500 hover:text-red-400">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-400">Raio (km)</label>
                  <input
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={zone.radius}
                    onChange={e => updateZone(i, 'radius', Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white mt-1 focus:outline-none focus:border-[#ff9607]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Taxa (R$)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={zone.fee}
                    onChange={e => updateZone(i, 'fee', Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white mt-1 focus:outline-none focus:border-[#ff9607]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Mínimo (R$)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={zone.minOrder}
                    onChange={e => updateZone(i, 'minOrder', Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white mt-1 focus:outline-none focus:border-[#ff9607]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => router.push('/setup/step-4-cardapio')}
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
