'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, ArrowRight, ArrowLeft, Plus, X } from 'lucide-react';

export default function Step5Entrega() {
  const router = useRouter();
  const [hasDelivery, setHasDelivery] = useState(true);
  const [hasPickup, setHasPickup] = useState(true);
  const [zones, setZones] = useState([
    { radius: 1, fee: 0, minOrder: 15 },
    { radius: 3, fee: 3, minOrder: 20 },
    { radius: 5, fee: 5, minOrder: 30 },
  ]);

  function addZone() {
    setZones([...zones, { radius: zones.length + 1, fee: 0, minOrder: 0 }]);
  }

  function removeZone(index: number) {
    setZones(zones.filter((_, i) => i !== index));
  }

  function updateZone(index: number, field: string, value: number) {
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
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Áreas de entrega</h3>
            <button onClick={addZone} className="text-[#ff9607] flex items-center gap-1 text-sm font-medium">
              <Plus className="h-4 w-4" /> Adicionar área
            </button>
          </div>
          {zones.map((zone, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#ff9607]">Área {i + 1}</span>
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
                    value={zone.radius}
                    onChange={e => updateZone(i, 'radius', Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Taxa (R$)</label>
                  <input
                    type="number"
                    value={zone.fee}
                    onChange={e => updateZone(i, 'fee', Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Mínimo (R$)</label>
                  <input
                    type="number"
                    value={zone.minOrder}
                    onChange={e => updateZone(i, 'minOrder', Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white mt-1"
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
