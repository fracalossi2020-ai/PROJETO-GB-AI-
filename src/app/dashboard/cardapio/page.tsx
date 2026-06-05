'use client';

import { useEffect, useState } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus, Search, Pencil, Trash2, GripVertical, Check, X, ChevronDown, ChevronRight,
  Sparkles, Wand2
} from 'lucide-react';

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

/* ---------- AI Templates ---------- */
const AI_TEMPLATES: Record<string, { category: string; products: { name: string; description: string; price: number; stock: number }[] }[]> = {
  HAMBURGUERIA: [
    {
      category: 'Hambúrgueres',
      products: [
        { name: 'Classic Burger', description: 'Carne 180g, queijo cheddar, alface, tomate, molho especial', price: 28.9, stock: 50 },
        { name: 'Bacon Burger', description: 'Carne 180g, bacon crocante, queijo cheddar, cebola caramelizada', price: 32.9, stock: 50 },
        { name: 'Duplo Smash', description: '2 carnes smash, queijo americano, picles, molho da casa', price: 35.9, stock: 40 },
        { name: 'Veggie Burger', description: 'Hambúrguer de grão-de-bico, queijo prato, rúcula, tomate seco', price: 26.9, stock: 30 },
      ],
    },
    {
      category: 'Combos',
      products: [
        { name: 'Combo Classic', description: 'Classic Burger + Batata média + Refrigerante', price: 42.9, stock: 999 },
        { name: 'Combo Família', description: '2 burgers + Batata grande + 2 refrigerantes', price: 74.9, stock: 999 },
      ],
    },
    {
      category: 'Porções',
      products: [
        { name: 'Batata Frita Média', description: 'Porção de batata frita crocante', price: 18.9, stock: 100 },
        { name: 'Batata Frita Grande', description: 'Porção grande de batata frita com cheddar e bacon', price: 28.9, stock: 100 },
        { name: 'Onion Rings', description: 'Anéis de cebola empanados e crocantes', price: 22.9, stock: 80 },
        { name: 'Nuggets (8un)', description: 'Nuggets de frango com molho barbecue', price: 19.9, stock: 80 },
      ],
    },
    {
      category: 'Bebidas',
      products: [
        { name: 'Coca-Cola 350ml', description: 'Lata', price: 6.5, stock: 200 },
        { name: 'Guaraná Antarctica 350ml', description: 'Lata', price: 6, stock: 200 },
        { name: 'Suco Natural Laranja', description: 'Copo 300ml', price: 9.9, stock: 50 },
        { name: 'Milkshake Chocolate', description: '400ml com chantilly', price: 16.9, stock: 40 },
      ],
    },
  ],
  PIZZARIA: [
    {
      category: 'Pizzas Salgadas',
      products: [
        { name: 'Calabresa', description: 'Molho de tomate, mussarela, calabresa, cebola', price: 45.9, stock: 50 },
        { name: 'Marguerita', description: 'Molho de tomate, mussarela, manjericão fresco', price: 42.9, stock: 50 },
        { name: 'Quatro Queijos', description: 'Mussarela, provolone, parmesão, gorgonzola', price: 49.9, stock: 50 },
        { name: 'Portuguesa', description: 'Mussarela, presunto, ovos, cebola, azeitona', price: 47.9, stock: 50 },
        { name: 'Frango c/ Catupiry', description: 'Mussarela, frango desfiado, catupiry', price: 48.9, stock: 50 },
        { name: 'Pepperoni', description: 'Molho de tomate, mussarela, pepperoni', price: 51.9, stock: 40 },
      ],
    },
    {
      category: 'Pizzas Doces',
      products: [
        { name: 'Brigadeiro', description: 'Mussarela, chocolate, granulado', price: 38.9, stock: 30 },
        { name: 'Romeu e Julieta', description: 'Mussarela, goiabada, queijo minas', price: 36.9, stock: 30 },
      ],
    },
    {
      category: 'Bebidas',
      products: [
        { name: 'Coca-Cola 2L', description: 'Garrafa', price: 14.9, stock: 100 },
        { name: 'Guaraná 2L', description: 'Garrafa', price: 13.9, stock: 100 },
        { name: 'Suco Del Valle', description: '1L', price: 10.9, stock: 50 },
        { name: 'Cerveja Heineken', description: 'Long neck 330ml', price: 9.9, stock: 80 },
      ],
    },
  ],
  ACAITERIA: [
    {
      category: 'Açaís',
      products: [
        { name: 'Açaí Puro 300ml', description: 'Açaí tradicional', price: 14.9, stock: 100 },
        { name: 'Açaí c/ Granola', description: 'Açaí, granola, leite condensado', price: 18.9, stock: 100 },
        { name: 'Açaí Premium', description: 'Açaí, granola, banana, morango, leite em pó, leite condensado', price: 24.9, stock: 80 },
        { name: 'Açaí Power', description: 'Açaí, whey protein, banana, granola, pasta de amendoim', price: 27.9, stock: 60 },
      ],
    },
    {
      category: 'Smoothies',
      products: [
        { name: 'Smoothie Morango', description: 'Leite, morango, banana, mel', price: 16.9, stock: 50 },
        { name: 'Smoothie Verde', description: 'Leite, espinafre, maçã, gengibre', price: 17.9, stock: 40 },
      ],
    },
  ],
  RESTAURANTE: [
    {
      category: 'Pratos Executivos',
      products: [
        { name: 'Filé de Frango Grelhado', description: 'Arroz, feijão, salada, batata frita', price: 29.9, stock: 40 },
        { name: 'Bife Acebolado', description: 'Arroz, feijão, salada, batata frita', price: 34.9, stock: 40 },
        { name: 'Peixe Grelhado', description: 'Arroz, purê de batata, legumes no vapor', price: 32.9, stock: 30 },
      ],
    },
    {
      category: 'Saladas',
      products: [
        { name: 'Salada Caesar', description: 'Alface americana, croutons, parmesão, peito de frango', price: 24.9, stock: 30 },
        { name: 'Salada Tropical', description: 'Mix de folhas, manga, nozes, queijo branco', price: 22.9, stock: 30 },
      ],
    },
  ],
  SORVETERIA: [
    {
      category: 'Sorvetes',
      products: [
        { name: 'Casquinha', description: '1 bola', price: 6, stock: 200 },
        { name: 'Cascão', description: '2 bolas', price: 10, stock: 200 },
        { name: 'Milkshake', description: '400ml', price: 16.9, stock: 100 },
        { name: 'Sundae', description: 'Sorvete, calda, chantilly, cereja', price: 14.9, stock: 100 },
      ],
    },
    {
      category: 'Açaís',
      products: [
        { name: 'Açaí 300ml', description: 'Com granola e leite condensado', price: 15.9, stock: 80 },
        { name: 'Açaí 500ml', description: 'Com 3 complementos à escolha', price: 22.9, stock: 80 },
      ],
    },
  ],
  BAR: [
    {
      category: 'Petiscos',
      products: [
        { name: 'Batata Frita', description: 'Porção grande', price: 28.9, stock: 50 },
        { name: 'Mandioca Frita', description: 'Porção com molho rosé', price: 24.9, stock: 40 },
        { name: 'Camarão Alho e Óleo', description: 'Porção de camarão', price: 42.9, stock: 30 },
        { name: 'Linguiça Acebolada', description: 'Porção com pão de alho', price: 32.9, stock: 40 },
      ],
    },
    {
      category: 'Bebidas',
      products: [
        { name: 'Chopp 300ml', description: 'Cerveja gelada', price: 8.9, stock: 200 },
        { name: 'Heineken Long Neck', description: '330ml', price: 9.9, stock: 150 },
        { name: 'Caipirinha', description: 'Limão, açúcar, cachaça', price: 16.9, stock: 100 },
        { name: 'Gin Tônica', description: 'Gin, água tônica, limão', price: 19.9, stock: 80 },
      ],
    },
  ],
  PADARIA: [
    {
      category: 'Pães',
      products: [
        { name: 'Pão Francês', description: 'Unidade', price: 1.2, stock: 500 },
        { name: 'Pão de Queijo', description: '6 unidades', price: 12.9, stock: 200 },
        { name: 'Baguete', description: 'Unidade', price: 5.9, stock: 100 },
      ],
    },
    {
      category: 'Salgados',
      products: [
        { name: 'Coxinha', description: 'Unidade', price: 5.5, stock: 150 },
        { name: 'Esfiha', description: 'Unidade', price: 6, stock: 150 },
        { name: 'Kibe', description: 'Unidade', price: 5.5, stock: 100 },
      ],
    },
    {
      category: 'Doces',
      products: [
        { name: 'Brigadeiro', description: 'Unidade', price: 3.5, stock: 200 },
        { name: 'Pastel de Belém', description: 'Unidade', price: 6.5, stock: 100 },
      ],
    },
    {
      category: 'Cafés',
      products: [
        { name: 'Café Espresso', description: 'Xícara', price: 4.5, stock: 999 },
        { name: 'Cappuccino', description: 'Xícara média', price: 8.9, stock: 999 },
        { name: 'Café c/ Leite', description: 'Xícara grande', price: 6, stock: 999 },
      ],
    },
  ],
  JAPONESA: [
    {
      category: 'Sushis',
      products: [
        { name: 'Sashimi Salmão (8un)', description: 'Fatias de salmão fresco', price: 38.9, stock: 40 },
        { name: 'Nigiri Salmão (4un)', description: 'Arroz com fatia de salmão', price: 22.9, stock: 40 },
        { name: 'Hot Roll (8un)', description: 'Salmão empanado frito', price: 28.9, stock: 50 },
        { name: 'Uramaki Califórnia (8un)', description: 'Kani, pepino, manga', price: 26.9, stock: 50 },
      ],
    },
    {
      category: 'Temakis',
      products: [
        { name: 'Temaki Salmão', description: 'Salmão, cream cheese, cebolinha', price: 24.9, stock: 40 },
        { name: 'Temaki Atum', description: 'Atum, gengibre, cebolinha', price: 27.9, stock: 30 },
      ],
    },
    {
      category: 'Bebidas',
      products: [
        { name: 'Saquê Quente', description: 'Dose', price: 14.9, stock: 60 },
        { name: 'Soda Italiana', description: 'Morango ou limão siciliano', price: 10.9, stock: 80 },
        { name: 'Coca-Cola 350ml', description: 'Lata', price: 6.5, stock: 100 },
      ],
    },
  ],
  BEBIDAS: [
    {
      category: 'Refrigerantes',
      products: [
        { name: 'Coca-Cola 2L', description: 'Garrafa PET', price: 14.9, stock: 100 },
        { name: 'Guaraná Antarctica 2L', description: 'Garrafa PET', price: 13.5, stock: 100 },
        { name: 'Sprite 2L', description: 'Garrafa PET', price: 13.5, stock: 80 },
        { name: 'Coca-Cola 350ml', description: 'Lata', price: 6.5, stock: 200 },
      ],
    },
    {
      category: 'Sucos',
      products: [
        { name: 'Suco Laranja Natural', description: '300ml', price: 9.9, stock: 50 },
        { name: 'Suco Maracujá', description: '300ml', price: 9.9, stock: 50 },
        { name: 'Água de Coco', description: '330ml', price: 7.5, stock: 80 },
      ],
    },
    {
      category: 'Cervejas',
      products: [
        { name: 'Heineken Long Neck', description: '330ml', price: 9.9, stock: 100 },
        { name: 'Brahma Lata', description: '350ml', price: 5.5, stock: 150 },
        { name: 'Corona Long Neck', description: '330ml', price: 10.9, stock: 80 },
      ],
    },
    {
      category: 'Águas',
      products: [
        { name: 'Água Mineral s/ Gás', description: '500ml', price: 4, stock: 200 },
        { name: 'Água Mineral c/ Gás', description: '500ml', price: 4.5, stock: 150 },
        { name: 'Água Tônica', description: '350ml', price: 6, stock: 80 },
      ],
    },
  ],
};

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

/* ---------- AI Menu Panel ---------- */
function AiMenuPanel({ businessType, onApply }: { businessType: string; onApply: (templateName: string) => void }) {
  const templates = AI_TEMPLATES[businessType] || AI_TEMPLATES['HAMBURGUERIA'];
  const templateNames = Object.keys(AI_TEMPLATES);

  return (
    <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#ff9607]/10 rounded-lg flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-[#ff9607]" />
        </div>
        <div>
          <h3 className="font-bold text-sm">Cardápio com IA</h3>
          <p className="text-xs text-gray-500">Sugestões baseadas no tipo do estabelecimento</p>
        </div>
      </div>

      <div className="space-y-3">
        {templateNames.map(type => {
          const isActive = type === businessType;
          const tpl = AI_TEMPLATES[type];
          const totalProducts = tpl?.reduce((s, c) => s + c.products.length, 0) || 0;
          return (
            <button
              key={type}
              onClick={() => onApply(type)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                isActive
                  ? 'border-[#ff9607]/50 bg-[#ff9607]/5'
                  : 'border-white/5 bg-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${isActive ? 'text-[#ff9607]' : 'text-gray-300'}`}>
                  {type === 'HAMBURGUERIA' ? '🍔 Hamburgueria' :
                   type === 'PIZZARIA' ? '🍕 Pizzaria' :
                   type === 'ACAITERIA' ? '🫐 Açaíteria' :
                   type === 'RESTAURANTE' ? '🍽️ Restaurante' :
                   type === 'SORVETERIA' ? '🍦 Sorveteria' :
                   type === 'BAR' ? '🍺 Bar' :
                   type === 'PADARIA' ? '🥐 Padaria' :
                   type === 'JAPONESA' ? '🍣 Japonesa' :
                   type === 'BEBIDAS' ? '🥤 Bebidas' : type}
                </span>
                <span className="text-xs text-gray-500">{totalProducts} itens</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{isActive ? '✓ Modelo sugerido para seu estabelecimento' : 'Clique para aplicar este modelo'}</p>
            </button>
          );
        })}
      </div>

      <div className="pt-2 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Wand2 className="h-3.5 w-3.5 text-[#ff9607]" />
          <span>O cardápio será preenchido automaticamente com produtos populares</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main Page ---------- */
export default function CardapioPage() {
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

  function applyAiTemplate(type: string) {
    const templates = AI_TEMPLATES[type];
    if (!templates) return;

    setCategories(prev => {
      const newCategories: Category[] = [...prev];

      templates.forEach(tpl => {
        const existingCat = newCategories.find(c => c.name.toLowerCase() === tpl.category.toLowerCase());
        if (existingCat) {
          // Adiciona produtos que não existem ainda
          tpl.products.forEach(prod => {
            const exists = existingCat.products.some(p => p.name.toLowerCase() === prod.name.toLowerCase());
            if (!exists) {
              existingCat.products.push({ ...prod, id: generateId(), isActive: true });
            }
          });
        } else {
          // Cria nova categoria
          newCategories.push({
            id: generateId(),
            name: tpl.category,
            products: tpl.products.map(p => ({ ...p, id: generateId(), isActive: true })),
          });
        }
      });

      return newCategories;
    });

    setShowAiApplied(true);
    setTimeout(() => setShowAiApplied(false), 3000);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Cardápio</h1>
          <p className="text-gray-400 text-sm">
            {search ? `${filtered.reduce((s, c) => s + c.products.length, 0)} produtos encontrados` : `${categories.length} categorias · ${categories.reduce((s, c) => s + c.products.length, 0)} produtos`}
          </p>
        </div>
        <button onClick={() => setShowNewProduct(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#ff9607] text-black rounded-xl text-sm font-bold hover:bg-[#ffaa33] transition-colors">
          <Plus className="h-4 w-4" /> Novo Produto
        </button>
      </div>

      {/* AI Applied Toast */}
      {showAiApplied && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-2">
          <Check className="h-4 w-4 text-green-400" />
          <span className="text-sm text-green-400">Cardápio gerado com sucesso! Produtos adicionados.</span>
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

        {/* Right: AI Menu */}
        <div className="space-y-4">
          <AiMenuPanel businessType={businessType} onApply={applyAiTemplate} />

          {/* Quick Stats */}
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
