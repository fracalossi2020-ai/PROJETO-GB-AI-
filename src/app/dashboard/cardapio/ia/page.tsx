'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Sparkles, Check, ArrowLeft, ChevronDown, ChevronRight,
  Loader2, ShoppingBag, UtensilsCrossed, GripVertical, Pencil,
  Trash2, Plus, X, AlertTriangle
} from 'lucide-react';
import { AI_TEMPLATES, TEMPLATE_META } from '@/lib/ai-templates';

function generateId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36).substring(0, 4);
}

/* ---------- Types ---------- */
interface DraftProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

interface DraftCategory {
  id: string;
  name: string;
  products: DraftProduct[];
}

/* ---------- Sortable Draft Product ---------- */
function SortableDraftProduct({
  product, index, onEdit, onDelete
}: {
  product: DraftProduct; index: number;
  onEdit: (id: string, field: keyof DraftProduct, value: string | number) => void;
  onDelete: (id: string) => void;
}) {
  const sortId = `dp-${product.id}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sortId });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: product.name, description: product.description, price: product.price.toFixed(2), stock: String(product.stock) });

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  const save = () => {
    onEdit(product.id, 'name', form.name.trim());
    onEdit(product.id, 'description', form.description.trim());
    onEdit(product.id, 'price', parseFloat(form.price) || 0);
    onEdit(product.id, 'stock', parseInt(form.stock) || 0);
    setEditing(false);
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2.5 bg-white/[0.02] rounded-lg border border-white/5 hover:border-white/10 transition-colors group">
      <button {...attributes} {...listeners} className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing p-1 touch-none">
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="text-[10px] text-gray-700 font-mono w-5 text-center">{index + 1}</span>

      {editing ? (
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome"
            className="bg-black/40 border border-[#ff9607]/50 rounded-lg px-2 py-1 text-sm text-white focus:outline-none" />
          <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrição"
            className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-[#ff9607]" />
          <input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Preço"
            className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-[#ff9607]" />
          <div className="flex items-center gap-1">
            <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="Estoque"
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-[#ff9607]" />
            <button onClick={save} className="p-1 text-green-400 hover:bg-green-400/10 rounded"><Check className="h-3.5 w-3.5" /></button>
            <button onClick={() => { setForm({ name: product.name, description: product.description, price: product.price.toFixed(2), stock: String(product.stock) }); setEditing(false); }} className="p-1 text-red-400 hover:bg-red-400/10 rounded"><X className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">{product.name}</p>
              <button onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-[#ff9607] transition-opacity">
                <Pencil className="h-3 w-3" />
              </button>
            </div>
            <p className="text-xs text-gray-500 truncate">{product.description || 'Sem descrição'} · R$ {product.price.toFixed(2)} · Estoque: {product.stock}</p>
          </div>
          <button onClick={() => onDelete(product.id)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
}

/* ---------- Sortable Draft Category ---------- */
function SortableDraftCategory({
  category, index, onProductEdit, onProductDelete, onCategoryEdit, onCategoryDelete, onAddProduct,
  onProductDragEnd
}: {
  category: DraftCategory; index: number;
  onProductEdit: (catId: string, prodId: string, field: keyof DraftProduct, value: string | number) => void;
  onProductDelete: (catId: string, prodId: string) => void;
  onCategoryEdit: (catId: string, name: string) => void;
  onCategoryDelete: (catId: string) => void;
  onAddProduct: (catId: string) => void;
  onProductDragEnd: (catId: string, event: any) => void;
}) {
  const sortId = `dc-${category.id}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sortId });
  const [catEditing, setCatEditing] = useState(false);
  const [catName, setCatName] = useState(category.name);
  const [expanded, setExpanded] = useState(true);
  const [activeProdId, setActiveProdId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
        <button onClick={() => onCategoryDelete(category.id)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {expanded && (
        <div className="p-3 space-y-1">
          {category.products.length === 0 && <p className="text-xs text-gray-600 text-center py-4">Nenhum produto</p>}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={e => setActiveProdId(e.active.id as string)}
            onDragEnd={e => { setActiveProdId(null); onProductDragEnd(category.id, e); }}
          >
            <SortableContext items={category.products.map(p => `dp-${p.id}`)} strategy={verticalListSortingStrategy}>
              {category.products.map((product, prodIndex) => (
                <SortableDraftProduct
                  key={product.id}
                  product={product}
                  index={prodIndex}
                  onEdit={(id, field, value) => onProductEdit(category.id, id, field, value)}
                  onDelete={(id) => onProductDelete(category.id, id)}
                />
              ))}
            </SortableContext>
            <DragOverlay>
              {activeProdId ? (
                <div className="bg-zinc-800 border-2 border-blue-400/40 rounded-lg p-3 shadow-2xl opacity-95 flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-gray-500" />
                  <p className="text-sm font-medium">{category.products.find(p => `dp-${p.id}` === activeProdId)?.name}</p>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          <button
            onClick={() => onAddProduct(category.id)}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-gray-500 hover:text-[#ff9607] hover:bg-[#ff9607]/5 rounded-lg border border-dashed border-white/5 hover:border-[#ff9607]/30 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Adicionar produto
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Main Page ---------- */
export default function CardapioIaPage() {
  const router = useRouter();
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [draft, setDraft] = useState<DraftCategory[]>([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [businessType, setBusinessType] = useState('HAMBURGUERIA');
  const [done, setDone] = useState(false);
  const [activeCatId, setActiveCatId] = useState<string | null>(null);

  const catSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetch('/api/stores')
      .then(r => r.json())
      .then(d => {
        if (d.data?.[0]) {
          const store = d.data[0];
          const bt = store.businessType || 'HAMBURGUERIA';
          setBusinessType(bt);
          if (AI_TEMPLATES[bt]) {
            setSelectedTemplates([bt]);
            populateDraft([bt]);
          }
        }
      })
      .catch(() => {});
  }, []);

  function populateDraft(keys: string[]) {
    setDraft(prev => {
      const merged = [...prev];
      keys.forEach(key => {
        const tpl = AI_TEMPLATES[key];
        if (!tpl) return;
        tpl.forEach(catTpl => {
          let cat = merged.find(c => c.name.toLowerCase() === catTpl.category.toLowerCase());
          if (!cat) {
            cat = { id: generateId(), name: catTpl.category, products: [] };
            merged.push(cat);
          }
          catTpl.products.forEach(prod => {
            const exists = cat!.products.some(p => p.name.toLowerCase() === prod.name.toLowerCase());
            if (!exists) {
              cat!.products.push({ id: generateId(), ...prod });
            }
          });
        });
      });
      return merged;
    });
  }

  function toggleTemplate(key: string) {
    setSelectedTemplates(prev => {
      const next = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key];
      if (!prev.includes(key)) populateDraft([key]);
      return next;
    });
  }

  /* Draft operations */
  function editCategory(catId: string, name: string) {
    setDraft(prev => prev.map(c => c.id === catId ? { ...c, name } : c));
  }

  function deleteCategory(catId: string) {
    setDraft(prev => prev.filter(c => c.id !== catId));
  }

  function addCategory() {
    const newCat: DraftCategory = { id: generateId(), name: 'Nova Categoria', products: [] };
    setDraft(prev => [...prev, newCat]);
  }

  function editProduct(catId: string, prodId: string, field: keyof DraftProduct, value: string | number) {
    setDraft(prev => prev.map(c =>
      c.id === catId ? { ...c, products: c.products.map(p => p.id === prodId ? { ...p, [field]: value } : p) } : c
    ));
  }

  function deleteProduct(catId: string, prodId: string) {
    setDraft(prev => prev.map(c =>
      c.id === catId ? { ...c, products: c.products.filter(p => p.id !== prodId) } : c
    ));
  }

  function addProduct(catId: string) {
    const newProd: DraftProduct = { id: generateId(), name: 'Novo Produto', description: '', price: 0, stock: 0 };
    setDraft(prev => prev.map(c =>
      c.id === catId ? { ...c, products: [...c.products, newProd] } : c
    ));
  }

  function handleCatDragEnd(event: any) {
    const { active, over } = event;
    setActiveCatId(null);
    if (over && active.id !== over.id) {
      setDraft(prev => {
        const oldIndex = prev.findIndex(c => `dc-${c.id}` === active.id);
        const newIndex = prev.findIndex(c => `dc-${c.id}` === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  function handleProdDragEnd(catId: string, event: any) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setDraft(prev => prev.map(cat => {
        if (cat.id !== catId) return cat;
        const oldIdx = cat.products.findIndex(p => `dp-${p.id}` === active.id);
        const newIdx = cat.products.findIndex(p => `dp-${p.id}` === over.id);
        if (oldIdx === -1 || newIdx === -1) return cat;
        return { ...cat, products: arrayMove(cat.products, oldIdx, newIdx) };
      }));
    }
  }

  async function generate() {
    if (draft.length === 0) return;
    setGenerating(true);

    for (let i = 0; i <= 100; i += 5) {
      setProgress(i);
      await new Promise(r => setTimeout(r, 80));
    }

    const payload = draft.map(c => ({
      id: generateId(),
      name: c.name,
      products: c.products.map(p => ({ ...p, id: generateId(), isActive: true })),
    }));

    localStorage.setItem('gbai-ai-menu-draft', JSON.stringify(payload));
    setGenerating(false);
    setDone(true);
  }

  function goToCardapio() {
    router.push('/dashboard/cardapio');
  }

  const totalCategories = draft.length;
  const totalProducts = draft.reduce((s, c) => s + c.products.length, 0);

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
            A IA gerou <strong className="text-white">{totalProducts}</strong> produtos em <strong className="text-white">{totalCategories}</strong> categorias.
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
          <p className="text-gray-400 text-sm">Selecione modelos, edite, reordene e personalize antes de gerar</p>
        </div>
      </div>

      {/* Template Selection */}
      <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold">1. Escolha os modelos</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {TEMPLATE_META.map(({ key, label, icon }) => {
            const isSelected = selectedTemplates.includes(key);
            const productCount = AI_TEMPLATES[key]?.reduce((s, c) => s + c.products.length, 0) || 0;
            const isBusinessType = businessType === key;

            return (
              <button
                key={key}
                onClick={() => toggleTemplate(key)}
                className={`relative text-left p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-[#ff9607] bg-[#ff9607]/5'
                    : 'border-white/5 bg-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-sm font-bold ${isSelected ? 'text-[#ff9607]' : 'text-white'}`}>{icon} {label}</p>
                    <p className="text-xs text-gray-500">{productCount} produtos</p>
                  </div>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-[#ff9607] border-[#ff9607]' : 'border-gray-600'
                  }`}>
                    {isSelected && <Check className="h-3 w-3 text-black" />}
                  </div>
                </div>
                {isBusinessType && (
                  <span className="absolute top-1.5 right-1.5 text-[10px] font-bold text-[#ff9607] bg-[#ff9607]/10 px-1.5 py-0.5 rounded-full">
                    Seu tipo
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Draft Editor */}
      {draft.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-[#ff9607]" />
              <h3 className="font-bold text-sm">2. Revise e personalize</h3>
            </div>
            <span className="text-xs text-gray-500">{totalCategories} categorias · {totalProducts} produtos</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><GripVertical className="h-3 w-3" /> Arraste para reordenar</span>
            <span className="flex items-center gap-1"><Pencil className="h-3 w-3" /> Clique no lápis para editar</span>
          </div>

          <DndContext
            sensors={catSensors}
            collisionDetection={closestCenter}
            onDragStart={e => setActiveCatId(e.active.id as string)}
            onDragEnd={handleCatDragEnd}
          >
            <SortableContext items={draft.map(c => `dc-${c.id}`)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {draft.map((category, index) => (
                  <SortableDraftCategory
                    key={category.id}
                    category={category}
                    index={index}
                    onProductEdit={editProduct}
                    onProductDelete={deleteProduct}
                    onCategoryEdit={editCategory}
                    onCategoryDelete={deleteCategory}
                    onAddProduct={addProduct}
                    onProductDragEnd={handleProdDragEnd}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeCatId ? (
                <div className="bg-zinc-800 border-2 border-[#ff9607]/40 rounded-2xl p-5 shadow-2xl opacity-95">
                  <p className="text-sm font-bold text-[#ff9607]">{draft.find(c => `dc-${c.id}` === activeCatId)?.name}</p>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          <button
            onClick={addCategory}
            className="w-full flex items-center justify-center gap-1.5 py-3 text-sm text-gray-500 hover:text-[#ff9607] hover:bg-[#ff9607]/5 rounded-xl border border-dashed border-white/5 hover:border-[#ff9607]/30 transition-colors"
          >
            <Plus className="h-4 w-4" /> Adicionar categoria
          </button>
        </motion.div>
      )}

      {draft.length === 0 && selectedTemplates.length === 0 && (
        <div className="text-center py-12 bg-zinc-900 border border-white/5 rounded-2xl">
          <AlertTriangle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Selecione pelo menos um modelo acima para começar</p>
        </div>
      )}

      {/* Generate Button */}
      {draft.length > 0 && !generating && (
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
