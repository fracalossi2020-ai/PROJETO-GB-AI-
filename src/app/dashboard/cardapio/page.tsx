'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus, Search, Pencil, Trash2, GripVertical, Check, X, ChevronDown, ChevronRight,
  Sparkles
} from 'lucide-react';
import { AI_TEMPLATES } from '@/lib/ai-templates';

/* ---------- Types ---------- */
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
  stock: number;
}

interface Category {
  id: string;
  name: string;
  products: Product[];
}

/* ---------- Helpers ---------- */
function generateId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36).substring(0, 4);
}

/* ---------- Sortable Product ---------- */
function SortableProduct({ product, prodIndex, onEdit, onDelete }: {
  product: Product; prodIndex: number;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const sortId = `prod-${product.id}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sortId });
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(product.name);

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2.5 bg-white/[0.02] rounded-lg border border-white/5 hover:border-white/10 transition-colors group">
      <button {...attributes} {...listeners} className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing p-1 touch-none">
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="text-[10px] text-gray-700 font-mono w-5 text-center">{prodIndex + 1}</span>
      <div className="w-8 h-8 bg-[#ff9607]/10 rounded-lg flex items-center justify-center text-sm flex-shrink-0">🍔</div>
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { onEdit(product.id, editName); setEditing(false); } if (e.key === 'Escape') { setEditName(product.name); setEditing(false); } }}
              autoFocus
              className="flex-1 bg-black/40 border border-[#ff9607]/50 rounded-lg px-2 py-1 text-sm text-white focus:outline-none"
            />
            <button onClick={() => { onEdit(product.id, editName); setEditing(false); }} className="p-1 text-green-400 hover:bg-green-400/10 rounded"><Check className="h-3 w-3" /></button>
            <button onClick={() => { setEditName(product.name); setEditing(false); }} className="p-1 text-red-400 hover:bg-red-400/10 rounded"><X className="h-3 w-3" /></button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{product.name}</p>
            <button onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-[#ff9607] transition-opacity">
              <Pencil className="h-3 w-3" />
            </button>
          </div>
        )}
        {!editing && <p className="text-xs text-gray-500">R$ {product.price.toFixed(2)} · Estoque: {product.stock}</p>}
      </div>
      <button onClick={() => onDelete(product.id)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ---------- Sortable Category ---------- */
function SortableCategory({ category, index, onProductEdit, onProductDelete, onCategoryEdit }: {
  category: Category; index: number;
  onProductEdit: (catId: string, prodId: string, name: string) => void;
  onProductDelete: (catId: string, prodId: string) => void;
  onCategoryEdit: (catId: string, name: string) => void;
}) {
  const sortId = `cat-${category.id}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sortId });
  const [catEditing, setCatEditing] = useState(false);
  const [catName, setCatName] = useState(category.name);
  const [expanded, setExpanded] = useState(true);

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <button {...attributes} {...listeners} className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing p-1 touch-none">
          <GripVertical className="h-4 w-4" />
        </button>
        <button onClick={() => setExpanded(!expanded)} className="p-1 text-gray-500 hover:text-white transition-colors">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <div className="flex-1 min-w-0">
          {catEditing ? (
            <div className="flex items-center gap-2">
              <input value={catName} onChange={e => setCatName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { onCategoryEdit(category.id, catName); setCatEditing(false); } if (e.key === 'Escape') { setCatName(category.name); setCatEditing(false); } }}
                autoFocus className="flex-1 bg-black/40 border border-[#ff9607]/50 rounded-lg px-2 py-1 text-sm text-white focus:outline-none max-w-xs" />
              <button onClick={() => { onCategoryEdit(category.id, catName); setCatEditing(false); }} className="p-1 text-green-400 hover:bg-green-400/10 rounded"><Check className="h-3.5 w-3.5" /></button>
              <button onClick={() => { setCatName(category.name); setCatEditing(false); }} className="p-1 text-red-400 hover:bg-red-400/10 rounded"><X className="h-3.5 w-3.5" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 font-mono">#{index + 1}</span>
              <h3 className="font-bold text-sm">{category.name}</h3>
              <button onClick={() => setCatEditing(true)} className="p-1 text-gray-600 hover:text-[#ff9607] transition-colors"><Pencil className="h-3 w-3" /></button>
            </div>
          )}
        </div>
        <span className="text-xs text-gray-500">{category.products.length} produto{category.products.length !== 1 ? 's' : ''}</span>
      </div>
      {expanded && (
        <div className="p-3 space-y-1">
          {category.products.length === 0 && <p className="text-xs text-gray-600 text-center py-4">Nenhum produto</p>}
          {category.products.map((product, prodIndex) => (
            <SortableProduct key={product.id} product={product} prodIndex={prodIndex}
              onEdit={(id, name) => onProductEdit(category.id, id, name)}
              onDelete={(id) => onProductDelete(category.id, id)} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- New Product Modal ---------- */
function NewProductModal({ categories, onClose, onSave }: {
  categories: Category[];
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'>, categoryId: string) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('50');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !price.trim()) return;
    onSave({ name: name.trim(), description: description.trim(), price: parseFloat(price), stock: parseInt(stock) || 0, isActive: true }, categoryId);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Novo Produto</h3>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Categoria</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff9607]">
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Nome *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: X-Burger Duplo"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#ff9607]" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Descrição</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Carne 180g, queijo cheddar, bacon..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#ff9607]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Preço (R$) *</label>
              <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="29.90"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#ff9607]" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Estoque</label>
              <input type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="50"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#ff9607]" />
            </div>
          </div>
          <button type="submit" className="w-full bg-[#ff9607] text-black py-3 rounded-xl font-bold text-sm hover:bg-[#ffaa33] transition-colors">
            Salvar Produto
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------- Main Page ---------- */
export default function CardapioPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [businessType, setBusinessType] = useState('HAMBURGUERIA');
  const [showAiApplied, setShowAiApplied] = useState(false);

  useEffect(() => {
    fetch('/api/stores')
      .then(r => r.json())
      .then(d => {
        if (d.data?.[0]) {
          const store = d.data[0];
          setBusinessType(store.businessType || 'HAMBURGUERIA');
          const cats = store.categories?.map((c: any) => ({
            id: c.id,
            name: c.name,
            products: (c.products || []).map((p: any) => ({
              id: p.id, name: p.name, description: p.description,
              price: p.price, isActive: p.isActive, stock: p.stock,
            })),
          })) || [];
          setCategories(cats);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Verifica se veio da página de IA com novos produtos
    const draft = localStorage.getItem('gbai-ai-menu-draft');
    if (draft) {
      try {
        const newCategories: Category[] = JSON.parse(draft);
        setCategories(prev => {
          const merged = [...prev];
          newCategories.forEach(nc => {
            const existing = merged.find(c => c.name.toLowerCase() === nc.name.toLowerCase());
            if (existing) {
              nc.products.forEach(p => {
                const exists = existing.products.some(ep => ep.name.toLowerCase() === p.name.toLowerCase());
                if (!exists) existing.products.push(p);
              });
            } else {
              merged.push(nc);
            }
          });
          return merged;
        });
        localStorage.removeItem('gbai-ai-menu-draft');
        setShowAiApplied(true);
        setTimeout(() => setShowAiApplied(false), 4000);
      } catch {
        localStorage.removeItem('gbai-ai-menu-draft');
      }
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleCatDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      setCategories(prev => {
        const oldIndex = prev.findIndex(c => `cat-${c.id}` === active.id);
        const newIndex = prev.findIndex(c => `cat-${c.id}` === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleProdDragEnd = (catId: string, event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCategories(prev => prev.map(cat => {
        if (cat.id !== catId) return cat;
        const oldIdx = cat.products.findIndex(p => `prod-${p.id}` === active.id);
        const newIdx = cat.products.findIndex(p => `prod-${p.id}` === over.id);
        if (oldIdx === -1 || newIdx === -1) return cat;
        return { ...cat, products: arrayMove(cat.products, oldIdx, newIdx) };
      }));
    }
  };

  function editProduct(catId: string, prodId: string, name: string) {
    setCategories(prev => prev.map(cat =>
      cat.id === catId ? { ...cat, products: cat.products.map(p => p.id === prodId ? { ...p, name } : p) } : cat
    ));
  }

  function deleteProduct(catId: string, prodId: string) {
    setCategories(prev => prev.map(cat =>
      cat.id === catId ? { ...cat, products: cat.products.filter(p => p.id !== prodId) } : cat
    ));
  }

  function addProduct(product: Omit<Product, 'id'>, categoryId: string) {
    const newProduct: Product = { ...product, id: generateId() };
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId ? { ...cat, products: [...cat.products, newProduct] } : cat
    ));
  }

  function editCategory(catId: string, name: string) {
    setCategories(prev => prev.map(cat => cat.id === catId ? { ...cat, name } : cat));
  }

  const filtered = search.trim()
    ? categories.map(cat => ({ ...cat, products: cat.products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())) })).filter(cat => cat.products.length > 0)
    : categories;

  const allSortIds = [
    ...filtered.map(c => `cat-${c.id}`),
    ...filtered.flatMap(c => c.products.map(p => `prod-${p.id}`)),
  ];

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
      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex bg-zinc-900 border border-white/5 rounded-xl p-1">
          <button className="px-4 py-2 rounded-lg bg-[#ff9607] text-black text-sm font-bold transition-colors">
            Meu Cardápio
          </button>
          <button
            onClick={() => router.push('/dashboard/cardapio/ia')}
            className="px-4 py-2 rounded-lg text-gray-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Cardápio com IA
          </button>
        </div>
        <button onClick={() => setShowNewProduct(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#ff9607] text-black rounded-xl text-sm font-bold hover:bg-[#ffaa33] transition-colors">
          <Plus className="h-4 w-4" /> Novo Produto
        </button>
      </div>

      {/* AI Applied Toast */}
      {showAiApplied && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-2">
          <Check className="h-4 w-4 text-green-400" />
          <span className="text-sm text-green-400">Cardápio da IA aplicado com sucesso! Produtos adicionados.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Product List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar produto..."
              className="w-full bg-zinc-900 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607]"
            />
          </div>

          {!search && (
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><GripVertical className="h-3 w-3" /> Arraste para reordenar</span>
              <span className="flex items-center gap-1"><Pencil className="h-3 w-3" /> Clique no lápis para editar</span>
            </div>
          )}

          {/* Categories Drag & Drop */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={e => setActiveId(e.active.id as string)} onDragEnd={handleCatDragEnd}>
            <SortableContext items={allSortIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {filtered.map((category, index) => (
                  <SortableCategory
                    key={category.id} category={category} index={index}
                    onProductEdit={editProduct} onProductDelete={deleteProduct} onCategoryEdit={editCategory}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeId ? (
                activeId.startsWith('cat-') ? (
                  <div className="bg-zinc-800 border-2 border-[#ff9607]/40 rounded-2xl p-5 shadow-2xl opacity-95">
                    <p className="text-sm font-bold text-[#ff9607]">{categories.find(c => `cat-${c.id}` === activeId)?.name}</p>
                  </div>
                ) : (
                  <div className="bg-zinc-800 border-2 border-blue-400/40 rounded-lg p-3 shadow-2xl opacity-95 flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#ff9607]/10 rounded-lg flex items-center justify-center text-sm">🍔</div>
                    <p className="text-sm font-medium">{categories.flatMap(c => c.products).find(p => `prod-${p.id}` === activeId)?.name}</p>
                  </div>
                )
              ) : null}
            </DragOverlay>
          </DndContext>

          {filtered.length === 0 && (
            <div className="text-center py-16 bg-zinc-900 border border-white/5 rounded-2xl">
              <p className="text-gray-500 text-sm">Nenhum produto encontrado</p>
            </div>
          )}
        </div>

        {/* Right: Quick Stats */}
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5">
            <h3 className="font-bold text-sm mb-3">Resumo</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Categorias</span>
                <span className="font-medium">{categories.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Produtos</span>
                <span className="font-medium">{categories.reduce((s, c) => s + c.products.length, 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Ativos</span>
                <span className="font-medium text-green-400">{categories.reduce((s, c) => s + c.products.filter(p => p.isActive).length, 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tipo</span>
                <span className="font-medium text-[#ff9607]">{businessType}</span>
              </div>
            </div>
          </div>

          {/* Quick AI shortcut */}
          <button
            onClick={() => router.push('/dashboard/cardapio/ia')}
            className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-5 text-left hover:border-[#ff9607]/30 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#ff9607]/10 rounded-xl flex items-center justify-center group-hover:bg-[#ff9607]/20 transition-colors">
                <Sparkles className="h-5 w-5 text-[#ff9607]" />
              </div>
              <div>
                <p className="text-sm font-bold group-hover:text-[#ff9607] transition-colors">Gerar com IA</p>
                <p className="text-xs text-gray-500">Crie seu cardápio automaticamente</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* New Product Modal */}
      {showNewProduct && (
        <NewProductModal
          categories={categories}
          onClose={() => setShowNewProduct(false)}
          onSave={addProduct}
        />
      )}
    </div>
  );
}
