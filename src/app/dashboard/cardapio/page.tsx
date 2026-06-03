'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, ToggleLeft, ToggleRight, GripVertical } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
  isFeatured: boolean;
  stock: number;
  category?: { name: string };
}

interface Category {
  id: string;
  name: string;
  products: Product[];
}

export default function CardapioPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'produtos' | 'categorias'>('produtos');

  useEffect(() => {
    fetch('/api/stores')
      .then(r => r.json())
      .then(d => {
        if (d.data?.[0]?.categories) {
          setCategories(d.data[0].categories);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const allProducts = categories.flatMap(c => c.products?.map(p => ({ ...p, category: c })) || []);
  const filtered = search.trim()
    ? allProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : allProducts;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-white/5 rounded animate-pulse" />
        <div className="h-96 bg-white/5 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Cardápio</h1>
          <p className="text-gray-400 text-sm">Gerencie seus produtos e categorias</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#ff9607] text-black rounded-xl text-sm font-bold hover:bg-[#ffaa33] transition-colors">
          <Plus className="h-4 w-4" /> Novo Produto
        </button>
      </div>

      <div className="flex gap-1.5">
        {(['produtos', 'categorias'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              activeTab === tab ? 'bg-[#ff9607] text-black' : 'bg-zinc-900 text-gray-400 border border-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'produtos' && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar produto..."
              className="w-full bg-zinc-900 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607]"
            />
          </div>

          <div className="space-y-4">
            {categories.map(cat => {
              const catProducts = search.trim()
                ? cat.products?.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
                : cat.products;
              if (!catProducts?.length) return null;

              return (
                <div key={cat.id} className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-600" />
                    <h3 className="font-bold text-sm">{cat.name}</h3>
                    <span className="text-xs text-gray-500 ml-auto">{catProducts.length} produto{catProducts.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {catProducts.map(product => (
                      <div key={product.id} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-lg">
                            🍔
                          </div>
                          <div>
                            <p className="text-sm font-medium">{product.name}</p>
                            <p className="text-xs text-gray-500">
                              {product.description || 'Sem descrição'} · Estoque: {product.stock}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold">R$ {product.price.toFixed(2)}</span>
                          <button className="p-1.5 text-gray-500 hover:text-[#ff9607] transition-colors">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button className="p-1.5 text-gray-500 hover:text-red-400 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'categorias' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="bg-zinc-900 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">{cat.name}</h3>
                <span className="text-xs bg-white/5 px-2 py-1 rounded-md text-gray-400">
                  {cat.products?.length || 0} produtos
                </span>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 text-xs bg-white/5 rounded-lg hover:bg-white/10 transition-colors">Editar</button>
                <button className="flex-1 py-2 text-xs bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-red-400">Excluir</button>
              </div>
            </div>
          ))}
          <button className="bg-zinc-900 border border-dashed border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 hover:border-[#ff9607]/50 transition-colors min-h-[140px]">
            <Plus className="h-6 w-6 text-gray-500" />
            <span className="text-sm text-gray-500">Nova Categoria</span>
          </button>
        </div>
      )}
    </div>
  );
}
