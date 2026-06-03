'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UtensilsCrossed, ArrowRight, ArrowLeft, Sparkles, Link2, Upload, FileText, Check } from 'lucide-react';

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

const cardapioOptions = [
  {
    id: 'ia',
    icon: Sparkles,
    title: 'Feito com IA',
    subtitle: 'Cardápio Inteligente',
    desc: 'Vamos montar um cardápio completo em poucos minutos com base nos produtos mais vendidos das categorias selecionadas.',
  },
  {
    id: 'ifood',
    icon: Link2,
    title: 'Copiar cardápio iFood',
    subtitle: '',
    desc: 'Vamos copiar seu cardápio iFood. Você pode editar os itens posteriormente no Gestor de Cardápio.',
  },
  {
    id: 'import',
    icon: Upload,
    title: 'Lido com IA',
    subtitle: 'Importar arquivo do cardápio',
    desc: 'Envie um arquivo do seu cardápio. Nossa IA irá ler e criar automaticamente suas categorias, itens e adicionais.',
  },
  {
    id: 'manual',
    icon: FileText,
    title: 'Cadastrar cardápio manualmente',
    subtitle: '',
    desc: 'Cadastre seus produtos, categorias e adicionais manualmente no sistema.',
  },
];

export default function Step4Cardapio() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  function toggleOption(id: string) {
    setSelectedOptions(prev =>
      prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]
    );
  }

  function handleNext() {
    localStorage.setItem('setup_cardapio_template', selectedTemplate);
    localStorage.setItem('setup_cardapio_options', JSON.stringify(selectedOptions));
    router.push('/setup/step-5-entrega');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-[#ff9607]/10 rounded-2xl flex items-center justify-center">
          <UtensilsCrossed className="h-7 w-7 text-[#ff9607]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">CADASTRE SEU CARDÁPIO</h2>
          <p className="text-gray-400">Escolha o tipo do seu estabelecimento e como deseja criar o cardápio</p>
        </div>
      </div>

      {/* Templates */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3">Tipo do estabelecimento *</h3>
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg">{t.name}</p>
                  <p className="text-sm text-gray-400 mt-1">{t.desc}</p>
                </div>
                {selectedTemplate === t.type && (
                  <div className="w-6 h-6 bg-[#ff9607] rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                    <Check className="h-4 w-4 text-black" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Opções de criação do cardápio */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3">Como deseja criar seu cardápio? (pode marcar mais de uma)</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {cardapioOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedOptions.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => toggleOption(option.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all relative ${
                  isSelected
                    ? 'border-[#ff9607] bg-[#ff9607]/5'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-[#ff9607]/20' : 'bg-[#ff9607]/10'
                  }`}>
                    <Icon className="h-5 w-5 text-[#ff9607]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{option.title}</p>
                    {option.subtitle && (
                      <p className="text-sm text-[#ff9607] font-medium">{option.subtitle}</p>
                    )}
                    <p className="text-sm text-gray-400 mt-1">{option.desc}</p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-[#ff9607] rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-black" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.push('/setup/step-3-horario')}
          className="flex-1 border border-white/10 py-4 rounded-xl font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" /> Voltar
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedTemplate}
          className="flex-[2] bg-[#ff9607] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#ffaa33] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
