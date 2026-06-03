'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Armchair, ArrowRight, ArrowLeft, Check } from 'lucide-react';

export default function Step6Salao() {
  const router = useRouter();
  const [hasDineIn, setHasDineIn] = useState(false);
  const [tables, setTables] = useState(10);
  const [commands, setCommands] = useState(10);
  const [hasWaiters, setHasWaiters] = useState(false);
  const [serviceFee, setServiceFee] = useState(10);

  function handleFinish() {
    localStorage.setItem('setup_salao', JSON.stringify({ hasDineIn, tables, commands, hasWaiters, serviceFee }));
    router.push('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-[#ff9607]/10 rounded-2xl flex items-center justify-center">
          <Armchair className="h-7 w-7 text-[#ff9607]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Estrutura de Salão</h2>
          <p className="text-gray-400">Configure mesas e comandas (opcional)</p>
        </div>
      </div>

      <label className="flex items-center gap-3 bg-white/5 rounded-xl p-4 cursor-pointer">
        <input
          type="checkbox"
          checked={hasDineIn}
          onChange={e => setHasDineIn(e.target.checked)}
          className="w-5 h-5 accent-[#ff9607]"
        />
        <div>
          <p className="font-medium">Atender no salão</p>
          <p className="text-sm text-gray-400">Permitir que clientes façam pedidos sentados nas mesas</p>
        </div>
      </label>

      {hasDineIn && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="bg-white/5 rounded-xl p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Quantidade de mesas: {tables}</label>
              <input
                type="range"
                min="0"
                max="50"
                value={tables}
                onChange={e => setTables(Number(e.target.value))}
                className="w-full accent-[#ff9607]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Quantidade de comandas: {commands}</label>
              <input
                type="range"
                min="0"
                max="50"
                value={commands}
                onChange={e => setCommands(Number(e.target.value))}
                className="w-full accent-[#ff9607]"
              />
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 space-y-4">
            <p className="font-medium">Possui garçons?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setHasWaiters(true)}
                className={`flex-1 py-3 rounded-xl border-2 font-medium transition-colors ${
                  hasWaiters ? 'border-[#ff9607] bg-[#ff9607]/5 text-[#ff9607]' : 'border-white/10'
                }`}
              >
                Sim
              </button>
              <button
                onClick={() => setHasWaiters(false)}
                className={`flex-1 py-3 rounded-xl border-2 font-medium transition-colors ${
                  !hasWaiters ? 'border-[#ff9607] bg-[#ff9607]/5 text-[#ff9607]' : 'border-white/10'
                }`}
              >
                Não
              </button>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Taxa de serviço: {serviceFee}%</label>
            <input
              type="range"
              min="0"
              max="20"
              value={serviceFee}
              onChange={e => setServiceFee(Number(e.target.value))}
              className="w-full accent-[#ff9607]"
            />
            <p className="text-xs text-gray-500 mt-1">Máximo de 20% segundo o Decreto Lei 13.419/17</p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => router.push('/setup/step-5-entrega')}
          className="flex-1 border border-white/10 py-4 rounded-xl font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" /> Voltar
        </button>
        <button
          onClick={handleFinish}
          className="flex-[2] bg-[#ff9607] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#ffaa33] transition-colors flex items-center justify-center gap-2"
        >
          <Check className="h-5 w-5" /> Finalizar configuração
        </button>
      </div>
    </div>
  );
}
