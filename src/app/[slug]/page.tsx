'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Plus, Minus, X, ChevronRight, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/stores/auth';

interface Product {
  id: string;
  name: string;
  description: string;
  image?: string;
  price: number;
  isPromotion: boolean;
  promotionPrice?: number;
  addons: { id: string; name: string; price: number }[];
}

interface Category {
  id: string;
  name: string;
  products: Product[];
}

interface CartItem {
  product: Product;
  quantity: number;
  selectedAddons: { id: string; name: string; price: number }[];
  note: string;
}

export default function CardapioPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { isAuth } = useAuth();

  const [store, setStore] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<{ id: string; name: string; price: number }[]>([]);
  const [note, setNote] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/stores/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.data) {
          setStore(d.data);
          const cats = d.data.categories.map((cat: any) => ({
            ...cat,
            products: d.data.products.filter((p: any) => p.categoryId === cat.id),
          }));
          setCategories(cats);
          if (cats.length > 0) setActiveCategory(cats[0].id);
        }
      });
  }, [slug]);

  function addToCart() {
    if (!selectedProduct) return;
    setCart([...cart, { product: selectedProduct, quantity, selectedAddons, note }]);
    setSelectedProduct(null);
    setQuantity(1);
    setSelectedAddons([]);
    setNote('');
  }

  function removeFromCart(index: number) {
    setCart(cart.filter((_, i) => i !== index));
  }

  const cartTotal = cart.reduce((sum, item) => {
    const addonsTotal = item.selectedAddons.reduce((s, a) => s + a.price, 0);
    const price = item.product.isPromotion && item.product.promotionPrice
      ? item.product.promotionPrice
      : item.product.price;
    return sum + (price + addonsTotal) * item.quantity;
  }, 0);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!store) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin h-10 w-10 border-4 border-[#ff9607] border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white pb-28">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#ff9607]/20 to-transparent" />
        <div className="relative p-4">
          {isAuth && (
            <Link href="/dashboard" className="absolute top-4 right-4 bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-colors z-10">
              <Settings className="h-5 w-5" />
            </Link>
          )}
          <div className="max-w-lg mx-auto text-center pt-8 pb-4">
            {store.logo ? (
              <img src={store.logo} alt={store.name} className="w-20 h-20 rounded-2xl mx-auto mb-4 object-cover" />
            ) : (
              <div className="w-20 h-20 bg-[#ff9607] rounded-2xl mx-auto mb-4 flex items-center justify-center text-black text-2xl font-bold">
                {store.name.charAt(0)}
              </div>
            )}
            <h1 className="text-2xl font-black">{store.name}</h1>
            <p className="text-gray-400 mt-1">{store.description}</p>
            <div className="flex items-center justify-center gap-4 mt-3 text-sm text-gray-500">
              <span>🕐 {store.deliveryTimeMin}-{store.deliveryTimeMax} min</span>
              <span>💰 Pedido mínimo R$ {store.minOrderValue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categorias */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-sm z-20 py-3 px-4 border-b border-white/5">
        <div className="flex gap-2 overflow-x-auto max-w-lg mx-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-[#ff9607] text-black'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Produtos */}
      <div className="max-w-lg mx-auto px-4 mt-6 space-y-6">
        {categories.filter(c => c.id === activeCategory).map((cat) => (
          <div key={cat.id}>
            <h2 className="text-lg font-bold mb-3">{cat.name}</h2>
            <div className="space-y-3">
              {cat.products.map((product) => (
                <motion.button
                  key={product.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedProduct(product);
                    setQuantity(1);
                    setSelectedAddons([]);
                    setNote('');
                  }}
                  className="w-full bg-gray-900 border border-white/5 rounded-2xl p-3 flex gap-3 text-left"
                >
                  <div className="w-24 h-24 bg-white/5 rounded-xl flex-shrink-0 overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-600 text-xs">Sem imagem</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold">{product.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                    <div className="mt-2">
                      {product.isPromotion && product.promotionPrice ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-[#ff9607]">R$ {product.promotionPrice.toFixed(2)}</span>
                          <span className="text-sm text-gray-500 line-through">R$ {product.price.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-[#ff9607]">R$ {product.price.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-[#ff9607] rounded-full flex items-center justify-center">
                      <Plus className="h-5 w-5 text-black" />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Botão Carrinho */}
      {cartCount > 0 && (
        <motion.button
          initial={{ y: 100 }} animate={{ y: 0 }}
          onClick={() => setShowCart(true)}
          className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto bg-[#ff9607] text-black rounded-2xl p-4 flex items-center justify-between shadow-2xl z-40"
        >
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5" />
            <span className="font-bold">{cartCount} {cartCount === 1 ? 'item' : 'itens'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">R$ {cartTotal.toFixed(2)}</span>
            <ChevronRight className="h-5 w-5" />
          </div>
        </motion.button>
      )}

      {/* Modal Produto */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center"
            onClick={() => setSelectedProduct(null)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              onClick={e => e.stopPropagation()}
              className="bg-gray-900 w-full max-w-lg rounded-t-3xl max-h-[90vh] overflow-auto">
              <div className="p-6 space-y-5">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold">{selectedProduct.name}</h2>
                  <button onClick={() => setSelectedProduct(null)}><X className="h-6 w-6 text-gray-400" /></button>
                </div>
                {selectedProduct.image && <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-48 object-cover rounded-2xl" />}
                <p className="text-gray-400">{selectedProduct.description}</p>

                {selectedProduct.addons.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-3">Adicionais</h3>
                    <div className="space-y-2">
                      {selectedProduct.addons.map((addon) => {
                        const isSelected = selectedAddons.some(a => a.id === addon.id);
                        return (
                          <button key={addon.id}
                            onClick={() => setSelectedAddons(isSelected ? selectedAddons.filter(a => a.id !== addon.id) : [...selectedAddons, addon])}
                            className={`w-full flex justify-between p-3 rounded-xl border transition-colors ${
                              isSelected ? 'border-[#ff9607] bg-[#ff9607]/5' : 'border-white/10'
                            }`}>
                            <span>{addon.name}</span>
                            <span className="text-[#ff9607] font-medium">+ R$ {addon.price.toFixed(2)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm text-gray-400">Observação</label>
                  <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Sem cebola..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white mt-1 resize-none" rows={2} />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-3 bg-white/5 rounded-xl p-1">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="font-bold w-6 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button onClick={addToCart} className="flex-1 bg-[#ff9607] text-black py-4 rounded-xl font-bold">
                    Adicionar R$ {((selectedProduct.price + selectedAddons.reduce((s, a) => s + a.price, 0)) * quantity).toFixed(2)}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer Carrinho */}
      <AnimatePresence>
        {showCart && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center"
            onClick={() => setShowCart(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              onClick={e => e.stopPropagation()}
              className="bg-gray-900 w-full max-w-lg rounded-t-3xl max-h-[90vh] overflow-auto">
              <div className="p-6 space-y-5">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Seu pedido</h2>
                  <button onClick={() => setShowCart(false)}><X className="h-6 w-6 text-gray-400" /></button>
                </div>
                <div className="space-y-3">
                  {cart.map((item, index) => {
                    const addonsTotal = item.selectedAddons.reduce((s, a) => s + a.price, 0);
                    const price = item.product.isPromotion && item.product.promotionPrice
                      ? item.product.promotionPrice
                      : item.product.price;
                    return (
                      <div key={index} className="flex gap-3 p-3 bg-white/5 rounded-xl">
                        <div className="flex-1">
                          <h4 className="font-bold">{item.product.name}</h4>
                          {item.selectedAddons.length > 0 && <p className="text-sm text-gray-400">+ {item.selectedAddons.map(a => a.name).join(', ')}</p>}
                          <p className="font-medium text-[#ff9607] mt-1">R$ {((price + addonsTotal) * item.quantity).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => removeFromCart(index)} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center font-bold">{item.quantity}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-white/10 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>R$ {cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Taxa de entrega</span>
                    <span>R$ {store.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-2">
                    <span>Total</span>
                    <span className="text-[#ff9607]">R$ {(cartTotal + store.deliveryFee).toFixed(2)}</span>
                  </div>
                </div>
                <a href={`/${slug}/checkout`} className="block w-full bg-[#ff9607] text-black py-4 rounded-2xl font-bold text-center text-lg">
                  Finalizar pedido
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
