'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { motion } from 'framer-motion';
import {
  Link2, Copy, Check, Share2, MessageCircle, ExternalLink, QrCode,
  Edit3, Save, X, Smartphone, Globe
} from 'lucide-react';

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function CompartilharPage() {
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [editingSlug, setEditingSlug] = useState(false);
  const [newSlug, setNewSlug] = useState('');
  const [savingSlug, setSavingSlug] = useState(false);
  const [slugError, setSlugError] = useState('');

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    apiFetch('/api/stores')
      .then(r => r.json())
      .then(d => {
        if (d.data?.[0]) {
          setStore(d.data[0]);
          setNewSlug(d.data[0].slug);
        }
        setLoading(false);
      });
  }, []);

  const storeUrl = store ? `${baseUrl}/${store.slug}` : '';
  const qrUrl = store ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(storeUrl)}` : '';

  async function copyLink() {
    if (!storeUrl) return;
    await navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    if (!storeUrl || !store) return;
    const text = encodeURIComponent(
      `Olá! Confira o cardápio da ${store.name} e faça seu pedido online:\n\n${storeUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  async function saveSlug() {
    if (!store || !newSlug.trim()) return;
    setSavingSlug(true);
    setSlugError('');

    const cleanSlug = slugify(newSlug);
    if (cleanSlug.length < 3) {
      setSlugError('O link precisa ter pelo menos 3 caracteres');
      setSavingSlug(false);
      return;
    }

    try {
      const res = await apiFetch('/api/stores/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: store.id, slug: cleanSlug }),
      });
      const data = await res.json();
      if (data.success) {
        setStore({ ...store, slug: cleanSlug });
        setEditingSlug(false);
      } else {
        setSlugError(data.message || 'Erro ao salvar link');
      }
    } catch {
      setSlugError('Erro ao salvar link');
    } finally {
      setSavingSlug(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-2 border-[#ff9607] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="text-center py-20">
        <p className="text-white/40">Nenhuma loja encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Link da Loja</h1>
        <p className="text-white/40 text-sm mt-1">Compartilhe seu cardápio com clientes</p>
      </div>

      {/* Link Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-sm bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#ff9607]/10 rounded-xl flex items-center justify-center">
            <Link2 className="h-5 w-5 text-[#ff9607]" />
          </div>
          <div>
            <p className="font-bold">Link público do cardápio</p>
            <p className="text-white/40 text-xs">Seus clientes acessam por aqui</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 flex items-center gap-2">
            <Globe className="h-4 w-4 text-white/20 flex-shrink-0" />
            <span className="text-white/40 text-sm flex-shrink-0">{baseUrl}/</span>
            {editingSlug ? (
              <input
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                className="bg-transparent text-white font-mono text-sm focus:outline-none flex-1"
                autoFocus
              />
            ) : (
              <span className="text-white font-mono text-sm">{store.slug}</span>
            )}
          </div>
          {editingSlug ? (
            <>
              <button
                onClick={saveSlug}
                disabled={savingSlug}
                className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-colors"
              >
                <Save className="h-5 w-5 text-green-400" />
              </button>
              <button
                onClick={() => { setEditingSlug(false); setNewSlug(store.slug); setSlugError(''); }}
                className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl hover:bg-white/[0.05] transition-colors"
              >
                <X className="h-5 w-5 text-white/40" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditingSlug(true)}
              className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl hover:bg-white/[0.05] transition-colors"
            >
              <Edit3 className="h-5 w-5 text-white/40" />
            </button>
          )}
        </div>
        {slugError && <p className="text-red-400 text-xs">{slugError}</p>}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={copyLink}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm hover:border-white/[0.15] transition-all"
          >
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copiado!' : 'Copiar link'}
          </button>
          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-500/10 border border-green-500/20 rounded-xl text-sm text-green-400 hover:bg-green-500/20 transition-all"
          >
            <MessageCircle className="h-4 w-4" />
            Compartilhar no WhatsApp
          </button>
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm hover:border-white/[0.15] transition-all"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir cardápio
          </a>
        </div>
      </motion.div>

      {/* QR Code */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="backdrop-blur-sm bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 text-center"
      >
        <div className="flex items-center gap-3 mb-4 justify-center">
          <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
            <QrCode className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="text-left">
            <p className="font-bold">QR Code do cardápio</p>
            <p className="text-white/40 text-xs">Escaneie para acessar</p>
          </div>
        </div>
        <div className="inline-block p-4 bg-white rounded-2xl">
          <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
        </div>
        <p className="text-white/30 text-xs mt-3">Imprima e cole na porta, mesas ou cardápio físico</p>
      </motion.div>

      {/* Preview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="backdrop-blur-sm bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <p className="font-bold">Como seus clientes veem</p>
            <p className="text-white/40 text-xs">Preview do cardápio público</p>
          </div>
        </div>
        <div className="bg-[#050505] border border-white/[0.08] rounded-xl p-4 max-w-sm mx-auto">
          <div className="flex items-center gap-3 mb-3">
            {store.logo ? (
              <img src={store.logo} alt={store.name} className="w-12 h-12 rounded-xl object-cover" />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-[#ff9607] to-[#ff0080] rounded-xl flex items-center justify-center text-black font-bold">
                {store.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-bold text-sm">{store.name}</p>
              <p className="text-white/40 text-xs">{store.description || 'Cardápio digital'}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-2 bg-white/5 rounded w-3/4" />
            <div className="h-2 bg-white/5 rounded w-1/2" />
          </div>
          <div className="mt-3 flex gap-2">
            <div className="h-8 bg-[#ff9607]/20 rounded-lg flex-1" />
            <div className="h-8 bg-white/5 rounded-lg flex-1" />
          </div>
        </div>
        <div className="text-center mt-4">
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#ff9607] text-sm font-medium hover:text-[#ffaa33] transition-colors"
          >
            Ver cardápio completo <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </motion.div>
    </div>
  );
}
