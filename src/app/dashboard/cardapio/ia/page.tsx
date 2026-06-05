'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Check, ArrowLeft, ChevronDown, ChevronRight,
  Loader2, ShoppingBag, UtensilsCrossed
} from 'lucide-react';
import { AI_TEMPLATES, TEMPLATE_META } from '@/lib/ai-templates';

function generateId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36).substring(0, 4);
}

export default function CardapioIaPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [expandedPreview, setExpandedPreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [businessType, setBusinessType] = useState('HAMBURGUERIA');
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch('/api/stores')
      .then(r => r.json())
      .then(d => {
        if (d.data?.[0]) {
          const store = d.data[0];
          const bt = store.businessType || 'HAMBURGUERIA';
          setBusinessType(bt);
          // pré-seleciona o tipo do estabelecimento
          if (AI_TEMPLATES[bt]) setSelected([bt]);
        }
      })
      .catch(() => {});
  }, []);

  function toggle(key: string) {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }

  const preview = selected.flatMap(key => AI_TEMPLATES[key] || []).reduce<Record<string, { name: string; description: string; price: number; count: number }[]>>((acc, cat) => {
    if (!acc[cat.category]) acc[cat.category] = [];
    cat.products.forEach(p => {
      const existing = acc[cat.category].find(x => x.name === p.name);
      if (existing) existing.count += 1;
      else acc[cat.category].push({ name: p.name, description: p.description, price: p.price, count: 1 });
    });
    return acc;
  }, {});

  const totalCategories = Object.keys(preview).length;
  const totalProducts = Object.values(preview).reduce((s, arr) => s + arr.length, 0);

  async function generate() {
    if (selected.length === 0) return;
    setGenerating(true);

    // Simula progresso da IA
    for (let i = 0; i <= 100; i += 5) {
      setProgress(i);
      await new Promise(r => setTimeout(r, 80));
    }

    // Monta o cardápio
    const newCategories: { id: string; name: string; products: { id: string; name: string; description: string; price: number; stock: number; isActive: true }[] }[] = [];

    selected.forEach(key => {
      const tpl = AI_TEMPLATES[key];
      if (!tpl) return;
      tpl.forEach(catTpl => {
        let cat = newCategories.find(c => c.name.toLowerCase() === catTpl.category.toLowerCase());
        if (!cat) {
          cat = { id: generateId(), name: catTpl.category, products: [] };
          newCategories.push(cat);
        }
        catTpl.products.forEach(prod => {
          const exists = cat!.products.some(p => p.name.toLowerCase() === prod.name.toLowerCase());
          if (!exists) {
            cat!.products.push({ id: generateId(), name: prod.name, description: prod.description, price: prod.price, stock: prod.stock, isActive: true });
          }
        });
      });
    });

    // Salva no localStorage para a página principal consumir
    localStorage.setItem('gbai-ai-menu-draft', JSON.stringify(newCategories));
    setGenerating(false);
    setDone(true);
  }

  function goToCardapio() {
    router.push('/dashboard/cardapio');
  }

  if (done) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-zinc-900 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center space-y-4"
        >
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-green-400" />
          </div>
          <h2 className="text-xl font-bold">Cardápio pronto!</h2>
          <p className="text-gray-400 text-sm">
            A IA gerou <strong className="text-white">{totalProducts}</strong> produtos em <strong className="text-white">{totalCategories}</strong> categorias com base nos modelos selecionados.
          </p>
          <div className="flex gap-3 pt-2">
            <button onClick={goToCardapio} className="flex-1 bg-[#ff9607] text-black py-3 rounded-xl font-bold text-sm hover:bg-[#ffaa33] transition-colors flex items-center justify-center gap-2">
              <ShoppingBag className="h-4 w-4" /> Ver meu cardápio
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={goToCardapio} className="p-2 bg-zinc-900 border border-white/10 rounded-xl hover:border-white/20 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#ff9607]" />
            Cardápio com IA
          </h1>
          <p className="text-gray-400 text-sm">Selecione um ou mais modelos e deixe a IA montar seu cardápio</p>
        </div>
      </div>

      {/* Template Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TEMPLATE_META.map(({ key, label, icon }) => {
          const isSelected = selected.includes(key);
          const productCount = AI_TEMPLATES[key]?.reduce((s, c) => s + c.products.length, 0) || 0;
          const isBusinessType = businessType === key;

          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`relative text-left p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'border-[#ff9607] bg-[#ff9607]/5'
                  : 'border-white/5 bg-zinc-900 hover:border-white/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className={`text-sm font-bold ${isSelected ? 'text-[#ff9607]' : 'text-white'}`}>{label}</p>
                    <p className="text-xs text-gray-500">{productCount} produtos</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-[#ff9607] border-[#ff9607]' : 'border-gray-600'
                }`}>
                  {isSelected && <Check className="h-3 w-3 text-black" />}
                </div>
              </div>
              {isBusinessType && (
                <span className="absolute top-2 right-2 text-[10px] font-bold text-[#ff9607] bg-[#ff9607]/10 px-2 py-0.5 rounded-full">
                  Seu tipo
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Preview */}
      {selected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-[#ff9607]" />
              <h3 className="font-bold text-sm">Pré-visualização</h3>
            </div>
            <span className="text-xs text-gray-500">{totalCategories} categorias · {totalProducts} produtos</span>
          </div>
          <div className="p-3 space-y-1 max-h-80 overflow-y-auto">
            {Object.entries(preview).map(([catName, products]) => (
              <div key={catName}>
                <button
                  onClick={() => setExpandedPreview(expandedPreview === catName ? null : catName)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm font-medium">{catName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{products.length} itens</span>
                    {expandedPreview === catName ? <ChevronDown className="h-3.5 w-3.5 text-gray-500" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-500" />}
                  </div>
                </button>
                <AnimatePresence>
                  {expandedPreview === catName && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-6 pr-3 pb-2 space-y-1">
                        {products.map((p, i) => (
                          <div key={i} className="flex items-center justify-between py-1.5 text-sm">
                            <span className="text-gray-300">{p.name}</span>
                            <span className="text-gray-500 text-xs">R$ {p.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Generate Button */}
      {selected.length > 0 && !generating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end"
        >
          <button
            onClick={generate}
            className="flex items-center gap-2 px-6 py-3 bg-[#ff9607] text-black rounded-xl font-bold text-sm hover:bg-[#ffaa33] transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Gerar Cardápio com IA
          </button>
        </motion.div>
      )}

      {/* Generating State */}
      {generating && (
        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-[#ff9607]/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="h-6 w-6 text-[#ff9607]" />
          </div>
          <div>
            <h3 className="font-bold text-sm">A IA está montando seu cardápio...</h3>
            <p className="text-xs text-gray-500 mt-1">Analisando modelos selecionados e criando produtos</p>
          </div>
          <div className="w-full max-w-xs mx-auto">
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#ff9607] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">{progress}%</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Organizando categorias e preços sugeridos</span>
          </div>
        </div>
      )}
    </div>
  );
}
