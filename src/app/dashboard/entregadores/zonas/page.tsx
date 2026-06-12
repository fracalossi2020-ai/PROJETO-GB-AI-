'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  MapPin, Plus, Trash2, Pencil, ArrowLeft, Save, X, Search, Navigation,
  DollarSign, Clock, Bike, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/api-client';

const DeliveryMap = dynamic(() => import('@/components/DeliveryMap'), { ssr: false });

interface Zone {
  id: string;
  name: string;
  radiusKm: number | null;
  neighborhoods: string | null;
  deliveryFee: number;
  minOrderValue: number;
  estimatedTimeMin: number;
  estimatedTimeMax: number;
  isActive: boolean;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];

export default function ZonasEntregaPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-23.5505, -46.6333]);
  const [addressSearch, setAddressSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Zone>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await apiFetch('/api/delivery-zones');
      const d = await r.json();
      if (d.success) setZones(d.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Tenta pegar endereço da loja
    apiFetch('/api/stores')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data?.address) {
          buscarEndereco(d.data.address + ' ' + (d.data.city || ''));
        }
      })
      .catch(() => {});
  }, [load]);

  async function buscarEndereco(query: string) {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { 'Accept-Language': 'pt-BR' } }
      );
      const data = await res.json();
      if (data && data[0]) {
        setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      }
    } catch {
      // mantém centro atual
    } finally {
      setSearching(false);
    }
  }

  const handleAddZone = async () => {
    const res = await apiFetch('/api/delivery-zones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Zona ${zones.length + 1}`,
        radiusKm: zones.length > 0 ? (zones[zones.length - 1].radiusKm || 0) + 2 : 2,
        deliveryFee: 0,
        minOrderValue: 0,
      }),
    });
    const d = await res.json();
    if (d.success) setZones(prev => [...prev, d.data]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta zona?')) return;
    await apiFetch(`/api/delivery-zones?id=${id}`, { method: 'DELETE' });
    setZones(prev => prev.filter(z => z.id !== id));
  };

  const handleSaveEdit = async (zone: Zone) => {
    const res = await apiFetch('/api/delivery-zones', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...zone, ...editForm, id: zone.id }),
    });
    const d = await res.json();
    if (d.success) {
      setZones(prev => prev.map(z => z.id === zone.id ? d.data : z));
      setEditingId(null);
    }
  };

  const mapZones = zones
    .filter(z => z.isActive && (z.radiusKm ?? 0) > 0)
    .map(z => ({
      radius: z.radiusKm || 0,
      fee: z.deliveryFee,
      minOrder: z.minOrderValue,
    }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/entregadores"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Zonas de Entrega</h1>
            <p className="text-gray-400 text-sm">Configure taxas por região no mapa</p>
          </div>
        </div>
        <button
          onClick={handleAddZone}
          className="flex items-center gap-2 px-4 py-2 bg-[#ff9607] hover:bg-[#ffaa33] text-black rounded-xl text-sm font-bold transition-all"
        >
          <Plus className="h-4 w-4" /> Nova Zona
        </button>
      </div>

      {/* Busca de endereço */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <Navigation className="h-4 w-4 text-[#ff9607]" />
          Local do estabelecimento
        </label>
        <div className="flex gap-2">
          <input
            value={addressSearch}
            onChange={e => setAddressSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && buscarEndereco(addressSearch)}
            placeholder="Digite o endereço da loja para centralizar o mapa..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607]"
          />
          <button
            onClick={() => buscarEndereco(addressSearch)}
            disabled={searching}
            className="bg-[#ff9607] text-black px-4 py-2.5 rounded-xl font-bold hover:bg-[#ffaa33] transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
          >
            <Search className="h-4 w-4" />
            {searching ? '...' : 'Buscar'}
          </button>
        </div>
      </div>

      {/* Mapa */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
        <DeliveryMap center={mapCenter} zones={mapZones} />
      </div>

      {/* Legenda */}
      {mapZones.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {zones.filter(z => z.isActive && (z.radiusKm ?? 0) > 0).map((zone, i) => (
            <div key={zone.id} className="flex items-center gap-2 text-xs text-gray-400 bg-white/[0.03] border border-white/5 px-3 py-1.5 rounded-lg">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              {zone.name}: {zone.radiusKm} km
            </div>
          ))}
        </div>
      )}

      {/* Tabela de zonas */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm overflow-hidden">
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="font-bold">Tabela de Taxas por Região</h2>
          <span className="text-xs text-gray-500">{zones.length} zona{zones.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : zones.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MapPin className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Nenhuma zona cadastrada</p>
            <p className="text-xs text-gray-600 mt-1">Clique em "Nova Zona" para começar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-gray-400 text-xs uppercase">
                  <th className="text-left px-5 py-3 font-medium">Zona</th>
                  <th className="text-left px-5 py-3 font-medium">Bairros</th>
                  <th className="text-center px-5 py-3 font-medium">Raio</th>
                  <th className="text-center px-5 py-3 font-medium">Taxa</th>
                  <th className="text-center px-5 py-3 font-medium">Mínimo</th>
                  <th className="text-center px-5 py-3 font-medium">Tempo</th>
                  <th className="text-center px-5 py-3 font-medium">Status</th>
                  <th className="text-right px-5 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {zones.map((zone, i) => {
                    const isEditing = editingId === zone.id;
                    return (
                      <motion.tr
                        key={zone.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-5 py-3">
                          {isEditing ? (
                            <input
                              value={editForm.name ?? zone.name}
                              onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm w-32"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                              <span className="font-medium">{zone.name}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {isEditing ? (
                            <input
                              value={editForm.neighborhoods ?? (zone.neighborhoods || '')}
                              onChange={e => setEditForm(f => ({ ...f, neighborhoods: e.target.value }))}
                              placeholder="Bairro 1, Bairro 2"
                              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm w-40"
                            />
                          ) : (
                            <span className="text-gray-400 text-xs">{zone.neighborhoods || '-'}</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              step={0.1}
                              value={editForm.radiusKm ?? (zone.radiusKm || 0)}
                              onChange={e => setEditForm(f => ({ ...f, radiusKm: Number(e.target.value) }))}
                              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm w-16 text-center"
                            />
                          ) : (
                            <span>{zone.radiusKm} km</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              step={0.01}
                              value={editForm.deliveryFee ?? zone.deliveryFee}
                              onChange={e => setEditForm(f => ({ ...f, deliveryFee: Number(e.target.value) }))}
                              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm w-16 text-center"
                            />
                          ) : (
                            <span className="text-green-400 font-medium">R$ {zone.deliveryFee.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              step={0.01}
                              value={editForm.minOrderValue ?? zone.minOrderValue}
                              onChange={e => setEditForm(f => ({ ...f, minOrderValue: Number(e.target.value) }))}
                              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm w-16 text-center"
                            />
                          ) : (
                            <span>R$ {zone.minOrderValue.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center text-xs text-gray-400">
                          {isEditing ? (
                            <div className="flex gap-1 justify-center">
                              <input
                                type="number"
                                value={editForm.estimatedTimeMin ?? zone.estimatedTimeMin}
                                onChange={e => setEditForm(f => ({ ...f, estimatedTimeMin: Number(e.target.value) }))}
                                className="bg-white/5 border border-white/10 rounded-lg px-1 py-1 text-sm w-10 text-center"
                              />
                              <span className="self-center">-</span>
                              <input
                                type="number"
                                value={editForm.estimatedTimeMax ?? zone.estimatedTimeMax}
                                onChange={e => setEditForm(f => ({ ...f, estimatedTimeMax: Number(e.target.value) }))}
                                className="bg-white/5 border border-white/10 rounded-lg px-1 py-1 text-sm w-10 text-center"
                              />
                            </div>
                          ) : (
                            <span>{zone.estimatedTimeMin}-{zone.estimatedTimeMax} min</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <button
                            onClick={async () => {
                              const res = await apiFetch('/api/delivery-zones', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ ...zone, isActive: !zone.isActive }),
                              });
                              const d = await res.json();
                              if (d.success) setZones(prev => prev.map(z => z.id === zone.id ? d.data : z));
                            }}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${
                              zone.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                            }`}
                          >
                            {zone.isActive ? 'Ativa' : 'Inativa'}
                          </button>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(zone)}
                                  className="p-1.5 rounded-lg hover:bg-green-500/10 text-green-400 transition-colors"
                                >
                                  <Save className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => { setEditingId(null); setEditForm({}); }}
                                  className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 transition-colors"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => { setEditingId(zone.id); setEditForm({}); }}
                                  className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(zone.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-400/10 text-gray-400 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex items-start gap-3">
        <MapPin className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-400">
          <p className="text-gray-300 font-medium mb-1">Como funciona o zoneamento?</p>
          <p>Cada zona pode ter um <strong>raio em km</strong> (círculo no mapa) ou uma lista de <strong>bairros</strong> separados por vírgula. Quando um pedido é atribuído a um entregador, o sistema busca automaticamente a zona pelo bairro do cliente e aplica a taxa correspondente.</p>
        </div>
      </div>
    </div>
  );
}
