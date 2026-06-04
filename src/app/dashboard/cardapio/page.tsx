'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus, Search, Pencil, Trash2, GripVertical, Check, X, ChevronDown, ChevronRight,
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

/* ---------- Sortable Product Item ---------- */
function SortableProduct({
  product,
  catIndex,
  prodIndex,
  onEdit,
  onDelete,
}: {
  product: Product;
  catIndex: number;
  prodIndex: number;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const sortId = `prod-${product.id}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sortId });
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(product.name);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const save = () => {
    onEdit(product.id, editName);
    setEditing(false);
  };
  const cancel = () => {
    setEditName(product.name);
    setEditing(false);
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2.5 bg-white/[0.02] rounded-lg border border-white/5 hover:border-white/10 transition-colors group">
      <button
        {...attributes}
        {...listeners}
        className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing p-1 touch-none"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <span className="text-[10px] text-gray-700 font-mono w-5 text-center">{prodIndex + 1}</span>

      <div className="w-8 h-8 bg-[#ff9607]/10 rounded-lg flex items-center justify-center text-sm flex-shrink-0">🍔</div>

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') save();
                if (e.key === 'Escape') cancel();
              }}
              autoFocus
              className="flex-1 bg-black/40 border border-[#ff9607]/50 rounded-lg px-2 py-1 text-sm text-white focus:outline-none"
            />
            <button onClick={save} className="p-1 text-green-400 hover:bg-green-400/10 rounded">
              <Check className="h-3 w-3" />
            </button>
            <button onClick={cancel} className="p-1 text-red-400 hover:bg-red-400/10 rounded">
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{product.name}</p>
            <button
              onClick={() => setEditing(true)}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-[#ff9607] transition-opacity"
            >
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
function SortableCategory({
  category,
  index,
  onProductEdit,
  onProductDelete,
  onCategoryEdit,
}: {
  category: Category;
  index: number;
  onProductEdit: (catId: string, prodId: string, name: string) => void;
  onProductDelete: (catId: string, prodId: string) => void;
  onCategoryEdit: (catId: string, name: string) => void;
}) {
  const sortId = `cat-${category.id}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sortId });
  const [catEditing, setCatEditing] = useState(false);
  const [catName, setCatName] = useState(category.name);
  const [expanded, setExpanded] = useState(true);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
      {/* Category Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <button
          {...attributes}
          {...listeners}
          className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing p-1 touch-none"
        >
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
                onChange={(e) => setCatName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onCategoryEdit(category.id, catName);
                    setCatEditing(false);
                  }
                  if (e.key === 'Escape') {
                    setCatName(category.name);
                    setCatEditing(false);
                  }
                }}
                autoFocus
                className="flex-1 bg-black/40 border border-[#ff9607]/50 rounded-lg px-2 py-1 text-sm text-white focus:outline-none max-w-xs"
              />
              <button
                onClick={() => {
                  onCategoryEdit(category.id, catName);
                  setCatEditing(false);
                }}
                className="p-1 text-green-400 hover:bg-green-400/10 rounded"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => {
                  setCatName(category.name);
                  setCatEditing(false);
                }}
                className="p-1 text-red-400 hover:bg-red-400/10 rounded"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 font-mono">#{index + 1}</span>
              <h3 className="font-bold text-sm">{category.name}</h3>
              <button
                onClick={() => setCatEditing(true)}
                className="p-1 text-gray-600 hover:text-[#ff9607] transition-colors"
              >
                <Pencil className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        <span className="text-xs text-gray-500">
          {category.products.length} produto{category.products.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Products List */}
      {expanded && (
        <div className="p-3 space-y-1">
          {category.products.length === 0 && (
            <p className="text-xs text-gray-600 text-center py-4">Nenhum produto nesta categoria</p>
          )}
          {category.products.map((product, prodIndex) => (
            <SortableProduct
              key={product.id}
              product={product}
              catIndex={index}
              prodIndex={prodIndex}
              onEdit={(id, name) => onProductEdit(category.id, id, name)}
              onDelete={(id) => onProductDelete(category.id, id)}
            />
          ))}
        </div>
      )}
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
      .then((r) => r.json())
      .then((d) => {
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
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    // Category drag
    if (activeIdStr.startsWith('cat-') && overIdStr.startsWith('cat-')) {
      setCategories((prev) => {
        const oldIndex = prev.findIndex((c) => `cat-${c.id}` === activeIdStr);
        const newIndex = prev.findIndex((c) => `cat-${c.id}` === overIdStr);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
      return;
    }

    // Product drag
    if (activeIdStr.startsWith('prod-') && overIdStr.startsWith('prod-')) {
      setCategories((prev) => {
        // Find which category contains both products
        for (let i = 0; i < prev.length; i++) {
          const cat = prev[i];
          const oldIdx = cat.products.findIndex((p) => `prod-${p.id}` === activeIdStr);
          const newIdx = cat.products.findIndex((p) => `prod-${p.id}` === overIdStr);

          if (oldIdx !== -1 && newIdx !== -1) {
            const newProducts = arrayMove(cat.products, oldIdx, newIdx);
            const newCats = [...prev];
            newCats[i] = { ...cat, products: newProducts };
            return newCats;
          }
        }
        return prev;
      });
    }
  }, []);

  const editProduct = useCallback((catId: string, prodId: string, name: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === catId
          ? { ...cat, products: cat.products.map((p) => (p.id === prodId ? { ...p, name } : p)) }
          : cat
      )
    );
  }, []);

  const deleteProduct = useCallback((catId: string, prodId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === catId ? { ...cat, products: cat.products.filter((p) => p.id !== prodId) } : cat
      )
    );
  }, []);

  const editCategory = useCallback((catId: string, name: string) => {
    setCategories((prev) => prev.map((cat) => (cat.id === catId ? { ...cat, name } : cat)));
  }, []);

  const filtered = search.trim()
    ? categories
        .map((cat) => ({
          ...cat,
          products: cat.products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
        }))
        .filter((cat) => cat.products.length > 0)
    : categories;

  const allSortIds = [
    ...filtered.map((c) => `cat-${c.id}`),
    ...filtered.flatMap((c) => c.products.map((p) => `prod-${p.id}`)),
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Cardápio</h1>
          <p className="text-gray-400 text-sm">
            {search
              ? `${filtered.reduce((s, c) => s + c.products.length, 0)} produtos encontrados`
              : `${categories.length} categorias · ${categories.reduce((s, c) => s + c.products.length, 0)} produtos`}
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
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produto..."
          className="w-full bg-zinc-900 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607]"
        />
      </div>

      {/* Legend */}
      {!search && (
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <GripVertical className="h-3 w-3" /> Arraste categorias e produtos para reordenar
          </span>
          <span className="flex items-center gap-1">
            <Pencil className="h-3 w-3" /> Clique no lápis para editar nome
          </span>
        </div>
      )}

      {/* Drag & Drop Context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={allSortIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {filtered.map((category, index) => (
              <SortableCategory
                key={category.id}
                category={category}
                index={index}
                onProductEdit={editProduct}
                onProductDelete={deleteProduct}
                onCategoryEdit={editCategory}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            activeId.startsWith('cat-') ? (
              <div className="bg-zinc-800 border-2 border-[#ff9607]/40 rounded-2xl p-5 shadow-2xl opacity-95">
                <p className="text-sm font-bold text-[#ff9607]">
                  {categories.find((c) => `cat-${c.id}` === activeId)?.name}
                </p>
              </div>
            ) : (
              <div className="bg-zinc-800 border-2 border-blue-400/40 rounded-lg p-3 shadow-2xl opacity-95 flex items-center gap-2">
                <div className="w-8 h-8 bg-[#ff9607]/10 rounded-lg flex items-center justify-center text-sm">🍔</div>
                <p className="text-sm font-medium">
                  {categories
                    .flatMap((c) => c.products)
                    .find((p) => `prod-${p.id}` === activeId)?.name}
                </p>
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
  );
}
