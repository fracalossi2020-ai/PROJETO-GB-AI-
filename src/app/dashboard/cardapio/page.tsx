'use client';

import { useEffect, useState } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus, Search, Pencil, Trash2, GripVertical, Check, X, ChevronDown, ChevronRight,
  ArrowUp, ArrowDown
} from 'lucide-react';

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

/* ---------- Sortable Category ---------- */
function SortableCategory({ category, index, onProductEdit, onProductDelete, onCategoryEdit, onProductMove, allCats }: {
  category: Category;
  index: number;
  onProductEdit: (catId: string, prodId: string, name: string) => void;
  onProductDelete: (catId: string, prodId: string) => void;
  onCategoryEdit: (catId: string, name: string) => void;
  onProductMove: (catId: string, prodId: string, direction: 'up' | 'down') => void;
  allCats: Category[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id });
  const [catEditing, setCatEditing] = useState(false);
  const [catName, setCatName] = useState(category.name);
  const [expanded, setExpanded] = useState(true);

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
      {/* Category Header */}
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
              <input
                value={catName}
                onChange={e => setCatName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { onCategoryEdit(category.id, catName); setCatEditing(false); } if (e.key === 'Escape') { setCatName(category.name); setCatEditing(false); } }}
                autoFocus
                className="flex-1 bg-black/40 border border-[#ff9607]/50 rounded-lg px-2 py-1 text-sm text-white focus:outline-none max-w-xs"
              />
              <button onClick={() => { onCategoryEdit(category.id, catName); setCatEditing(false); }} className="p-1 text-green-400 hover:bg-green-400/10 rounded"><Check className="h-3.5 w-3.5" /></button>
              <button onClick={() => { setCatName(category.name); setCatEditing(false); }} className="p-1 text-red-400 hover:bg-red-400/10 rounded"><X className="h-3.5 w-3.5" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 font-mono">#{index + 1}</span>
              <h3 className="font-bold text-sm">{category.name}</h3>
              <button onClick={() => setCatEditing(true)} className="p-1 text-gray-600 hover:text-[#ff9607] transition-colors">
                <Pencil className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        <span className="text-xs text-gray-500">{category.products.length} produto{category.products.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Products */}
      {expanded && (
        <div className="p-3 space-y-1">
          {category.products.length === 0 && (
            <p className="text-xs text-gray-600 text-center py-4">Nenhum produto nesta categoria</p>
          )}
          {category.products.map((product, prodIndex) => (
            <ProductRow
              key={product.id}
              product={product}
              prodIndex={prodIndex}
              totalProducts={category.products.length}
              onEdit={(name) => onProductEdit(category.id, product.id, name)}
              onDelete={() => onProductDelete(category.id, product.id)}
              onMove={(dir) => onProductMove(category.id, product.id, dir)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Product Row (with inline edit + move buttons) ---------- */
function ProductRow({ product, prodIndex, totalProducts, onEdit, onDelete, onMove }: {
  product: Product;
  prodIndex: number;
  totalProducts: number;
  onEdit: (name: string) => void;
  onDelete: () => void;
  onMove: (dir: 'up' | 'down') => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(product.name);

  return (
    <div className="flex items-center gap-2 p-2.5 bg-white/[0.02] rounded-lg border border-white/5 hover:border-white/10 transition-colors group">
      <span className="text-[10px] text-gray-700 font-mono w-5 text-center">{prodIndex + 1}</span>

      <div className="w-8 h-8 bg-[#ff9607]/10 rounded-lg flex items-center justify-center text-sm flex-shrink-0">🍔</div>

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { onEdit(editName); setEditing(false); } if (e.key === 'Escape') { setEditName(product.name); setEditing(false); } }}
              autoFocus
              className="flex-1 bg-black/40 border border-[#ff9607]/50 rounded-lg px-2 py-1 text-sm text-white focus:outline-none"
            />
            <button onClick={() => { onEdit(editName); setEditing(false); }} className="p-1 text-green-400 hover:bg-green-400/10 rounded"><Check className="h-3 w-3" /></button>
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

      {/* Move buttons */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onMove('up')}
          disabled={prodIndex === 0}
          className="p-1 text-gray-500 hover:text-white disabled:text-gray-800 transition-colors"
          title="Subir"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onMove('down')}
          disabled={prodIndex === totalProducts - 1}
          className="p-1 text-gray-500 hover:text-white disabled:text-gray-800 transition-colors"
          title="Descer"
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <button onClick={onDelete} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ---------- Main Page ---------- */
export default function CardapioPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/stores')
      .then(r => r.json())
      .then(d => {
        if (d.data?.[0]?.categories) {
          const cats = d.data[0].categories.map((c: any) => ({
            id: c.id,
            name: c.name,
            products: (c.products || []).map((p: any) => ({
              id: p.id,
              name: p.name,
              description: p.description,
              price: p.price,
              isActive: p.isActive,
              stock: p.stock,
            })),
          }));
          setCategories(cats);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Category drag
  const handleCatDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      setCategories(prev => {
        const oldIndex = prev.findIndex(c => c.id === active.id);
        const newIndex = prev.findIndex(c => c.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  // Product move (up/down)
  function moveProduct(catId: string, prodId: string, direction: 'up' | 'down') {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      const idx = cat.products.findIndex(p => p.id === prodId);
      if (idx < 0) return cat;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= cat.products.length) return cat;
      return { ...cat, products: arrayMove(cat.products, idx, newIdx) };
    }));
  }

  function editProduct(catId: string, prodId: string, name: string) {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      return { ...cat, products: cat.products.map(p => p.id === prodId ? { ...p, name } : p) };
    }));
  }

  function deleteProduct(catId: string, prodId: string) {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      return { ...cat, products: cat.products.filter(p => p.id !== prodId) };
    }));
  }

  function editCategory(catId: string, name: string) {
    setCategories(prev => prev.map(cat => cat.id === catId ? { ...cat, name } : cat));
  }

  const filtered = search.trim()
    ? categories.map(cat => ({
        ...cat,
        products: cat.products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())),
      })).filter(cat => cat.products.length > 0)
    : categories;

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Cardápio</h1>
          <p className="text-gray-400 text-sm">
            {search ? `${filtered.reduce((s, c) => s + c.products.length, 0)} produtos encontrados` : `${categories.length} categorias · ${categories.reduce((s, c) => s + c.products.length, 0)} produtos`}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#ff9607] text-black rounded-xl text-sm font-bold hover:bg-[#ffaa33] transition-colors">
          <Plus className="h-4 w-4" /> Novo Produto
        </button>
      </div>

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

      {/* Legend */}
      {!search && (
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><GripVertical className="h-3 w-3" /> Arraste categorias para reordenar</span>
          <span className="flex items-center gap-1"><Pencil className="h-3 w-3" /> Clique no lápis para editar nome</span>
          <span className="flex items-center gap-1"><ArrowUp className="h-3 w-3" /> Use as setas para mover produtos</span>
        </div>
      )}

      {/* Categories with Drag & Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(e) => setActiveId(e.active.id as string)}
        onDragEnd={handleCatDragEnd}
      >
        <SortableContext items={filtered.map(c => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {filtered.map((category, index) => (
              <SortableCategory
                key={category.id}
                category={category}
                index={index}
                onProductEdit={editProduct}
                onProductDelete={deleteProduct}
                onCategoryEdit={editCategory}
                onProductMove={moveProduct}
                allCats={filtered}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <div className="bg-zinc-800 border-2 border-[#ff9607]/40 rounded-2xl p-5 shadow-2xl opacity-95">
              <p className="text-sm font-bold text-[#ff9607]">{categories.find(c => c.id === activeId)?.name}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-zinc-900 border border-white/5 rounded-2xl">
          <p className="text-gray-500 text-sm">Nenhum produto encontrado</p>
        </div>
      )}
    </div>
  );
}
