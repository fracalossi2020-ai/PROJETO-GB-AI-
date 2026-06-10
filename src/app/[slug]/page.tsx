'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Plus, Minus, X, ChevronRight, Search,
  Clock, Star, MapPin, MessageCircle, Sun, Moon, Flame,
  ArrowUp, Sparkles, Zap
} from 'lucide-react';
import { useAuth } from '@/stores/auth';

interface Product {
  id: string; name: string; description: string; image?: string;
  price: number; isPromotion: boolean; promotionPrice?: number;
  isFeatured: boolean; addons: { id: string; name: string; price: number }[];
}
interface Category { id: string; name: string; products: Product[]; }
interface CartItem {
  product: Product; quantity: number;
  selectedAddons: { id: string; name: string; price: number }[]; note: string;
}

/* ── Product Card ── */
function ProductCard({
  product, idx, isDark, muted, onClick,
}: {
  product: Product; idx: number; isDark: boolean; muted: string; onClick: () => void;
}) {
  const padded = String(idx + 1).padStart(2, '0');
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: idx * 0.06, duration: 0.45, ease: 'easeOut' }}
      whileHover={{ scale: 1.035, y: -8, transition: { duration: 0.25 } }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`group snap-start flex-shrink-0 w-64 ${isDark
        ? 'bg-white/[0.03] border-white/[0.08] hover:border-[#ff9607]/25 hover:shadow-[0_12px_40px_rgba(255,150,7,0.10)]'
        : 'bg-white border-black/[0.06] hover:border-[#ff9607]/30 hover:shadow-[0_8px_30px_rgba(255,150,7,0.12)]'
      } border backdrop-blur-sm rounded-2xl overflow-hidden text-left cursor-pointer transition-all duration-300`}
    >
      <div className="relative h-52 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full ${isDark ? 'bg-white/[0.03]' : 'bg-black/[0.03]'} flex items-center justify-center`}>
            <span className="text-5xl font-black text-[#ff9607]/10">{product.name.charAt(0)}</span>
          </div>
        )}

        {/* Floating add button on hover */}
        <div className="absolute bottom-3 right-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <div className="w-9 h-9 rounded-full bg-[#ff9607] text-black flex items-center justify-center shadow-lg">
            <Plus className="h-5 w-5" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {product.isPromotion && (
            <span className="bg-[#ff0080] text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider uppercase">PROMO</span>
          )}
          {product.isFeatured && (
            <span className="bg-[#ff9607] text-black text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider uppercase">TOP</span>
          )}
        </div>

        {/* Index overlay */}
        <div className="absolute bottom-3 left-3">
          <span className={`font-mono text-xs font-bold ${muted} bg-black/30 backdrop-blur-md px-2 py-1 rounded-md`}>#{padded}</span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-[17px] tracking-tight truncate leading-snug">{product.name}</h3>
        <p className={`${muted} text-sm mt-1.5 line-clamp-2 h-10 leading-relaxed`}>{product.description}</p>
        <div className="mt-3.5 flex items-end justify-between">
          {product.isPromotion && product.promotionPrice ? (
            <div className="flex items-center gap-2">
              <span className="text-[22px] font-black text-[#ff9607]">R$ {product.promotionPrice.toFixed(2)}</span>
              <span className={`text-sm line-through ${muted}`}>R$ {product.price.toFixed(2)}</span>
            </div>
          ) : (
            <span className="text-[22px] font-black text-[#ff9607]">R$ {product.price.toFixed(2)}</span>
          )}
          {product.addons.length > 0 && (
            <span className={`text-[11px] font-mono font-bold uppercase tracking-widest ${muted}`}>+{product.addons.length}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function CardapioPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { isAuth } = useAuth();

  /* ── Theme ── */
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  useEffect(() => {
    const saved = localStorage.getItem('menu-theme');
    const t = saved === 'light' ? 'light' : 'dark';
    setTheme(t);
    document.documentElement.classList.toggle('theme-light', t === 'light');
  }, []);
  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('menu-theme', next);
    document.documentElement.classList.toggle('theme-light', next === 'light');
  }, [theme]);

  /* ── Data ── */
  const [store, setStore] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  /* ── Search ── */
  const [search, setSearch] = useState('');

  /* ── Cart ── */
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try { const s = localStorage.getItem(`cart-${slug}`); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [showCart, setShowCart] = useState(false);

  /* ── Product modal ── */
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<{ id: string; name: string; price: number }[]>([]);
  const [note, setNote] = useState('');

  /* ── Toast ── */
  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((message: string) => {
    setToastMsg(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 2500);
  }, []);

  /* ── Load store ── */
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/stores/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.data) {
          setStore(d.data);
          setCategories(d.data.categories.map((cat: any) => ({
            ...cat,
            products: d.data.products.filter((p: any) => p.categoryId === cat.id),
          })));
          setIsLoaded(true);
        }
      });
  }, [slug]);

  /* ── Persist cart ── */
  useEffect(() => {
    localStorage.setItem(`cart-${slug}`, JSON.stringify(cart));
  }, [cart, slug]);

  /* ── Active category on scroll ── */
  const [activeCategory, setActiveCategory] = useState('');
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    const onScroll = () => {
      if (scrollTimer.current) return;
      scrollTimer.current = setTimeout(() => {
        scrollTimer.current = null;
        const sections = Object.entries(sectionRefs.current);
        for (const [id, el] of sections) {
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top < 250 && rect.bottom > 100) {
              setActiveCategory(id);
              break;
            }
          }
        }
      }, 100);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isLoaded]);

  /* ── Helpers ── */
  const scrollToCategory = useCallback((catId: string) => {
    const el = sectionRefs.current[catId];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const addToCart = useCallback(() => {
    if (!selectedProduct) return;
    setCart(prev => [...prev, { product: selectedProduct, quantity, selectedAddons, note }]);
    setSelectedProduct(null);
    setQuantity(1);
    setSelectedAddons([]);
    setNote('');
    showToast(`${selectedProduct.name} adicionado!`);
  }, [selectedProduct, quantity, selectedAddons, note, showToast]);

  const removeFromCart = useCallback((index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  }, []);

  const cartTotal = cart.reduce((sum, item) => {
    const addonsTotal = item.selectedAddons.reduce((s, a) => s + a.price, 0);
    const price = item.product.isPromotion && item.product.promotionPrice ? item.product.promotionPrice : item.product.price;
    return sum + (price + addonsTotal) * item.quantity;
  }, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  /* ── Filtered products ── */
  const filteredCategories = search.trim()
    ? categories.map(cat => ({
        ...cat,
        products: cat.products.filter(p =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
        ),
      })).filter(cat => cat.products.length > 0)
    : categories;

  const featuredProducts = store?.products?.filter((p: Product) => p.isFeatured).slice(0, 4) || [];

  /* ── Theme classes ── */
  const isDark = theme === 'dark';
  const bg = isDark ? 'bg-[#050505]' : 'bg-[#f8f7f4]';
  const text = isDark ? 'text-white' : 'text-[#1a1a1a]';
  const muted = isDark ? 'text-white/40' : 'text-black/40';
  const muted2 = isDark ? 'text-white/60' : 'text-black/60';
  const card = isDark ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-black/[0.06]';
  const inputCls = isDark ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-black/[0.1]';
  const stickyCat = isDark ? 'bg-[#050505]/95 border-white/[0.06]' : 'bg-[#f8f7f4]/95 border-black/[0.06]';
  const modalBg = isDark ? 'bg-[#0a0a0f]' : 'bg-white';
  const overlay = isDark ? 'bg-black/80' : 'bg-black/40';

  /* ── Loading ── */
  if (!store) {
    return (
      <div className={`min-h-screen ${bg} ${text} flex items-center justify-center`}>
        <div className="w-10 h-10 rounded-full border-2 border-[#ff9607] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} ${text}`}>
      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[60]"
          >
            <div className="bg-[#ff9607] text-black px-5 py-3 rounded-2xl font-bold text-sm shadow-lg whitespace-nowrap flex items-center gap-2">
              <Zap className="h-4 w-4" /> {toastMsg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="relative z-10">
        {store.coverImage ? (
          <div className="absolute inset-0">
            <img src={store.coverImage} alt="" className="w-full h-full object-cover opacity-25" loading="eager" />
            <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-b from-[#050505]/30 via-[#050505]/60 to-[#050505]' : 'bg-gradient-to-b from-[#f8f7f4]/30 via-[#f8f7f4]/60 to-[#f8f7f4]'}`} />
          </div>
        ) : (
          <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-b from-[#ff9607]/5 via-[#ff0080]/3 to-transparent' : 'bg-gradient-to-b from-[#ff9607]/8 via-[#ff0080]/4 to-transparent'}`} />
        )}

        <div className="relative px-4 pt-5 pb-6">
          <div className="max-w-3xl mx-auto flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Link href={`/${slug}/meus-pedidos`} className={`${card} rounded-xl p-2.5 hover:scale-105 transition-transform backdrop-blur-sm`}>
                <ShoppingCart className="h-5 w-5" />
              </Link>
              <Link href={`/${slug}/rastrear`} className={`${card} rounded-xl p-2.5 hover:scale-105 transition-transform backdrop-blur-sm`}>
                <MapPin className="h-5 w-5" />
              </Link>
            </div>
            <div className="flex items-center gap-2">
              {isAuth && (
                <button onClick={() => router.push('/dashboard')} className={`${card} rounded-xl p-2.5 hover:scale-105 transition-transform backdrop-blur-sm`}>
                  <Sparkles className="h-5 w-5" />
                </button>
              )}
              <button onClick={toggleTheme} className={`${card} rounded-xl p-2.5 hover:scale-105 transition-transform backdrop-blur-sm`}>
                {isDark ? <Sun className="h-5 w-5 text-[#ff9607]" /> : <Moon className="h-5 w-5 text-[#ff9607]" />}
              </button>
            </div>
          </div>

          <div className="max-w-3xl mx-auto text-center">
            {store.logo ? (
              <img src={store.logo} alt={store.name} className="w-20 h-20 rounded-3xl mx-auto mb-4 object-cover ring-4 ring-[#ff9607]/20 shadow-xl" loading="eager" />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-[#ff9607] to-[#ff0080] rounded-3xl mx-auto mb-4 flex items-center justify-center text-black text-3xl font-black shadow-xl">
                {store.name.charAt(0)}
              </div>
            )}

            <h1 className="text-[42px] font-black tracking-tighter uppercase leading-none"
              style={{ textShadow: isDark ? '0 0 60px rgba(255,150,7,0.15)' : 'none' }}>
              {store.name}
            </h1>
            <p className={`${muted} mt-2 text-base max-w-md mx-auto leading-relaxed`}>{store.description}</p>

            <div className="flex items-center justify-center flex-wrap gap-2 mt-4">
              <span className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold ${card} backdrop-blur-sm tracking-tight`}>
                <Clock className="h-4 w-4 text-[#ff9607]" /> {store.deliveryTimeMin || 25}-{store.deliveryTimeMax || 45} min
              </span>
              <span className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold ${card} backdrop-blur-sm tracking-tight`}>
                <Star className="h-4 w-4 text-[#ff9607]" /> 4.9
              </span>
              <span className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold ${card} backdrop-blur-sm tracking-tight`}>
                R$ {store.deliveryFee?.toFixed(2) || '5.00'}
              </span>
              <span className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold ${store.isOpen ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                <span className={`w-2 h-2 rounded-full ${store.isOpen ? 'bg-green-400' : 'bg-red-400'}`} />
                {store.isOpen ? 'Aberto' : 'Fechado'}
              </span>
            </div>

            {/* Search */}
            <div className={`mt-5 max-w-md mx-auto flex items-center gap-2 ${inputCls} rounded-2xl px-4 py-3 backdrop-blur-sm`}>
              <Search className="h-5 w-5 text-[#ff9607] flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar no cardápio..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#ff9607]/40"
              />
              {search && <button onClick={() => setSearch('')}><X className="h-4 w-4" /></button>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Featured ── */}
      {!search && featuredProducts.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 mt-2 mb-4 relative z-10">
          <h2 className="font-black text-lg tracking-tight mb-3 flex items-center gap-2 uppercase">
            <Flame className="h-5 w-5 text-[#ff9607]" /> Destaques
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x">
            {featuredProducts.map((p: Product, fIdx: number) => (
              <button
                key={p.id}
                onClick={() => { setSelectedProduct(p); setQuantity(1); setSelectedAddons([]); setNote(''); }}
                className={`snap-start flex-shrink-0 w-40 ${card} rounded-2xl overflow-hidden text-left hover:scale-[1.03] transition-transform backdrop-blur-sm`}
              >
                <div className="h-32 relative">
                  {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" /> : (
                    <div className="w-full h-full bg-gradient-to-br from-[#ff9607]/10 to-[#ff0080]/10 flex items-center justify-center text-xs text-[#ff9607]">Sem imagem</div>
                  )}
                  {p.isPromotion && <span className="absolute top-2 left-2 bg-[#ff0080] text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase">PROMO</span>}
                  <div className="absolute bottom-2 left-2">
                    <span className={`font-mono text-[10px] font-bold ${muted} bg-black/30 backdrop-blur-md px-1.5 py-0.5 rounded`}>#{String(fIdx + 1).padStart(2, '0')}</span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-base tracking-tight truncate leading-snug">{p.name}</h3>
                  <p className="text-[#ff9607] font-black text-lg mt-1">
                    R$ {(p.isPromotion && p.promotionPrice ? p.promotionPrice : p.price).toFixed(2)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Category Tabs ── */}
      <div className={`sticky top-0 ${stickyCat} z-30 border-b backdrop-blur-sm relative`}>
        <div className="flex gap-2 overflow-x-auto px-4 py-3 max-w-3xl mx-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={`relative px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${activeCategory === cat.id ? 'text-[#ff9607]' : muted2}`}
            >
              {cat.name}
              {activeCategory === cat.id && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-[#ff9607] rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      {/* ── Products ── */}
      <div className="max-w-5xl mx-auto px-4 mt-6 pb-32 space-y-12 relative z-10">
        {isLoaded ? (
          filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-10 w-10 mx-auto text-[#ff9607]/20 mb-2" />
              <p className={muted2}>Nenhum produto encontrado</p>
              <button onClick={() => setSearch('')} className="mt-2 text-[#ff9607] text-sm font-semibold">Limpar busca</button>
            </div>
          ) : (
            filteredCategories.map((cat) => (
              <div key={cat.id} id={cat.id} ref={el => { sectionRefs.current[cat.id] = el; }}>
                <div className="flex items-baseline gap-3 mb-4">
                  <h2 className="text-[28px] font-black tracking-tight uppercase leading-none">{cat.name}</h2>
                  <span className={`text-sm font-mono font-bold ${muted} uppercase tracking-[0.2em]`}>{String(cat.products.length).padStart(2, '0')} itens</span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory">
                  {cat.products.map((product, idx) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      idx={idx}
                      isDark={isDark}
                      muted={muted}
                      onClick={() => { setSelectedProduct(product); setQuantity(1); setSelectedAddons([]); setNote(''); }}
                    />
                  ))}
                </div>
              </div>
            ))
          )
        ) : (
          /* Skeleton */
          <div className="space-y-10">
            {[1,2].map(i => (
              <div key={i}>
                <div className={`h-6 w-36 ${isDark ? 'bg-white/[0.06]' : 'bg-black/[0.06]'} rounded mb-4`} />
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {[1,2,3].map(j => (
                    <div key={j} className={`flex-shrink-0 w-64 ${isDark ? 'bg-white/[0.03]' : 'bg-white'} border border-black/[0.06] rounded-2xl overflow-hidden`}>
                      <div className={`h-52 ${isDark ? 'bg-white/[0.04]' : 'bg-black/[0.04]'}`} />
                      <div className="p-4 space-y-2">
                        <div className={`h-4 w-2/3 ${isDark ? 'bg-white/[0.06]' : 'bg-black/[0.06]'} rounded`} />
                        <div className={`h-3 w-full ${isDark ? 'bg-white/[0.04]' : 'bg-black/[0.04]'} rounded`} />
                        <div className={`h-5 w-20 ${isDark ? 'bg-white/[0.06]' : 'bg-black/[0.06]'} rounded`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scroll to top */}
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-24 right-4 z-40 w-10 h-10 rounded-full bg-[#ff9607] text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
        <ArrowUp className="h-5 w-5" />
      </button>

      {/* Cart button */}
      {cartCount > 0 && (
        <button onClick={() => setShowCart(true)} className="fixed bottom-5 left-4 right-4 max-w-md mx-auto bg-gradient-to-r from-[#ff9607] to-[#ff0080] text-black rounded-2xl p-3.5 flex items-center justify-between shadow-xl z-40 animate-fadeInUp">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5" />
            <span className="font-bold">{cartCount} {cartCount === 1 ? 'item' : 'itens'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-black text-lg">R$ {cartTotal.toFixed(2)}</span>
            <ChevronRight className="h-5 w-5" />
          </div>
        </button>
      )}

      {/* ── Product Modal ── */}
      {selectedProduct && (
        <div className={`fixed inset-0 ${overlay} z-50 flex items-end justify-center`} onClick={() => setSelectedProduct(null)}>
          <div onClick={e => e.stopPropagation()} className={`${modalBg} w-full max-w-lg rounded-t-3xl max-h-[90vh] overflow-auto border-t border-white/[0.08]`}>
            {selectedProduct.image && (
              <div className="relative h-56">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
                <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="p-5 space-y-5 -mt-4 relative">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-[26px] font-black tracking-tight leading-tight">{selectedProduct.name}</h2>
                  <p className={`${muted} text-base mt-1.5 leading-relaxed`}>{selectedProduct.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  {selectedProduct.isPromotion && selectedProduct.promotionPrice ? (
                    <div>
                      <span className="text-2xl font-black text-[#ff9607]">R$ {selectedProduct.promotionPrice.toFixed(2)}</span>
                      <span className={`block text-sm line-through ${muted}`}>R$ {selectedProduct.price.toFixed(2)}</span>
                    </div>
                  ) : (
                    <span className="text-2xl font-black text-[#ff9607]">R$ {selectedProduct.price.toFixed(2)}</span>
                  )}
                </div>
              </div>

              {selectedProduct.addons.length > 0 && (
                <div>
                  <h3 className={`font-mono text-xs font-bold uppercase tracking-[0.2em] mb-3 ${muted2}`}>Adicionais</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.addons.map(addon => {
                      const isSelected = selectedAddons.some(a => a.id === addon.id);
                      return (
                        <button
                          key={addon.id}
                          onClick={() => setSelectedAddons(prev => isSelected ? prev.filter(a => a.id !== addon.id) : [...prev, addon])}
                          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm border transition-colors ${
                            isSelected ? 'bg-[#ff9607]/10 border-[#ff9607]/40 text-[#ff9607]' : `${card}`
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-[#ff9607] border-[#ff9607]' : 'border-white/20'}`}>
                            {isSelected && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span>{addon.name}</span>
                          <span className="text-[#ff9607] font-semibold">+R$ {addon.price.toFixed(2)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className={`font-mono text-xs font-bold uppercase tracking-[0.2em] ${muted}`}>Observação</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Ex: Sem cebola..."
                  className={`w-full mt-2 p-3.5 rounded-xl text-base resize-none outline-none ${inputCls}`} rows={2} />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div className={`flex items-center gap-2 rounded-xl p-1 border ${card}`}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5"><Minus className="h-4 w-4" /></button>
                  <span className="font-black w-5 text-center text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5"><Plus className="h-4 w-4" /></button>
                </div>
                <button onClick={addToCart} className="flex-1 bg-gradient-to-r from-[#ff9607] to-[#ff0080] text-black py-4 rounded-xl font-bold text-base">
                  Adicionar R$ {((selectedProduct.isPromotion && selectedProduct.promotionPrice ? selectedProduct.promotionPrice : selectedProduct.price) + selectedAddons.reduce((s, a) => s + a.price, 0)) * quantity}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Cart Drawer ── */}
      {showCart && (
        <div className={`fixed inset-0 ${overlay} z-50 flex items-end justify-center`} onClick={() => setShowCart(false)}>
          <div onClick={e => e.stopPropagation()} className={`${modalBg} w-full max-w-lg rounded-t-3xl max-h-[85vh] overflow-auto border-t border-white/[0.08]`}>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-[28px] font-black tracking-tight uppercase">Seu pedido</h2>
                <button onClick={() => setShowCart(false)} className="w-9 h-9 rounded-full bg-white/[0.05] flex items-center justify-center hover:bg-white/10"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-2.5">
                {cart.map((item, index) => {
                  const addonsTotal = item.selectedAddons.reduce((s, a) => s + a.price, 0);
                  const price = item.product.isPromotion && item.product.promotionPrice ? item.product.promotionPrice : item.product.price;
                  return (
                    <div key={index} className={`flex gap-3 p-3 ${card} rounded-xl`}>
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-white/[0.03]">
                        {item.product.image ? <img src={item.product.image} alt="" className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center text-xs text-[#ff9607]/30">{item.product.name.charAt(0)}</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-base tracking-tight truncate">{item.product.name}</h4>
                        {item.selectedAddons.length > 0 && <p className={`text-sm ${muted} truncate`}>+ {item.selectedAddons.map(a => a.name).join(', ')}</p>}
                        {item.note && <p className={`text-sm ${muted} truncate`}>Obs: {item.note}</p>}
                        <p className="text-[#ff9607] font-black text-base mt-1">R$ {((price + addonsTotal) * item.quantity).toFixed(2)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-bold">{item.quantity}x</span>
                        <button onClick={() => removeFromCart(index)} className="w-7 h-7 rounded-full bg-white/[0.05] flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-colors"><X className="h-3 w-3" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-white/[0.08] pt-3 space-y-1.5">
                <div className={`flex justify-between text-sm ${muted}`}><span>Subtotal</span><span>R$ {cartTotal.toFixed(2)}</span></div>
                <div className={`flex justify-between text-sm ${muted}`}><span>Entrega</span><span>R$ {store.deliveryFee?.toFixed(2) || '0.00'}</span></div>
                <div className="flex justify-between text-lg font-black pt-1"><span>Total</span><span className="text-[#ff9607]">R$ {(cartTotal + (store.deliveryFee || 0)).toFixed(2)}</span></div>
              </div>
              <Link href={`/${slug}/checkout`} className="block w-full bg-gradient-to-r from-[#ff9607] to-[#ff0080] text-black py-4 rounded-2xl font-bold text-center text-lg">
                Finalizar pedido
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp float */}
      {store.whatsapp && (
        <a href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
          className="fixed bottom-24 left-4 z-40 w-11 h-11 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          <MessageCircle className="h-6 w-6 text-white" />
        </a>
      )}
    </div>
  );
}
