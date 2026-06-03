'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UtensilsCrossed, ArrowRight, ArrowLeft, Sparkles, Camera, Link2, Upload } from 'lucide-react';

const templates = [
  { type: 'HAMBURGUERIA', name: '🍔 Hamburgueria', desc: 'Burgers, combos, porções e bebidas' },
  { type: 'PIZZARIA', name: '🍕 Pizzaria', desc: 'Pizzas, calzones, bebidas e sobremesas' },
  { type: 'RESTAURANTE', name: '🍽️ Restaurante', desc: 'Pratos executivos, saladas, bebidas' },
  { type: 'ACAITERIA', name: '🫐 Açaíteria', desc: 'Açaís, smoothies, complementos' },
  { type: 'SORVETERIA', name: '🍦 Sorveteria', desc: 'Sorvetes, milkshakes, açaís' },
  { type: 'BAR', name: '🍺 Bar', desc: 'Petiscos, cervejas, drinks, porções' },
  { type: 'LANCHONETE', name: '🥪 Lanchonete', desc: 'Lanches naturais, sucos, cafés' },
  { type: 'PADARIA', name: '🥐 Padaria', desc: 'Pães, salgados, doces, cafés' },
  { type: 'JAPONESA', name: '🍣 Japonesa', desc: 'Sushis, sashimis, temakis, hot rolls' },
  { type: 'BEBIDAS', name: '🥤 Bebidas', desc: 'Sucos, refrigerantes, cervejas, água' },
];

const iaOptions = [
  { icon: Sparkles, label: 'Gerar com IA', desc: 'Descreva seu cardápio e a IA cria tudo' },
  { icon: Camera, label: 'Foto do cardápio', desc: 'Tire foto ou envie imagem do cardápio atual' },
  { icon: Link2, label: 'Copiar do iFood', desc: 'Cole o link da sua loja no iFood' },
  { icon: Upload, label: 'Importar dados', desc: 'Envie planilha ou arquivo' },
];

export default function Step4Cardapio() {
  const router = useRouter();
  const [mode, setMode] = useState<'template' | 'ia'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  function handleNext() {
    localStorage.setItem('setup_cardapio_template', selectedTemplate);
    router.push('/setup/step-5-entrega');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-[#ff9607]/10 rounded-2xl flex items-center justify-center">
          <UtensilsCrossed className="h-7 w-7 text-[#ff9607]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Cardápio</h2>
          <p className="text-gray-400">Escolha como criar seu cardápio</p>
        </div>
      </div>

      <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
        <button
          onClick={() => setMode('template')}
          className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
            mode === 'template' ? 'bg-[#ff9607] text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => setMode('ia')}
          className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
            mode === 'ia' ? 'bg-[#ff9607] text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          Inteligência Artificial
        </button>
      </div>

      {mode === 'template' && (
        <div className="grid md:grid-cols-2 gap-3">
          {templates.map((t) => (
            <button
              key={t.type}
              onClick={() => setSelectedTemplate(t.type)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                selectedTemplate === t.type
                  ? 'border-[#ff9607] bg-[#ff9607]/5'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <p className="font-bold text-lg">{t.name}</p>
              <p className="text-sm text-gray-400 mt-1">{t.desc}</p>
            </button>
          ))}
        </div>
      )}

      {mode === 'ia' && (
        <div className="grid md:grid-cols-2 gap-3">
          {iaOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.label}
                className="text-left p-4 rounded-xl border-2 border-white/10 bg-white/5 hover:border-[#ff9607]/50 transition-all"
              >
                <div className="w-10 h-10 bg-[#ff9607]/10 rounded-xl flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5 text-[#ff9607]" />
                </div>
                <p className="font-bold">{option.label}</p>
                <p className="text-sm text-gray-400 mt-1">{option.desc}</p>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => router.push('/setup/step-3-horario')}
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
